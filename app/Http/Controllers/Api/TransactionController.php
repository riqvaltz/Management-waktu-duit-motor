<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::where('user_id', Auth::id());

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:income,expense,initial_balance',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $transaction = Auth::user()->transactions()->create($validated);

        return response()->json($transaction, 201);
    }

    public function destroy($id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->find($id);
        if ($transaction) {
            $transaction->delete();
            return response()->json(['message' => 'Deleted successfully'], 200);
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    public function dailySummary(Request $request)
    {
        $request->validate(['date' => 'required|date']);
        $date = $request->date;
        $userId = Auth::id();

        // Opening balance: sum of all transactions before the given date
        $openingBalance = Transaction::where('user_id', $userId)
            ->where('date', '<', $date)
            ->selectRaw("SUM(CASE WHEN type IN ('income', 'initial_balance') THEN amount ELSE -amount END) as total")
            ->value('total') ?? 0;

        // Transactions for the given date
        $todayTransactions = Transaction::where('user_id', $userId)
            ->whereDate('date', $date)
            ->get();
        
        $totalIn = $todayTransactions->where('type', 'income')->sum('amount');
        $totalInitial = $todayTransactions->where('type', 'initial_balance')->sum('amount');
        $totalOut = $todayTransactions->where('type', 'expense')->sum('amount');
        
        $closingBalance = $openingBalance + $totalIn + $totalInitial - $totalOut;

        return response()->json([
            'opening_balance' => (float) $openingBalance,
            'total_in' => (float) ($totalIn + $totalInitial),
            'total_out' => (float) $totalOut,
            'closing_balance' => (float) $closingBalance,
        ]);
    }

    public function summaryRange(Request $request)
    {
        $validated = $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);
        $userId = Auth::id();
        $start = $validated['start'];
        $end = $validated['end'];

        // Preload all transactions up to end date to compute rolling balances
        $transactions = Transaction::where('user_id', $userId)
            ->where('date', '<=', $end)
            ->orderBy('date')
            ->get()
            ->groupBy('date');

        $dates = new \DatePeriod(
            new \DateTime($start),
            new \DateInterval('P1D'),
            (new \DateTime($end))->modify('+1 day')
        );

        $running = 0;
        // Initialize running with sum before start
        $running = Transaction::where('user_id', $userId)
            ->where('date', '<', $start)
            ->selectRaw("SUM(CASE WHEN type IN ('income','initial_balance') THEN amount ELSE -amount END) as total")
            ->value('total') ?? 0;

        $result = [];
        foreach ($dates as $d) {
            $day = $d->format('Y-m-d');
            $dayTx = $transactions->get($day) ?? collect();
            $in = $dayTx->where('type','income')->sum('amount') + $dayTx->where('type','initial_balance')->sum('amount');
            $out = $dayTx->where('type','expense')->sum('amount');
            $running = $running + $in - $out;
            $result[] = [
                'date' => $day,
                'closing_balance' => (float) $running,
                'total_in' => (float) $in,
                'total_out' => (float) $out,
            ];
        }

        return response()->json($result);
    }

    public function exportMonthlyCsv(Request $request)
    {
        $validated = $request->validate([
            'month' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $userId = Auth::id();
        $month = $validated['month'];
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
        $end = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

        $openingBalance = Transaction::where('user_id', $userId)
            ->where('date', '<', $start)
            ->selectRaw("SUM(CASE WHEN type IN ('income', 'initial_balance') THEN amount ELSE -amount END) as total")
            ->value('total') ?? 0;

        $monthTx = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$start, $end])
            ->orderBy('date')
            ->orderBy('created_at')
            ->get();

        $monthIncome = $monthTx->where('type', 'income')->sum('amount');
        $monthInitial = $monthTx->where('type', 'initial_balance')->sum('amount');
        $monthExpense = $monthTx->where('type', 'expense')->sum('amount');
        $closingBalance = $openingBalance + $monthIncome + $monthInitial - $monthExpense;

        $filename = "laporan-{$month}.csv";

        return response()->streamDownload(function () use ($month, $openingBalance, $monthIncome, $monthExpense, $closingBalance, $monthTx) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, ['Bulan', $month]);
            fputcsv($out, ['Saldo Awal Bulan', (string) $openingBalance]);
            fputcsv($out, ['Total Pemasukan Bulan', (string) $monthIncome]);
            fputcsv($out, ['Total Pengeluaran Bulan', (string) $monthExpense]);
            fputcsv($out, ['Saldo Akhir Bulan', (string) $closingBalance]);
            fputcsv($out, []);

            fputcsv($out, ['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal']);
            foreach ($monthTx as $t) {
                fputcsv($out, [
                    Carbon::parse($t->date)->format('Y-m-d'),
                    $t->type,
                    $t->category ?? '',
                    $t->description ?? '',
                    (string) $t->amount,
                ]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
