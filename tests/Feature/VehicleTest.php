<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VehicleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_vehicle_and_oil_due_logic(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/vehicles', [
            'brand' => 'Honda',
            'model' => 'Vario 125',
            'year' => 2020,
            'oil_interval_km' => 5000,
            'current_km' => 6000,
            'last_oil_change_km' => 1000,
        ]);

        $create->assertStatus(201);
        $this->assertTrue((bool) $create->json('oil_due'));
        $this->assertSame(5000, $create->json('km_since_oil'));
        $this->assertSame(0, $create->json('km_remaining_oil'));

        $vehicleId = $create->json('id');
        $this->assertNotNull($vehicleId);

        $mark = $this->postJson("/api/vehicles/{$vehicleId}/oil-change");
        $mark->assertOk();
        $this->assertFalse((bool) $mark->json('oil_due'));
        $this->assertSame(0, $mark->json('km_since_oil'));

        $down = $this->patchJson("/api/vehicles/{$vehicleId}/km", [
            'current_km' => 10,
        ]);
        $down->assertStatus(422);

        $up = $this->patchJson("/api/vehicles/{$vehicleId}/km", [
            'current_km' => 12000,
        ]);
        $up->assertOk();
        $this->assertTrue((bool) $up->json('oil_due'));
    }

    public function test_vehicle_year_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $bad = $this->postJson('/api/vehicles', [
            'brand' => 'Honda',
            'model' => 'Test',
            'year' => 2009,
        ]);
        $bad->assertStatus(422);
    }

    public function test_vehicle_maintenance_list_and_mark_done(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/vehicles', [
            'brand' => 'Honda',
            'model' => 'Vario 125',
            'year' => 2020,
            'current_km' => 0,
        ]);
        $create->assertStatus(201);
        $vehicleId = $create->json('id');

        $list = $this->getJson("/api/vehicles/{$vehicleId}/maintenance");
        $list->assertOk();
        $items = $list->json('items');
        $this->assertIsArray($items);
        $this->assertGreaterThan(0, count($items));

        $firstId = $items[0]['id'];
        $mark = $this->postJson("/api/vehicles/{$vehicleId}/maintenance/{$firstId}/done");
        $mark->assertOk();
    }
}
