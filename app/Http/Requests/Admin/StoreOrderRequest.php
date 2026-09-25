<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_uuid' => ['required', 'uuid'],
            'table_id' => ['required', 'integer', 'exists:tables,id'],
            'customer_id' => ['nullable', 'integer', 'exists:users,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:40'],
            'order_type' => ['required', 'string', 'in:dine_in,takeaway,delivery'],
            'payment_method' => ['nullable', 'string', 'in:cash_at_reception,esewa,card,khalti'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'subtotal' => ['required', 'numeric', 'min:0.01'],
            'total' => ['required', 'numeric', 'min:0.01'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_item_id' => ['required', 'integer', 'exists:food_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
