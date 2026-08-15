<?php

use App\Http\Controllers\Admin\DashbaordController;
use App\Http\Controllers\Admin\FoodCategoryController;
use App\Http\Controllers\Admin\FoodItemController;
use App\Http\Controllers\Admin\GeofenceAlertController;
use App\Http\Controllers\Admin\OrderUserController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SubCategoryController;
use App\Http\Controllers\Admin\TableController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'prevent-user'])->group(function () {
    Route::get('dashboard', [DashbaordController::class, 'dashboard'])->name('dashboard');
    Route::resource('food-categories', FoodCategoryController::class);
    Route::resource('food-items', FoodItemController::class);
    Route::resource('sub-categories', SubCategoryController::class);
    Route::resource('tables', TableController::class);

    Route::resource('userOrders', OrderUserController::class);
    Route::patch('orderUser/{orderUser}', [OrderUserController::class, 'status'])
        ->name('orderStatus');

    Route::resource('permission', PermissionController::class);
    Route::resource('role', RoleController::class);
    Route::resource('user', UserController::class);

    // Geofence alert notifications
    Route::prefix('geofence-alerts')->name('geofence-alerts.')->group(function () {
        Route::get('/', [GeofenceAlertController::class, 'index'])->name('index');
        Route::patch('{geofenceAlert}/read', [GeofenceAlertController::class, 'markRead'])->name('read');
        Route::patch('read-all', [GeofenceAlertController::class, 'markAllRead'])->name('read-all');
        Route::delete('delete-all', [GeofenceAlertController::class, 'destroyAll'])->name('destroy-all');
        Route::delete('{geofenceAlert}', [GeofenceAlertController::class, 'destroy'])->name('destroy');
    });
});
