<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\TransactionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DB;

class NotaController extends Controller
{
    public function index(Request $request)
  {
    $perPage = 20;
    $searchTerm = $request->input('search');
    $filterBusinessUnit = $request->input('business_unit');
    $filterSource = $request->input('source');
    $timeFilter = $request->input('time_filter', 'this_month');
    $selectMonth = $request->input('select_month');
    $selectYear = $request->input('select_year');
    $startDate = $request->input('start_date');
    $endDate = $request->input('end_date');

    $now = now();

    $transactionsQuery = FinancialTransaction::query()
      ->where('type', 'expense')
      ->where('db_cr', 'credit')
      ->when($searchTerm, function ($query, $search) {
        $query->where('category', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('counterparty', 'like', "%{$search}%");
      })
      ->when($filterBusinessUnit, function ($query, $bu) {
        $query->where('business_unit', $bu);
      })
      ->when($filterSource, function ($query, $source) {
        $query->where('source', $source);
      })
      ->when($timeFilter === 'this_month', function ($query) use ($now) {
        $query->whereMonth('transaction_date', $now->month)
              ->whereYear('transaction_date', $now->year);
      })
      ->when($timeFilter === 'last_month', function ($query) use ($now) {
        $lastMonth = $now->copy()->subMonth();
        $query->whereMonth('transaction_date', $lastMonth->month)
              ->whereYear('transaction_date', $lastMonth->year);
      })
      ->when($timeFilter === 'select_month' && $selectMonth, function ($query) use ($selectMonth) {
        [$year, $month] = explode('-', $selectMonth);
        $query->whereMonth('transaction_date', $month)
              ->whereYear('transaction_date', $year);
      })
      ->when($timeFilter === 'this_year', function ($query) use ($now) {
        $query->whereYear('transaction_date', $now->year);
      })
      ->when($timeFilter === 'select_year' && $selectYear, function ($query) use ($selectYear) {
        $query->whereYear('transaction_date', $selectYear);
      })
      ->when($timeFilter === 'date_range' && $startDate && $endDate, function ($query) use ($startDate, $endDate) {
        $query->whereBetween('transaction_date', [$startDate, $endDate]);
      });

    $transactions = $transactionsQuery
      ->orderBy('transaction_date', 'DESC')
      ->orderBy('id', 'DESC')
      ->paginate($perPage)
      ->withQueryString();

    $categories = TransactionCategory::active()->get();

    // Clone the base query for stats calculations
    $statsQuery = clone $transactionsQuery;
    $karetStatsQuery = (clone $transactionsQuery)->where('business_unit', 'karet');
    $realestateStatsQuery = (clone $transactionsQuery)->where('business_unit', 'realestate');

    $stats = [
      'total' => $statsQuery->count(),
      'total_amount' => $statsQuery->sum('amount'),
      'karet_amount' => $karetStatsQuery->sum('amount'),
      'realestate_amount' => $realestateStatsQuery->sum('amount'),
    ];

    return Inertia::render("Notas/index", [
      "transactions" => $transactions,
      "categories" => $categories,
      "stats" => $stats,
      "filters" => $request->only(['search', 'business_unit', 'source', 'time_filter', 'select_month', 'select_year', 'start_date', 'end_date']),
    ]);
  }

    public function up_nota()
    {
        $categories = TransactionCategory::active()->get();
        return Inertia('Notas/up_nota', compact('categories'));
    }

    public function c_nota(Request $request)
    {
        $validated = $request->validate([
            'business_unit' => 'required|in:karet,realestate',
            'source' => 'required|in:cash,bank',
            'category' => 'required|string',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'counterparty' => 'nullable|string',
        ]);

        $category = TransactionCategory::where('name', $validated['category'])
            ->where('business_unit', $validated['business_unit'])
            ->first();

        $prefix = $category->prefix ?? 'EXP';
        $date = Carbon::parse($validated['transaction_date']);
        $monthYear = $date->format('my');
        $transactionCode = $prefix . '-' . $monthYear;

        $lastTrx = FinancialTransaction::where('business_unit', $validated['business_unit'])
            ->where('transaction_code', $transactionCode)
            ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
            ->first();

        $nextSeq = 1;
        if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
            $nextSeq = (int)$lastTrx->transaction_number + 1;
        }
        $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            // 1. Debit: Expense category
            FinancialTransaction::create([
                ...$validated,
                'type' => 'expense',
                'category' => $validated['category'],
                'source' => null,
                'transaction_code' => $transactionCode,
                'transaction_number' => $transactionNumber,
                'db_cr' => 'debit',
            ]);

            // 2. Credit: Cash/Bank
            FinancialTransaction::create([
                ...$validated,
                'type' => 'expense',
                'category' => $validated['source'] === 'cash' ? 'Kas' : 'Bank',
                'transaction_code' => $transactionCode,
                'transaction_number' => $transactionNumber,
                'db_cr' => 'credit',
            ]);

            DB::commit();
            return redirect()->route('notas.index')->with('success', 'Pengeluaran berhasil dicatat dan disinkron ke Buku Jurnal.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal mencatat pengeluaran: ' . $e->getMessage());
        }
    }

    public function show(string $id)
    {
        $transaction = FinancialTransaction::findOrFail($id);
        return Inertia::render("Notas/show", [
            "transaction" => $transaction,
        ]);
    }

    public function edit(string $id)
    {
        $transaction = FinancialTransaction::findOrFail($id);
        $categories = TransactionCategory::active()->get();
        return Inertia::render("Notas/edit", [
            "transaction" => $transaction,
            "categories" => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $transaction = FinancialTransaction::findOrFail($id);

        $validated = $request->validate([
            'business_unit' => 'required|in:karet,realestate',
            'source' => 'required|in:cash,bank',
            'category' => 'required|string',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'counterparty' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Find both journal entries (debit and credit)
            if ($transaction->transaction_code && $transaction->transaction_number) {
                $relatedTransactions = FinancialTransaction::where('transaction_code', $transaction->transaction_code)
                    ->where('transaction_number', $transaction->transaction_number)
                    ->get();

                foreach ($relatedTransactions as $trx) {
                    if ($trx->db_cr === 'debit') {
                        $trx->update([
                            ...$validated,
                            'category' => $validated['category'],
                            'source' => null,
                            'type' => 'expense',
                        ]);
                    } else {
                        $trx->update([
                            ...$validated,
                            'category' => $validated['source'] === 'cash' ? 'Kas' : 'Bank',
                            'type' => 'expense',
                        ]);
                    }
                }
            } else {
                $transaction->update([
                    ...$validated,
                    'type' => 'expense',
                    'db_cr' => 'credit',
                ]);
            }

            DB::commit();
            return redirect()->route('notas.index')->with('success', 'Pengeluaran berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui pengeluaran: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $transaction = FinancialTransaction::findOrFail($id);

            if ($transaction->transaction_code && $transaction->transaction_number) {
                FinancialTransaction::where('transaction_code', $transaction->transaction_code)
                    ->where('transaction_number', $transaction->transaction_number)
                    ->delete();
            } else {
                $transaction->delete();
            }

            DB::commit();
            return redirect()->route('notas.index')->with('success', 'Pengeluaran berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus pengeluaran: ' . $e->getMessage());
        }
    }
}
