<?php
require_once 'vendor/autoload.php';

use App\Models\Song;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test song ID (from the data we saw earlier)
$songId = '01983e01-e207-700b-badd-f35877850a57';

try {
    $song = Song::with('download')->find($songId);

    if (!$song || !$song->download) {
        echo "Song or download not found.\n";
        exit;
    }

    echo "Testing path resolution for: " . $song->title . "\n";
    echo "Original file path: " . $song->download->file_path . "\n";

    $filePath = $song->download->file_path;
    $storagePath = str_replace('/storage/', '', ltrim($filePath, '/'));

    echo "Storage path: " . $storagePath . "\n";

    // Try multiple possible file locations
    $possiblePaths = [];
    $publicStoragePath = public_path('storage/' . $storagePath);
    $storageAppPath = storage_path('app/public/' . $storagePath);

    $possiblePaths[] = $publicStoragePath;
    $possiblePaths[] = $storageAppPath;

    echo "\nTesting paths:\n";

    $resolvedPath = null;
    foreach ($possiblePaths as $path) {
        $exists = file_exists($path);
        echo "- $path: " . ($exists ? "EXISTS" : "NOT FOUND") . "\n";
        if ($exists && !$resolvedPath) {
            $resolvedPath = $path;
        }
    }

    echo "\nResolved path: " . ($resolvedPath ?: "NONE") . "\n";

    if ($resolvedPath) {
        echo "File size: " . filesize($resolvedPath) . " bytes\n";
        echo "Mime type: " . (mime_content_type($resolvedPath) ?: 'unknown') . "\n";
        echo "Readable: " . (is_readable($resolvedPath) ? "YES" : "NO") . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
