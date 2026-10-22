<?php

namespace App\Http\Controllers\Admin;

use App\Enum\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use App\Services\AdminOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrderUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $date = $request->input('date', 'all');

        // Summary stats calculated directly in database
        $stats = [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('status', OrderStatusEnum::Preparing->value)->count(),
            'completedOrders' => Order::where('status', OrderStatusEnum::Served->value)->count(),
            'totalRevenue' => Order::where('payment_status', 'paid')->sum('total'),
        ];

        // Filtered orders query
        $orderUsers = Order::with(['customer', 'table', 'items.foodItem'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status && $status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($date && $date !== 'all', function ($query) use ($date) {
                match ($date) {
                    'today' => $query->whereDate('created_at', today()),
                    'yesterday' => $query->whereDate('created_at', today()->subDay()),
                    'week' => $query->whereBetween('created_at', [today()->startOfWeek(), today()->endOfWeek()]),
                    default => $query,
                };
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Order/Index', [
            'orderUsers' => $orderUsers,
            'orderStatuses' => OrderStatusEnum::labels(),
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'date' => $date ?? 'all',
            ],
            'stats' => $stats,
            'orderTables' => Table::query()
                ->orderBy('table_number')
                ->get(['id', 'table_number']),
            'orderFoodItems' => FoodItem::query()
                ->where('status', true)
                ->orderBy('title')
                ->get(['id', 'title', 'price']),
            'orderCustomers' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'email']),
        ]);
    }

    public function storeOfflineOrder(StoreOrderRequest $request, AdminOrderService $service): JsonResponse
    {
        $existing = Order::query()->where('client_uuid', $request->validated('client_uuid'))->exists();
        // Staff may add another manual order to an occupied table.
        $order = $service->create($request->validated(), allowOccupiedTable: true);

        return response()->json([
            'order' => $order,
            'idempotent' => $existing,
        ], $existing ? 200 : 201);
    }

    public function status(Request $request, Order $orderUser)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatusEnum::class)],
        ]);
        $orderUser->update([
            'status' => $validated['status'],
        ]);
        broadcast(new OrderStatusUpdated($orderUser));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order status updated successfully.')]);

        return back();
    }

    public function billUpdate(Request $request, Order $orderUser)
    {
        $validated = $request->validate([
            'payment_status' => ['required', Rule::in(['unpaid', 'paid', 'failed', 'refunded'])],
            'payment_method' => ['required', Rule::in(['esewa', 'cash_at_reception', 'card', 'khalti'])],
        ]);

        $orderUser->update($validated + [
            'updated_by' => Auth::id(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment information updated successfully.')]);

        return back();
    }
}
