<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FoodCategory extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'food_categories';
    protected $fillable = [
        'title',
        'slug',
        'image',
        'description',
        'status'
    ];
    protected $casts = [
        'status' => 'boolean',
    ];
    private function generateSlug()
    {
        $slug = Str::slug($this->title);
        $base = $slug;
        $i = 1;
        while (FoodCategory::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i;
            $i++;
        }
        return $slug;
    }
    public function image():Attribute
    {
        return $this->castingFile(defaultPath:'FoodCategory');
    }
}
