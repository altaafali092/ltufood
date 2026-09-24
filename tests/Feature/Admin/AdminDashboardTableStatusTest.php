<?php

use App\Enum\OrderStatusEnum;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin dashboard includes dynamic table status from database', function () {
    $user = User::factory()->create();

    $availableTable = Table::create([
        'table_number' => 'T-01',
        'qr_uuid' => fake()->uuid(),
        'radius_meters' => 50,
        'is_occupied' => false,
    ]);

    $preparingTable = Table::create([
        'table_number' => 'T-02',
        'qr_uuid' => fake()->uuid(),
        'radius_meters' => 50,
        'is_occupied' => true,
    ]);

    Order::create([
        'order_number' => 'ORD-1001',
        'table_id' => $preparingTable->id,
        'order_type' => 'dine_in',
        'status' => OrderStatusEnum::Preparing->value,
        'payment_method' => 'cash_at_reception',
        'payment_status' => 'unpaid',
        'subtotal' => 390,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 390,
    ]);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/dashboard')
            ->has('liveOrders', 1)
            ->where('liveOrders.0.status', 'Preparing')
            ->has('recentOrders', 1)
            ->has('tables', 2)
            ->where('tables.0.table_number', 'T-01')
            ->where('tables.0.status', 'Available')
            ->where('tables.1.table_number', 'T-02')
            ->where('tables.1.status', 'Preparing')
            ->where('tables.1.amount', 390)
            ->where('active_tables.occupied', 1)
            ->where('active_tables.total', 2)
            ->where('active_tables.percent', 50)
        );
});
