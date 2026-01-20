<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_fn_01_set_saldo_awal()
    {
        $response = $this->postJson('/api/transactions', [
            'date' => '2026-01-13',
            'type' => 'initial_balance',
            'amount' => 10000000,
            'description' => 'Saldo Awal',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('transactions', [
            'amount' => 10000000,
            'type' => 'initial_balance',
        ]);

        // Check summary
        $summary = $this->getJson('/api/daily-summary?date=2026-01-13');
        $summary->assertJson([
            'opening_balance' => 0,
            'total_in' => 10000000,
            'total_out' => 0,
            'closing_balance' => 10000000
        ]);
    }

    public function test_fn_02_input_pemasukan()
    {
        // Setup initial balance
        Transaction::create([
            'user_id' => $this->user->id,
            'date' => '2026-01-13',
            'type' => 'initial_balance',
            'amount' => 10000000
        ]);

        $response = $this->postJson('/api/transactions', [
            'date' => '2026-01-13',
            'type' => 'income',
            'amount' => 500000,
            'description' => 'Project Web',
        ]);

        $response->assertStatus(201);

        $summary = $this->getJson('/api/daily-summary?date=2026-01-13');
        $summary->assertJson([
            'opening_balance' => 0,
            'total_in' => 10500000, // 10m + 500k
            'total_out' => 0,
            'closing_balance' => 10500000
        ]);
    }

    public function test_fn_03_input_pengeluaran()
    {
        // Setup balance
        Transaction::create([
            'user_id' => $this->user->id,
            'date' => '2026-01-13',
            'type' => 'initial_balance',
            'amount' => 10000000
        ]);
        Transaction::create([
            'user_id' => $this->user->id,
            'date' => '2026-01-13',
            'type' => 'income',
            'amount' => 500000
        ]);

        $response = $this->postJson('/api/transactions', [
            'date' => '2026-01-13',
            'type' => 'expense',
            'amount' => 50000,
            'description' => 'Makan Siang',
            'category' => 'Food',
        ]);

        $response->assertStatus(201);

        $summary = $this->getJson('/api/daily-summary?date=2026-01-13');
        // Total In: 10,500,000
        // Total Out: 50,000
        // Closing: 10,450,000
        $summary->assertJson([
            'total_in' => 10500000,
            'total_out' => 50000,
            'closing_balance' => 10450000
        ]);
    }

    public function test_fn_04_kalkulasi_akumulatif()
    {
        Transaction::create(['user_id' => $this->user->id, 'date' => '2026-01-13', 'type' => 'initial_balance', 'amount' => 10000000]);
        
        // Add 3 expenses
        $this->postJson('/api/transactions', ['date' => '2026-01-13', 'type' => 'expense', 'amount' => 10000]);
        $this->postJson('/api/transactions', ['date' => '2026-01-13', 'type' => 'expense', 'amount' => 20000]);
        $this->postJson('/api/transactions', ['date' => '2026-01-13', 'type' => 'expense', 'amount' => 30000]);

        $summary = $this->getJson('/api/daily-summary?date=2026-01-13');
        
        $summary->assertJson([
            'total_out' => 60000, // 10+20+30
            'closing_balance' => 9940000 // 10m - 60k
        ]);
    }

    public function test_fn_05_perpindahan_tanggal()
    {
        // Day 1: 13 Jan
        Transaction::create(['user_id' => $this->user->id, 'date' => '2026-01-13', 'type' => 'initial_balance', 'amount' => 10000000]);
        Transaction::create(['user_id' => $this->user->id, 'date' => '2026-01-13', 'type' => 'expense', 'amount' => 50000]);
        // Closing Day 1: 9,950,000

        // Check Day 2: 14 Jan
        $summary = $this->getJson('/api/daily-summary?date=2026-01-14');
        
        // Opening balance of 14th should be Closing balance of 13th (calculated from all prev transactions)
        $summary->assertJson([
            'opening_balance' => 9950000,
            'total_in' => 0,
            'total_out' => 0,
            'closing_balance' => 9950000
        ]);
    }

    public function test_api_03_delete_transaction()
    {
        $transaction = Transaction::create([
            'user_id' => $this->user->id,
            'date' => '2026-01-13',
            'type' => 'income',
            'amount' => 100000
        ]);

        $response = $this->deleteJson("/api/transactions/{$transaction->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);

        // Check calculation update
        $summary = $this->getJson('/api/daily-summary?date=2026-01-13');
        $summary->assertJson([
            'total_in' => 0
        ]);
    }
}
