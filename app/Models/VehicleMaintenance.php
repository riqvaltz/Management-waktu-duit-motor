<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'maintenance_item_id',
        'interval_km',
        'last_service_km',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function item()
    {
        return $this->belongsTo(MaintenanceItem::class, 'maintenance_item_id');
    }
}

