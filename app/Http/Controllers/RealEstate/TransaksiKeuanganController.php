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
    public function index(Request $request)
    {
        $data = $this->getFinancialData($request);
        return Inertia::render('RealEstate/Keuangan/Index', $data);
    }

    private function getFinancialData(Request $request)
    {
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);
        $startYear = $request->input('start_year', Carbon::now()->year);
        $endYear = $request->input('end_year', Carbon::now()->year);
        $startMonth = $request->input('start_month', Carbon::now()->month);
        $endMonth = $request->input('end_month', Carbon::now()->month);

        $transaksiQuery = FinancialTransaction::realEstate()
            ->with(['housingProject', 'penjualanKavling.konsumen', 'materialReceipt.tokoMaterial']);

        $this->applyTimeFilter($transaksiQuery, $timePeriod, $selectedMonth, $selectedYear, $startYear, $endYear, $startMonth, $endMonth);

        $transaksis = $transaksiQuery->latest('transaction_date')
            ->latest('id')
            ->get();

        $projects = HousingProject::all();
        $penjualans = PenjualanKavling::with(['konsumen', 'blokKavling.tipeRumah'])->get();
        $receipts = MaterialReceipt::with(['tokoMaterial'])->where('business_unit', 'properti')->whereIn('status_pembayaran', ['Belum Lunas', 'Sebagian'])->get();

        $reports = $this->calculateFinancialReports($transaksiQuery);
        $chartData = $this->calculateChartData(clone $transaksiQuery, $timePeriod);

        return [
            'transaksis' => $transaksis,
            'projects' => $projects,
            'penjualans' => $penjualans,
            'receipts' => $receipts,
            'summary' => $reports,
            'chartData' => $chartData,
            'filter' => $request->all(),
            'currentMonth' => (int)$selectedMonth,
            'currentYear' => (int)$selectedYear,
        ];
    }

    private function applyTimeFilter($query, $timePeriod, $selectedMonth, $selectedYear, $startYear, $endYear, $startMonth, $endMonth): void
    {
        if ($timePeriod === 'specific-month') {
            $query->whereMonth('transaction_date', $selectedMonth)->whereYear('transaction_date', $selectedYear);
        } elseif ($timePeriod === 'last-month') {
            $lastMonth = Carbon::now()->subMonth();
            $query->whereMonth('transaction_date', $lastMonth->month)->whereYear('transaction_date', $lastMonth->year);
        } elseif ($timePeriod === 'this-month') {
            $query->whereMonth('transaction_date', Carbon::now()->month)->whereYear('transaction_date', Carbon::now()->year);
        } elseif ($timePeriod === 'this-year') {
            $query->whereYear('transaction_date', Carbon::now()->year);
        } elseif ($timePeriod === 'periodic-years') {
            $query->whereYear('transaction_date', '>=', $startYear)->whereYear('transaction_date', '<=', $endYear);
        } elseif ($timePeriod === 'range-month') {
            $sDate = Carbon::create($startYear, $startMonth, 1)->startOfMonth();
            $eDate = Carbon::create($endYear, $endMonth, 1)->endOfMonth();
            $query->whereBetween('transaction_date', [$sDate, $eDate]);
        }
    }

    private function calculateFinancialReports($query)
    {
        $totalPemasukan = $query->clone()->where('type', 'income')->sum('amount') ?? 0;
        $totalPengeluaran = $query->clone()->where('type', 'expense')->sum('amount') ?? 0;
        $saldoBerjalan = $totalPemasukan - $totalPengeluaran;

        $bankIn = $query->clone()->where('type', 'income')->where('source', 'bank')->sum('amount') ?? 0;
        $bankOut = $query->clone()->where('type', 'expense')->where('source', 'bank')->sum('amount') ?? 0;
        $saldoBankPeriod = $bankIn - $bankOut;

        $kasIn = $query->clone()->where('type', 'income')->where('source', 'cash')->sum('amount') ?? 0;
        $kasOut = $query->clone()->where('type', 'expense')->where('source', 'cash')->sum('amount') ?? 0;
        $saldoKasPeriod = $kasIn - $kasOut;

        $revenue = $totalPemasukan;
        $opex = $totalPengeluaran;
        $netProfit = $revenue - $opex;

        $totalPemasukanBank = FinancialTransaction::realEstate()->where('type', 'income')->where('source', 'bank')->sum('amount') ?? 0;
        $totalPengeluaranBank = FinancialTransaction::realEstate()->where('type', 'expense')->where('source', 'bank')->sum('amount') ?? 0;
        $totalPemasukanKas = FinancialTransaction::realEstate()->where('type', 'income')->where('source', 'cash')->sum('amount') ?? 0;
        $totalPengeluaranKas = FinancialTransaction::realEstate()->where('type', 'expense')->where('source', 'cash')->sum('amount') ?? 0;

        $saldoBankAccumulated = $totalPemasukanBank - $totalPengeluaranBank;
        $saldoKasAccumulated = $totalPemasukanKas - $totalPengeluaranKas;

        $totalAktiva = $saldoKasAccumulated + $saldoBankAccumulated;

        $labaRugi = [
            'revenue' => $revenue,
            'opex' => $opex,
            'net_profit' => $netProfit,
        ];

        $neraca = [
            'assets' => [
                'kas_period' => $saldoKasAccumulated,
                'bank_period' => $saldoBankAccumulated,
                'total_aktiva' => $totalAktiva,
            ],
            'liabilities' => [
                'total_pasiva' => $totalAktiva,
            ],
        ];

        $bankDetails = $this->getCategoryBreakdown($query, 'bank');
        $kasDetails = $this->getCategoryBreakdown($query, 'cash');

        return [
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'saldoBerjalan' => $saldoBerjalan,
            'reports' => [
                'bank' => $bankDetails + [
                    'balance' => $saldoBankPeriod,
                ],
                'kas' => $kasDetails + [
                    'balance' => $saldoKasPeriod,
                ],
                'profit_loss' => $labaRugi,
                'neraca' => $neraca,
            ],
        ];
    }

    private function getCategoryBreakdown($query, $source): array
    {
        $categoryBreakdown = [];
        $sourceQuery = $query->clone()->where('source', $source);
        $transactions = $sourceQuery->get();
        foreach ($transactions as $t) {
            if (!isset($categoryBreakdown[$t->category])) {
                $categoryBreakdown[$t->category] = 0;
            }
            if ($t->type === 'income') {
                $categoryBreakdown[$t->category] += $t->amount;
            } else {
                $categoryBreakdown[$t->category] -= $t->amount;
            }
        }

        $totalIn = $sourceQuery->clone()->where('type', 'income')->sum('amount') ?? 0;
        $totalOut = $sourceQuery->clone()->where('type', 'expense')->sum('amount') ?? 0;

        return [
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'breakdown' => $categoryBreakdown,
        ];
    }

    private function calculateChartData($query, $timePeriod)
    {
        $chartData = [];
        $groupBy = ($timePeriod === 'this-year' || $timePeriod === 'all-years' || $timePeriod === 'periodic-years') ? 'month' : 'date';

        $incManual = $query->clone()->where('type', 'income')
            ->selectRaw($groupBy === 'month' ? 'MONTH(transaction_date) as label, SUM(amount) as total' : 'DATE(transaction_date) as label, SUM(amount) as total')
            ->groupBy('label')
            ->pluck('total', 'label');

        $expManual = $query->clone()->where('type', 'expense')
            ->selectRaw($groupBy === 'month' ? 'MONTH(transaction_date) as label, SUM(amount) as total' : 'DATE(transaction_date) as label, SUM(amount) as total')
            ->groupBy('label')
            ->pluck('total', 'label');

        $allLabels = $incManual->keys()->merge($expManual->keys())->unique()->sort();

        foreach ($allLabels as $label) {
            $displayLabel = ($timePeriod === 'this-year' || $timePeriod === 'all-years' || $timePeriod === 'periodic-years')
                ? Carbon::create()->month($label)->locale('id')->isoFormat('MMM')
                : Carbon::parse($label)->locale('id')->isoFormat('D MMM');

            $totalInc = $incManual[$label] ?? 0;
            $totalExp = $expManual[$label] ?? 0;

            $chartData[] = ['name' => $displayLabel, 'Pemasukan' => (float)$totalInc, 'Pengeluaran' => (float)$totalExp];
        }

        return $chartData;
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

    public function exportExcel(Request $request)
    {
        $data = $this->getFinancialData($request);

        $fileName = 'Laporan_Keuangan_Real_Estate_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, ['Laporan Keuangan Real Estate'], ';');
            fputcsv($file, [''], ';');

            fputcsv($file, ['Ringkasan'], ';');
            fputcsv($file, ['Total Pemasukan', $data['summary']['totalPemasukan']], ';');
            fputcsv($file, ['Total Pengeluaran', $data['summary']['totalPengeluaran']], ';');
            fputcsv($file, ['Saldo Berjalan', $data['summary']['saldoBerjalan']], ';');
            fputcsv($file, [''], ';');

            fputcsv($file, ['Detail Transaksi'], ';');
            fputcsv($file, ['Tanggal', 'Kategori', 'Tipe', 'Sumber', 'Nominal', 'Keterangan', 'Pihak Terkait'], ';');

            foreach ($data['transaksis'] as $t) {
                fputcsv($file, [
                    $t->transaction_date,
                    $t->category,
                    $t->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                    $t->source === 'bank' ? 'Bank' : 'Kas',
                    $t->amount,
                    $t->description,
                    $t->counterparty,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
