<?php

namespace App\Http\Controllers;

use App\Enum\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function store(Request $request, CartService $cartService): RedirectResponse
    {
        $validated = $request->validate([
            'table_id' => ['nullable', 'exists:tables,id'],
            'order_type' => ['nullable', 'string', 'in:dine_in,takeaway,delivery'],
            'payment_method' => ['nullable', 'string', 'in:cash_at_reception,esewa,card,khalti'],
            'mood' => ['nullable', 'string', 'in:happy,sad,energetic,comfort,spicy,light'],
            'customer_lat' => ['nullable', 'numeric'],
            'customer_lng' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $cartItems = $cartService->getCartItems();

        if ($cartItems === []) {
            return back()->withErrors([
                'cart' => __('Your cart is empty.'),
            ]);
        }

        $foodItems = FoodItem::whereIn('id', collect($cartItems)->pluck('food_item_id'))
            ->get()
            ->keyBy('id');

        $subtotal = collect($cartItems)->sum(function (array $cartItem) use ($foodItems): float {
            $foodItem = $foodItems->get($cartItem['food_item_id']);

            if (! $foodItem || ! $foodItem->status) {
                return 0;
            }

            return (float) $foodItem->price * (int) $cartItem['quantity'];
        });

        if ($subtotal <= 0) {
            return back()->withErrors([
                'cart' => __('Your cart does not contain available food items.'),
            ]);
        }

        $order = DB::transaction(function () use ($cartItems, $cartService, $foodItems, $subtotal, $validated): Order {
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'table_id' => $validated['table_id'] ?? null,
                'customer_id' => Auth::id(),
                'order_type' => $validated['order_type'] ?? 'dine_in',
                'status' => OrderStatusEnum::Pending->value,
                'payment_method' => $validated['payment_method'] ?? 'cash_at_reception',
                'payment_status' => 'unpaid',
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total' => $subtotal,
                'mood' => $validated['mood'] ?? null,
                'customer_lat' => $validated['customer_lat'] ?? null,
                'customer_lng' => $validated['customer_lng'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($cartItems as $cartItem) {
                $foodItem = $foodItems->get($cartItem['food_item_id']);

                if (! $foodItem || ! $foodItem->status) {
                    continue;
                }

                $quantity = (int) $cartItem['quantity'];
                $price = (float) $foodItem->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'food_item_id' => $foodItem->id,
                    'quantity' => $quantity,
                    'price_at_time' => $price,
                    'total_price' => $price * $quantity,
                ]);
            }

            $cartService->clearCart();

            return $order;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Order placed successfully.'),
        ]);

        return back()->with('order_id', $order->id);
    }

    public function track(Order $order)
    {
        $order->load(['items.foodItem', 'table']);

        return Inertia::render('Frontend/Order/TrackOrder', [
            'order' => $order,
            'statuses' => OrderStatusEnum::cases(),
        ]);
    }

    /**
     * Admin: List all orders
     */
    public function index(): Response
    {
        // Fetch orders belonging to the authenticated user
        $orders = Order::where('customer_id', Auth::id())
            ->with(['table', 'items.foodItem'])
            ->latest()
            ->get();

        return Inertia::render('Frontend/Order/Index', [
            'orders' => $orders,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatusEnum::class)],
        ]);

        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === OrderStatusEnum::Served->value) {
            $order->update(['checked_out_at' => now()]);
            $order->table?->update(['is_occupied' => false]);
        }

        broadcast(new OrderStatusUpdated($order));

        return back()->with('success', __('Status updated.'));
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
