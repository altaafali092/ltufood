<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    $order = Order::find($orderId);

    if (! $order) {
        return false;
    }

    return $user->id === $order->customer_id;
});
Broadcast::channel('restaurant-alerts', function (User $user) {
    return ! $user->hasRole('User');
});
