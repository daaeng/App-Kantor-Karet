<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FinancialTransaction;
// [UBAH] Gunakan Model Baru, Hapus Product lama
use App\Models\OutgoingStock;
use App\Models\Kasbon;
use App\Models\Payroll;
use App\Models\Nota;
use App\Models\PpbHeader;
use App\Models\HargaInformasi;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdministrasiController extends Controller
{
    public function index(Request $request)
    {
        $data = $this->getFinancialData($request);
        return Inertia::render("Administrasis/index", $data);
    }

    public function print(Request $request)
    {
        $data = $this->getFinancialData($request);
        $data['printType'] = $request->input('type', 'all');
        return Inertia::render("Administrasis/print", $data);
    }

    // Fungsi Private untuk Logika Perhitungan
    private function getFinancialData(Request $request)
    {
        $perPage = 10;

        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);

        // [BARU] Input untuk Rentang Tahun
        $startYear = $request->input('start_year', Carbon::now()->year);
        $endYear = $request->input('end_year', Carbon::now()->year);

        $timePeriod = $request->input('time_period', 'this-month');

        // Query Builder Dasar
        $outgoingQuery = OutgoingStock::query();
        $trxQuery = FinancialTransaction::query();
        $kasbonQuery = Kasbon::query();
        $payrollQuery = Payroll::query();

        // --- Logic Filter Waktu ---
        $dateRangeStart = null;
        $dateRangeEnd = null;

        // [MODIFIKASI] Logic Penentuan Tanggal
        if ($timePeriod === 'specific-month') {
            $dateRangeStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
            $dateRangeEnd = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth();
        } elseif ($timePeriod === 'today') {
            $dateRangeStart = Carbon::today();
            $dateRangeEnd = Carbon::today();
        } elseif ($timePeriod === 'this-month') {
            $dateRangeStart = Carbon::now()->startOfMonth();
            $dateRangeEnd = Carbon::now()->endOfMonth();
        } elseif ($timePeriod === 'this-year') {
            $dateRangeStart = Carbon::now()->startOfYear();
            $dateRangeEnd = Carbon::now()->endOfYear();
        } elseif ($timePeriod === 'periodic-years') {
            // [BARU] Logika Rentang Tahun
            // Dari Awal Tahun 'startYear' sampai Akhir Tahun 'endYear'
            $dateRangeStart = Carbon::create($startYear, 1, 1)->startOfYear();
            $dateRangeEnd = Carbon::create($endYear, 12, 31)->endOfYear();
        }

        // Terapkan Filter ke Query
        if ($dateRangeStart && $dateRangeEnd) {
            $outgoingQuery->whereBetween('date', [$dateRangeStart, $dateRangeEnd]);
            $trxQuery->whereBetween('transaction_date', [$dateRangeStart, $dateRangeEnd]);

            // Filter Kasbon & Payroll (Gunakan created_at atau tanggal transaksi)
            $kasbonQuery->whereBetween('created_at', [$dateRangeStart, $dateRangeEnd]);
            $payrollQuery->whereBetween('created_at', [$dateRangeStart, $dateRangeEnd]);
        }

        // ==========================================
        // 1. LAPORAN BANK (PERIODE TERPILIH)
        // ==========================================
        $bankIn_Auto = $outgoingQuery->sum('grand_total') ?? 0;
        $bankIn_Manual = $trxQuery->clone()->where('source', 'bank')->where('type', 'income')->sum('amount') ?? 0;
        $totalBankIn = $bankIn_Auto + $bankIn_Manual;

        $bankOut_Auto = $payrollQuery->clone()->sum('gaji_bersih') ?? 0;
        $bankOut_Manual = $trxQuery->clone()->where('source', 'bank')->where('type', 'expense')->sum('amount') ?? 0;
        $totalBankOut = $bankOut_Auto + $bankOut_Manual;

        $saldoBankPeriod = $totalBankIn - $totalBankOut;

        // ==========================================
        // 2. LAPORAN KAS (PERIODE TERPILIH)
        // ==========================================
        $kasIn_Transfer = $trxQuery->clone()->where('source', 'bank')->where('category', 'Penarikan Bank')->sum('amount') ?? 0;
        $kasIn_Manual = $trxQuery->clone()->where('source', 'cash')->where('type', 'income')->sum('amount') ?? 0;
        $totalKasIn = $kasIn_Transfer + $kasIn_Manual;

        $kasOut_Pegawai = $kasbonQuery->clone()->where('kasbonable_type', 'App\Models\Employee')->sum('kasbon') ?? 0;
        $kasOut_Penoreh = $kasbonQuery->clone()->where('kasbonable_type', 'App\Models\Incisor')->sum('kasbon') ?? 0;
        $kasOut_Total_Valid = $kasOut_Pegawai + $kasOut_Penoreh;

        $kasOut_Manual = $trxQuery->clone()->where('source', 'cash')->where('type', 'expense')->sum('amount') ?? 0;
        $totalKasOut = $kasOut_Total_Valid + $kasOut_Manual;

        $saldoKasPeriod = $totalKasIn - $totalKasOut;

        // ==========================================
        // 3. NERACA (AKUMULASI TOTAL - SALDO BERJALAN)
        // ==========================================
        // Neraca tidak terpengaruh filter periode (selalu akumulasi sampai saat ini)
        // Kecuali Anda ingin melihat "Posisi Neraca per Tanggal X" (tapi biasanya neraca itu snapshot hari ini)

        $accBankIn = OutgoingStock::sum('grand_total') + FinancialTransaction::where('source', 'bank')->where('type', 'income')->sum('amount');
        $accBankOut = Payroll::sum('gaji_bersih') + FinancialTransaction::where('source', 'bank')->where('type', 'expense')->sum('amount');
        $saldoBankAccumulated = $accBankIn - $accBankOut;

        $accKasIn = FinancialTransaction::where('source', 'bank')->where('category', 'Penarikan Bank')->sum('amount') + FinancialTransaction::where('source', 'cash')->where('type', 'income')->sum('amount');
        $accKasOut = Kasbon::sum('kasbon') + FinancialTransaction::where('source', 'cash')->where('type', 'expense')->sum('amount');
        $saldoKasAccumulated = $accKasIn - $accKasOut;

        $totalKasbonAll = Kasbon::sum('kasbon');
        $totalPaymentAll = \App\Models\KasbonPayment::sum('amount');
        $totalPiutangPegawai = $totalKasbonAll - $totalPaymentAll;

        $neraca = [
            'assets' => [
                'kas_period' => (float) $saldoKasAccumulated,
                'bank_period' => (float) $saldoBankAccumulated,
                'piutang' => (float) $totalPiutangPegawai,
                'inventory_value' => 0
            ],
            'liabilities' => ['hutang_dagang' => 0]
        ];

        // ==========================================
        // 4. RUGI LABA
        // ==========================================
        $revenue = $bankIn_Auto + $bankIn_Manual;
        $cogs = $trxQuery->clone()->where('category', 'Pembelian Karet')->sum('amount') ?? 0;
        $grossProfit = $revenue - $cogs;

        $opsExpenseManual = $trxQuery->clone()->where('type', 'expense')->whereNotIn('category', ['Pembelian Karet', 'Penarikan Bank'])->sum('amount') ?? 0;
        $operatingExpenses = $opsExpenseManual + $bankOut_Auto;
        $netProfit = $grossProfit - $operatingExpenses;

        // --- Data Chart ---
        $chartData = [];

        // [MODIFIKASI] Tentukan Grouping Grafik
        // Jika rentang tahun, kita group by 'YYYY-MM' agar grafik tidak terlalu padat per hari
        $isLongPeriod = in_array($timePeriod, ['this-year', 'periodic-years']);

        // Format SQL untuk Grouping (MySQL)
        $sqlDateFormat = $isLongPeriod ? "%Y-%m" : "%Y-%m-%d";

        $incAuto = $outgoingQuery->clone()
            ->selectRaw("DATE_FORMAT(date, '$sqlDateFormat') as label, SUM(grand_total) as total")
            ->groupBy('label')->pluck('total', 'label');

        $incManual = $trxQuery->clone()->where('type', 'income')
            ->selectRaw("DATE_FORMAT(transaction_date, '$sqlDateFormat') as label, SUM(amount) as total")
            ->groupBy('label')->pluck('total', 'label');

        $expManual = $trxQuery->clone()->where('type', 'expense')->where('category', '!=', 'Penarikan Bank')
            ->selectRaw("DATE_FORMAT(transaction_date, '$sqlDateFormat') as label, SUM(amount) as total")
            ->groupBy('label')->pluck('total', 'label');

        $allLabels = $incAuto->keys()->merge($incManual->keys())->merge($expManual->keys())->unique()->sort();

        foreach ($allLabels as $label) {
            // Format Label Tampilan Chart
            if ($isLongPeriod) {
                // Label: "Jan 2024", "Feb 2024"
                $displayLabel = Carbon::createFromFormat('Y-m', $label)->locale('id')->isoFormat('MMM YYYY');
            } else {
                // Label: "01 Jan", "02 Jan"
                $displayLabel = Carbon::parse($label)->locale('id')->isoFormat('D MMM');
            }

            $totalInc = ($incAuto[$label] ?? 0) + ($incManual[$label] ?? 0);
            $totalExp = ($expManual[$label] ?? 0);
            $chartData[] = ['name' => $displayLabel, 'Pemasukan' => (float) $totalInc, 'Pengeluaran' => (float) $totalExp];
        }

        // Return Data
        $requests = PpbHeader::orderBy('created_at', 'DESC')->paginate($perPage);
        $notas = Nota::orderBy('created_at', 'DESC')->paginate($perPage);
        $hargaSahamKaret = HargaInformasi::where('jenis', 'harga_saham_karet')->orderBy('tanggal_berlaku', 'DESC')->first();
        $hargaDollar = HargaInformasi::where('jenis', 'harga_dollar')->orderBy('tanggal_berlaku', 'DESC')->first();
        $pendingRequests = PpbHeader::where('status', 'belum ACC')->count();
        $pendingNotas = Nota::where('status', 'belum ACC')->count();

        $bankOpsDetails = $trxQuery->clone()->where('source', 'bank')->where('type', 'expense')->get();
        $kasOpsDetails = $trxQuery->clone()->where('source', 'cash')->where('type', 'expense')->get();

        return [
            "requests" => $requests,
            "notas" => $notas,
            "summary" => [
                "totalRequests" => PpbHeader::count(),
                "totalNotas" => Nota::count(),
                "pendingRequests" => $pendingRequests,
                "pendingNotas" => $pendingNotas,
                "pendingCount" => $pendingRequests + $pendingNotas,
                "hargaSahamKaret" => $hargaSahamKaret ? (float)$hargaSahamKaret->nilai : 0,
                "hargaDollar" => $hargaDollar ? (float)$hargaDollar->nilai : 0,
                "reports" => [
                    "bank" => [
                        "in_penjualan" => (float) $bankIn_Auto,
                        "in_lainnya" => (float) $bankIn_Manual,
                        "out_gaji" => (float) $bankOut_Auto,
                        "out_kapal" => (float) $bankOpsDetails->where('category', 'Pembayaran Kapal')->sum('amount'),
                        "out_truck" => (float) $bankOpsDetails->where('category', 'Pembayaran Truck')->sum('amount'),
                        "out_hutang" => (float) $bankOpsDetails->where('category', 'Bayar Hutang')->sum('amount'),
                        "out_penarikan" => (float) $bankOpsDetails->where('category', 'Penarikan Bank')->sum('amount'),
                        "total_in" => (float) $totalBankIn,
                        "total_out" => (float) $totalBankOut,
                        "balance" => (float) $saldoBankPeriod
                    ],
                    "kas" => [
                        "in_penarikan" => (float) $kasIn_Transfer,
                        "out_lapangan" => (float) $kasOpsDetails->where('category', 'Operasional Lapangan')->sum('amount'),
                        "out_kantor" => (float) $kasOpsDetails->where('category', 'Operasional Kantor')->sum('amount'),
                        "out_bpjs" => (float) $kasOpsDetails->where('category', 'BPJS Ketenagakerjaan')->sum('amount'),
                        "out_belikaret" => (float) $kasOpsDetails->where('category', 'Pembelian Karet')->sum('amount'),
                        "out_kasbon_pegawai" => (float) $kasOut_Pegawai,
                        "out_kasbon_penoreh" => (float) $kasOut_Penoreh,
                        "total_in" => (float) $totalKasIn,
                        "total_out" => (float) $totalKasOut,
                        "balance" => (float) $saldoKasPeriod
                    ],
                    "profit_loss" => [
                        "revenue" => (float) $revenue,
                        "cogs" => (float) $cogs,
                        "gross_profit" => (float) $grossProfit,
                        "opex" => (float) $operatingExpenses,
                        "net_profit" => (float) $netProfit
                    ],
                    "neraca" => $neraca
                ],
                "totalPengeluaran" => $totalBankOut + $totalKasOut,
                "labaRugi" => $netProfit,
                "totalPenjualanKaret" => $revenue,
                "s_karet" => $outgoingQuery->sum('qty_out'),
                "tb_karet" => $outgoingQuery->sum('grand_total'),
            ],
            "chartData" => $chartData,

            // [MODIFIKASI] Return Filter Params
            "filter" => $request->only(['time_period', 'month', 'year', 'start_year', 'end_year']),
            "currentMonth" => (int)$selectedMonth,
            "currentYear" => (int)$selectedYear,
        ];
    }

    // --- CRUD Transaksi Baru (API) ---
    public function getTransactions(Request $request)
    {
        $perPage = 10;
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $page = $request->input('page', 1);

        $query = FinancialTransaction::query();
        $query->whereYear('transaction_date', $year)->whereMonth('transaction_date', $month);

        $paginator = $query->orderBy('transaction_date', 'DESC')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginator->items(),
            'links' => [],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]
        ]);
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric',
            'tanggal' => 'required|date',
            'transaction_code' => 'required|string',
            'transaction_number' => 'required|string',
        ]);

        FinancialTransaction::create([
            'type' => $request->type,
            'source' => $request->source,
            'category' => $request->kategori,
            'amount' => $request->jumlah,
            'transaction_date' => $request->tanggal,
            'description' => $request->deskripsi,
            'transaction_code' => $request->transaction_code,
            'transaction_number' => $request->transaction_number,
            'db_cr' => $request->db_cr,
            'counterparty' => $request->counterparty,
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil dicatat!');
    }

    // [BARU] Fungsi Update Transaksi
    public function updateTransaction(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric',
            'tanggal' => 'required|date',
            'transaction_code' => 'required|string',
            'transaction_number' => 'required|string',
        ]);

        $transaction = FinancialTransaction::findOrFail($id);
        $transaction->update([
            'type' => $request->type,
            'source' => $request->source,
            'category' => $request->kategori,
            'amount' => $request->jumlah,
            'transaction_date' => $request->tanggal,
            'description' => $request->deskripsi,
            'transaction_code' => $request->transaction_code,
            'transaction_number' => $request->transaction_number,
            'db_cr' => $request->db_cr,
            'counterparty' => $request->counterparty,
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function destroyTransaction($id)
    {
        FinancialTransaction::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Transaksi dihapus!');
    }

    public function updateHarga(Request $request)
    {
        $request->validate(['jenis' => 'required','nilai' => 'required','tanggal_berlaku' => 'required']);
        HargaInformasi::updateOrCreate(
            ['jenis' => $request->jenis, 'tanggal_berlaku' => $request->tanggal_berlaku],
            ['nilai' => $request->nilai]
        );
        return redirect()->back();
    }
}
