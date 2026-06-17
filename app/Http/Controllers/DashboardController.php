<?php

namespace App\Http\Controllers;

use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use App\Models\Incised;
use App\Models\Incisor;
use App\Models\Requested;
use App\Models\Nota;
use App\Models\User;
use App\Models\HousingProject;
use App\Models\FinancialTransaction;
use App\Models\BlokKavling;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month');
        $selectedYear = $request->input('year', Carbon::now()->year);

        // --- 1. FILTER WAKTU UNTUK KARTU (STATISTIK) ---
        $dateRangeStart = null;
        $dateRangeEnd = null;

        if ($timePeriod !== 'all-time') {
            switch ($timePeriod) {
                case 'today':
                    $dateRangeStart = Carbon::today(); $dateRangeEnd = Carbon::today(); break;
                case 'this-week':
                    $dateRangeStart = Carbon::now()->startOfWeek(); $dateRangeEnd = Carbon::now()->endOfWeek(); break;
                case 'this-month':
                    $dateRangeStart = Carbon::now()->startOfMonth(); $dateRangeEnd = Carbon::now()->endOfMonth(); break;
                case 'last-month':
                    $dateRangeStart = Carbon::now()->subMonth()->startOfMonth(); $dateRangeEnd = Carbon::now()->subMonth()->endOfMonth(); break;
                case 'this-year':
                    $dateRangeStart = Carbon::now()->startOfYear(); $dateRangeEnd = Carbon::now()->endOfYear(); break;
                case 'custom':
                    if ($selectedMonth && $selectedYear) {
                        $dateRangeStart = Carbon::createFromDate($selectedYear, $selectedMonth, 1)->startOfMonth();
                        $dateRangeEnd = Carbon::createFromDate($selectedYear, $selectedMonth, 1)->endOfMonth();
                    }
                    break;
            }
        }

        // --- 2. QUERY KARTU STATISTIK (Mengikuti Filter) ---
        $incomingQuery = IncomingStock::query()->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'));
        $outgoingQuery = OutgoingStock::query()->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'));

        if ($dateRangeStart && $dateRangeEnd) {
            $incomingQuery->whereBetween('date', [$dateRangeStart, $dateRangeEnd]);
            $outgoingQuery->whereBetween('date', [$dateRangeStart, $dateRangeEnd]);
        }

        // A. Pendapatan Penjualan Karet (Outgoing)
        $statsSales = (clone $outgoingQuery)
            ->selectRaw('SUM(grand_total) as total_uang, SUM(qty_out) as total_kg_kirim')
            ->first();

        $totalRevenueAmount = $statsSales->total_uang ?? 0;
        $stok_gka = $statsSales->total_kg_kirim ?? 0;

        // B. Produksi Karet (Incoming)
        $statsProd = (clone $incomingQuery)
            ->selectRaw('SUM(qty_net) as total_kg, SUM(total_amount) as total_uang')
            ->first();

        $hsl_tsa = $statsProd->total_kg ?? 0;
        $hsl_beli = $statsProd->total_uang ?? 0;

        // C. Data Pendukung Lain
        $totalPendingRequests = Requested::where('status', 'belum ACC')->count();
        $totalPendingNota = Nota::where('status', 'belum ACC')->sum('dana');
        $jml_penoreh = Incisor::where('is_active', true)->count();
        $jml_pegawai = User::count();


        // --- 2.5 QUERY STATISTIK REAL ESTATE ---
        $reProyekAktif = HousingProject::where('status', 'Sedang Berjalan')->orWhere('status', 'Aktif')->count();
        if ($reProyekAktif === 0) {
             // fallback just in case
             $reProyekAktif = HousingProject::count();
        }
        $reDanaMasuk = FinancialTransaction::realEstate()
            ->where('type', 'income')
            ->sum('amount');
        $reKavlingTersedia = BlokKavling::where('status_jual', 'Tersedia')->orWhere('status_jual', 'Available')->count();
        $reValuasiAset = BlokKavling::sum('harga_jual_final');

        // --- 3. QUERY GRAFIK BULANAN (SELALU TAHUN INI/TERPILIH) ---
        // Agar grafik tidak kosong saat filter 'this-month', kita paksa grafik ambil data 1 tahun penuh.
        $chartYear = $selectedYear ?: Carbon::now()->year; // Default tahun ini jika tidak dipilih

        // Data Produksi (Masuk) per Bulan
        $incomingMonthly = IncomingStock::selectRaw('MONTH(date) as month, SUM(CASE WHEN nm_supplier LIKE "%Temadu%" THEN qty_net ELSE 0 END) as temadu, SUM(CASE WHEN nm_supplier LIKE "%Sebayar%" THEN qty_net ELSE 0 END) as sebayar')
            ->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'))
            ->whereYear('date', $chartYear) // Selalu per tahun
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Data Penjualan (Keluar) per Bulan
        $outgoingMonthly = OutgoingStock::selectRaw('MONTH(date) as month, SUM(grand_total) as uang')
            ->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'))
            ->whereYear('date', $chartYear) // Selalu per tahun
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Gabungkan Data untuk Chart
        $monthlyData = [];
        $monthlyRevenueData = [];

        for ($i = 1; $i <= 12; $i++) {
            $monthName = Carbon::create()->month($i)->translatedFormat('M');

            $in = $incomingMonthly->get($i);
            $out = $outgoingMonthly->get($i);

            // Chart Komposisi Produksi (Kg)
            $monthlyData[] = [
                'name' => $monthName,
                'temadu' => $in ? (float)$in->temadu : 0,
                'sebayar' => $in ? (float)$in->sebayar : 0,
            ];

            // Chart Tren Pendapatan (Rp)
            $monthlyRevenueData[] = [
                'name' => $monthName,
                'value' => $out ? (float)$out->uang : 0
            ];
        }

        // --- 4. TOP PENOREH ---
        $topIncisorRevenue = Incisor::select('incisors.name')
            ->join('inciseds', 'incisors.no_invoice', '=', 'inciseds.no_invoice')
            ->selectRaw('SUM(inciseds.qty_kg) as qty_karet')
            ->whereYear('inciseds.date', $chartYear) // Ikut tahun chart
            ->groupBy('incisors.name')
            ->orderByDesc('qty_karet')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return ['name' => $item->name, 'qty_karet' => (float)$item->qty_karet];
            });

        // --- 5. Distribusi Kualitas ---
        $qualityDistribution = IncomingStock::selectRaw('kualitas, COUNT(*) as count')
            ->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'))
            ->whereYear('date', $chartYear)
            ->groupBy('kualitas')
            ->get()
            ->map(function($item) {
                return ['name' => $item->kualitas ?: 'Tanpa Label', 'value' => $item->count];
            });

        return Inertia::render("Dashboard/Index", [
            "filter" => $request->only(['search', 'time_period', 'month', 'year']),
            "chartYear" => (int)$chartYear, // Kirim tahun grafik ke frontend

            "totalRevenueAmount" => $totalRevenueAmount,
            "hsl_tsa" => $hsl_tsa,
            "stok_gka" => $stok_gka,
            "hsl_beli" => $hsl_beli,

            "totalPendingRequests" => $totalPendingRequests,
            "totalPendingNota" => $totalPendingNota,
            "jml_penoreh" => $jml_penoreh,
            'jml_pegawai' => $jml_pegawai,

            'reProyekAktif' => $reProyekAktif,
            'reDanaMasuk' => $reDanaMasuk,
            'reKavlingTersedia' => $reKavlingTersedia,
            'reValuasiAset' => $reValuasiAset,

            'monthlyData' => $monthlyData,
            "monthlyRevenueData" => $monthlyRevenueData,
            "topIncisorRevenue" => $topIncisorRevenue,
            "qualityDistribution" => $qualityDistribution,

            // Legacy
            'totalAmountOutKaret' => 0, 'totalRevenueKg' => 0,
        ]);
    }
}
