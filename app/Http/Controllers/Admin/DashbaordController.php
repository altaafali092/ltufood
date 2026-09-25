<?php

namespace App\Http\Controllers\Admin;

use App\Enum\OrderStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashbaordController extends Controller
{
    public function dashboard(): Response
    {
        $total_menu_items = FoodItem::count();
        $orders_count = Order::where('status', OrderStatusEnum::Pending->value)->count();
        $todays_orders = Order::where('created_at', '>=', now()->startOfDay())->count();
        $todaySales = Order::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->where('status', '!=', OrderStatusEnum::Cancelled->value)
            ->sum('total');
        $todayPaymentOrders = Order::query()
            ->whereDate('created_at', today())
            ->whereNotIn('status', [OrderStatusEnum::Cancelled->value])
            ->get(['payment_status', 'payment_method', 'total']);
        $paidToday = $todayPaymentOrders->where('payment_status', 'paid');
        $paymentOverview = [
            'revenue' => round((float) $paidToday->sum('total'), 2),
            'payment_methods' => [
                'Cash' => round((float) $paidToday->where('payment_method', 'cash_at_reception')->sum('total'), 2),
                'Online' => round((float) $paidToday->whereIn('payment_method', ['esewa', 'khalti'])->sum('total'), 2),
                'Card' => round((float) $paidToday->where('payment_method', 'card')->sum('total'), 2),
            ],
            'pending_amount' => round((float) $todayPaymentOrders->where('payment_status', 'unpaid')->sum('total'), 2),
            'counts' => [
                'paid' => $todayPaymentOrders->where('payment_status', 'paid')->count(),
                'pending' => $todayPaymentOrders->where('payment_status', 'unpaid')->count(),
                'failed' => $todayPaymentOrders->where('payment_status', 'failed')->count(),
                'refunded' => $todayPaymentOrders->where('payment_status', 'refunded')->count(),
            ],
        ];

        $salesOverview = collect([
            'Today' => ['start' => now()->startOfDay(), 'bucket' => 'hour', 'format' => 'H:00'],
            '7 Days' => ['start' => now()->subDays(6)->startOfDay(), 'bucket' => 'day', 'format' => 'D'],
            '30 Days' => ['start' => now()->subDays(29)->startOfDay(), 'bucket' => 'day', 'format' => 'M j'],
            'This Year' => ['start' => now()->startOfYear(), 'bucket' => 'month', 'format' => 'M'],
        ])->mapWithKeys(function (array $config, string $label): array {
            $start = $config['start'];
            $end = now();
            $previousStart = $start->copy()->sub($start->diff($end));
            $previousEnd = $start->copy()->subSecond();
            $orders = Order::query()
                ->where('payment_status', 'paid')
                ->whereNotIn('status', [OrderStatusEnum::Cancelled->value])
                ->whereBetween('created_at', [$start, $end])
                ->get(['created_at', 'total']);
            $previousSales = Order::query()
                ->where('payment_status', 'paid')
                ->whereNotIn('status', [OrderStatusEnum::Cancelled->value])
                ->whereBetween('created_at', [$previousStart, $previousEnd])
                ->sum('total');
            $buckets = collect();
            $cursor = $start->copy();
            while ($cursor <= $end) {
                $key = $cursor->format($config['bucket'] === 'hour' ? 'Y-m-d H' : ($config['bucket'] === 'month' ? 'Y-m' : 'Y-m-d'));
                $buckets->push([
                    'label' => $cursor->format($config['format']),
                    'sales' => round((float) $orders->filter(fn (Order $order): bool => $order->created_at->format($config['bucket'] === 'hour' ? 'Y-m-d H' : ($config['bucket'] === 'month' ? 'Y-m' : 'Y-m-d')) === $key)->sum('total'), 2),
                ]);
                $cursor = $config['bucket'] === 'hour' ? $cursor->addHour() : ($config['bucket'] === 'month' ? $cursor->addMonth() : $cursor->addDay());
            }
            $totalSales = (float) $orders->sum('total');
            $change = $previousSales > 0 ? (($totalSales - $previousSales) / $previousSales) * 100 : ($totalSales > 0 ? 100 : 0);

            return [$label => [
                'total_sales' => round($totalSales, 2),
                'total_orders' => $orders->count(),
                'average_order_value' => $orders->count() > 0 ? round($totalSales / $orders->count(), 2) : 0,
                'change_percent' => round($change, 1),
                'points' => $buckets->values(),
            ]];
        });

        $restaurantTables = Table::query()->orderBy('table_number')->get();

        $activeOrdersByTableId = Order::query()
            ->whereNotNull('table_id')
            ->whereNotIn('status', [
                OrderStatusEnum::Cancelled->value,
                OrderStatusEnum::Served->value,
            ])
            ->latest()
            ->get()
            ->unique('table_id')
            ->keyBy('table_id');

        $tables = $restaurantTables->map(function (Table $table) use ($activeOrdersByTableId) {
            $activeOrder = $activeOrdersByTableId->get($table->id);

            return [
                'id' => $table->id,
                'table_number' => $table->table_number,
                'status' => $table->displayStatus($activeOrder),
                'amount' => (float) ($activeOrder?->total ?? 0),
            ];
        })->values();

        $totalTables = $restaurantTables->count();
        $occupiedTables = $restaurantTables->where('is_occupied', true)->count();
        $occupiedPercent = $totalTables > 0
            ? (int) round(($occupiedTables / $totalTables) * 100)
            : 0;

        $orderRelations = ['customer', 'table', 'items.foodItem'];

        $liveOrders = Order::query()
            ->with($orderRelations)
            ->whereNotIn('status', [
                OrderStatusEnum::Cancelled->value,
                OrderStatusEnum::Served->value,
            ])
            ->latest()
            ->limit(50)
            ->get();

        $recentOrders = Order::query()
            ->with($orderRelations)
            ->latest()
            ->limit(8)
            ->get();

        $popularItems = OrderItem::query()
            ->select('food_item_id', DB::raw('SUM(quantity) as total_orders'))
            ->with('foodItem:id,title')
            ->whereHas('order', function ($query) {
                $query->where('created_at', '>=', now()->subDays(30))
                    ->whereNotIn('status', [OrderStatusEnum::Cancelled->value]);
            })
            ->groupBy('food_item_id')
            ->orderByDesc('total_orders')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->foodItem?->title ?? 'Unknown Item',
                    'orders' => (int) $item->total_orders,
                ];
            });

        return Inertia::render('Admin/dashboard', [
            'total_menu_items' => $total_menu_items,
            'orders_count' => $orders_count,
            'todays_orders' => $todays_orders,
            'todaySales' => $todaySales,
            'paymentOverview' => $paymentOverview,
            'salesOverview' => $salesOverview,
            'tables' => $tables,
            'active_tables' => [
                'occupied' => $occupiedTables,
                'total' => $totalTables,
                'percent' => $occupiedPercent,
            ],
            'liveOrders' => $liveOrders,
            'recentOrders' => $recentOrders,
            'orderStatuses' => OrderStatusEnum::labels(),
            'popularItems' => $popularItems,
        ]);
    }
}
