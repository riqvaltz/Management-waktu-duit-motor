<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExportMonthlyCsvTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_monthly_csv_returns_csv_with_summary_and_rows(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Transaction::create([
            'user_id' => $user->id,
            'date' => '2025-12-31',
            'type' => 'initial_balance',
            'amount' => 1000000,
            'description' => 'Saldo Awal',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'date' => '2026-01-05',
            'type' => 'income',
            'amount' => 250000,
            'description' => 'Gaji',
            'category' => 'Salary',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'date' => '2026-01-06',
            'type' => 'expense',
            'amount' => 50000,
            'description' => 'Makan',
            'category' => 'Food',
        ]);

        $response = $this->get('/api/export/monthly?month=2026-01');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));

        $csv = $response->streamedContent();
        $csv = ltrim($csv, "\xEF\xBB\xBF");
        $this->assertStringContainsString('Bulan,2026-01', $csv);
        $this->assertStringContainsString('"Saldo Awal Bulan",1000000', $csv);
        $this->assertStringContainsString('"Total Pemasukan Bulan",250000', $csv);
        $this->assertStringContainsString('"Total Pengeluaran Bulan",50000', $csv);
        $this->assertStringContainsString('"Saldo Akhir Bulan",1200000', $csv);
        $this->assertStringContainsString('Tanggal,Jenis,Kategori,Keterangan,Nominal', $csv);
        $this->assertStringContainsString('2026-01-05,income,Salary,Gaji,250000.00', $csv);
        $this->assertStringContainsString('2026-01-06,expense,Food,Makan,50000.00', $csv);
    }
}
