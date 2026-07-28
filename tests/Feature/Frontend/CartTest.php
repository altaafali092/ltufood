<?php

use App\Models\FoodItem;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('food item can be added to the cart', function () {
    $foodItem = FoodItem::create([
        'title' => 'Chicken Momo',
        'slug' => 'chicken-momo',
        'description' => 'Steamed dumplings.',
        'price' => 250,
        'status' => true,
        'tags' => ['popular'],
        'popularity_score' => 90,
    ]);

    $this->post(route('cartStore', $foodItem), [
        'quantity' => 2,
    ])->assertRedirect();

    $this->post(route('cartStore', $foodItem), [
        'quantity' => 1,
    ])->assertRedirect();

    $cart = app(CartService::class);
    $items = $cart->all();

    expect($items)->toHaveKey($foodItem->id)
        ->and($items[$foodItem->id]['quantity'])->toBe(3)
        ->and($cart->count())->toBe(3)
        ->and($cart->subtotal())->toBe(750.0);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('cart.count', 3)
            ->where('cart.subtotal', 750.0)
            ->has('cart.items.'.$foodItem->id)
            ->etc()
        );
});

test('unavailable food item cannot be added to the cart', function () {
    $foodItem = FoodItem::create([
        'title' => 'Sold Out Pasta',
        'slug' => 'sold-out-pasta',
        'price' => 500,
        'status' => false,
        'popularity_score' => 20,
    ]);

    $this->post(route('cartStore', $foodItem), [
        'quantity' => 1,
    ])->assertNotFound();

    expect(app(CartService::class)->all())->toBe([]);
});
