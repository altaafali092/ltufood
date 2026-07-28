<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        abort_unless($foodItem->status, 404);

        $cartService->addItemToCart($foodItem, $data['quantity']);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$foodItem->title} added to cart successfully.",
        ]);

        return back();
    }

    public function update(Request $request, FoodItem $foodItem, CartService $cartService): RedirectResponse
    {
        $request->validate([
            'quantity' => ['integer', 'min:1'],
        ]);

        $quantity = $request->input('quantity');

        $cartService->updateItemQuantity($foodItem, $quantity);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quantity was updated')]);

        return back();
    }

    public function destroy(FoodItem $foodItem, CartService $cartService): RedirectResponse
    {

        $cartService->removeItemFromCart($foodItem);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Food was removed from Cart.')]);

        return back();
    }
}
