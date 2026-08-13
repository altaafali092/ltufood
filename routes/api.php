<?php

use App\Http\Controllers\GeofenceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
// ENSURE THIS IS AT THE BOTTOM OF ROUTES/API.PHP
Route::post('geofence/verify/{qr_uuid}', [GeofenceController::class, 'verifyLocation']);
