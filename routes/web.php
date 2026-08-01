<?php

use App\Http\Controllers\FrontController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\UserAuthController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontController::class, 'index'])->name('home');
Route::get('food-item-detail/{foodItem:slug}', [FrontController::class, 'foodItemDetail'])->name('foodItemDetail');

Route::controller(CartController::class)->group(function () {
    Route::get('cart', 'index')->name('cartIndex');
    Route::post('/cart/add/{foodItem}', 'store')->name('cartStore');
    Route::put('cart/{foodItem}', 'update')->name('cartUpdate');
    Route::delete('/cart/{foodItem}', 'destroy')->name('cartDestroy');
});

Route::post('/orders', [OrderController::class, 'store'])->name('ordersStore');
Route::get('/order/track/{order}', [OrderController::class, 'track'])->name('orderTrack');

Route::get('/login', [UserAuthController::class, 'loginPage'])->name('loginPage');
Route::post('/login', [UserAuthController::class, 'login'])->name('userLogin');
Route::get('/register', [UserAuthController::class, 'registerPage'])->name('registerPage');
Route::post('/register', [UserAuthController::class, 'registerUser'])->name('registerUser');
Route::post('/userLogout', [UserAuthController::class, 'userLogout'])->name('userLogout');


require __DIR__.'/settings.php';
