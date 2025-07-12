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
     * Serve audio file for a song
     */
    public function stream(string $songId)
    {
        $song = Song::findOrFail($songId);
        
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
        $mimeType = Storage::mimeType($storagePath);
        $fileSize = Storage::size($storagePath);

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $fileSize,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=31536000', // Cache for 1 year
        ];

        return new Response($file, 200, $headers);
    }

    /**
     * Stream audio file with range support (for seeking)
     */
    public function streamWithRange(Request $request, string $songId)
    {
        $song = Song::findOrFail($songId);
        
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

        $fullPath = Storage::path($storagePath);
        $fileSize = filesize($fullPath);
        $mimeType = Storage::mimeType($storagePath);

        $start = 0;
        $end = $fileSize - 1;

        if ($request->hasHeader('Range')) {
            $range = $request->header('Range');
            $matches = [];
            
            if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
                $start = intval($matches[1]);
                if (!empty($matches[2])) {
                    $end = intval($matches[2]);
                }
            }
        }

        $length = $end - $start + 1;

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $length,
            'Accept-Ranges' => 'bytes',
            'Content-Range' => "bytes $start-$end/$fileSize",
            'Cache-Control' => 'public, max-age=31536000',
        ];

        $file = fopen($fullPath, 'rb');
        fseek($file, $start);
        $data = fread($file, $length);
        fclose($file);

        return new Response($data, 206, $headers);
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
}