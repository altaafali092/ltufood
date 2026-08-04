<?php

use App\Models\FoodItem;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function orderCartCookieFor(FoodItem $foodItem, int $quantity): string
{
    return json_encode([
        (string) $foodItem->id => [
            'id' => (string) Str::uuid(),
            'food_item_id' => $foodItem->id,
            'quantity' => $quantity,
            'price' => (float) $foodItem->price,
        ],
    ], JSON_THROW_ON_ERROR);
}

test('guest can place an order from cart items', function () {
    $foodItem = FoodItem::create([
        'title' => 'Chicken Momo',
        'slug' => 'chicken-momo',
        'description' => 'Steamed dumplings.',
        'price' => 250,
        'status' => true,
        'tags' => ['popular'],
        'popularity_score' => 90,
    ]);

    $this->withCookie('cartItems', orderCartCookieFor($foodItem, 2))
        ->post(route('ordersStore'))
        ->assertRedirect();

    $order = Order::query()->first();

    expect($order)->not->toBeNull()
        ->and($order->subtotal)->toBe('500.00')
        ->and($order->total)->toBe('500.00')
        ->and($order->customer_id)->toBeNull();

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'food_item_id' => $foodItem->id,
        'quantity' => 2,
        'price_at_time' => 250,
        'total_price' => 500,
    ]);
});

test('order cannot be placed with an empty cart', function () {
    $this->post(route('ordersStore'))
        ->assertSessionHasErrors('cart');

    expect(Order::query()->count())->toBe(0);
});
