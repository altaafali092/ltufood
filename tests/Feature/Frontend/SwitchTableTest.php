<?php

use App\Enum\OrderStatusEnum;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('customer can see available tables and transfer the existing order', function () {
    $currentTable = Table::create([
        'table_number' => 'T-02',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $availableTable = Table::create([
        'table_number' => 'T-05',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => false,
    ]);
    $occupiedTable = Table::create([
        'table_number' => 'T-06',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $foodItem = FoodItem::create([
        'title' => 'Momo',
        'slug' => 'momo',
        'price' => 150,
        'status' => true,
        'popularity_score' => 10,
    ]);
    $order = Order::create([
        'order_number' => 'ORD-SWITCH-1',
        'table_id' => $currentTable->id,
        'order_type' => 'dine_in',
        'status' => OrderStatusEnum::Preparing->value,
        'payment_method' => 'cash_at_reception',
        'payment_status' => 'unpaid',
        'subtotal' => 300,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 300,
    ]);
    $item = OrderItem::create([
        'order_id' => $order->id,
        'food_item_id' => $foodItem->id,
        'quantity' => 2,
        'price_at_time' => 150,
        'total_price' => 300,
    ]);

    $this->withSession([
        'active_order_id' => $order->id,
        'table_id' => $currentTable->id,
        'table_number' => $currentTable->table_number,
    ])->get(route('orders.availableTables'))
        ->assertOk()
        ->assertJsonPath('tables.0.id', $availableTable->id)
        ->assertJsonMissing(['id' => $currentTable->id])
        ->assertJsonMissing(['id' => $occupiedTable->id]);

    $this->withSession([
        'active_order_id' => $order->id,
        'table_id' => $currentTable->id,
        'table_number' => $currentTable->table_number,
    ])->post(route('orders.switchTable', $order), [
        'table_id' => $availableTable->id,
    ])->assertRedirect()->assertSessionHas('table_id', $availableTable->id);

    $order->refresh();
    $item->refresh();
    expect($order->table_id)->toBe($availableTable->id)
        ->and($order->status)->toBe(OrderStatusEnum::Preparing->value)
        ->and($order->total)->toBe('300.00')
        ->and($item->quantity)->toBe(2)
        ->and($item->price_at_time)->toBe('150.00');
    expect($currentTable->refresh()->is_occupied)->toBeFalse()
        ->and($availableTable->refresh()->is_occupied)->toBeTrue();
});

test('switching fails when the selected table becomes occupied', function () {
    $currentTable = Table::create([
        'table_number' => 'T-02',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $newTable = Table::create([
        'table_number' => 'T-05',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $order = Order::create([
        'order_number' => 'ORD-SWITCH-2',
        'table_id' => $currentTable->id,
        'order_type' => 'dine_in',
        'status' => OrderStatusEnum::Pending->value,
        'payment_method' => 'cash_at_reception',
        'payment_status' => 'unpaid',
        'subtotal' => 100,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 100,
    ]);

    $this->withSession(['active_order_id' => $order->id])
        ->post(route('orders.switchTable', $order), ['table_id' => $newTable->id])
        ->assertSessionHasErrors('table_id');

    expect($order->refresh()->table_id)->toBe($currentTable->id);
});

test('customer cannot switch another customer order', function () {
    $owner = User::factory()->create();
    $otherCustomer = User::factory()->create();
    $currentTable = Table::create([
        'table_number' => 'T-02',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $newTable = Table::create([
        'table_number' => 'T-05',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => false,
    ]);
    $order = Order::create([
        'order_number' => 'ORD-SWITCH-3',
        'table_id' => $currentTable->id,
        'customer_id' => $owner->id,
        'order_type' => 'dine_in',
        'status' => OrderStatusEnum::Pending->value,
        'payment_method' => 'cash_at_reception',
        'payment_status' => 'unpaid',
        'subtotal' => 100,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 100,
    ]);

    $this->actingAs($otherCustomer)
        ->withSession(['active_order_id' => $order->id])
        ->post(route('orders.switchTable', $order), ['table_id' => $newTable->id])
        ->assertForbidden();
});
