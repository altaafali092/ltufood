<?php

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

if (!function_exists('deleteFiles')) {
    function deleteFiles($files): void
    {
        if (!$files) return;

        // If stored as JSON string → decode
        if (is_string($files)) {
            $files = json_decode($files, true);
        }

        // Normalize to array
        $files = is_array($files) ? $files : [$files];

        foreach ($files as $file) {
            if (!$file) continue;

            // Convert full URL to storage path
            $path = Str::after($file, '/storage/');

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
