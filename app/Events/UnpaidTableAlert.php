<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnpaidTableAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $tableNumber;
    public $orderId;

    public function __construct(Table $table,Order $order)
    {
        $this->tableNumber = $table->table_number;
        $this->orderId = $order->id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('restaurant-alerts'),
        ];
    }
    
    public function broadcastWith(): array
    {
        return [
            'message' => "Alert: Table {$this->tableNumber} left the area without paying their bill!",
            'order_id' => $this->orderId,
            'table_number' => $this->tableNumber,
        ];
    }
}
