<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FoodCategory extends Model
{
    use HasFactory, SoftDeletes,FileTrait;
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

    public function image():Attribute
    {
        return $this->castingFile(defaultPath:'FoodCategory');
    }
}
