<?php

use App\Models\CartItem;
use App\Models\FoodItem;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

function cartCookieFor(FoodItem $foodItem, int $quantity): string
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

test('food item can be added to the guest cart', function () {
    $foodItem = FoodItem::create([
        'title' => 'Chicken Momo',
        'slug' => 'chicken-momo',
        'description' => 'Steamed dumplings.',
        'price' => 250,
        'status' => true,
        'tags' => ['popular'],
        'popularity_score' => 90,
    ]);

    $this->withCookie('cartItems', cartCookieFor($foodItem, 3))
        ->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('totalQuantity', 3)
            ->where('totalPrice', 750)
            ->has('cartItems', 1)
            ->where('cartItems.0.food_item_id', $foodItem->id)
            ->where('cartItems.0.quantity', 3)
            ->etc()
        );
});

test('guest cart item is moved to database once after login', function () {
    $foodItem = FoodItem::create([
        'title' => 'Chicken Momo',
        'slug' => 'chicken-momo',
        'description' => 'Steamed dumplings.',
        'price' => 250,
        'status' => true,
        'tags' => ['popular'],
        'popularity_score' => 90,
    ]);
    $user = User::factory()->create();

    $this->withCookie('cartItems', cartCookieFor($foodItem, 1))
        ->post(route('userLogin'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('home'));

    expect(CartItem::where('user_id', $user->id)->where('food_item_id', $foodItem->id)->value('quantity'))
        ->toBe(1);

    app(CartService::class)->moveCartItemsToDatabase($user->id);

    expect(CartItem::where('user_id', $user->id)->where('food_item_id', $foodItem->id)->value('quantity'))
        ->toBe(1);
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
