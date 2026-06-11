<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FinancialTransaction;
use App\Models\OutgoingStock;
use App\Models\IncomingStock;
use App\Models\Kasbon;
use App\Models\Payroll;
use App\Models\Nota;
use App\Models\PpbHeader;
use App\Models\HargaInformasi;
use App\Models\Incised;
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
        $data['current_filter'] = $request->all();

        // Tambahan logika untuk memuat data profit & loss multi-periode saat dicetak
        if ($request->input('time_period') === 'range-month') {
            $startMonth = (int) $request->input('start_month', 1);
            $startYear  = (int) $request->input('start_year', Carbon::now()->year);
            $endMonth   = (int) $request->input('end_month', Carbon::now()->month);
            $endYear    = (int) $request->input('end_year', Carbon::now()->year);

            $periods = [];
            $current = Carbon::create($startYear, $startMonth, 1);
            $end = Carbon::create($endYear, $endMonth, 1);

            while ($current <= $end) {
                $year = $current->year;
                $month = $current->month;
                $periodLabel = $current->locale('id')->isoFormat('MMMM YYYY');
                $periodData = $this->calculateProfitLossForPeriod($year, $month);
                $periodData['period_label'] = $periodLabel;
                $periods[] = $periodData;
                $current->addMonth();
            }
            $data['profitLossPeriods'] = $periods;
        }

        if ($data['printType'] === 'jurnal' || $data['printType'] === 'all') {
            $trxQuery = FinancialTransaction::query();
            $timePeriod = $request->input('time_period', 'this-month');
            $selectedMonth = $request->input('month', Carbon::now()->month);
            $selectedYear = $request->input('year', Carbon::now()->year);
            $startYear = $request->input('start_year', Carbon::now()->year);
            $endYear = $request->input('end_year', Carbon::now()->year);
            $startMonth = $request->input('start_month', Carbon::now()->month);
            $endMonth = $request->input('end_month', Carbon::now()->month);

            if ($timePeriod === 'specific-month') {
                $trxQuery->whereMonth('transaction_date', $selectedMonth)->whereYear('transaction_date', $selectedYear);
            } elseif ($timePeriod === 'last-month') {
                $lastMonth = Carbon::now()->subMonth();
                $trxQuery->whereMonth('transaction_date', $lastMonth->month)->whereYear('transaction_date', $lastMonth->year);
            } elseif ($timePeriod === 'this-month') {
                $trxQuery->whereMonth('transaction_date', Carbon::now()->month)->whereYear('transaction_date', Carbon::now()->year);
            } elseif ($timePeriod === 'this-year') {
                $trxQuery->whereYear('transaction_date', Carbon::now()->year);
            } elseif ($timePeriod === 'periodic-years') {
                $trxQuery->whereYear('transaction_date', '>=', $startYear)->whereYear('transaction_date', '<=', $endYear);
            } elseif ($timePeriod === 'range-month') {
                $sDate = Carbon::create($startYear, $startMonth, 1)->startOfMonth();
                $eDate = Carbon::create($endYear, $endMonth, 1)->endOfMonth();
                $trxQuery->whereBetween('transaction_date', [$sDate, $eDate]);
            }
            $data['jurnal_transactions'] = $trxQuery->orderBy('transaction_date', 'ASC')->get();
        }

        return Inertia::render("Administrasis/print", $data);
    }

    private function getFinancialData(Request $request)
    {
        $perPage = 10;

        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);

        $startYear = $request->input('start_year', Carbon::now()->year);
        $endYear = $request->input('end_year', Carbon::now()->year);

        $startMonth = $request->input('start_month', Carbon::now()->month);
        $endMonth = $request->input('end_month', Carbon::now()->month);

        $outgoingQuery = OutgoingStock::query();
        $incomingQuery = IncomingStock::query();
        $trxQuery = FinancialTransaction::query();
        $kasbonQuery = Kasbon::query();

        $payrollQuery = Payroll::whereIn('status', ['final', 'paid']);

        if ($timePeriod === 'specific-month') {
            $month = $selectedMonth; $year = $selectedYear;
            $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $outgoingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $incomingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $trxQuery->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year);
            $payrollQuery->where('payroll_period', $periodString);
            $kasbonQuery->where(function($q) use ($month, $year) {
                $q->whereMonth(DB::raw('COALESCE(transaction_date, created_at)'), $month)
                  ->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), $year);
            });
        } elseif ($timePeriod === 'last-month') {
            $lastMonth = Carbon::now()->subMonth();
            $month = $lastMonth->month; $year = $lastMonth->year;
            $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $outgoingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $incomingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $trxQuery->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year);
            $payrollQuery->where('payroll_period', $periodString);
            $kasbonQuery->where(function($q) use ($month, $year) {
                $q->whereMonth(DB::raw('COALESCE(transaction_date, created_at)'), $month)
                  ->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), $year);
            });
        } elseif ($timePeriod === 'this-month') {
            $month = Carbon::now()->month; $year = Carbon::now()->year;
            $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $outgoingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $incomingQuery->whereMonth('date', $month)->whereYear('date', $year);
            $trxQuery->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year);
            $payrollQuery->where('payroll_period', $periodString);
            $kasbonQuery->where(function($q) use ($month, $year) {
                $q->whereMonth(DB::raw('COALESCE(transaction_date, created_at)'), $month)
                  ->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), $year);
            });
        } elseif ($timePeriod === 'this-year') {
            $year = Carbon::now()->year;
            $outgoingQuery->whereYear('date', $year);
            $incomingQuery->whereYear('date', $year);
            $trxQuery->whereYear('transaction_date', $year);
            $payrollQuery->where('payroll_period', 'like', $year . '-%');
            $kasbonQuery->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), $year);
        } elseif ($timePeriod === 'periodic-years') {
            $outgoingQuery->whereYear('date', '>=', $startYear)->whereYear('date', '<=', $endYear);
            $incomingQuery->whereYear('date', '>=', $startYear)->whereYear('date', '<=', $endYear);
            $trxQuery->whereYear('transaction_date', '>=', $startYear)->whereYear('transaction_date', '<=', $endYear);
            $payrollQuery->whereRaw("SUBSTRING(payroll_period, 1, 4) >= ?", [$startYear])
                         ->whereRaw("SUBSTRING(payroll_period, 1, 4) <= ?", [$endYear]);
            $kasbonQuery->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), '>=', $startYear)
                        ->whereYear(DB::raw('COALESCE(transaction_date, created_at)'), '<=', $endYear);
        }

        $penarikanTunaiPeriod = $trxQuery->clone()->where('category', 'Penarikan Tunai dari Bank')->sum('amount') ?? 0;

        $bankIn_Auto = $outgoingQuery->sum('grand_total') ?? 0;
        $bankIn_Manual = $trxQuery->clone()->where('source', 'bank')->where('type', 'income')->sum('amount') ?? 0;
        $totalBankIn = $bankIn_Auto + $bankIn_Manual;

        $bankOut_Auto = $payrollQuery->clone()->sum('gaji_bersih') ?? 0;
        $bankOut_Manual = $trxQuery->clone()->where('source', 'bank')->where('type', 'expense')->sum('amount') ?? 0;

        $totalBankOut = $bankOut_Auto + $bankOut_Manual + $penarikanTunaiPeriod;
        $saldoBankPeriod = $totalBankIn - $totalBankOut;

        $kasIn_Lainnya = $trxQuery->clone()->where('source', 'cash')->where('type', 'income')->where('category', '!=', 'Penarikan Tunai dari Bank')->sum('amount') ?? 0;
        $totalKasIn = $kasIn_Lainnya + $penarikanTunaiPeriod;

        $kasOpsDetails = $trxQuery->clone()->where('source', 'cash')->where('type', 'expense')->get();

        $kasOut_BayarPenoreh = $kasOpsDetails->where('category', 'Pembayaran Penoreh')->sum('amount');
        $kasOut_BeliKaretManual = $kasOpsDetails->where('category', 'Pembelian Karet')->sum('amount');

        $kasOut_Pegawai = $kasbonQuery->clone()->where('kasbonable_type', 'App\Models\Employee')->sum('kasbon') ?? 0;
        $kasOut_Penoreh = $kasbonQuery->clone()->where('kasbonable_type', 'App\Models\Incisor')->sum('kasbon') ?? 0;

        $kasOut_Lainnya = $trxQuery->clone()
            ->where('source', 'cash')
            ->where('type', 'expense')
            ->whereNotIn('category', ['Pembayaran Penoreh', 'Pembelian Karet'])
            ->sum('amount') ?? 0;

        $totalKasOut = $kasOut_BayarPenoreh + $kasOut_BeliKaretManual + $kasOut_Pegawai + $kasOut_Penoreh + $kasOut_Lainnya;
        $saldoKasPeriod = $totalKasIn - $totalKasOut;

        $accPenarikanTunai = FinancialTransaction::where('category', 'Penarikan Tunai dari Bank')->sum('amount');
        $accBankIn = OutgoingStock::sum('grand_total') + FinancialTransaction::where('source', 'bank')->where('type', 'income')->sum('amount');
        $accBankOut = Payroll::whereIn('status', ['final', 'paid'])->sum('gaji_bersih') + FinancialTransaction::where('source', 'bank')->where('type', 'expense')->sum('amount') + $accPenarikanTunai;
        $saldoBankAccumulated = $accBankIn - $accBankOut;

        $accKasInManual = FinancialTransaction::where('source', 'cash')->where('type', 'income')->where('category', '!=', 'Penarikan Tunai dari Bank')->sum('amount');
        $accKasIn = $accKasInManual + $accPenarikanTunai;

        $accKasOut = Kasbon::sum('kasbon') + FinancialTransaction::where('source', 'cash')->where('type', 'expense')->sum('amount');
        $saldoKasAccumulated = $accKasIn - $accKasOut;

        $totalKasbonAll = Kasbon::sum('kasbon');
        $totalPaymentAll = \App\Models\KasbonPayment::sum('amount');
        $totalPiutangPegawai = $totalKasbonAll - $totalPaymentAll;

        $totalAktiva = $saldoKasAccumulated + $saldoBankAccumulated + $totalPiutangPegawai;
        $totalHutang = 0;
        $ekuitasModal = $totalAktiva - $totalHutang;

        $neraca = [
            'assets' => ['kas_period' => (float) $saldoKasAccumulated, 'bank_period' => (float) $saldoBankAccumulated, 'piutang' => (float) $totalPiutangPegawai, 'inventory_value' => 0, 'total_aktiva' => (float) $totalAktiva],
            'liabilities' => ['hutang_dagang' => (float) $totalHutang, 'ekuitas' => (float) $ekuitasModal, 'total_pasiva' => (float) $totalAktiva]
        ];

        $revenue_karet = $outgoingQuery->sum('grand_total') ?? 0;
        $revenue_lain = $trxQuery->clone()->where('category', 'Pendapatan Lain (Bank)')->sum('amount') ?? 0;
        $revenue = $revenue_karet + $revenue_lain;

        // =====================================
        // COGS - PEMBELIAN BAHAN BAKU KARET
        // =====================================

        $cogs_from_inciseds = Incised::query();

        if ($timePeriod === 'specific-month') {
            $cogs_from_inciseds->whereMonth('date', $selectedMonth)
                            ->whereYear('date', $selectedYear);
        } elseif ($timePeriod === 'last-month') {
            $lastMonth = Carbon::now()->subMonth();
            $cogs_from_inciseds->whereMonth('date', $lastMonth->month)
                            ->whereYear('date', $lastMonth->year);
        } elseif ($timePeriod === 'this-month') {
            $cogs_from_inciseds->whereMonth('date', Carbon::now()->month)
                            ->whereYear('date', Carbon::now()->year);
        } elseif ($timePeriod === 'this-year') {
            $cogs_from_inciseds->whereYear('date', Carbon::now()->year);
        } elseif ($timePeriod === 'periodic-years') {
            $cogs_from_inciseds->whereYear('date', '>=', $startYear)
                            ->whereYear('date', '<=', $endYear);
        }

        $cogs = $cogs_from_inciseds->sum('total_deduction') ?? 0;
        $cogs_Manual = $kasOut_BeliKaretManual;
        $cogs += $cogs_Manual;

        $grossProfit = $revenue - $cogs;

        // =====================================
        // OPEX (OPERATING EXPENSES)
        // =====================================
        $opex_gaji = $payrollQuery->clone()->sum('gaji_bersih') ?? 0;
        $opex_lapangan = $trxQuery->clone()->where('category', 'Operasional Lapangan')->sum('amount') ?? 0;
        $opex_kantor = $trxQuery->clone()->where('category', 'Operasional Kantor')->sum('amount') ?? 0;
        $opex_bpjs = $trxQuery->clone()->where('category', 'BPJS Ketenagakerjaan')->sum('amount') ?? 0;
        $opex_kapal_truck = $trxQuery->clone()->whereIn('category', ['Pembayaran Kapal', 'Pembayaran Truck'])->sum('amount') ?? 0;
        $opex_makan_mandor = $trxQuery->clone()
            ->where('category', 'Uang Makan Mandor')
            ->sum('amount') ?? 0;

        $opex_lainnya = $trxQuery->clone()
            ->where('type', 'expense')
            ->whereNotIn('category', [
                'Pembelian Karet',
                'Penarikan Bank',
                'Penarikan Tunai dari Bank',
                'Pembayaran Penoreh',
                'Bayar Hutang',
                'Operasional Lapangan',
                'Operasional Kantor',
                'BPJS Ketenagakerjaan',
                'Pembayaran Kapal',
                'Pembayaran Truck',
                'Uang Makan Mandor'
            ])->sum('amount') ?? 0;

        $operatingExpenses = $opex_gaji + $opex_lapangan + $opex_kantor + $opex_bpjs +
                           $opex_kapal_truck + $opex_lainnya + $opex_makan_mandor;

        $netProfit = $grossProfit - $operatingExpenses;

        // =====================================
        // CHART DATA
        // =====================================
        $chartData = [];
        $groupBy = ($timePeriod === 'this-year' || $timePeriod === 'all-years' || $timePeriod === 'periodic-years') ? 'month' : 'date';

        $incAuto = $outgoingQuery->clone()->selectRaw($groupBy === 'month' ? 'MONTH(date) as label, SUM(grand_total) as total' : 'DATE(date) as label, SUM(grand_total) as total')->groupBy('label')->pluck('total', 'label');
        $incManual = $trxQuery->clone()->where('type', 'income')->selectRaw($groupBy === 'month' ? 'MONTH(transaction_date) as label, SUM(amount) as total' : 'DATE(transaction_date) as label, SUM(amount) as total')->groupBy('label')->pluck('total', 'label');
        $expManual = $trxQuery->clone()->where('type', 'expense')->where('category', '!=', 'Penarikan Tunai dari Bank')->selectRaw($groupBy === 'month' ? 'MONTH(transaction_date) as label, SUM(amount) as total' : 'DATE(transaction_date) as label, SUM(amount) as total')->groupBy('label')->pluck('total', 'label');

        $allLabels = $incAuto->keys()->merge($incManual->keys())->merge($expManual->keys())->unique()->sort();

        foreach ($allLabels as $label) {
            $displayLabel = ($timePeriod === 'this-year' || $timePeriod === 'all-years' || $timePeriod === 'periodic-years')
                ? Carbon::create()->month($label)->locale('id')->isoFormat('MMM')
                : Carbon::parse($label)->locale('id')->isoFormat('D MMM');
            $totalInc = ($incAuto[$label] ?? 0) + ($incManual[$label] ?? 0);
            $totalExp = ($expManual[$label] ?? 0);
            $chartData[] = ['name' => $displayLabel, 'Pemasukan' => (float) $totalInc, 'Pengeluaran' => (float) $totalExp];
        }

        $requests = PpbHeader::orderBy('created_at', 'DESC')->paginate($perPage);
        $notas = Nota::orderBy('created_at', 'DESC')->paginate($perPage);
        $hargaSahamKaret = HargaInformasi::where('jenis', 'harga_saham_karet')->orderBy('tanggal_berlaku', 'DESC')->first();
        $hargaDollar = HargaInformasi::where('jenis', 'harga_dollar')->orderBy('tanggal_berlaku', 'DESC')->first();
        $pendingRequests = PpbHeader::where('status', 'belum ACC')->count();
        $pendingNotas = Nota::where('status', 'belum ACC')->count();
        $bankOpsDetails = $trxQuery->clone()->where('source', 'bank')->where('type', 'expense')->get();

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
                        "out_penarikan" => (float) $penarikanTunaiPeriod,
                        "total_in" => (float) $totalBankIn,
                        "total_out" => (float) $totalBankOut,
                        "balance" => (float) $saldoBankPeriod
                    ],
                    "kas" => [
                        "in_penarikan" => (float) $penarikanTunaiPeriod,
                        "out_lapangan" => (float) $kasOpsDetails->where('category', 'Operasional Lapangan')->sum('amount'),
                        "out_kantor" => (float) $kasOpsDetails->where('category', 'Operasional Kantor')->sum('amount'),
                        "out_bpjs" => (float) $kasOpsDetails->where('category', 'BPJS Ketenagakerjaan')->sum('amount'),
                        "out_bayar_penoreh" => (float) $kasOut_BayarPenoreh,
                        "out_belikaret" => (float) $kasOut_BeliKaretManual,
                        "out_kasbon_pegawai" => (float) $kasOut_Pegawai,
                        "out_kasbon_penoreh" => (float) $kasOut_Penoreh,
                        "out_makan_mandor" => (float) $opex_makan_mandor,
                        "total_in" => (float) $totalKasIn,
                        "total_out" => (float) $totalKasOut,
                        "balance" => (float) $saldoKasPeriod
                    ],
                    "profit_loss" => [
                        "revenue_karet" => (float) $revenue_karet,
                        "revenue_lain" => (float) $revenue_lain,
                        "revenue_total" => (float) $revenue,
                        "cogs" => (float) $cogs,
                        "gross_profit" => (float) $grossProfit,
                        "opex_gaji" => (float) $opex_gaji,
                        "opex_lapangan" => (float) $opex_lapangan,
                        "opex_kantor" => (float) $opex_kantor,
                        "opex_bpjs" => (float) $opex_bpjs,
                        "opex_kapal_truck" => (float) $opex_kapal_truck,
                        "opex_makan_mandor" => (float) $opex_makan_mandor,
                        "opex_lainnya" => (float) $opex_lainnya,
                        "opex_total" => (float) $operatingExpenses,
                        "net_profit" => (float) $netProfit,
                        "kasbon_keluar_period" => (float) ($kasOut_Pegawai + $kasOut_Penoreh)
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
            "filter" => $request->all(),
            "currentMonth" => (int)$selectedMonth,
            "currentYear" => (int)$selectedYear,
        ];
    }

    public function getTransactions(Request $request)
    {
        $perPage = 10;
        $page = $request->input('page', 1);

        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);
        $startYear = $request->input('start_year', Carbon::now()->year);
        $endYear = $request->input('end_year', Carbon::now()->year);

        $query = FinancialTransaction::query();

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
            $startMonth = $request->input('start_month', Carbon::now()->month);
            $endMonth = $request->input('end_month', Carbon::now()->month);
            $sDate = Carbon::create($startYear, $startMonth, 1)->startOfMonth();
            $eDate = Carbon::create($endYear, $endMonth, 1)->endOfMonth();
            $query->whereBetween('transaction_date', [$sDate, $eDate]);
        }

        $paginator = $query->orderBy('transaction_date', 'DESC')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginator->items(),
            'links' => [],
            'meta' => ['current_page' => $paginator->currentPage(), 'last_page' => $paginator->lastPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total()]
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
        ]);

        $prefix = match($request->kategori) {
            'Operasional Lapangan' => 'OL',
            'Operasional Kantor' => 'OK',
            'BPJS Ketenagakerjaan' => 'BPJS',
            'Pembelian Karet' => 'BKR',
            'Pembayaran Penoreh' => 'BPN',
            'Pembayaran Kapal' => 'BKP',
            'Pembayaran Truck' => 'BTR',
            'Uang Makan Mandor' => 'UMM',
            'Penarikan Bank' => 'PB',
            'Bayar Hutang' => 'BHT',
            'Setor Modal' => 'SMD',
            'Dana Investasi' => 'DIN',
            'Pendapatan Lain (Bank)' => 'PLL',
            'Penarikan Tunai dari Bank' => 'PTB',
            default => 'TRX'
        };

        $date = Carbon::parse($request->tanggal);
        $monthYear = $date->format('my');

        $transactionCode = $prefix . '-' . $monthYear;

        $lastTrx = FinancialTransaction::where('transaction_code', $transactionCode)
            ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
            ->first();

        $nextSeq = 1;
        if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
            $nextSeq = intval($lastTrx->transaction_number) + 1;
        }
        $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

        FinancialTransaction::create([
            'type' => $request->type,
            'source' => $request->source,
            'category' => $request->kategori,
            'amount' => $request->jumlah,
            'transaction_date' => $request->tanggal,
            'description' => $request->deskripsi ?? null,
            'transaction_code' => $transactionCode,
            'transaction_number' => $transactionNumber,
            'db_cr' => $request->db_cr ?? 'debit',
            'counterparty' => $request->counterparty ?? null,
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil dicatat dengan Nomor: ' . $transactionCode . '-' . $transactionNumber);
    }

    public function updateTransaction(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'source' => 'required|in:cash,bank',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric',
            'tanggal' => 'required|date',
        ]);

        $transaction = FinancialTransaction::findOrFail($id);
        $transaction->update([
            'type' => $request->type,
            'source' => $request->source,
            'category' => $request->kategori,
            'amount' => $request->jumlah,
            'transaction_date' => $request->tanggal,
            'description' => $request->deskripsi ?? null,
            'db_cr' => $request->db_cr ?? 'debit',
            'counterparty' => $request->counterparty ?? null,
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function destroyTransaction($id)
    {
        FinancialTransaction::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Transaksi dihapus!');
    }

    public function getProfitLossPeriods(Request $request)
    {
        $startMonth = (int) $request->input('start_month', 1);
        $startYear  = (int) $request->input('start_year', Carbon::now()->year);
        $endMonth   = (int) $request->input('end_month', Carbon::now()->month);
        $endYear    = (int) $request->input('end_year', Carbon::now()->year);

        $periods = [];
        $current = Carbon::create($startYear, $startMonth, 1);
        $end = Carbon::create($endYear, $endMonth, 1);

        while ($current <= $end) {
            $year = $current->year;
            $month = $current->month;
            $periodLabel = $current->locale('id')->isoFormat('MMMM YYYY');
            $data = $this->calculateProfitLossForPeriod($year, $month);
            $data['period_label'] = $periodLabel;
            $periods[] = $data;
            $current->addMonth();
        }

        return response()->json($periods);
    }

    private function calculateProfitLossForPeriod($year, $month)
    {
        $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);

        $revenue_karet = OutgoingStock::whereMonth('date', $month)->whereYear('date', $year)->sum('grand_total') ?? 0;
        $revenue_lain = FinancialTransaction::where('type', 'income')
            ->where('category', 'Pendapatan Lain (Bank)')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)
            ->sum('amount') ?? 0;
        $revenue_total = $revenue_karet + $revenue_lain;

        $cogs_incised = Incised::whereMonth('date', $month)->whereYear('date', $year)->sum('total_deduction') ?? 0;
        $cogs_manual = FinancialTransaction::where('source', 'cash')
            ->where('type', 'expense')->where('category', 'Pembelian Karet')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)
            ->sum('amount') ?? 0;
        $cogs = $cogs_incised + $cogs_manual;
        $gross_profit = $revenue_total - $cogs;

        $opex_gaji = Payroll::whereIn('status', ['final', 'paid'])
            ->where('payroll_period', $periodString)->sum('gaji_bersih') ?? 0;

        $opex_lapangan = FinancialTransaction::where('category', 'Operasional Lapangan')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount') ?? 0;

        $opex_kantor = FinancialTransaction::where('category', 'Operasional Kantor')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount') ?? 0;

        $opex_bpjs = FinancialTransaction::where('category', 'BPJS Ketenagakerjaan')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount') ?? 0;

        $opex_kapal_truck = FinancialTransaction::whereIn('category', ['Pembayaran Kapal', 'Pembayaran Truck'])
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount') ?? 0;

        $opex_makan_mandor = FinancialTransaction::where('category', 'Uang Makan Mandor')
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)->sum('amount') ?? 0;

        $opex_lainnya = FinancialTransaction::where('type', 'expense')
            ->whereNotIn('category', [
                'Pembelian Karet', 'Penarikan Bank', 'Penarikan Tunai dari Bank',
                'Pembayaran Penoreh', 'Bayar Hutang', 'Operasional Lapangan',
                'Operasional Kantor', 'BPJS Ketenagakerjaan', 'Pembayaran Kapal',
                'Pembayaran Truck', 'Uang Makan Mandor'
            ])
            ->whereMonth('transaction_date', $month)->whereYear('transaction_date', $year)
            ->sum('amount') ?? 0;

        $opex_total = $opex_gaji + $opex_lapangan + $opex_kantor + $opex_bpjs +
                      $opex_kapal_truck + $opex_makan_mandor + $opex_lainnya;

        $net_profit = $gross_profit - $opex_total;

        $kasOut_Pegawai = \App\Models\Kasbon::where('kasbonable_type', 'App\Models\Employee')
            ->whereMonth(\Illuminate\Support\Facades\DB::raw('COALESCE(transaction_date, created_at)'), $month)
            ->whereYear(\Illuminate\Support\Facades\DB::raw('COALESCE(transaction_date, created_at)'), $year)
            ->sum('kasbon') ?? 0;
        $kasOut_Penoreh = \App\Models\Kasbon::where('kasbonable_type', 'App\Models\Incisor')
            ->whereMonth(\Illuminate\Support\Facades\DB::raw('COALESCE(transaction_date, created_at)'), $month)
            ->whereYear(\Illuminate\Support\Facades\DB::raw('COALESCE(transaction_date, created_at)'), $year)
            ->sum('kasbon') ?? 0;
        $kasbon_keluar_period = $kasOut_Pegawai + $kasOut_Penoreh;

        return [
            'period_label'         => '',
            'revenue_karet'        => (float) $revenue_karet,
            'revenue_lain'         => (float) $revenue_lain,
            'revenue_total'        => (float) $revenue_total,
            'cogs'                 => (float) $cogs,
            'gross_profit'         => (float) $gross_profit,
            'opex_gaji'            => (float) $opex_gaji,
            'opex_lapangan'        => (float) $opex_lapangan,
            'opex_kantor'          => (float) $opex_kantor,
            'opex_bpjs'            => (float) $opex_bpjs,
            'opex_kapal_truck'     => (float) $opex_kapal_truck,
            'opex_makan_mandor'    => (float) $opex_makan_mandor,
            'opex_lainnya'         => (float) $opex_lainnya,
            'opex_total'           => (float) $opex_total,
            'net_profit'           => (float) $net_profit,
            'kasbon_keluar_period' => (float) $kasbon_keluar_period,
        ];
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

    public function exportExcel(Request $request)
    {
        $timePeriod = $request->input('time_period', 'this-month');
        $data = $this->getFinancialData($request);

        $fileName = 'Laporan_Laba_Rugi_PT_GKA_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($timePeriod, $data, $request) {
            $file = fopen('php://output', 'w');

            // Tambahkan BOM (Byte Order Mark) agar karakter terbaca sempurna di MS Excel
            fputs($file, "\xEF\xBB\xBF");

            // Fungsi bantuan penulisan per baris
            $writeRow = function($label, $valKey, $periods = null, $isMinus = false) use ($file, $data) {
                $row = [$label];
                if ($periods) {
                    foreach ($periods as $p) {
                        $val = $p[$valKey];
                        $row[] = $isMinus ? -$val : $val;
                    }
                } else {
                    $val = $data['summary']['reports']['profit_loss'][$valKey];
                    $row[] = $isMinus ? -$val : $val;
                }
                // Pakai titik koma (;) agar data langsung rapi di MS Excel Indonesia
                fputcsv($file, $row, ';');
            };

            // JIKA MODE RENTANG WAKTU (MULTI-KOLOM)
            if ($timePeriod === 'range-month') {
                $startMonth = (int) $request->input('start_month', 1);
                $startYear  = (int) $request->input('start_year', Carbon::now()->year);
                $endMonth   = (int) $request->input('end_month', Carbon::now()->month);
                $endYear    = (int) $request->input('end_year', Carbon::now()->year);

                $periods = [];
                $current = Carbon::create($startYear, $startMonth, 1);
                $end = Carbon::create($endYear, $endMonth, 1);

                $headersRow = ['Nama Akun'];
                while ($current <= $end) {
                    $headersRow[] = $current->locale('id')->isoFormat('MMMM YYYY');
                    $periods[] = $this->calculateProfitLossForPeriod($current->year, $current->month);
                    $current->addMonth();
                }
                fputcsv($file, $headersRow, ';');

                $writeRow('PENDAPATAN', 'revenue_total', $periods);
                $writeRow('Penjualan Bersih (Karet)', 'revenue_karet', $periods);
                $writeRow('Pendapatan Lain-Lain', 'revenue_lain', $periods);

                $writeRow('HARGA POKOK PENJUALAN (COGS)', 'cogs', $periods);
                $writeRow('Pembelian Bahan Baku Karet', 'cogs', $periods);

                $writeRow('LABA KOTOR (GROSS PROFIT)', 'gross_profit', $periods);

                $writeRow('BIAYA OPERASIONAL (OPEX)', 'opex_total', $periods);
                $writeRow('Biaya Gaji & Upah Pegawai', 'opex_gaji', $periods, true);
                $writeRow('Biaya Operasional Lapangan', 'opex_lapangan', $periods, true);
                $writeRow('Biaya Operasional Kantor', 'opex_kantor', $periods, true);
                $writeRow('Biaya Ekspedisi (Kapal & Truck)', 'opex_kapal_truck', $periods, true);
                $writeRow('Biaya BPJS Ketenagakerjaan', 'opex_bpjs', $periods, true);
                $writeRow('Uang Makan Mandor', 'opex_makan_mandor', $periods, true);
                $writeRow('Biaya Rupa-Rupa Lainnya', 'opex_lainnya', $periods, true);

                $writeRow('LABA BERSIH (NET PROFIT)', 'net_profit', $periods);

                fputcsv($file, [], ';');
                fputcsv($file, ['INFORMASI TAMBAHAN (NON-P&L)'], ';');
                $writeRow('Total Uang Kasbon Keluar', 'kasbon_keluar_period', $periods);

            } else {
                // JIKA MODE BULAN BIASA (1 KOLOM)
                fputcsv($file, ['Nama Akun', 'Total (Rp)'], ';');

                $writeRow('PENDAPATAN', 'revenue_total');
                $writeRow('Penjualan Bersih (Karet)', 'revenue_karet');
                $writeRow('Pendapatan Lain-Lain', 'revenue_lain');

                $writeRow('HARGA POKOK PENJUALAN (COGS)', 'cogs');
                $writeRow('Pembelian Bahan Baku Karet', 'cogs');

                $writeRow('LABA KOTOR (GROSS PROFIT)', 'gross_profit');

                $writeRow('BIAYA OPERASIONAL (OPEX)', 'opex_total');
                $writeRow('Biaya Gaji & Upah Pegawai', 'opex_gaji', null, true);
                $writeRow('Biaya Operasional Lapangan', 'opex_lapangan', null, true);
                $writeRow('Biaya Operasional Kantor', 'opex_kantor', null, true);
                $writeRow('Biaya Ekspedisi (Kapal & Truck)', 'opex_kapal_truck', null, true);
                $writeRow('Biaya BPJS Ketenagakerjaan', 'opex_bpjs', null, true);
                $writeRow('Uang Makan Mandor', 'opex_makan_mandor', null, true);
                $writeRow('Biaya Rupa-Rupa Lainnya', 'opex_lainnya', null, true);

                $writeRow('LABA BERSIH (NET PROFIT)', 'net_profit');

                fputcsv($file, [], ';');
                fputcsv($file, ['INFORMASI TAMBAHAN (NON-P&L)'], ';');
                $writeRow('Total Uang Kasbon Keluar', 'kasbon_keluar_period');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
