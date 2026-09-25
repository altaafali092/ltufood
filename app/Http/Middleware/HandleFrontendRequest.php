<?php

namespace App\Http\Middleware;

use App\Models\OfficeSetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class HandleFrontendRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share(
            ['officeSetting' => fn () => OfficeSetting::first()]
        );

        return $next($request);
    }
}
