<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\VehicleController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    Route::get('/daily-summary', [TransactionController::class, 'dailySummary']);
    Route::get('/summary-range', [TransactionController::class, 'summaryRange']);
    Route::get('/export/monthly', [TransactionController::class, 'exportMonthlyCsv']);

    Route::get('/activities', [ActivityController::class, 'index']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::patch('/activities/{id}/completed', [ActivityController::class, 'setCompleted']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);
    Route::patch('/vehicles/{id}/km', [VehicleController::class, 'updateKm']);
    Route::post('/vehicles/{id}/oil-change', [VehicleController::class, 'markOilChanged']);
    Route::get('/vehicles/{id}/maintenance', [VehicleController::class, 'maintenanceIndex']);
    Route::patch('/vehicles/{vehicleId}/maintenance/{maintenanceId}', [VehicleController::class, 'maintenanceUpdate']);
    Route::post('/vehicles/{vehicleId}/maintenance/{maintenanceId}/done', [VehicleController::class, 'maintenanceMarkDone']);
});
