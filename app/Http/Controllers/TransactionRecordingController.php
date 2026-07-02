<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\TransactionCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionRecordingController extends Controller
{
    public function index()
    {
        $categories = TransactionCategory::active()->get();
        $transactions = FinancialTransaction::orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return Inertia::render('TransactionRecording/Index', [
            'categories' => $categories,
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'category' => 'required|string',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'counterparty' => 'nullable|string',
        ]);

        // Find the category to get prefix
        $category = TransactionCategory::where('name', $validated['category'])
            ->where('business_unit', $validated['business_unit'])
            ->first();

        $prefix = $category->prefix ?? 'TRX';
        $date = Carbon::parse($validated['transaction_date']);
        $monthYear = $date->format('my');
        $transactionCode = $prefix . '-' . $monthYear;

        $lastTrx = FinancialTransaction::where('transaction_code', $transactionCode)
            ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
            ->first();

        $nextSeq = 1;
        if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
            $nextSeq = (int)$lastTrx->transaction_number + 1;
        }
        $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

        FinancialTransaction::create([
            ...$validated,
            'transaction_code' => $transactionCode,
            'transaction_number' => $transactionNumber,
            'db_cr' => $validated['type'] === 'income' ? 'debit' : 'credit',
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil dicatat!');
    }

    public function update(Request $request, $id)
    {
        $transaction = FinancialTransaction::findOrFail($id);

        $validated = $request->validate([
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'category' => 'required|string',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'counterparty' => 'nullable|string',
        ]);

        $transaction->update([
            ...$validated,
            'db_cr' => $validated['type'] === 'income' ? 'debit' : 'credit',
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $transaction = FinancialTransaction::findOrFail($id);

        // Delete all transactions with same code and number if exists
        if ($transaction->transaction_code && $transaction->transaction_number) {
            FinancialTransaction::where('transaction_code', $transaction->transaction_code)
                ->where('transaction_number', $transaction->transaction_number)
                ->delete();
        } else {
            $transaction->delete();
        }

        return redirect()->back()->with('success', 'Transaksi berhasil dihapus!');
    }
}
