<?php

namespace App\Services;

use App\Models\Order;

class EsewaService
{
    public function getPaymentParameters(Order $order): array
    {
        $merchantCode = config('services.esewa.merchant_code', 'EPAYTEST');
        $secretKey = config('services.esewa.secret_key', '8gBmUz3q1GE0MBDWG2A85377A3A6aB6A');

        // 1. Convert all values to float to prevent mathematical mismatches
        $amount = (float) $order->subtotal;
        $taxAmount = (float) ($order->tax_amount ?? 0);
        $serviceCharge = (float) ($order->service_charge ?? 0);
        $deliveryCharge = (float) ($order->delivery_charge ?? 0);

        // 2. Mathematically calculate total_amount to guarantee eSewa's formula passes:
        // total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
        $calculatedTotal = $amount + $taxAmount + $serviceCharge + $deliveryCharge;

        // 3. Format ALL amounts strictly to 2 decimal places as strings (e.g., "100.00")
        $amountStr = number_format($amount, 2, '.', '');
        $taxAmountStr = number_format($taxAmount, 2, '.', '');
        $serviceChargeStr = number_format($serviceCharge, 2, '.', '');
        $deliveryChargeStr = number_format($deliveryCharge, 2, '.', '');
        $totalAmountStr = number_format($calculatedTotal, 2, '.', '');

        $transactionUuid = $order->transaction_uuid;

        // 4. Construct the signature payload
        // The message MUST follow: total_amount=100.00,transaction_uuid=xxx,product_code=EPAYTEST
        $signedFieldNames = 'total_amount,transaction_uuid,product_code';
        $signatureMessage = "total_amount={$totalAmountStr},transaction_uuid={$transactionUuid},product_code={$merchantCode}";

        // 5. Generate raw HMAC-SHA256 signature and Base64 encode it
        $rawSignature = hash_hmac('sha256', $signatureMessage, $secretKey, true);
        $signature = base64_encode($rawSignature);

        return [
            'amount' => $amountStr,
            'tax_amount' => $taxAmountStr,
            'total_amount' => $totalAmountStr,
            'transaction_uuid' => $transactionUuid,
            'product_code' => $merchantCode,
            'product_service_charge' => $serviceChargeStr,
            'product_delivery_charge' => $deliveryChargeStr,
            'success_url' => route('esewa.success'),
            'failure_url' => route('esewa.failure'),
            'signed_field_names' => $signedFieldNames,
            'signature' => $signature,
        ];
    }
}