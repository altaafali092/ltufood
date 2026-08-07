<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class PreventUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        // Block only users with the "User" role
        if (Auth::user()->hasRole('User')) {
            // abort(403, 'You are not authorized to access this page.');

            Inertia::flash('toast', ['type' => 'error', 'message' => __('Unauthorized access')]);
            return to_route('home');
        }

        return $next($request);
    }
}
