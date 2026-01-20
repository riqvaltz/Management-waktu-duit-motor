<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_list_update_and_delete_activity(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/activities', [
            'date' => '2026-01-01',
            'start_time' => '10:00',
            'end_time' => '10:30',
            'title' => 'Nyapu',
            'notes' => 'Bersihin ruang tamu',
        ]);

        $create->assertStatus(201);
        $activityId = $create->json('id');
        $this->assertNotNull($activityId);

        $list = $this->getJson('/api/activities?date=2026-01-01');
        $list->assertOk();
        $list->assertJsonFragment([
            'id' => $activityId,
            'title' => 'Nyapu',
            'start_time' => '10:00',
            'end_time' => '10:30',
        ]);

        $markDone = $this->patchJson("/api/activities/{$activityId}/completed", [
            'completed' => true,
        ]);
        $markDone->assertOk();
        $this->assertNotNull($markDone->json('completed_at'));

        $unmark = $this->patchJson("/api/activities/{$activityId}/completed", [
            'completed' => false,
        ]);
        $unmark->assertOk();
        $this->assertNull($unmark->json('completed_at'));

        $update = $this->putJson("/api/activities/{$activityId}", [
            'date' => '2026-01-01',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'title' => 'Nyapu + Pel',
            'notes' => 'Sekalian pel',
        ]);
        $update->assertOk();
        $update->assertJsonFragment([
            'id' => $activityId,
            'title' => 'Nyapu + Pel',
            'end_time' => '11:00',
        ]);

        $del = $this->deleteJson("/api/activities/{$activityId}");
        $del->assertOk();

        $after = $this->getJson('/api/activities?date=2026-01-01');
        $after->assertOk();
        $this->assertCount(0, $after->json());
    }
}
