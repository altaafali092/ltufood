<?php

use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function reportOrder(string $number, float $total, string $createdAt, string $status = 'Served', string $paymentStatus = 'paid'): Order
{
    $order = Order::create([
        'order_number' => $number,
        'status' => $status,
        'payment_status' => $paymentStatus,
        'subtotal' => $total,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total' => $total,
    ]);

    $order->forceFill(['created_at' => Carbon::parse($createdAt)])->saveQuietly();

    return $order;
}

function seedSalesReportOrders(): void
{
    reportOrder('ORD-PAID-1', 450, '2026-09-24 12:00:00');
    reportOrder('ORD-PAID-2', 125, '2026-09-22 09:00:00');
    reportOrder('ORD-CANCELLED', 999, '2026-09-24 13:00:00', status: 'Cancelled');
    reportOrder('ORD-UNPAID', 700, '2026-09-24 14:00:00', paymentStatus: 'unpaid');
}

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-09-24 12:00:00'));
    $this->actingAs(User::factory()->create());
    seedSalesReportOrders();
});

afterEach(function () {
    Carbon::setTestNow();
});

test('sales report defaults to the weekly period', function () {
    $this->get(route('admin.sales-report.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->where('period', 'weekly')
            ->where('report.total_orders', 2)
            ->where('report.total_sales', 575)
        );
});

test('sales report buckets paid sales by week', function () {
    $this->get(route('admin.sales-report.index', ['period' => 'weekly']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->where('period', 'weekly')
            ->has('report.rows.data', 10)
            ->where('report.rows.total', 12)
            ->where('report.rows.data.0.label', 'Sep 21 - Sep 27, 2026')
            ->where('report.rows.data.0.orders', 2)
            ->where('report.rows.data.0.sales', 575)
            ->where('report.total_orders', 2)
            ->where('report.total_sales', 575)
        );
});

test('sales report buckets paid sales by month', function () {
    $this->get(route('admin.sales-report.index', ['period' => 'monthly']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->has('report.rows.data', 10)
            ->where('report.rows.total', 12)
            ->where('report.rows.data.0.label', 'September 2026')
            ->where('report.rows.data.0.sales', 575)
        );
});

test('sales report buckets paid sales by year', function () {
    $this->get(route('admin.sales-report.index', ['period' => 'yearly']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->has('report.rows.data', 5)
            ->where('report.rows.data.0.label', '2026')
            ->where('report.rows.data.0.sales', 575)
        );
});

test('sales report paginates rows ten per page', function () {
    $this->get(route('admin.sales-report.index', ['period' => 'weekly', 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SalesReport')
            ->has('report.rows.data', 2)
            ->where('report.rows.current_page', 2)
            ->where('report.rows.total', 12)
        );
});

test('admin can download the sales report as an xlsx workbook', function () {
    $response = $this->get(route('admin.sales-report.export', ['period' => 'weekly']));

    $response->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertDownload('sales-report-weekly-2026-09-24.xlsx');

    $contents = $response->getContent();

    expect($contents)->toStartWith('PK');

    $path = tempnam(sys_get_temp_dir(), 'xlsx-test');
    file_put_contents($path, $contents);

    $archive = new ZipArchive;
    expect($archive->open($path))->toBe(true)
        ->and($archive->locateName('xl/worksheets/sheet1.xml'))->not->toBe(false);

    $sheet = $archive->getFromName('xl/worksheets/sheet1.xml');
    $archive->close();
    unlink($path);

    expect($sheet)
        ->toContain('Sales (NPR)')
        ->toContain('<v>575</v>');
});

test('admin can download a single period row as an xlsx workbook', function () {
    $response = $this->get(route('admin.sales-report.export', [
        'period' => 'weekly',
        'start' => '2026-09-21',
        'end' => '2026-09-27',
    ]));

    $response->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertDownload('sales-report-weekly-2026-09-21-to-2026-09-27.xlsx');

    $path = tempnam(sys_get_temp_dir(), 'xlsx-test');
    file_put_contents($path, $response->getContent());

    $archive = new ZipArchive;
    $archive->open($path);
    $sheet = $archive->getFromName('xl/worksheets/sheet1.xml');
    $archive->close();
    unlink($path);

    expect($sheet)->toContain('Sep 21 - Sep 27, 2026');
    expect($sheet)->toContain('<v>575</v>');
    expect($sheet)->not->toContain('Total');
});

test('sales report export rejects an invalid date range', function () {
    $this->get(route('admin.sales-report.export', [
        'period' => 'weekly',
        'start' => 'not-a-date',
        'end' => '2026-09-27',
    ]))->assertSessionHasErrors('start');
});
