<?php

use App\Enum\OrderStatusEnum;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeOrder(array $attributes = []): Order
{
    $createdAt = $attributes['created_at'] ?? null;
    unset($attributes['created_at']);

    $order = Order::create(array_merge([
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

    if ($createdAt !== null) {
        $order->forceFill(['created_at' => $createdAt])->saveQuietly();
    }

    return $order;
}

test('order index filters orders by today', function () {
    $user = User::factory()->create();

    makeOrder(['order_number' => 'ORD-TODAY', 'created_at' => now()]);
    makeOrder(['order_number' => 'ORD-OLD', 'created_at' => now()->subDays(10)]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index', ['date' => 'today']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers', 1)
            ->where('orderUsers.0.order_number', 'ORD-TODAY')
            ->where('filters.date', 'today')
        );
});

test('order index filters orders by yesterday', function () {
    $user = User::factory()->create();

    makeOrder(['order_number' => 'ORD-YESTERDAY', 'created_at' => now()->subDay()]);
    makeOrder(['order_number' => 'ORD-TODAY', 'created_at' => now()]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index', ['date' => 'yesterday']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers', 1)
            ->where('orderUsers.0.order_number', 'ORD-YESTERDAY')
        );
});

test('order index filters orders by this week', function () {
    $user = User::factory()->create();

    $this->travelTo(Carbon::parse('2026-10-14 12:00:00'));

    makeOrder(['order_number' => 'ORD-MONDAY', 'created_at' => Carbon::parse('2026-10-12 09:00:00')]);
    makeOrder(['order_number' => 'ORD-LASTWEEK', 'created_at' => Carbon::parse('2026-10-05 09:00:00')]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index', ['date' => 'week']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers', 1)
            ->where('orderUsers.0.order_number', 'ORD-MONDAY')
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
            ->has('orderUsers', 1)
            ->where('orderUsers.0.order_number', 'ORD-READY')
            ->where('filters.status', OrderStatusEnum::Ready->value)
        );
});

test('order index returns every order when no date filter is applied', function () {
    $user = User::factory()->create();

    makeOrder(['created_at' => now()]);
    makeOrder(['created_at' => now()->subDays(30)]);

    $this->actingAs($user)
        ->get(route('admin.userOrders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Order/Index')
            ->has('orderUsers', 2)
            ->where('filters.date', 'all')
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
