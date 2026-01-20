<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceItem;
use App\Models\Vehicle;
use App\Models\VehicleMaintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VehicleController extends Controller
{
    private function serialize(Vehicle $v): array
    {
        $sinceOil = max(0, (int) $v->current_km - (int) $v->last_oil_change_km);
        $remaining = max(0, (int) $v->oil_interval_km - $sinceOil);
        $due = $sinceOil >= (int) $v->oil_interval_km;

        return [
            'id' => $v->id,
            'brand' => $v->brand,
            'model' => $v->model,
            'year' => (int) $v->year,
            'oil_interval_km' => (int) $v->oil_interval_km,
            'current_km' => (int) $v->current_km,
            'last_oil_change_km' => (int) $v->last_oil_change_km,
            'km_since_oil' => $sinceOil,
            'km_remaining_oil' => $remaining,
            'oil_due' => $due,
            'created_at' => optional($v->created_at)->toISOString(),
            'updated_at' => optional($v->updated_at)->toISOString(),
        ];
    }

    public function index()
    {
        $vehicles = Vehicle::where('user_id', Auth::id())
            ->orderBy('brand')
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Vehicle $v) => $this->serialize($v))
            ->values();

        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:2010|max:2025',
            'oil_interval_km' => 'nullable|integer|min:500|max:50000',
            'current_km' => 'nullable|integer|min:0|max:20000000',
            'last_oil_change_km' => 'nullable|integer|min:0|max:20000000',
        ]);

        $current = (int) ($validated['current_km'] ?? 0);
        $lastOil = array_key_exists('last_oil_change_km', $validated) ? (int) $validated['last_oil_change_km'] : $current;
        if ($lastOil > $current) {
            return response()->json([
                'errors' => [
                    'last_oil_change_km' => ['KM ganti oli terakhir tidak boleh lebih besar dari KM saat ini.'],
                ],
            ], 422);
        }

        $vehicle = Auth::user()->vehicles()->create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => (int) $validated['year'],
            'oil_interval_km' => (int) ($validated['oil_interval_km'] ?? 5000),
            'current_km' => $current,
            'last_oil_change_km' => $lastOil,
        ]);

        $this->ensureMaintenancesForVehicle($vehicle);

        return response()->json($this->serialize($vehicle), 201);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($id);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:2010|max:2025',
            'oil_interval_km' => 'required|integer|min:500|max:50000',
            'current_km' => 'required|integer|min:0|max:20000000',
            'last_oil_change_km' => 'required|integer|min:0|max:20000000',
        ]);

        if ((int) $validated['last_oil_change_km'] > (int) $validated['current_km']) {
            return response()->json([
                'errors' => [
                    'last_oil_change_km' => ['KM ganti oli terakhir tidak boleh lebih besar dari KM saat ini.'],
                ],
            ], 422);
        }

        $vehicle->update([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => (int) $validated['year'],
            'oil_interval_km' => (int) $validated['oil_interval_km'],
            'current_km' => (int) $validated['current_km'],
            'last_oil_change_km' => (int) $validated['last_oil_change_km'],
        ]);

        return response()->json($this->serialize($vehicle));
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($id);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);
        $vehicle->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    public function maintenanceIndex($id)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($id);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $this->ensureMaintenancesForVehicle($vehicle);

        $rows = VehicleMaintenance::where('vehicle_id', $vehicle->id)
            ->with('item')
            ->orderBy('id')
            ->get()
            ->map(function (VehicleMaintenance $m) use ($vehicle) {
                $interval = (int) ($m->interval_km ?? $m->item->default_interval_km ?? 0);
                $since = max(0, (int) $vehicle->current_km - (int) $m->last_service_km);
                $remaining = $interval > 0 ? max(0, $interval - $since) : 0;
                $due = $m->enabled && $interval > 0 && $since >= $interval;

                return [
                    'id' => $m->id,
                    'maintenance_item_id' => $m->maintenance_item_id,
                    'name' => $m->item->name,
                    'interval_km' => $interval,
                    'last_service_km' => (int) $m->last_service_km,
                    'km_since_service' => $since,
                    'km_remaining' => $remaining,
                    'due' => $due,
                    'enabled' => (bool) $m->enabled,
                    'updated_at' => optional($m->updated_at)->toISOString(),
                ];
            })
            ->values();

        return response()->json([
            'vehicle' => $this->serialize($vehicle),
            'items' => $rows,
        ]);
    }

    public function maintenanceUpdate(Request $request, $vehicleId, $maintenanceId)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($vehicleId);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $maintenance = VehicleMaintenance::where('vehicle_id', $vehicle->id)->find($maintenanceId);
        if (!$maintenance) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'enabled' => 'nullable|boolean',
            'interval_km' => 'nullable|integer|min:500|max:50000',
        ]);

        if (array_key_exists('enabled', $validated)) $maintenance->enabled = (bool) $validated['enabled'];
        if (array_key_exists('interval_km', $validated)) $maintenance->interval_km = (int) $validated['interval_km'];
        $maintenance->save();

        return response()->json(['message' => 'Updated']);
    }

    public function maintenanceMarkDone($vehicleId, $maintenanceId)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($vehicleId);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $maintenance = VehicleMaintenance::where('vehicle_id', $vehicle->id)->find($maintenanceId);
        if (!$maintenance) return response()->json(['message' => 'Not found'], 404);

        $maintenance->last_service_km = (int) $vehicle->current_km;
        $maintenance->save();

        return response()->json(['message' => 'Marked done']);
    }

    public function updateKm(Request $request, $id)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($id);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'current_km' => 'required|integer|min:0|max:20000000',
        ]);

        $current = (int) $validated['current_km'];
        if ($current < (int) $vehicle->current_km) {
            return response()->json([
                'errors' => [
                    'current_km' => ['KM saat ini tidak boleh turun dari sebelumnya.'],
                ],
            ], 422);
        }

        $vehicle->current_km = $current;
        $vehicle->save();

        return response()->json($this->serialize($vehicle));
    }

    public function markOilChanged(Request $request, $id)
    {
        $vehicle = Vehicle::where('user_id', Auth::id())->find($id);
        if (!$vehicle) return response()->json(['message' => 'Not found'], 404);

        $vehicle->last_oil_change_km = (int) $vehicle->current_km;
        $vehicle->save();

        return response()->json($this->serialize($vehicle));
    }

    private function ensureMaintenancesForVehicle(Vehicle $vehicle): void
    {
        $items = MaintenanceItem::where('vehicle_kind', 'motor_matic')->get();
        foreach ($items as $item) {
            VehicleMaintenance::firstOrCreate(
                ['vehicle_id' => $vehicle->id, 'maintenance_item_id' => $item->id],
                ['interval_km' => $item->default_interval_km, 'last_service_km' => (int) $vehicle->current_km, 'enabled' => true]
            );
        }
    }
}
