<?php

namespace App\Services;

use App\Enum\OrderStatusEnum;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminOrderService
{
    /**
     * @param array{
     *     client_uuid: string,
     *     table_id: int,
     *     customer_name?: string|null,
     *     customer_phone?: string|null,
     *     customer_id?: int|null,
     *     order_type?: string,
     *     payment_method?: string|null,
     *     notes?: string|null,
     *     items: array<int, array{food_item_id: int, quantity: int, price: numeric}>,
     *     subtotal: numeric,
     *     total: numeric
     * } $data
     */
    public function create(array $data, bool $allowOccupiedTable = false): Order
    {
        try {
            return DB::transaction(function () use ($data, $allowOccupiedTable): Order {
                $existingOrder = Order::query()
                    ->where('client_uuid', $data['client_uuid'])
                    ->first();

                if ($existingOrder) {
                    return $existingOrder->load(['customer', 'table', 'items.foodItem']);
                }

                $table = Table::query()->lockForUpdate()->find($data['table_id']);

                if (! $table) {
                    throw ValidationException::withMessages([
                        'table_id' => __('The selected table does not exist.'),
                    ]);
                }

                if (! $allowOccupiedTable && ($table->is_occupied || $this->hasActiveOrder($table))) {
                    throw ValidationException::withMessages([
                        'table_id' => __('The selected table is not available.'),
                    ]);
                }

                $foodItems = FoodItem::query()
                    ->whereIn('id', collect($data['items'])->pluck('food_item_id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');
                $calculatedSubtotal = 0.0;

                foreach ($data['items'] as $item) {
                    $foodItem = $foodItems->get($item['food_item_id']);

                    if (! $foodItem || ! $foodItem->status) {
                        throw ValidationException::withMessages([
                            'items' => __('One or more selected food items are unavailable.'),
                        ]);
                    }

                    if (round((float) $foodItem->price, 2) !== round((float) $item['price'], 2)) {
                        throw ValidationException::withMessages([
                            'items' => __('A food item price has changed. Refresh the menu and try again.'),
                        ]);
                    }

                    $calculatedSubtotal += (float) $foodItem->price * (int) $item['quantity'];
                }

                if (round($calculatedSubtotal, 2) !== round((float) $data['subtotal'], 2)
                    || round($calculatedSubtotal, 2) !== round((float) $data['total'], 2)) {
                    throw ValidationException::withMessages([
                        'total' => __('The order total is invalid. Refresh the menu and try again.'),
                    ]);
                }

                $order = Order::create([
                    'order_number' => $this->orderNumber(),
                    'client_uuid' => $data['client_uuid'],
                    'table_id' => $table->id,
                    'customer_id' => $data['customer_id'] ?? null,
                    'order_type' => $data['order_type'] ?? 'dine_in',
                    'status' => OrderStatusEnum::Pending->value,
                    'payment_method' => $data['payment_method'] ?? 'cash_at_reception',
                    'payment_status' => 'unpaid',
                    'subtotal' => $calculatedSubtotal,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total' => $calculatedSubtotal,
                    'notes' => $data['notes'] ?? $this->customerNote($data),
                ]);

                foreach ($data['items'] as $item) {
                    $price = (float) $foodItems->get($item['food_item_id'])->price;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'food_item_id' => $item['food_item_id'],
                        'quantity' => $item['quantity'],
                        'price_at_time' => $price,
                        'total_price' => $price * $item['quantity'],
                    ]);
                }

                $table->update(['is_occupied' => true]);

                return $order->load(['customer', 'table', 'items.foodItem']);
            });
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }

            $existingOrder = Order::query()
                ->where('client_uuid', $data['client_uuid'])
                ->first();

            if (! $existingOrder) {
                throw $exception;
            }

            return $existingOrder->load(['customer', 'table', 'items.foodItem']);
        }
    }

    private function hasActiveOrder(Table $table): bool
    {
        return $table->orders()
            ->whereNotIn('status', [
                OrderStatusEnum::Cancelled->value,
                OrderStatusEnum::Served->value,
            ])
            ->exists();
    }

    private function orderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    private function customerNote(array $data): ?string
    {
        $details = collect([
            $data['customer_name'] ?? null ? 'Customer: '.$data['customer_name'] : null,
            $data['customer_phone'] ?? null ? 'Phone: '.$data['customer_phone'] : null,
        ])->filter()->implode(' | ');

        return $details !== '' ? $details : null;
    }
}
