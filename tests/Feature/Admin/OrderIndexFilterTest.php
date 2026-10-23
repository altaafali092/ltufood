<?php

use App\Enum\OrderStatusEnum;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeOrder(array $attributes = []): Order
{
    return Order::create(array_merge([
        'order_number' => 'ORD-'.fake()->unique()->numerify('######'),
        'order_type' => 'dine_in',
        'status' => OrderStatusEnum::Pending->value,
        'payment_method' => 'cash_at_reception',
        'payment_status' => 'unpaid',
        'subtotal' => 100,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 100,
    ], $attributes));
}

test('order index lists every order by default', function () {
    $user = User::factory()->create();

    makeOrder(['order_number' => 'ORD-ONE']);
    makeOrder(['order_number' => 'ORD-TWO']);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers.data', 2)
            ->where('filters.status', 'all')
        );
});

test('order index filters orders by status', function () {
    $user = User::factory()->create();

    makeOrder(['order_number' => 'ORD-PENDING', 'status' => OrderStatusEnum::Pending->value]);
    makeOrder(['order_number' => 'ORD-READY', 'status' => OrderStatusEnum::Ready->value]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index', ['status' => OrderStatusEnum::Ready->value]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers.data', 1)
            ->where('orderUsers.data.0.order_number', 'ORD-READY')
            ->where('filters.status', OrderStatusEnum::Ready->value)
        );
});

test('order index exposes summary statistics', function () {
    $user = User::factory()->create();

    makeOrder(['status' => OrderStatusEnum::Pending->value, 'payment_status' => 'unpaid']);
    makeOrder(['status' => OrderStatusEnum::Preparing->value, 'payment_status' => 'unpaid']);
    makeOrder([
        'status' => OrderStatusEnum::Served->value,
        'payment_status' => 'paid',
        'total' => 250,
    ]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->where('stats.totalOrders', 3)
            ->where('stats.pendingOrders', 1)
            ->where('stats.completedOrders', 1)
            ->where('stats.totalRevenue', 250)
        );
});
