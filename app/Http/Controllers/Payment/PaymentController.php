<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;


class PaymentController extends Controller
{
    public function show(Order $order)
    {
        if ($order->customer_id !== Auth::id()) {
            abort(403);
        }

        if ($order->payment_status === 'paid' || $order->status === 'cancelled') {
            return to_route('orders.receipt', $order->id);
        }

        return Inertia::render('Frontend/Order/PaymentOption', [
            'order' => $order->load(['items.foodItem', 'table']),
        ]);
    }


    /**
     * Process payment selection
     */
    public function process(Request $request, Order $order)
    {
        if ($order->customer_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'payment_method' => 'required|in:cash,esewa',
        ]);

        if ($request->payment_method === 'cash') {
            $order->update([
                'payment_method' => 'cash',
            ]);

            return redirect()->route('orders.receipt', $order->id)
                ->with('message', 'Please proceed to the reception counter to pay your bill.');
        }

        if ($request->payment_method === 'esewa') {
            // Redirects to your existing EsewaController initiate route
            return redirect()->route('esewa.initiate', $order->id);
        }
    }



    public function receipt(Order $order): Response
    {
        if ($order->customer_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Frontend/Order/Receipt', [
            'order' => $order->load(['items.foodItem', 'table']),
        ]);
    }




    // private function initiateEsewaPayment(Order $order)
    // {
    //     $order->update(['payment_method' => 'esewa']);

    //     // eSewa configuration parameters
    //     $merchantCode = config('services.esewa.merchant_code', 'EPAYTEST');
    //     $successUrl = route('orders.esewa.success', $order->id);
    //     $failureUrl = route('orders.esewa.failure', $order->id);

    //     // Required parameters for eSewa v2 API / standard form
    //     $esewaData = [
    //         'amount' => $order->subtotal,
    //         'tax_amount' => 0,
    //         'total_amount' => $order->total,
    //         'transaction_uuid' => $order->order_number . '-' . time(),
    //         'product_code' => $merchantCode,
    //         'product_service_charge' => 0,
    //         'product_delivery_charge' => 0,
    //         'success_url' => $successUrl,
    //         'failure_url' => $failureUrl,
    //         'signed_field_names' => 'total_amount,transaction_uuid,product_code',
    //     ];

    //     // Generate eSewa HMAC Signature (if using v2 API)
    //     $secretKey = config('services.esewa.secret_key', '8gBkn4AKMe552xBw');
    //     $signatureString = "total_amount={$esewaData['total_amount']},transaction_uuid={$esewaData['transaction_uuid']},product_code={$esewaData['product_code']}";
    //     $esewaData['signature'] = base64_encode(hash_hmac('sha256', $signatureString, $secretKey, true));

    //     return Inertia::render('Frontend/Order/EsewaRedirect', [
    //         'esewaUrl' => config('services.esewa.payment_url', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'),
    //         'params' => $esewaData,
    //     ]);
    // }

    // public function esewaSuccess(Request $request, Order $order)
    // {
    //     $order->update([
    //         'payment_status' => 'paid',
    //         'status' => $order->status === 'pending' ? 'preparing' : $order->status,
    //     ]);

    //     return redirect()->route('orders.receipt', $order->id)
    //         ->with('message', 'Payment successfully received via eSewa!');
    // }
    // /**
    //  * eSewa Payment Failure Callback
    //  */
    // public function esewaFailure(Order $order)
    // {
    //     return redirect()->route('orders.payment', $order->id)
    //         ->with('error', 'eSewa payment failed or was cancelled. Please try again.');
    // }
}
