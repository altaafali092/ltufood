<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FoodItem extends Model
{
    use HasFactory, SoftDeletes,FileTrait;

    protected $with = ['foodCategory'];

    protected $fillable = [
        'food_category_id',
        'title',
        'slug',
        'description',
        'price',
        'images',
        'status',
        'tags',
        'popularity_score',
    ];

    protected $casts = [
        'images' => 'array',
        'status' => 'boolean',
        'tags' => 'array',
        'popularity_score' => 'integer',
    ];

    public function images(): Attribute
    {
        return $this->castingFile(defaultPath: 'FoodItems');
    }

    public function foodCategory(): BelongsTo
    {
        return $this->belongsTo(FoodCategory::class);
    }
}
