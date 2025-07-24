<?php

namespace App\Http\Controllers;

use App\Models\Download;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AudioController extends Controller
{
    /**
     * Stream audio file with range support (for seeking)
     * This is the main method for audio streaming with seeking support
     */
    public function stream(Request $request, Song $song)
    {
        try {
            $download = $song->download;
            if (!$download) {
                Log::error('Download record not found for song', ['song_id' => $song->id]);
                abort(404, 'Audio file not found');
            }

            $filePath = $download->file_path;
            Log::info('Attempting to stream file:', ['file_path' => $filePath]);

            // Normalize file path to handle different formats
            $filePath = ltrim($filePath, '/');

            // Try multiple possible file locations
            $absolutePath = $this->resolveFilePath($filePath);

            if (!$absolutePath) {
                Log::error('Audio file not found after path resolution', [
                    'song_id' => $song->id,
                    'file_path' => $filePath
                ]);
                abort(404, 'Audio file not found');
            }

            $fileSize = filesize($absolutePath);
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $absolutePath) ?: 'audio/mpeg';
            finfo_close($finfo);

            // Handle range requests for seeking
            $start = 0;
            $end = $fileSize - 1;
            $status = 200;

            if ($request->hasHeader('Range')) {
                $range = $request->header('Range');
                $matches = [];
                if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
                    $start = intval($matches[1]);
                    if (!empty($matches[2])) {
                        $end = intval($matches[2]);
                    }
                    $status = 206;  // Partial Content
                }
            }

            // Ensure end doesn't exceed file size
            $end = min($end, $fileSize - 1);
            $length = $end - $start + 1;

            $headers = [
                'Content-Type' => $mimeType,
                'Content-Length' => $length,
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'public, max-age=31536000',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers' => 'Range, Content-Range, Content-Length, Content-Type',
            ];

            // Add Content-Range header for partial content
            if ($status === 206) {
                $headers['Content-Range'] = "bytes $start-$end/$fileSize";
            }

            // Handle HEAD requests
            if ($request->getMethod() === 'HEAD') {
                return new Response('', $status, $headers);
            }

            // For small files or when not seeking, return the entire file
            if ($status === 200 && $fileSize < 10 * 1024 * 1024) { // Less than 10MB
                return response()->file($absolutePath, $headers);
            }

            // Stream the file content for larger files or range requests
            $file = fopen($absolutePath, 'rb');
            if (!$file) {
                Log::error('Cannot open audio file', ['path' => $absolutePath]);
                abort(500, 'Cannot open audio file');
            }

            fseek($file, $start);
            $data = fread($file, $length);
            fclose($file);

            return new Response($data, $status, $headers);
        } catch (\Exception $e) {
            Log::error('Audio stream error: ' . $e->getMessage(), [
                'exception' => $e,
                'song_id' => $song->id ?? 'unknown'
            ]);
            abort(500, 'An error occurred while streaming the audio file.');
        }
    }

    /**
     * Stream audio file without range support (fallback)
     */
    public function streamBasic(Song $song)
    {
        try {
            $download = $song->download;
            if (!$download) {
                Log::error('Download record not found for song', ['song_id' => $song->id]);
                abort(404, 'Audio file not found');
            }

            $filePath = $download->file_path;
            $absolutePath = $this->resolveFilePath($filePath);

            if (!$absolutePath) {
                Log::error('Audio file not found in streamBasic', ['song_id' => $song->id]);
                abort(404, 'Audio file not found');
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $absolutePath) ?: 'audio/mpeg';
            finfo_close($finfo);

            return response()->file($absolutePath, [
                'Content-Type' => $mimeType,
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'public, max-age=31536000',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers' => 'Range, Content-Range, Content-Length, Content-Type',
            ]);
        } catch (\Exception $e) {
            Log::error('Basic audio stream error: ' . $e->getMessage(), [
                'exception' => $e,
                'song_id' => $song->id ?? 'unknown'
            ]);
            abort(500, 'An error occurred while streaming the audio file.');
        }
    }

    /**
     * Get audio metadata and streaming URL
     */
    public function getAudioInfo(string $songId)
    {
        try {
            $song = Song::findOrFail($songId);

            if (!$song->download) {
                return response()->json(['error' => 'No audio available'], 404);
            }

            // Get the file path and check if it exists
            $filePath = $song->download->file_path;
            $absolutePath = $this->resolveFilePath($filePath);

            if (!$absolutePath) {
                return response()->json(['error' => 'Audio file not found'], 404);
            }

            $fileSize = filesize($absolutePath);
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $absolutePath) ?: 'audio/mpeg';
            finfo_close($finfo);

            return response()->json([
                'id' => $song->id,
                'title' => $song->title,
                'artist' => $song->artist?->name,
                'duration' => $song->duration,
                'cover_url' => $song->cover_url,
                'stream_url' => route('audio.stream', $song->id),
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'supports_seeking' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting audio info: ' . $e->getMessage(), [
                'song_id' => $songId,
                'exception' => $e
            ]);
            return response()->json(['error' => 'Error retrieving audio information'], 500);
        }
    }

    /**
     * Get download URL for a song
     */
    public function getDownloadUrl(string $songId)
    {
        try {
            $song = Song::findOrFail($songId);

            if (!$song->download) {
                return response()->json(['error' => 'No download available'], 404);
            }

            // Verify file exists before returning download URL
            $filePath = $song->download->file_path;
            $absolutePath = $this->resolveFilePath($filePath);

            if (!$absolutePath) {
                return response()->json(['error' => 'Audio file not found'], 404);
            }

            return response()->json([
                'url' => route('audio.stream', $song->id),
                'filename' => $song->title . '.mp3'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting download URL: ' . $e->getMessage(), [
                'song_id' => $songId,
                'exception' => $e
            ]);
            return response()->json(['error' => 'Error retrieving download information'], 500);
        }
    }

    /**
     * Handle preflight requests for CORS
     */
    public function options()
    {
        return response('', 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers' => 'Range, Content-Range, Content-Length, Content-Type',
            'Access-Control-Max-Age' => '86400',
        ]);
    }

    /**
     * Debug audio file information
     */
    public function debugAudio(Song $song)
    {
        $download = $song->download;
        if (!$download) {
            return response()->json(['error' => 'No download record found'], 404);
        }

        $filePath = $download->file_path;
        $absolutePath = $this->resolveFilePath($filePath);

        $debug = [
            'song_id' => $song->id,
            'song_title' => $song->title,
            'download_id' => $download->id,
            'original_file_path' => $filePath,
            'resolved_path' => $absolutePath,
            'file_found' => $absolutePath !== null,
            'all_possible_paths' => $this->getAllPossiblePaths($filePath),
        ];

        if ($absolutePath && file_exists($absolutePath)) {
            $debug['file_size'] = filesize($absolutePath);
            $debug['file_permissions'] = substr(sprintf('%o', fileperms($absolutePath)), -4);
            $debug['mime_type'] = mime_content_type($absolutePath);
            $debug['is_readable'] = is_readable($absolutePath);
        }

        return response()->json($debug);
    }

    /**
     * Resolve file path to absolute path
     *
     * @param string $filePath
     * @return string|null
     */
    protected function resolveFilePath(string $filePath)
    {
        // Normalize the file path
        $filePath = ltrim($filePath, '/');

        // Remove /storage/ prefix if present
        $storagePath = str_replace('/storage/', '', $filePath);
        if ($storagePath === $filePath) {
            $storagePath = str_replace('storage/', '', $filePath);
        }

        // Try multiple possible file locations
        $possiblePaths = $this->getAllPossiblePaths($filePath);

        // Find the correct path
        foreach ($possiblePaths as $path) {
            if (file_exists($path) && is_readable($path)) {
                return $path;
            }
        }

        Log::error('Audio file not found in any location:', [
            'file_path' => $filePath,
            'storage_path' => $storagePath,
            'tried_paths' => $possiblePaths
        ]);

        return null;
    }

    /**
     * Get all possible paths for a file
     *
     * @param string $filePath
     * @return array
     */
    protected function getAllPossiblePaths(string $filePath)
    {
        $possiblePaths = [];

        // Normalize the file path
        $filePath = ltrim($filePath, '/');

        // Remove /storage/ prefix if present
        $storagePath = str_replace('/storage/', '', $filePath);
        if ($storagePath === $filePath) {
            $storagePath = str_replace('storage/', '', $filePath);
        }

        // Try storage symlink first (public/storage/downloads/file.mp3)
        $possiblePaths[] = public_path('storage/' . $storagePath);

        // Try storage disk path (storage/app/public/downloads/file.mp3)
        $possiblePaths[] = storage_path('app/public/' . $storagePath);

        // Try direct path without storage prefix
        $possiblePaths[] = public_path($storagePath);

        // Try with storage prefix
        $possiblePaths[] = storage_path('app/' . $storagePath);

        // Try with original path
        $possiblePaths[] = public_path($filePath);
        $possiblePaths[] = storage_path('app/' . $filePath);

        return $possiblePaths;
    }
}
