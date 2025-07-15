<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use App\Models\Song;
use App\Models\Download;

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
                abort(404, 'Audio file not found');
            }

            // El archivo está en /storage/downloads/xxx.mp3, pero esa ruta es pública (accesible desde el navegador)
            // Para acceder desde PHP, necesitamos la ruta absoluta en el sistema de archivos, no la URL pública.
            // Normalmente, 'storage' en la URL apunta a 'public/storage' en el filesystem (symlink a storage/app/public)
            // Así que convertimos '/storage/downloads/xxx.mp3' a base_path('public/storage/downloads/xxx.mp3')

            $publicPath = $download->file_path;
            $relativePath = ltrim($publicPath, '/'); // remove leading slash
            $absolutePath = public_path($relativePath);

            if (!file_exists($absolutePath)) {
                \Log::error("Audio file not found at: $absolutePath");
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
                    $status = 206; // Partial Content
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

            // Stream the file content
            $file = fopen($absolutePath, 'rb');
            if (!$file) {
                abort(500, 'Cannot open audio file');
            }

            fseek($file, $start);
            $data = fread($file, $length);
            fclose($file);

            return new Response($data, $status, $headers);
        } catch (\Exception $e) {
            \Log::error('Audio stream error: ' . $e->getMessage());
            abort(500, 'An error occurred while streaming the audio file.');
        }
    }

    /**
     * Stream audio file without range support (fallback)
     */
    public function streamBasic(Song $song)
    {
        \Log::info($song);
        
        $download = $song->download;
        if (!$download) {
            abort(404, 'Audio file not found');
        }

        // Get the file path - remove leading slash if present
        $filePath = ltrim($download->file_path, '/');
        
        // Convert public URL path to storage path
        $storagePath = str_replace('storage/', 'public/', $filePath);

        if (!Storage::exists($storagePath)) {
            abort(404, 'Audio file not found');
        }

        $file = Storage::get($storagePath);
        $mimeType = Storage::mimeType($storagePath) ?: 'audio/mpeg';
        $fileSize = Storage::size($storagePath);

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $fileSize,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=31536000',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers' => 'Range, Content-Range, Content-Length, Content-Type',
        ];

        return new Response($file, 200, $headers);
    }

    /**
     * Get audio metadata and streaming URL
     */
    public function getAudioInfo(string $songId)
    {
        $song = Song::findOrFail($songId);
        
        if (!$song->download) {
            return response()->json(['error' => 'No audio available'], 404);
        }

        // Get the file path and check if it exists
        $filePath = ltrim($song->download->file_path, '/');
        $storagePath = str_replace('storage/', 'public/', $filePath);

        if (!Storage::exists($storagePath)) {
            return response()->json(['error' => 'Audio file not found'], 404);
        }

        $fileSize = Storage::size($storagePath);
        $mimeType = Storage::mimeType($storagePath) ?: 'audio/mpeg';

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
    }

    /**
     * Get download URL for a song
     */
    public function getDownloadUrl(string $songId)
    {
        $song = Song::findOrFail($songId);
        
        if (!$song->download) {
            return response()->json(['error' => 'No download available'], 404);
        }

        return response()->json([
            'url' => route('audio.stream', $song->id),
            'filename' => $song->title . '.mp3'
        ]);
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
}