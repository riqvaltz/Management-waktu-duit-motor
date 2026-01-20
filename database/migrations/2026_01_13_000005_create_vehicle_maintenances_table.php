<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('maintenance_item_id')->constrained('maintenance_items')->cascadeOnDelete();
            $table->unsignedInteger('interval_km')->nullable();
            $table->unsignedInteger('last_service_km')->default(0);
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['vehicle_id', 'maintenance_item_id']);
            $table->index(['vehicle_id', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_maintenances');
    }
};

