<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;


#[Fillable([
    'order_number',
    'table_id',
    'customer_id',
    'order_type',
    'status',
    'payment_method',
    'payment_status',
    'esewa_transaction_id',
    'transaction_uuid',
    'subtotal',
    'discount_amount',
    'tax_amount',
    'total',
    'cash_received',
    'change_given',
    'mood',
    'customer_lat',
    'customer_lng',
    'notes',
    'checked_out_at',
    'paid_at',

])]


class Order extends Model
{

    use FileTrait, HasFactory, SoftDeletes;

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'total'           => 'decimal:2',
        'cash_received'   => 'decimal:2',
        'change_given'    => 'decimal:2',
        'customer_lat'    => 'decimal:8',
        'customer_lng'    => 'decimal:8',
        'checked_out_at'  => 'datetime',
        'paid_at'          => 'datetime',
    ];



    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }



    public function isActive(): bool
    {
        return ! in_array($this->status, ['completed', 'cancelled']);
    }

    /**
     * Check if the order has been paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }


    public function calculateTotal(): void
    {
        $this->loadMissing('items');

        $this->subtotal = $this->items->sum(fn ($item) => $item->quantity * $item->price_at_time);

        // Total = (Subtotal - Discount) + Tax
        $this->total = ($this->subtotal - $this->discount_amount) + $this->tax_amount;
        $this->save();
    }


    public function getPaymentParameters(Order $order): array
    {
        $merchantCode = config('services.esewa.merchant_code');
        $secretKey = config('services.esewa.secret_key');
        $totalAmount = number_format((float)$order->total, 2, '.', '');
        $transactionUuid = $order->transaction_uuid;

        $successUrl = route('esewa.success');
        $failureUrl = route('esewa.failure');

        $signedFieldNames = 'total_amount,transaction_uuid,product_code';
        $signatureString = "total_amount={$totalAmount},transaction_uuid={$transactionUuid},product_code={$merchantCode}";
        
        $signature = base64_encode(hash_hmac('sha256', $signatureString, $secretKey, true));

        return [
            'amount' => number_format((float)$order->subtotal, 2, '.', ''),
            'tax_amount' => '0',
            'total_amount' => $totalAmount,
            'transaction_uuid' => $transactionUuid,
            'product_code' => $merchantCode,
            'product_service_charge' => '0',
            'product_delivery_charge' => '0',
            'success_url' => $successUrl,
            'failure_url' => $failureUrl,
            'signed_field_names' => $signedFieldNames,
            'signature' => $signature,
        ];
    }
}
