<?php

namespace App\Http\Middleware;

use App\Models\Order;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cartService = app(CartService::class);
        $totalQuantity = $cartService->getTotalQuantity();
        $totalPrice = $cartService->getTotalPrice();
        $cartItems = $cartService->getCartItems();
        $activeOrder = $this->activeOrder($request);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'created_at' => $request->user()->created_at,
                    'updated_at' => $request->user()->updated_at,
                    'can' => $request->user()
                        ? $request->user()
                            ->getAllPermissions()
                            ->pluck('name')
                            ->mapWithKeys(fn ($permission) => [$permission => true])
                            ->all()
                        : [],
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            'totalPrice' => $totalPrice,
            'totalQuantity' => $totalQuantity,
            'cartItems' => $cartItems,
            'subtotal' => $cartService->subtotal(),
            'activeTable' => $activeOrder && $activeOrder['table_id'] ? [
                'id' => $activeOrder['table_id'],
                'table_number' => $activeOrder['table_number'],
            ] : (session('table_id') ? [
                'id' => session('table_id'),
                'table_number' => session('table_number'),
            ] : null),
            'activeOrder' => $activeOrder,

        ];
    }

    private function activeOrder(Request $request): ?array
    {
        $order = Order::query()
            ->with('table:id,table_number')
            ->find(session('active_order_id'));

        if (! $order || ! $order->isActive()) {
            return null;
        }

        if (
            ($request->user() && $order->customer_id !== $request->user()->id)
            || (! $request->user() && $order->customer_id !== null)
        ) {
            return null;
        }

        return [
            'id' => $order->id,
            'table_id' => $order->table_id,
            'table_number' => $order->table?->table_number,
        ];
    }
}
