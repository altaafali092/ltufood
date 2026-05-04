<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{

    public function store(Request $request, Table $table)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.special_notes'=> 'nullable|string',
            'mood'                 => 'nullable|string|in:happy,sad,energetic,comfort,spicy,light',
            'customer_lat'         => 'nullable|numeric',
            'customer_lng'         => 'nullable|numeric',
        ]);

        // Create Order
        $order = Order::create([
            'table_id'      => $table->id,
            'customer_id'   => Auth::id(), // null for guest
            'status'        => 'pending',
            'mood'          => $validated['mood'],
            'customer_lat'  => $validated['customer_lat'],
            'customer_lng'  => $validated['customer_lng'],
        ]);

        // Add Order Items
        foreach ($validated['items'] as $item) {
            $foodItem = FoodItem::findOrFail($item['menu_item_id']);
            OrderItem::create([
                'order_id'       => $order->id,
                'food_item_id'   => $foodItem->id,
                'quantity'       => $item['quantity'],
                'price_at_time'  => $foodItem->price,
                'special_notes'  => $item['special_notes'] ?? null,
            ]);
        }

        $order->calculateTotal();
        $table->update(['is_occupied' => true]);

        // Broadcast real-time event
        // broadcast(new \App\Events\OrderPlaced($order))->toOthers();

        // return redirect()->route('order.track', $order->id)
        //     ->with('success', 'Order placed successfully!');
        return "order successfully placed";
    }
    
    public function track(Order $order)
    {
        return Inertia::render('Customer/TrackOrder', [
            'order' => $order->load('items.foodItem', 'table')
        ]);
    }

    /**
     * Admin: List all orders
     */
    public function index()
    {
        $orders = Order::with(['table', 'customer', 'items.foodItem'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders
        ]);
    }
    /**
     * Admin: Assign order to chef
     */
    // public function assign(Request $request, Order $order)
    // {
    //     $validated = $request->validate([
    //         'chef_id' => 'required|exists:users,id'
    //     ]);

    //     OrderAssignment::create([
    //         'order_id'    => $order->id,
    //         'chef_id'     => $validated['chef_id'],
    //         'assigned_by' => Auth::id(),
    //         'assigned_at' => now(),
    //     ]);

    //     $order->update(['status' => 'assigned']);

    //     // broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();

    //     return back()->with('success', 'Order assigned to chef.');
    // }


public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:preparing,ready,served,paid,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === 'paid') {
            $order->update(['checked_out_at' => now()]);
            $order->table?->update(['is_occupied' => false]);
        }

        // broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();

        return back()->with('success', 'Status updated.');
    }

}
