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
use Inertia\Response;

class OrderUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status', 'all')->value();

        $stats = [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('status', OrderStatusEnum::Preparing->value)->count(),
            'completedOrders' => Order::where('status', OrderStatusEnum::Served->value)->count(),
            'totalRevenue' => (float) Order::where('payment_status', 'paid')->sum('total'),
        ];

       
        $orderUsers = Order::query()
            ->with(['customer', 'table', 'items.foodItem', 'updatedBy'])
            ->when($search, function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

            $orderTables = Table::orderBy('table_number')->get(['id', 'table_number']);
            $orderFoodItems = FoodItem::where('status', true)->orderBy('title')->get(['id', 'title', 'price']);
            $orderCustomers = User::orderBy('name')->get(['id', 'name', 'phone', 'email']);

        return Inertia::render('Admin/Order/Index', [
            'orderUsers' => $orderUsers,
            'orderStatuses' => OrderStatusEnum::labels(),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => $stats,
            'orderTables' => $orderTables,
            'orderFoodItems' => $orderFoodItems,
            'orderCustomers' => $orderCustomers,
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
