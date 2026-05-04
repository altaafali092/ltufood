<?php

use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

   Route::post('/orders', [OrderController::class, 'store'])->name('ordersStore');
    Route::get('/order/track/{order}', [OrderController::class, 'track'])->name('orderTrack');



require __DIR__.'/settings.php';
