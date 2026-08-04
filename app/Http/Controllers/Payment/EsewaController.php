<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\EsewaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EsewaController extends Controller
{
public function __construct(protected EsewaService $esewaService) {}

/**
 * Initiate Payment Redirect / Send Form Payload
 */
public function initiate(Order $order)
{
    // Ensure unique transaction ID per payment attempt
    if (! $order->transaction_uuid) {
        $order->update([
            'transaction_uuid' => 'ORD-'.$order->id.'-'.Str::random(6),
            'payment_method' => 'esewa',
        ]);
    }

    $params = $this->esewaService->getPaymentParameters($order);

    return Inertia::render('Frontend/Order/EsewaRedirect', [
        'params' => $params,
    ]);

    
}

/**
 * Handle eSewa Success Redirect
 */
public function success(Request $request)
{
    $encodedData = $request->query('data');

    if (!$encodedData) {
        return redirect()->route('home')->with('error', 'Invalid eSewa response.');
    }

    // 1. Decode Base64 string from eSewa
    $decodedJson = base64_decode($encodedData);
    $response = json_decode($decodedJson, true);

    if (!$response || !isset($response['transaction_uuid'])) {
        return redirect()->route('home')->with('error', 'Failed to read transaction payload.');
    }

    // 2. Locate order by transaction_uuid
    $order = Order::where('transaction_uuid', $response['transaction_uuid'])->first();

    if (!$order) {
        return redirect()->route('home')->with('error', 'Order not found.');
    }

    // 3. Check status from eSewa payload
    if (($response['status'] ?? '') === 'COMPLETE') {
        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
            'esewa_transaction_id' => $response['transaction_code'] ?? null,
            'paid_at' => now(),
        ]);

        return redirect()->route('orders.receipt', $order->id)
            ->with('message', 'Payment successfully processed via eSewa!');
    }

    return redirect()->route('orders.payment', $order->id)
        ->with('error', 'Payment verification was not completed.');
}

/**
 * Handle eSewa Failure Redirect
 */
public function failure()
{
    return redirect()->route('home')->with('error', 'Payment was cancelled or failed.');
}
}
