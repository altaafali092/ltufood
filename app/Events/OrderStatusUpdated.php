<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel; // <-- Import PrivateChannel
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $orderUser) {}

    /**
     * Broadcast on private-orders.{id}
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("orders.{$this->orderUser->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderStatusUpdated';
    }

    public function broadcastWith(): array
    {
        $statusValue = $this->orderUser->status;

        if ($statusValue instanceof \BackedEnum) {
            $statusValue = $statusValue->value;
        }

        return [
            'order' => [
                'id'     => $this->orderUser->id,
                'status' => $statusValue,
            ],
        ];
    }
}