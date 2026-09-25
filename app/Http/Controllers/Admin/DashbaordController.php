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
            ->where('status', 'completed')
            ->sum('total');

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
