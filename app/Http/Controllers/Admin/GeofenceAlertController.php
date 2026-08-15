<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeofenceAlert;
use Illuminate\Http\JsonResponse;

class GeofenceAlertController extends Controller
{
    /**
     * Return all alerts, newest first.
     */
    public function index(): JsonResponse
    {
        $alerts = GeofenceAlert::orderByDesc('created_at')->get([
            'id',
            'order_id',
            'table_number',
            'message',
            'read_at',
            'created_at',
        ]);

        return response()->json($alerts);
    }

    /**
     * Mark a single alert as read.
     */
    public function markRead(GeofenceAlert $geofenceAlert): JsonResponse
    {
        $geofenceAlert->markAsRead();

        return response()->json(['ok' => true]);
    }

    /**
     * Mark all alerts as read.
     */
    public function markAllRead(): JsonResponse
    {
        GeofenceAlert::whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    /**
     * Permanently delete a single alert.
     */
    public function destroy(GeofenceAlert $geofenceAlert): JsonResponse
    {
        $geofenceAlert->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Permanently delete all alerts.
     */
    public function destroyAll(): JsonResponse
    {
        GeofenceAlert::query()->delete();

        return response()->json(['ok' => true]);
    }
}
