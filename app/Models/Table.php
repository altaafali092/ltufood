<?php

namespace App\Models;

use App\Concerns\FileTrait;
use App\Enum\OrderStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Table extends Model
{
    use FileTrait, HasFactory, SoftDeletes;

    protected $fillable = [
        'table_number',
        'qr_uuid',
        'qr_code_image',
        'lat',
        'lng',
        'radius_meters',
        'is_occupied',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'radius_meters' => 'integer',
        'is_occupied' => 'boolean',
    ];

    protected $appends = [
        'qr_url',
        'qr_image_url',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function activeOrder(): ?Order
    {
        return $this->orders()
            ->whereNotIn('status', [
                OrderStatusEnum::Cancelled->value,
                OrderStatusEnum::Served->value,
            ])
            ->latest()
            ->first();
    }

    public function displayStatus(?Order $activeOrder = null): string
    {
        $activeOrder ??= $this->activeOrder();

        if ($activeOrder !== null) {
            return match ($activeOrder->status) {
                OrderStatusEnum::Pending->value => 'Order Requested',
                OrderStatusEnum::Preparing->value => 'Preparing',
                default => 'Occupied',
            };
        }

        return $this->is_occupied ? 'Occupied' : 'Available';
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_occupied', false);
    }

    /**
     * Generate QR Code URL
     */
    public function getQrUrlAttribute(): string
    {
        return url("/table/{$this->qr_uuid}");
    }

    /**
     * Full public QR image URL
     */
    public function getQrImageUrlAttribute(): ?string
    {
        return $this->qr_code_image
            ? asset('storage/'.$this->qr_code_image)
            : null;
    }
}
