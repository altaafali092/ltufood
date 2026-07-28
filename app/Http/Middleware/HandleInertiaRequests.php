<?php

namespace App\Http\Middleware;

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
                        ->mapWithKeys(fn($permission) => [$permission => true])
                        ->all()
                        : [],
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cart' => fn(): array => [
                'items' => app(CartService::class)->all(),
                'count' => app(CartService::class)->count(),
                'subtotal' => app(CartService::class)->subtotal(),
            ],
        ];
    }
}
