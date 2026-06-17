<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\HousingProject;
use App\Models\MaterialReceipt;
use App\Models\PenjualanKavling;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransaksiKeuanganController extends Controller
{
    public function index()
    {
        $transaksis = FinancialTransaction::realEstate()
            ->with(['housingProject', 'penjualanKavling.konsumen', 'materialReceipt.tokoMaterial'])
            ->latest('transaction_date')
            ->latest('id')
            ->get();

        $projects = HousingProject::all();
        $penjualans = PenjualanKavling::with(['konsumen', 'blokKavling.tipeRumah'])->get();
        $receipts = MaterialReceipt::with(['tokoMaterial'])->whereIn('status_pembayaran', ['Belum Lunas', 'Sebagian'])->get();

        return Inertia::render('RealEstate/Keuangan/Index', [
            'transaksis' => $transaksis,
            'projects' => $projects,
            'penjualans' => $penjualans,
            'receipts' => $receipts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateTransaction($request);
        [$code, $number] = $this->generateTransactionNumber($validated['category'], $validated['transaction_date']);
        $validated['transaction_code'] = $code;
        $validated['transaction_number'] = $number;

        FinancialTransaction::create($validated);

        if ($validated['material_receipt_id']) {
            $this->recalculateHutang($validated['material_receipt_id']);
        }

        return redirect()->back()->with('success', 'Transaksi keuangan berhasil dicatat.');
    }

    public function update(Request $request, int $id)
    {
        $transaksi = FinancialTransaction::realEstate()->findOrFail($id);
        $validated = $this->validateTransaction($request);

        $oldReceiptId = $transaksi->material_receipt_id;

        $transaksi->update($validated);

        if ($oldReceiptId) {
            $this->recalculateHutang($oldReceiptId);
        }
        if ($validated['material_receipt_id'] && $validated['material_receipt_id'] != $oldReceiptId) {
            $this->recalculateHutang($validated['material_receipt_id']);
        }

        return redirect()->back()->with('success', 'Transaksi keuangan berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $transaksi = FinancialTransaction::realEstate()->findOrFail($id);
        $receiptId = $transaksi->material_receipt_id;
        $transaksi->delete();

        if ($receiptId) {
            $this->recalculateHutang($receiptId);
        }

        return redirect()->back()->with('success', 'Transaksi dibatalkan.');
    }

    private function validateTransaction(Request $request): array
    {
        $validated = $request->validate([
            'housing_project_id' => 'nullable|exists:housing_projects,id',
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'category' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'penjualan_kavling_id' => 'nullable|exists:penjualan_kavlings,id',
            'material_receipt_id' => 'nullable|exists:material_receipts,id',
            'counterparty' => 'nullable|string|max:255',
        ]);

        $validated['business_unit'] = FinancialTransaction::BUSINESS_REALESTATE;
        $validated['db_cr'] = $validated['type'] === 'income' ? 'debit' : 'credit';
        $validated['housing_project_id'] = $validated['housing_project_id'] ?? null;
        $validated['penjualan_kavling_id'] = $validated['penjualan_kavling_id'] ?? null;
        $validated['material_receipt_id'] = $validated['material_receipt_id'] ?? null;

        return $validated;
    }

    private function generateTransactionNumber(string $category, string $date): array
    {
        $prefix = match ($category) {
            'Booking Fee' => 'BFE',
            'DP Kavling' => 'DPK',
            'Cicilan DP' => 'CDP',
            'Pencairan KPR' => 'KPR',
            'Pelunasan Material' => 'PLM',
            'Upah Tukang' => 'UTK',
            'Material Bangunan' => 'MTB',
            'Overhead Proyek' => 'OVP',
            'Marketing' => 'MKT',
            'Pendapatan Lain' => 'PDL',
            default => 'RE',
        };

        $monthYear = Carbon::parse($date)->format('my');
        $transactionCode = $prefix . '-' . $monthYear;

        $lastTrx = FinancialTransaction::realEstate()
            ->where('transaction_code', $transactionCode)
            ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
            ->first();

        $nextSeq = 1;
        if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
            $nextSeq = (int) $lastTrx->transaction_number + 1;
        }

        return [$transactionCode, str_pad($nextSeq, 3, '0', STR_PAD_LEFT)];
    }

    private function recalculateHutang(int $receiptId): void
    {
        $receipt = MaterialReceipt::with('tokoMaterial')->find($receiptId);
        if (!$receipt) {
            return;
        }

        $totalDibayar = FinancialTransaction::realEstate()
            ->where('material_receipt_id', $receiptId)
            ->sum('amount');

        if ($totalDibayar >= $receipt->total_harga) {
            $receipt->update(['status_pembayaran' => 'Lunas']);
        } elseif ($totalDibayar > 0) {
            $receipt->update(['status_pembayaran' => 'Sebagian']);
        } else {
            $receipt->update(['status_pembayaran' => 'Belum Lunas']);
        }

        $tokoId = $receipt->toko_material_id;
        $toko = \App\Models\TokoMaterial::find($tokoId);
        if ($toko) {
            $totalHutangSemuaNota = MaterialReceipt::where('toko_material_id', $tokoId)->sum('total_harga');
            $totalDibayarSemuaNota = FinancialTransaction::realEstate()
                ->whereHas('materialReceipt', function ($q) use ($tokoId) {
                    $q->where('toko_material_id', $tokoId);
                })
                ->sum('amount');

            $toko->update(['total_hutang' => max(0, $totalHutangSemuaNota - $totalDibayarSemuaNota)]);
        }
    }
}
