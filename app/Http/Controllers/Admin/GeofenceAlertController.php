<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeofenceAlert;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class GeofenceAlertController extends Controller
{
    /**
     * Return all alerts, newest first.
     */
    public function index()
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
    public function markRead(GeofenceAlert $geofenceAlert)
    {
        $geofenceAlert->markAsRead();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status Marked as Read Successfully.')]);
        return back();
    }

    /**
     * Mark all alerts as read.
     */
    public function markAllRead()
    {
        GeofenceAlert::whereNull('read_at')->update(['read_at' => now()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status MarkedAll Read Successfully.')]);
        return back();
    }

    /**
     * Permanently delete a single alert.
     */
    public function destroy(GeofenceAlert $geofenceAlert)
    {
        $geofenceAlert->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status Deleted Successfully.')]);
        return back();
    }

    /**
     * Permanently delete all alerts.
     */
    public function destroyAll()
    {
        GeofenceAlert::query()->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status Deleted All Successfully.')]);
        return back();
    }
}
