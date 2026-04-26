<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait FileTrait
{
    public function castingFile(string $defaultData = '', string $defaultPath = '', string $field = 'image'): Attribute
    {
        return Attribute::make(

            // GETTER
            get: function (?string $value) use ($defaultData) {
                if (empty($value)) {
                    return [];
                }

                $files = json_decode($value, true);

                if (empty($files)) {
                    return [];
                }

                return array_map(function ($file) use ($defaultData) {
                    if (filter_var($file, FILTER_VALIDATE_URL)) return $file;
                    if (Storage::disk('public')->exists($file)) {
                        return Storage::disk('public')->url($file);
                    }
                    return $defaultData;
                }, $files);
            },

            // SETTER
            set: function ($value, array $attributes) use ($defaultPath, $field) {

                // 🔥 DELETE OLD FILES
                if (!empty($attributes[$field])) {
                    $oldFiles = json_decode($attributes[$field], true) ?? [];

                    foreach ($oldFiles as $oldFile) {
                        if (Storage::disk('public')->exists($oldFile)) {
                            Storage::disk('public')->delete($oldFile);
                        }
                    }
                }

                if (empty($value)) {
                    return null;
                }

                $storedFiles = [];

                if (!is_array($value)) {
                    $value = [$value];
                }

                foreach ($value as $file) {

                    if ($file instanceof UploadedFile) {
                        $storedFiles[] = $file->store($defaultPath, 'public');
                    } elseif (is_string($file)) {
                        $storedFiles[] = $file;
                    }
                }

                return json_encode($storedFiles);
            }
        );
    }
}

