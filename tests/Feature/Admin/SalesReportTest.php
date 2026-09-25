<?php

use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin can view paid sales by period and download the report', function () {
    $this->actingAs(User::factory()->create());

    Carbon::setTestNow(Carbon::parse('2026-09-24 12:00:00'));

    Order::create([
        'order_number' => 'ORD-PAID-1',
        'status' => 'Served',
        'payment_status' => 'paid',
        'subtotal' => 450,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 450,
        'created_at' => now(),
    ]);
    Order::create([
        'order_number' => 'ORD-PAID-2',
        'status' => 'Served',
        'payment_status' => 'paid',
        'subtotal' => 125,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 125,
        'created_at' => now()->subDay(),
    ]);
    Order::create([
        'order_number' => 'ORD-CANCELLED',
        'status' => 'Cancelled',
        'payment_status' => 'paid',
        'subtotal' => 999,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => 999,
        'created_at' => now(),
    ]);

    $this->get(route('admin.sales-report.index', ['period' => 'daily']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->where('period', 'daily')
            ->where('report.total_orders', 2)
            ->where('report.total_sales', 575)
        );

    $this->get(route('admin.sales-report.export', ['period' => 'daily']))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8')
        ->assertDownload('sales-report-daily-2026-09-24.csv');

    Carbon::setTestNow();
});
