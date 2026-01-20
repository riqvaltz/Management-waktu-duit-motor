<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_items', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_kind')->index(); // motor_matic | motor_manual | mobil
            $table->string('name');
            $table->unsignedInteger('default_interval_km')->nullable();
            $table->string('unit')->default('km');
            $table->timestamps();

            $table->unique(['vehicle_kind', 'name']);
        });

        $now = now();
        DB::table('maintenance_items')->insert([
            ['vehicle_kind' => 'motor_matic', 'name' => 'Oli mesin', 'default_interval_km' => 2500, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Oli gardan / final gear', 'default_interval_km' => 10000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Filter udara', 'default_interval_km' => 14000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Busi', 'default_interval_km' => 10000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'CVT - V-belt', 'default_interval_km' => 22000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'CVT - Roller', 'default_interval_km' => 20000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'CVT - Kampas ganda', 'default_interval_km' => 25000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'CVT - Mangkok kopling', 'default_interval_km' => 25000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Kampas rem depan', 'default_interval_km' => 15000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Sepatu rem belakang', 'default_interval_km' => 20000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Bersihkan throttle body / injector', 'default_interval_km' => 15000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
            ['vehicle_kind' => 'motor_matic', 'name' => 'Setel klep', 'default_interval_km' => 24000, 'unit' => 'km', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_items');
    }
};

