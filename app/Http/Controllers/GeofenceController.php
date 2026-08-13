<?php

namespace App\Http\Controllers;

use App\Events\UnpaidTableAlert;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GeofenceController extends Controller
{
    public function verifyLocation(Request $request, $qr_uuid)
    {
        Log::info("Geofence API Pinged!", [
            'uuid_received' => $qr_uuid,
            'lat_received' => $request->lat,
            'lng_received' => $request->lng
        ]);

        // 2. Break down the query to see if the UUID is missing
        $table = Table::where('qr_uuid', $qr_uuid)->first();

        if (!$table) {
            Log::error("Geofence Error: Table UUID not found in database.", ['uuid' => $qr_uuid]);
            return response()->json(['error' => 'Table not found in database matching this UUID.'], 404);
        }

        $activeOrder = $table->activeOrder();
        if (!$activeOrder) {
            return response()->json(['status' => 'clear', 'message' => 'No unpaid bills.']);
        }

        // Haversine Calculation...
        $earthRadius = 6371000;
        $latFrom = deg2rad($table->lat);
        $lngFrom = deg2rad($table->lng);
        $latTo = deg2rad($request->lat);
        $lngTo = deg2rad($request->lng);
        $angle = 2 * asin(sqrt(pow(sin(($latTo - $latFrom) / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin(($lngTo - $lngFrom) / 2), 2)));
        $distance = $angle * $earthRadius;

        Log::info("Distance calculated", ['table' => $table->table_number, 'distance_meters' => $distance, 'allowed_radius' => $table->radius_meters]);

        if ($distance > $table->radius_meters) {
            broadcast(new UnpaidTableAlert($table, $activeOrder))->toOthers();
            return response()->json(['status' => 'outside_boundary', 'message' => "Left boundary!"], 403);
        }

        return response()->json(['status' => 'inside_boundary']);
    }
}
