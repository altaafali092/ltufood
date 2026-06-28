<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;



#[Fillable(['food_category_id', 'title', 'slug', 'image', 'description', 'status'])]
class SubCategory extends Model
{
    use HasFactory, SoftDeletes, FileTrait;

    protected $with = ['foodCategory'];
    protected $casts = [
        'status' => 'boolean',
    ];

    protected $table = 'sub_categories';

    public function image(): Attribute
    {
        return $this->castingFile(defaultPath: 'subCategories');
    }
    public function foodCategory(): BelongsTo
    {
        return $this->belongsTo(FoodCategory::class, 'food_category_id');
    }

    public function foodItems(): HasMany
    {
        return $this->hasMany(FoodItem::class);
    }
}
