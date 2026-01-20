<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('vehicles');

        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users', 'id', 'vehicles_user_id_foreign')->cascadeOnDelete();
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year')->index();
            $table->unsignedInteger('oil_interval_km')->default(5000);
            $table->unsignedInteger('current_km')->default(0);
            $table->unsignedInteger('last_oil_change_km')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'brand', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
