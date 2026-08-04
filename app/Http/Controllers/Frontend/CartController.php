<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(CartService $cartService): JsonResponse
    {
        return response()->json([
            'items' => $cartService->all(),
            'count' => $cartService->count(),
            'subtotal' => $cartService->subtotal(),
        ]);
    }

    public function store(Request $request, FoodItem $foodItem, CartService $cartService): RedirectResponse
    {
        $request->mergeIfMissing([
            'quantity' => 1,
        ]);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        abort_unless($foodItem->status, 404);

        $cartService->addItemToCart($foodItem, $data['quantity']);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$foodItem->title}😊 added to cart successfully.",
        ]);

        return back();
    }

    // public function update(Request $request, FoodItem $foodItem, CartService $cartService): RedirectResponse
    // {
    //     $request->validate([
    //         'quantity' => ['integer', 'min:1'],
    //     ]);

    //     $quantity = $request->input('quantity');

    //     $cartService->updateItemQuantity($foodItem, $quantity);
    //     Inertia::flash('toast', ['type' => 'success', 'message' => __('Quantity was updated')]);

    //     return back();
    // }

    public function update(Request $request, FoodItem $foodItem, CartService $cartService): RedirectResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer'],
        ]);

        $cartService->updateItemQuantity($foodItem, (int) $request->quantity);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quantity was updated'),
        ]);

        return back();
    }

    public function destroy(FoodItem $foodItem, CartService $cartService): RedirectResponse
    {
        $cartService->removeItemFromCart($foodItem->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Food was removed from Cart.'),
        ]);

        return back();
    }

    // public function checkout(Request $request, CartService $cartService)
    // {

    //     $allCartItemsGrouped = $cartService->getCartItemsGrouped();

    //     if (empty($allCartItemsGrouped)) {
    //         return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
    //     }

    //     DB::beginTransaction();

    //     try {
    //         $checkoutCartItems = $allCartItemsGrouped;

    //         if ($vendorId && isset($allCartItemsGrouped[$vendorId])) {
    //             $checkoutCartItems = [$vendorId => $allCartItemsGrouped[$vendorId]];
    //         }

    //         $orders = [];

    //         foreach ($checkoutCartItems as $vendorUserId => $vendorCart) {
    //             $cartItems = $vendorCart['items'];

    //             // Validate stock before proceeding
    //             foreach ($cartItems as $item) {
    //                 $product = Product::with('variations')->find($item['product_id']);
    //                 $optionIds = $item['option_ids'] ?? [];

    //                 // Find variation
    //                 $selectedVariation = $product->variations->first(function ($variation) use ($optionIds) {
    //                     $variationOptionIds = is_string($variation->variation_types_option_ids)
    //                         ? json_decode($variation->variation_types_option_ids, true)
    //                         : $variation->variation_types_option_ids;

    //                     return collect($variationOptionIds)->sort()->values()->toArray() === collect($optionIds)->sort()->values()->toArray();
    //                 });

    //                 // Check variation stock
    //                 if ($selectedVariation && $selectedVariation->quantity < $item['quantity']) {
    //                     DB::rollBack();

    //                     return back()->with('error', 'Some items in your cart are no longer available.');
    //                 }

    //                 // Fallback to product-level stock
    //                 if (! $selectedVariation && $product->quantity < $item['quantity']) {
    //                     DB::rollBack();

    //                     return back()->with('error', 'Some items in your cart are no longer available.');
    //                 }
    //             }

    //             // All stock is valid — proceed to create order
    //             $user = $request->user();
    //             $totalPrice = $vendorCart['totalPrice'] ?? 0;

    //             $order = Order::create([
    //                 'user_id' => $user->id,
    //                 'vendor_user_id' => $vendorCart['user']['id'],
    //                 'total_price' => $totalPrice,
    //                 'status' => OrderStatusEnum::Draft->value,
    //                 'payment_method' => 'cash_on_delivery',
    //                 'online_payment_commission' => 0,
    //                 'website_commision' => $totalPrice,
    //                 'vendor_commision' => $totalPrice,
    //                 'payment_intent' => null,
    //                 'payment_session_id' => Str::uuid(),
    //             ]);

    //             foreach ($cartItems as $cartItem) {
    //                 OrderItem::create([
    //                     'order_id' => $order->id,
    //                     'product_id' => $cartItem['product_id'],
    //                     'quantity' => $cartItem['quantity'],
    //                     'price' => $cartItem['price'],
    //                     'variation_type_options_ids' => json_encode($cartItem['option_ids'] ?? []),
    //                 ]);

    //                 // Decrease stock now
    //                 $product = Product::with('variations')->find($cartItem['product_id']);
    //                 $optionIds = $cartItem['option_ids'] ?? [];

    //                 $selectedVariation = $product->variations->first(function ($variation) use ($optionIds) {
    //                     $variationOptionIds = is_string($variation->variation_types_option_ids)
    //                         ? json_decode($variation->variation_types_option_ids, true)
    //                         : $variation->variation_types_option_ids;

    //                     return collect($variationOptionIds)->sort()->values()->toArray() === collect($optionIds)->sort()->values()->toArray();
    //                 });

    //                 if ($selectedVariation) {
    //                     $selectedVariation->quantity -= $cartItem['quantity'];
    //                     $selectedVariation->in_stock = $selectedVariation->quantity > 0;
    //                     $selectedVariation->save();
    //                 } else {
    //                     $product->quantity -= $cartItem['quantity'];
    //                     $product->save();
    //                 }
    //             }

    //             // Email logic
    //             $shippingAddress = ShippingAddress::where('user_id', $user->id)->first();
    //             Mail::to($user->email)->send(new UserOrderConfirmationMail($order, $shippingAddress));

    //             $vendorEmail = $vendorCart['user']['email'] ?? null;
    //             if ($vendorEmail) {
    //                 Mail::to($vendorEmail)->send(new VendorOrderNotificationMail($order));
    //             }

    //             $orders[] = $order;
    //         }

    //         // ✅ Clear cart after order is created
    //         $cartService->clearCart();

    //         DB::commit();

    //         return redirect()->route('payment.success')->with('success', 'Thank you for your order!');
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         \Log::error('Checkout Error: '.$e->getMessage(), [
    //             'trace' => $e->getTrace(),
    //             'file' => $e->getFile(),
    //             'line' => $e->getLine(),
    //             'cart_items' => $cartItems ?? null,
    //         ]);

    //         return back()->with('error', 'Order placement failed. Please try again.');
    //     }
    // }
}
