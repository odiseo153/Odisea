<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait ModelHelperTrait
{
    /**
     * Handle base64 file upload and store it in public accessible path
     *
     * @param string $base64File The base64 encoded file data
     * @param string $storagePath Relative path within storage/app/public
     * @param string|null $existingFilePath Existing file path to delete
     * @param string|null $fileExtension Force specific file extension
     * @param int $maxFileSize Maximum file size in bytes (default 10MB)
     * @return string Public URL of the stored file
     * @throws \InvalidArgumentException
     */
    public function handleBase64File(
        string $base64File, 
        string $storagePath, 
        ?string $existingFilePath = null, 
        ?string $fileExtension = null,
        int $maxFileSize = 10485760 // 10MB default
    ): string {
        // Validate base64 input
        if (empty($base64File)) {
            throw new \InvalidArgumentException('Base64 file data is required');
        }

        // Remove data URI prefix if present
        $base64File = preg_replace('/^data:[^;]+;base64,/', '', $base64File);

        // Validate base64 format
        if (!base64_decode($base64File, true)) {
            throw new \InvalidArgumentException('Invalid base64 format');
        }

        // Decode base64 file
        $fileData = base64_decode($base64File);

        // Check file size
        if (strlen($fileData) > $maxFileSize) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed size of " . ($maxFileSize / 1024 / 1024) . "MB");
        }

        // Determine file extension and validate MIME type
        if (!$fileExtension) {
            $fileExtension = $this->detectFileExtension($fileData);
        }

        // Validate file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp3', 'wav', 'mp4', 'mpeg', 'txt', 'doc', 'docx'];
        if (!in_array(strtolower($fileExtension), $allowedExtensions)) {
            throw new \InvalidArgumentException("File type '{$fileExtension}' is not allowed");
        }

        // Ensure storage path doesn't start with slash and is clean
        $storagePath = trim($storagePath, '/');
        $storagePath = Str::slug($storagePath, '/');

        // Generate secure filename
        $fileName = $this->generateSecureFilename($fileExtension);
        $fullPath = $storagePath . '/' . $fileName;

        // Delete existing file if provided
        $this->deleteExistingFile($existingFilePath);

        // Ensure directory exists
        $this->ensureDirectoryExists($storagePath);

        // Store the file
        if (!Storage::disk('public')->put($fullPath, $fileData)) {
            throw new \RuntimeException('Failed to store file');
        }

        // Return the public URL of the stored file
        return Storage::url($fullPath);
    }

    /**
     * Detect file extension from file data
     */
    private function detectFileExtension(string $fileData): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_buffer($finfo, $fileData);
        finfo_close($finfo);

        $extensionMap = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'audio/ogg' => 'ogg',
            'video/mp4' => 'mp4',
            'video/mpeg' => 'mpeg',
            'video/quicktime' => 'mov',
            'application/pdf' => 'pdf',
            'text/plain' => 'txt',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        ];

        return $extensionMap[$mimeType] ?? 'bin';
    }

    protected function isBase64($value)
    {
        // Detecta si el string parece ser base64 (data URI o solo base64)
        if (is_string($value)) {
            if (preg_match('/^data:\w+\/\w+;base64,/', $value)) {
                return true;
            }
            // Check if it's a valid base64 string (not a file path or URL)
            $decoded = base64_decode($value, true);
            if ($decoded !== false && base64_encode($decoded) === $value) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Generate secure filename
     */
    private function generateSecureFilename(string $extension): string
    {
        return date('Y/m/d') . '/' . time() . '_' . Str::random(20) . '.' . strtolower($extension);
    }

    /**
     * Delete existing file if it exists
     */
    private function deleteExistingFile(?string $existingFilePath): void
    {
        if ($existingFilePath) {
            // Remove /storage prefix if present in the path
            $cleanPath = str_replace('/storage/', '', $existingFilePath);
            
            if (Storage::disk('public')->exists($cleanPath)) {
                Storage::disk('public')->delete($cleanPath);
            }
        }
    }

    /**
     * Ensure directory exists
     */
    private function ensureDirectoryExists(string $storagePath): void
    {
        $fullPath = storage_path('app/public/' . $storagePath);
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
    }

    /**
     * Get file info for stored file
     */
    public function getFileInfo(string $filePath): array
    {
        $cleanPath = str_replace('/storage/', '', $filePath);
        
        if (!Storage::disk('public')->exists($cleanPath)) {
            return [];
        }

        $fullPath = Storage::disk('public')->path($cleanPath);
        
        return [
            'size' => Storage::disk('public')->size($cleanPath),
            'mime_type' => mime_content_type($fullPath),
            'last_modified' => Storage::disk('public')->lastModified($cleanPath),
            'url' => Storage::url($cleanPath),
            'exists' => true
        ];
    }
}