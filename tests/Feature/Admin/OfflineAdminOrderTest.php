<?php

use App\Enum\OrderStatusEnum;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can create an order through the idempotent sync endpoint', function () {
    $admin = User::factory()->create();
    $table = Table::create([
        'table_number' => 'T-01',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => false,
    ]);
    $foodItem = FoodItem::create([
        'title' => 'Fried Rice',
        'slug' => 'fried-rice',
        'price' => 250,
        'status' => true,
        'popularity_score' => 5,
    ]);
    $payload = [
        'client_uuid' => fake()->uuid(),
        'table_id' => $table->id,
        'customer_name' => 'Walk-in Guest',
        'customer_phone' => '9800000000',
        'order_type' => 'dine_in',
        'payment_method' => 'cash_at_reception',
        'subtotal' => 500,
        'total' => 500,
        'items' => [[
            'food_item_id' => $foodItem->id,
            'quantity' => 2,
            'price' => 250,
        ]],
    ];

    $first = $this->actingAs($admin)
        ->postJson(route('admin.userOrders.sync'), $payload)
        ->assertCreated()
        ->assertJsonPath('idempotent', false);

    $this->actingAs($admin)
        ->postJson(route('admin.userOrders.sync'), $payload)
        ->assertOk()
        ->assertJsonPath('idempotent', true);

    expect(Order::query()->count())->toBe(1)
        ->and($first->json('order.status'))->toBe(OrderStatusEnum::Pending->value);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $first->json('order.id'),
        'food_item_id' => $foodItem->id,
        'quantity' => 2,
        'price_at_time' => 250,
    ]);
});

test('admin order sync allows staff to add an order to an occupied table', function () {
    $admin = User::factory()->create();
    $table = Table::create([
        'table_number' => 'T-02',
        'qr_uuid' => fake()->uuid(),
        'is_occupied' => true,
    ]);
    $foodItem = FoodItem::create([
        'title' => 'Tea',
        'slug' => 'tea',
        'price' => 80,
        'status' => true,
        'popularity_score' => 1,
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.userOrders.sync'), [
            'client_uuid' => fake()->uuid(),
            'table_id' => $table->id,
            'order_type' => 'dine_in',
            'subtotal' => 80,
            'total' => 80,
            'items' => [[
                'food_item_id' => $foodItem->id,
                'quantity' => 1,
                'price' => 80,
            ]],
        ])
        ->assertCreated()
        ->assertJsonPath('order.table_id', $table->id);
});
