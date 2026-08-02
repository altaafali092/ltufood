<?php

namespace App\Listeners;

use App\Services\CartService;
use Illuminate\Auth\Events\Login;

class MoveCartItemsToDatabase
{
    public function __construct(
        protected CartService $cartService
    ) {}

    public function handle(Login $event): void
    {
        $this->cartService->moveCartItemsToDatabase($event->user->id);
    }
}
