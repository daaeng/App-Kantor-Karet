<?php

namespace App\Http\Controllers;

use App\Models\TransactionCategory;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = TransactionCategory::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('business_unit') && $request->business_unit && $request->business_unit !== 'all') {
            $query->where('business_unit', $request->business_unit);
        }

        if ($request->has('type') && $request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $categories = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('TransactionCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'business_unit', 'type'])
        ]);
    }

    public function show(TransactionCategory $transactionCategory, Request $request)
    {
        $perPage = 20;
        $searchTerm = $request->input('search');
        $timeFilter = $request->input('time_filter', 'this_month');
        $selectMonth = $request->input('select_month');
        $selectYear = $request->input('select_year');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $now = now();

        // Get transactions for this category
        $transactionsQuery = FinancialTransaction::query()
            ->where('category', $transactionCategory->name)
            ->where('business_unit', $transactionCategory->business_unit)
            ->when($searchTerm, function ($query, $search) {
                $query->where('description', 'like', "%{$search}%")
                    ->orWhere('counterparty', 'like', "%{$search}%");
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

        // Calculate stats for this category
        $statsQuery = clone $transactionsQuery;
        $incomeStatsQuery = (clone $transactionsQuery)->where('type', 'income')->where('db_cr', 'debit');
        $expenseStatsQuery = (clone $transactionsQuery)->where('type', 'expense')->where('db_cr', 'debit');

        $stats = [
            'total_transactions' => $statsQuery->count(),
            'total_amount' => $statsQuery->where('db_cr', 'debit')->sum('amount'),
            'income_amount' => $incomeStatsQuery->sum('amount'),
            'expense_amount' => $expenseStatsQuery->sum('amount'),
        ];

        return Inertia::render('TransactionCategories/Show', [
            'category' => $transactionCategory,
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'time_filter', 'select_month', 'select_year', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'prefix' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        TransactionCategory::create([
            'name' => $request->name,
            'business_unit' => $request->business_unit,
            'type' => $request->type,
            'prefix' => $request->prefix,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Kategori transaksi berhasil ditambahkan!');
    }

    public function update(Request $request, TransactionCategory $transactionCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'prefix' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $transactionCategory->update([
            'name' => $request->name,
            'business_unit' => $request->business_unit,
            'type' => $request->type,
            'prefix' => $request->prefix,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Kategori transaksi berhasil diperbarui!');
    }

    public function destroy(TransactionCategory $transactionCategory)
    {
        $transactionCategory->delete();
        return redirect()->back()->with('success', 'Kategori transaksi berhasil dihapus!');
    }
}
