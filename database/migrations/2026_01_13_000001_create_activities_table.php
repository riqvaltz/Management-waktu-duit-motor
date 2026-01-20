<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->index();
            $table->date('date')->index();
            $table->time('start_time')->index();
            $table->time('end_time')->index();
            $table->string('title');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};

