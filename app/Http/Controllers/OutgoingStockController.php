<?php

namespace App\Http\Controllers;

use App\Models\OutgoingStock;
use App\Models\IncomingStock;
use App\Models\MasterProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OutgoingStockController extends Controller
{
    /**
     * Halaman GKA: Dashboard Pusat (Penjualan & Stok Gudang Utama)
     */
    public function gka(Request $request)
    {
        $perPage = 20;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month'); // Default bulan ini biar relevan
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);
        $productType = $request->input('product_type', 'all');

        // =====================================================================
        // 1. QUERY UNTUK KARTU & CHART (STATISTIK)
        // =====================================================================

        // A. PRODUKSI KARET (CARD ORANGE) -> Ambil dari IncomingStock (Barang Masuk)
        $produksiQuery = IncomingStock::whereHas('product', function($q) {
            $q->where('name', 'like', '%karet%');
        });
        $this->applyDateFilter($produksiQuery, $timePeriod, $selectedMonth, $selectedYear);
        $total_produksi_karet = $produksiQuery->sum('qty_net'); // Total KG Masuk

        // B. PENJUALAN / SALES (CARD HIJAU & BIRU) -> Ambil dari OutgoingStock
        $salesQuery = OutgoingStock::with(['product', 'customer'])
            ->where(function($q) {
                $q->where('status', 'buyer')
                  ->orWhere('status', 'shipped')
                  ->orWhere('status', 'Done');
            });

        // Filter Produk di Sales
        if ($productType !== 'all') {
            $salesQuery->whereHas('product', function($q) use ($productType) {
                $q->where('name', 'like', "%{$productType}%");
            });
        }

        // Terapkan Filter Waktu yang SAMA ke Sales
        $this->applyDateFilter($salesQuery, $timePeriod, $selectedMonth, $selectedYear);

        // Hitung Angka Statistik Sales
        $total_pendapatan = $salesQuery->sum('grand_total'); // Card Hijau (Rp)
        $total_terjual_kg = $salesQuery->sum('qty_sampai');     // Card Biru (Kg)

        // Hitung Susut (Card Merah) -> Hanya hitung yg sudah ada qty_sampai
        $querySusut = clone $salesQuery;
        $total_susut = $querySusut->whereNotNull('qty_sampai')
                                  ->where('qty_sampai', '>', 0)
                                  ->sum(DB::raw('qty_out - qty_sampai'));


        // =====================================================================
        // 2. QUERY UNTUK TABEL DAFTAR (PAGINATION)
        // =====================================================================

        // Tabel Penjualan (Kita pakai query sales di atas + search + paginate)
        $salesTableQuery = clone $salesQuery;

        $salesTableQuery->when($searchTerm, function ($q, $search) {
            $q->where(function($sub) use ($search) {
                $sub->where('no_invoice', 'like', "%{$search}%")
                    ->orWhere('no_po', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        });

        $products2 = $salesTableQuery->orderBy('date', 'DESC')->paginate($perPage, ['*'], 'page2');

        // Tabel Produksi (Opsional: Jika ingin menampilkan daftar masuk karet di tab Produksi)
        // Kita pakai query produksi di atas
        $productionTableQuery = clone $produksiQuery;
        $products = $productionTableQuery->with('product')->orderBy('date', 'DESC')->paginate($perPage, ['*'], 'page');


        // =====================================================================
        // 3. CHART DATA (GRAFIK TAHUNAN)
        // =====================================================================
        $chartQueryYear = $request->input('year', Carbon::now()->year);

        // Grafik Produksi (Masuk)
        $chartProduksi = IncomingStock::selectRaw('MONTH(date) as month, SUM(qty_net) as total')
            ->whereYear('date', $chartQueryYear)
            ->whereHas('product', fn($q) => $q->where('name', 'like', '%karet%'))
            ->groupBy('month')->pluck('total', 'month');

        // Grafik Penjualan (Keluar)
        $chartPenjualan = OutgoingStock::selectRaw('MONTH(date) as month, SUM(qty_out) as total')
            ->whereYear('date', $chartQueryYear)
            ->whereIn('status', ['buyer', 'shipped'])
            ->groupBy('month')->pluck('total', 'month');

        $chartData = collect(range(1, 12))->map(function ($m) use ($chartProduksi, $chartPenjualan) {
            return [
                'name' => Carbon::create()->month($m)->locale('id')->isoFormat('MMM'),
                'Produksi' => $chartProduksi[$m] ?? 0,
                'Penjualan' => $chartPenjualan[$m] ?? 0,
            ];
        });

        // =====================================================================
        // 4. DATA STOK READY (REALTIME)
        // =====================================================================
        $karetProduct = MasterProduct::where('name', 'like', '%karet%')->first();
        $s_ready = $karetProduct ? $karetProduct->current_stock : 0;

        $pupukProduct = MasterProduct::where('name', 'like', '%pupuk%')->first();
        $p_ready = $pupukProduct ? $pupukProduct->current_stock : 0;

        $kelapaProduct = MasterProduct::where('name', 'like', '%kelapa%')->first();
        $klp_ready = $kelapaProduct ? $kelapaProduct->current_stock : 0;

        return Inertia::render("Products/gka", [
            // Data Tabel
            "products"  => $products,  // Tabel Produksi (Incoming Karet)
            "products2" => $products2, // Tabel Penjualan (Outgoing)

            // Dummy table lain biar gak error
            "products3" => ['data' => [], 'links' => []],
            "products4" => ['data' => [], 'links' => []],
            "products5" => ['data' => [], 'links' => []],
            "products6" => ['data' => [], 'links' => []],

            // Filter
            "filter" => $request->only(['search', 'time_period', 'month', 'year', 'product_type']),
            "currentMonth" => (int)$selectedMonth,
            "currentYear" => (int)$selectedYear,

            // --- STATISTIK CARD UTAMA (Sesuai Request) ---
            "tm_sin"  => $total_produksi_karet, // CARD ORANGE (Produksi)
            "tm_slou" => $total_pendapatan,     // CARD HIJAU (Pendapatan Rp)
            "tm_sampai" => $total_terjual_kg,   // CARD BIRU (Terjual Kg)
            "dataSusut" => $total_susut,        // CARD MERAH (Susut Kg)

            // Stok Ready
            "s_ready" => $s_ready,
            "p_ready" => $p_ready,
            "klp_ready" => $klp_ready,

            // Variable lama (set 0)
            "tm_slin" => 0, "tm_sou" => 0, "keping_in" => 0, "keping_out" => 0,
            "ppk_slin" => 0, "ppk_slou" => 0, "ppk_sin" => 0, "ppk_sou" => 0,
            "klp_slin" => 0, "klp_slou" => 0, "klp_sin" => 0, "klp_sou" => 0,

            // Chart
            "chartData" => $chartData,
        ]);
    }

    // ... Function Helper date filter, create, store, edit, update, show, destroy ...
    // (Pastikan fungsi-fungsi CRUD yang kita buat sebelumnya tetap ada di bawah ini)

    private function applyDateFilter($query, $timePeriod, $selectedMonth, $selectedYear) {
        if ($timePeriod === 'specific-month') {
            $query->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
        } elseif ($timePeriod !== 'all-time') {
            switch ($timePeriod) {
                case 'today': $query->whereDate('date', Carbon::today()); break;
                case 'this-week': $query->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month': $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month':
                    $lastMonth = Carbon::now()->subMonth();
                    $query->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year);
                    break;
                case 'this-year': $query->whereYear('date', Carbon::now()->year); break;
            }
        }
    }

    // --- PASTE KEMBALI FUNGSI CREATE, STORE, EDIT, UPDATE, SHOW, DESTROY DI SINI ---
    // (Saya persingkat agar muat, tapi logic-nya pakai yang terakhir kita bahas ya)
    public function create() {
        return Inertia::render('Products/CreateOutgoing', [
            'master_products' => MasterProduct::select('id', 'name', 'code')->orderBy('name')->get(),
            'customers' => \App\Models\Customer::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request) {
        // ... (Gunakan validasi store terakhir yang ada PPH & NO PO) ...
        $validated = $request->validate([
            'date' => 'required|date', 'no_invoice' => 'required|string|max:50', 'no_po' => 'nullable|string',
            'product_id' => 'required|exists:master_products,id', 'customer_id' => 'required|exists:customers,id',
            'qty_out' => 'required|numeric', 'selling_price' => 'required|numeric', 'grand_total' => 'required|numeric',
            'shipping_method' => 'nullable', 'status' => 'required', 'keping_out' => 'nullable', 'kualitas_out' => 'nullable',
            'tgl_kirim' => 'nullable', 'person_in_charge' => 'nullable', 'pph_value' => 'nullable', 'ob_cost' => 'nullable', 'extra_cost' => 'nullable', 'notes' => 'nullable'
        ]);
        OutgoingStock::create($validated);
        return redirect()->route('products.gka')->with('message', 'Penjualan Berhasil Disimpan');
    }

    public function edit(OutgoingStock $outgoingStock) {
        return Inertia::render('Products/EditOutgoing', [
            'stock' => $outgoingStock,
            'master_products' => MasterProduct::select('id', 'name', 'code')->orderBy('name')->get(),
            'customers' => \App\Models\Customer::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, OutgoingStock $outgoingStock) {
        // ... (Gunakan validasi update terakhir) ...
        $validated = $request->validate([
            'date' => 'required|date', 'no_invoice' => 'required|string|max:50', 'no_po' => 'nullable|string',
            'product_id' => 'required|exists:master_products,id', 'customer_id' => 'required|exists:customers,id',
            'qty_out' => 'required|numeric', 'selling_price' => 'required|numeric', 'grand_total' => 'required|numeric',
            'shipping_method' => 'nullable', 'status' => 'required', 'keping_out' => 'nullable', 'kualitas_out' => 'nullable',
            'tgl_kirim' => 'nullable', 'person_in_charge' => 'nullable', 'pph_value' => 'nullable', 'ob_cost' => 'nullable', 'extra_cost' => 'nullable', 'notes' => 'nullable',
            'tgl_sampai' => 'nullable', 'qty_sampai' => 'nullable'
        ]);
        $outgoingStock->update($validated);
        return redirect()->route('products.gka')->with('message', 'Data Penjualan Berhasil Diperbarui');
    }

    public function destroy(OutgoingStock $outgoingStock) {
        $outgoingStock->delete();
        return redirect()->back()->with('message', 'Data Penjualan Berhasil Dihapus');
    }

    public function show(OutgoingStock $outgoingStock) {
        return Inertia::render('Products/ShowOutgoing', ['stock' => $outgoingStock->load(['product', 'customer'])]);
    }

    public function print(OutgoingStock $outgoingStock)
    {
        // Load relasi
        $outgoingStock->load(['product', 'customer']);

        // Mapping data agar sesuai dengan Interface di Print.tsx
        // Kita ubah objek model menjadi array flat sesuai kebutuhan Print.tsx
        $printData = [
            'id' => $outgoingStock->id,
            'no_invoice' => $outgoingStock->no_invoice,
            'no_po' => $outgoingStock->no_po,
            'date' => $outgoingStock->date,
            'product' => $outgoingStock->product ? $outgoingStock->product->name : '-', // Ambil nama produk
            'nm_supplier' => 'Gudang Utama (GKA)', // Atau ambil field lain jika ada
            'j_brg' => $outgoingStock->j_brg ?? 'Karet', // Default jika null
            'qty_out' => $outgoingStock->qty_out,
            'qty_sampai' => $outgoingStock->qty_sampai ?? 0,
            'keping_out' => $outgoingStock->keping_out,
            'kualitas_out' => $outgoingStock->kualitas_out,
            'shipping_method' => $outgoingStock->shipping_method,
            'tgl_kirim' => $outgoingStock->tgl_kirim,
            'tgl_sampai' => $outgoingStock->tgl_sampai,
            'person_in_charge' => $outgoingStock->person_in_charge,

            // Keuangan
            'price_out' => $outgoingStock->selling_price, // Di model namanya selling_price, di Print.tsx price_out
            'pph_value' => $outgoingStock->pph_value,
            'ob_cost' => $outgoingStock->ob_cost,
            'extra_cost' => $outgoingStock->extra_cost,
            'amount_out' => $outgoingStock->grand_total, // Net Total
            'due_date' => $outgoingStock->due_date ?? '',
            'desk' => $outgoingStock->notes ?? '',

            // Customer
            'customer_name' => $outgoingStock->customer ? $outgoingStock->customer->name : 'Umum',
            'status' => $outgoingStock->status,
        ];

        // Hitung Susut untuk dikirim ke props
        $susutValue = 0;
        if ($outgoingStock->qty_sampai > 0) {
            $susutValue = $outgoingStock->qty_out - $outgoingStock->qty_sampai;
        }

        return Inertia::render('Products/Print', [
            'product' => $printData,
            'susut_value' => $susutValue
        ]);
    }

    /**
     * Cetak Laporan Riwayat Penjualan (Rekap)
     */
    public function printReport(Request $request)
    {
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month');
        $selectedYear = $request->input('year');

        // 1. Query Dasar dengan Relasi
        $query = OutgoingStock::with(['product', 'customer']);

        // 2. Filter Pencarian (Sama seperti di halaman Index)
        $query->when($searchTerm, function ($q, $search) {
            $q->where(function($sub) use ($search) {
                $sub->where('no_invoice', 'like', "%{$search}%")
                    ->orWhere('no_po', 'like', "%{$search}%")
                    ->orWhereHas('customer', function($c) use ($search) {
                        $c->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('product', function($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%");
                    });
            });
        });

        // 3. Filter Waktu (Manual Logic agar presisi)
        if ($timePeriod !== 'all-time') {
            switch ($timePeriod) {
                case 'today':
                    $query->whereDate('date', Carbon::today()); break;
                case 'this-week':
                    $query->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month':
                    $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month':
                    $query->whereMonth('date', Carbon::now()->subMonth()->month)->whereYear('date', Carbon::now()->subMonth()->year); break;
                case 'this-year':
                    $query->whereYear('date', Carbon::now()->year); break;
                case 'custom':
                    if ($selectedMonth && $selectedYear) {
                        $query->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
                    }
                    break;
            }
        }

        // 4. Ambil Data (Urutkan dari terlama ke terbaru untuk laporan)
        $data = $query->orderBy('date', 'ASC')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'date' => $item->date,
                'no_invoice' => $item->no_invoice,
                'no_po' => $item->no_po ?? '-',
                // nm_supplier untuk outgoing biasanya internal/gudang, atau kosong
                'nm_supplier' => 'Gudang Utama',
                'product' => $item->product ? $item->product->name : '-',
                'j_brg' => $item->j_brg ?? '-',
                'qty_out' => (float)$item->qty_out,
                'qty_sampai' => (float)$item->qty_sampai,
                'amount_out' => (float)$item->grand_total, // Gunakan grand_total sebagai nilai akhir
                'price_out' => (float)$item->selling_price,
                'tgl_kirim' => $item->tgl_kirim ?? '-',
                'tgl_sampai' => $item->tgl_sampai ?? '-',
                'shipping_method' => $item->shipping_method ?? '-',
                'customer_name' => $item->customer ? $item->customer->name : 'Umum',
                'pph_value' => (float)$item->pph_value,
                'ob_cost' => (float)$item->ob_cost,
                'extra_cost' => (float)$item->extra_cost,
            ];
        });

        // 5. Hitung Totals untuk Footer Laporan
        $totals = [
            'qty' => $data->sum('qty_out'),
            'qty_sampai' => $data->sum('qty_sampai'),
            'amount' => $data->sum('amount_out'),
            'pph_value' => $data->sum('pph_value'),
            'ob_cost' => $data->sum('ob_cost'),
            'extra_cost' => $data->sum('extra_cost'),
        ];

        return Inertia::render('Products/Report', [
            'data' => $data,
            'totals' => $totals,
            'filters' => [
                'period' => $timePeriod,
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'type' => 'Laporan Penjualan'
            ]
        ]);
    }
}
