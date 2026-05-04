<?php

use App\Http\Controllers\Admin\DashbaordController;
use App\Http\Controllers\Admin\FoodCategoryController;
use App\Http\Controllers\Admin\FoodItemController;
use App\Http\Controllers\Admin\TableController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashbaordController::class, 'dashboard'])->name('dashboard');
    Route::resource('food-categories', FoodCategoryController::class);
    Route::resource('food-items', FoodItemController::class);
    Route::resource('tables', TableController::class);

    Route::get('/orders', [OrderController::class, 'index'])->name('orderIndex');
    Route::post('/orders/{order}/assign', [OrderController::class, 'assign'])->name('orderAssign');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orderStatusUpdate');
});
