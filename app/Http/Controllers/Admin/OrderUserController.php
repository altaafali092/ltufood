<?php

namespace App\Http\Controllers\Admin;

use App\Enum\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
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
            ->when($status && $status !== 'all', function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->get();

        return Inertia::render('Admin/Order/Index', [
            'orderUsers' => $orderUsers,
            'orderStatuses' => OrderStatusEnum::labels(), // Returns key-value pair of statuses
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function status(Request $request, Order $orderUser)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatusEnum::class)],
        ]);

        $orderUser->update([
            'status' => $validated['status'],
        ]);

        // Broadcast to everyone listening on "orders.{id}"
        broadcast(new OrderStatusUpdated($orderUser));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order status updated successfully.')]);

        return back();
    }
}
