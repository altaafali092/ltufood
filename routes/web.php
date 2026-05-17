<?php

use App\Http\Controllers\FrontController;
use App\Http\Controllers\Frontend\UserAuthController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/test',[FrontController::class,'test'])->name('test');
Route::get('/', [FrontController::class, 'index'])->name('home');
Route::post('/orders', [OrderController::class, 'store'])->name('ordersStore');
Route::get('/order/track/{order}', [OrderController::class, 'track'])->name('orderTrack');

Route::get('/login', [UserAuthController::class, 'loginPage'])->name('loginPage');
Route::post('/login', [UserAuthController::class, 'login'])->name('userLogin');
Route::get('/register', [UserAuthController::class, 'registerPage'])->name('registerPage');

require __DIR__ . '/settings.php';
