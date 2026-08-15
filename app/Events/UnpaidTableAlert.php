<?php

namespace App\Events;

use App\Models\GeofenceAlert;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnpaidTableAlert implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $alertId;

    public string $tableNumber;

    public int $orderId;

    public string $message;

    public string $timestamp;

    public function __construct(Table $table, Order $order)
    {
        $this->tableNumber = (string) ($table->table_number ?? $table->name ?? 'Unknown');
        $this->orderId = (int) $order->id;
        $this->message = "Alert: Table {$this->tableNumber} left the area without paying their bill!";
        $this->timestamp = now()->toIso8601String();

        $alert = GeofenceAlert::create([
            'order_id' => $this->orderId,
            'table_number' => $this->tableNumber,
            'message' => $this->message,
        ]);

        $this->alertId = $alert->id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('restaurant-alerts')];
    }

    public function broadcastAs(): string
    {
        return 'UnpaidTableAlert';
    }

    public function broadcastWith(): array
    {
        return [
            'alert_id' => $this->alertId,
            'message' => $this->message,
            'order_id' => $this->orderId,
            'table_number' => $this->tableNumber,
            'timestamp' => $this->timestamp,
        ];
    }
}
