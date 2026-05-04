<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use FileTrait,HasFactory,SoftDeletes;

    protected $fillable = [
        'table_id',
        'customer_id',
        'status',
        'subtotal',
        'discount_amount',
        'total',
        'mood',
        'customer_lat',
        'customer_lng',
        'checked_out_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'customer_lat' => 'decimal:8',
        'customer_lng' => 'decimal:8',
        'checked_out_at' => 'datetime',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // public function payment(): HasOne
    // {
    //     return $this->hasOne(Payment::class);
    // }

    // public function assignment(): HasOne
    // {
    //     return $this->hasOne(OrderAssignment::class);
    // }

    public function isActive(): bool
    {
        return ! in_array($this->status, ['paid', 'cancelled']);
    }

    // Helper to calculate total
    public function calculateTotal(): void
    {
        $this->subtotal = $this->items->sum(fn ($item) => $item->quantity * $item->price_at_time);
        $this->total = $this->subtotal - $this->discount_amount;
        $this->save();
    }
}
