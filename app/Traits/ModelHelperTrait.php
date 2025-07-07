<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait ModelHelperTrait
{
    public function handleBase64File(string $base64File, string $storagePath, ?string $existingFilePath = null, ?string $fileExtension = null): string
    {
        // Remove data URI prefix if present
        $base64File = preg_replace('/^data:[^;]+;base64,/', '', $base64File);

        // Decode base64 file
        $fileData = base64_decode($base64File);

        // Determine file extension if not provided
        if (!$fileExtension) {
            // Try to detect MIME type and map to extension
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_buffer($finfo, $fileData);
            $extensionMap = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'audio/mpeg' => 'mp3',
                'audio/wav' => 'wav',
                'video/mp4' => 'mp4',
                'video/mpeg' => 'mpeg',
            ];
            $fileExtension = $extensionMap[$mimeType] ?? 'bin';
            finfo_close($finfo);
        }

        // Generate unique filename
        $fileName = time() . '_' . uniqid() . '.' . $fileExtension;
        $fullPath = $storagePath . '/' . $fileName;

        // Delete existing file if provided
        if ($existingFilePath && Storage::disk('public')->exists($existingFilePath)) {
            Storage::disk('public')->delete($existingFilePath);
        }

        // Store the file
        Storage::disk('public')->put($fullPath, $fileData);

        // Return the public URL of the stored file
        return Storage::url($fullPath);
    }
}
