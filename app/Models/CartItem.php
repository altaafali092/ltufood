<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
 
    use HasFactory;

    protected $fillable = [
        'food_item_id',
        'user_id',
        'quantity',
        'price',
        'saved_for_later',
    ];

    public function foodItem()
    {
        return $this->belongsTo(FoodItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
