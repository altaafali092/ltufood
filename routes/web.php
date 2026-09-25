<?php

use App\Http\Controllers\Ai\ChatController;
use App\Http\Controllers\FrontController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\UserAuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Payment\EsewaController;
use App\Http\Controllers\Payment\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontController::class, 'index'])->name('home');
Route::get('/table/{qr_uuid}', [FrontController::class, 'scanTable'])->name('table.scan');
Route::get('food-item-detail/{foodItem:slug}', [FrontController::class, 'foodItemDetail'])->name('foodItemDetail');

Route::controller(CartController::class)->group(function () {
    Route::get('cart', 'index')->name('cartIndex');
    Route::post('/cart/add/{foodItem}', 'store')->name('cartStore');
    Route::put('cart/{foodItem}', 'update')->name('cartUpdate');
    Route::delete('/cart/{foodItem}', 'destroy')->name('cartDestroy');
});

Route::post('/orders', [OrderController::class, 'store'])->name('ordersStore');
Route::get('/orders/available-tables', [OrderController::class, 'availableTables'])->name('orders.availableTables');
Route::post('/orders/{order}/switch-table', [OrderController::class, 'switchTable'])->name('orders.switchTable');

Route::get('/orders', [OrderController::class, 'index'])->name('orderIndex');
Route::post('/orders/{order}/assign', [OrderController::class, 'assign'])->name('orderAssign');
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orderStatusUpdate');

Route::get('/login', [UserAuthController::class, 'loginPage'])->name('loginPage');
Route::post('/login', [UserAuthController::class, 'login'])->name('userLogin');
Route::get('/register', [UserAuthController::class, 'registerPage'])->name('registerPage');
Route::post('/register', [UserAuthController::class, 'registerUser'])->name('registerUser');
Route::post('/userLogout', [UserAuthController::class, 'userLogout'])->name('userLogout');

Route::middleware('auth')->group(function () {
    Route::get('/order/track/{order:order_number}', [OrderController::class, 'track'])->name('orderTrack');

    Route::get('/orders/{order}/payment', [PaymentController::class, 'show'])->name('orderPayment');
    Route::post('/orders/{order}/payment', [PaymentController::class, 'process'])->name('orderPaymentProcess');
    Route::get('/orders/{order:order_number}/receipt', [PaymentController::class, 'receipt'])->name('orders.receipt');

    // Your Existing eSewa routes
    Route::get('/esewa/initiate/{order}', [EsewaController::class, 'initiate'])->name('esewa.initiate');
    Route::get('/esewa/success', [EsewaController::class, 'success'])->name('esewa.success');
    Route::get('/esewa/failure', [EsewaController::class, 'failure'])->name('esewa.failure');

    Route::get('/chat', [ChatController::class, 'chat'])->name('chat');
    Route::post('/chat/message', [ChatController::class, 'sendMessage'])->name('chat.message');
});
require __DIR__.'/settings.php';
