<?php

use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('customer selecting cash receives a paid receipt', function () {
    $customer = User::factory()->create();
    $table = Table::create([
        'table_number' => 'T-01',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $order = Order::create([
        'order_number' => 'ORD-CASH-001',
        'customer_id' => $customer->id,
        'table_id' => $table->id,
        'order_type' => 'dine_in',
        'status' => 'Pending',
        'payment_method' => null,
        'payment_status' => 'unpaid',
        'subtotal' => 100,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 100,
    ]);

    $this->actingAs($customer)
        ->post(route('orderPaymentProcess', $order), [
            'payment_method' => 'cash',
        ])
        ->assertRedirect(route('orders.receipt', $order));

    expect($order->refresh())
        ->payment_method->toBe('cash_at_reception')
        ->payment_status->toBe('paid')
        ->paid_at->not->toBeNull();
});
