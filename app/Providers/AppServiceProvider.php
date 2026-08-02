<?php

namespace App\Providers;

use App\Services\CartService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 1. Register CartService Singleton
        $this->app->singleton(CartService::class, function (): CartService {
            return new CartService;
        });

        // 2. Custom Fortify Login Response (Superadmin Protection & Custom Redirect)
        $this->app->singleton(LoginResponseContract::class, function () {
            return new class implements LoginResponseContract
            {
                public function toResponse($request): Response
                {
                    $user = Auth::user();
                    if ($user && $user->role === 'superadmin') {
                        Auth::guard('web')->logout();
                        $request->session()->invalidate();
                        $request->session()->regenerateToken();

                        return Inertia::location(route('admin.dashboard'));
                    }

                    return redirect()->intended(route('home'));
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->listenToAuthEvents();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }

    protected function listenToAuthEvents(): void
    {
        Event::listen(Login::class, function (Login $event) {
            $user = $event->user;

            // Skip cart transfer if user is superadmin
            if ($user->role === 'Super Admin') {
                return;
            }

            // Move cookie items to database exactly once
            app(CartService::class)->moveCartItemsToDatabase($user->id);
        });
    }
}
