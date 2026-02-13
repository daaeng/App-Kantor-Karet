<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\OutgoingStock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductsAllExport;
use Carbon\Carbon;

class ProductController extends Controller
{
    // ... (Fungsi index, create, store, edit, update biarkan seperti biasa) ...
    public function index()
    {
        // $products = Product::orderBy('created_at', 'DESC')->get();

        // $karet = Product::where('product', 'karet')->SUM('qty_kg');
        // $karet2 = Product::where('product', 'karet')->SUM('qty_out');

        // $saldoin = Product::where('product', 'karet')->SUM('amount');
        // $saldoout = Product::where('product', 'karet')->SUM('amount_out');

        // $klp = Product::where('product', 'kelapa')->SUM('qty_kg');
        // $klp2 = Product::where('product', 'kelapa')->SUM('qty_out');

        // $saldoinklp = Product::where('product', 'kelapa')->SUM('amount');
        // $saldooutklp = Product::where('product', 'kelapa')->SUM('amount_out');

        // $ppk = Product::where('product', 'pupuk')->SUM('qty_kg');
        // $ppk2 = Product::where('product', 'pupuk')->SUM('qty_out');

        // $saldoinppk = Product::where('product', 'pupuk')->SUM('amount');
        // $saldooutppk = Product::where('product', 'pupuk')->SUM('amount_out');

        // return Inertia::render("Products/index", [
        //     "products" => $products,
        //     "filter" => request()->only(['search']),
        //     "hsl_karet" => $karet - $karet2,
        //     "saldoin" => $saldoin,
        //     "saldoout" => $saldoout,
        //     "hsl_kelapa" => $klp - $klp2,
        //     "saldoinklp" => $saldoinklp,
        //     "saldooutklp" => $saldooutklp,
        //     "hsl_pupuk" => $ppk - $ppk2,
        //     "saldoinppk" => $saldoinppk,
        //     "saldooutppk" => $saldooutppk,
        // ]);
        return Inertia::render('Products/index');
    }

    public function create()
    {
            return inertia('Products/create');
    }

    public function c_send()
    {
            return inertia('Products/c_send');
    }

    public function s_gka()
    {
            return inertia('Products/s_gka');
    }

    public function store(Request $request)
    {
        $request->validate([
            'product' => 'required|string|max:250',
            'date' => 'required|date',
            'no_invoice' => 'required|string|max:250',
            'no_po' => 'nullable|string|max:250',
            'nm_supplier' => 'required|string|max:250',
            'j_brg' => 'required|string|max:250',
            'desk' => 'nullable|string',
            'qty_kg' => 'nullable|numeric',
            'price_qty' => 'nullable|numeric',
            'amount' => 'nullable|numeric',
            'keping' => 'nullable|numeric',
            'kualitas' => 'nullable|string|max:250',
            'qty_out' => 'nullable|numeric',
            'price_out' => 'nullable|numeric',
            'amount_out' => 'nullable|numeric',
            'keping_out' => 'nullable|numeric',
            'kualitas_out' => 'nullable|string|max:250',
            'status' => 'required|string|max:250',
            'tgl_kirim' => 'nullable|date',
            'tgl_sampai' => 'nullable|date',
            'qty_sampai' => 'nullable|numeric',
        ]);

        Product::create($request->all());
        return redirect()->route('products.index')->with('message', 'Product Created Successfully');
    }

    public function edit(Product $product){
        return inertia('Products/Edit', compact('product'));
    }

    public function edit_out(Product $product){
        return inertia('Products/Edit_out', compact('product'));
    }

    public function update(Request $request, Product $product)
    {
        // Validasi ulang saat update
        $request->validate([
            'product' => 'required|string|max:250',
            'date' => 'required|date',
            'no_invoice' => 'required|string|max:250',
            'no_po' => 'nullable|string|max:250',
            'nm_supplier' => 'required|string|max:250',
            'j_brg' => 'required|string|max:250',
            'desk' => 'nullable|string',
            'qty_kg' => 'nullable|numeric',
            'price_qty' => 'nullable|numeric',
            'amount' => 'nullable|numeric',
            'keping' => 'nullable|numeric',
            'kualitas' => 'nullable|string|max:250',
            'qty_out' => 'nullable|numeric',
            'price_out' => 'nullable|numeric',
            'amount_out' => 'nullable|numeric',
            'keping_out' => 'nullable|numeric',
            'kualitas_out' => 'nullable|string|max:250',
            'status' => 'required|string|max:250',
            'tgl_kirim' => 'nullable|date',
            'tgl_sampai' => 'nullable|date',
            'qty_sampai' => 'nullable|numeric',

            // Field Tambahan
            'customer_name' => 'nullable|string|max:250',
            'shipping_method' => 'nullable|string|max:250',
            'pph_value' => 'nullable|numeric',
            'ob_cost' => 'nullable|numeric',
            'extra_cost' => 'nullable|numeric',
            'due_date' => 'nullable|date',
            'person_in_charge' => 'nullable|string|max:250',
        ]);

        // [PERBAIKAN UTAMA] Gunakan ini agar semua field otomatis tersimpan/terupdate
        $product->update($request->all());

        return redirect()->route('products.index')->with('message', 'Product Updated Successfully');
    }

    public function show(Product $product)
    {
       $susutValue = 0;

        if ($product->product === 'karet' && $product->status === 'buyer') {
            $productDate = Carbon::parse($product->date)->toDateString();

            // Logic hitung susut (sesuai kode lama)
            // ... (Kode hitung susut tetap sama) ...
            $gkaTotalOnDate = Product::where('product', 'karet')
                ->where('status', 'gka')
                ->whereDate('date', $productDate)
                ->sum('qty_out');

            $buyerTotalOnDate = Product::where('product', 'karet')
                ->where('status', 'buyer')
                ->whereDate('date', $productDate)
                ->sum('qty_out');

            if ($gkaTotalOnDate > 0) {
                $susutValue = $gkaTotalOnDate - $buyerTotalOnDate;
            }
        }
        return inertia('Products/show', [
            'product' => $product,
            'susut_value' => $susutValue,
        ]);
    }

    // [BARU] Fungsi Cetak Laporan Produk Individual (Invoice)
    public function print(Product $product)
    {
        // Hitung susut (Logic yang sama dengan show)
        $susutValue = 0;
        if ($product->product === 'karet' && $product->status === 'buyer') {
            $productDate = Carbon::parse($product->date)->toDateString();
            $gkaTotalOnDate = Product::where('product', 'karet')->where('status', 'gka')->whereDate('date', $productDate)->sum('qty_out');
            $buyerTotalOnDate = Product::where('product', 'karet')->where('status', 'buyer')->whereDate('date', $productDate)->sum('qty_out');
            if ($gkaTotalOnDate > 0) {
                $susutValue = $gkaTotalOnDate - $buyerTotalOnDate;
            }
        }

        return Inertia::render('Products/Print', [
            'product' => $product,
            'susut_value' => $susutValue,
        ]);
    }

    // [BARU & PENTING] Fungsi Cetak Laporan Rekapitulasi Penjualan
    public function print_report(Request $request)
    {
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'all-time');
        $selectedMonth = $request->input('month', \Carbon\Carbon::now()->month);
        $selectedYear = $request->input('year', \Carbon\Carbon::now()->year);
        $productType = $request->input('product_type', 'all');

        // Load relasi customer & product
        $query = OutgoingStock::query()->with(['customer', 'product'])->where('status', 'buyer');

        // Filter Pencarian
        $query->when($searchTerm, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('no_invoice', 'like', "%{$search}%")
                    ->orWhere('no_po', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($c) use ($search) {
                        $c->where('name', 'like', "%{$search}%");
                    });
            });
        });

        // Filter Waktu
        if ($timePeriod === 'specific-month') {
            $query->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
        } elseif ($timePeriod !== 'all-time') {
            switch ($timePeriod) {
                case 'today': $query->whereDate('date', \Carbon\Carbon::today()); break;
                case 'this-week': $query->whereBetween('date', [\Carbon\Carbon::now()->startOfWeek(), \Carbon\Carbon::now()->endOfWeek()]); break;
                case 'this-month': $query->whereMonth('date', \Carbon\Carbon::now()->month)->whereYear('date', \Carbon\Carbon::now()->year); break;
                case 'last-month': $query->whereMonth('date', \Carbon\Carbon::now()->subMonth()->month)->whereYear('date', \Carbon\Carbon::now()->subMonth()->year); break;
                case 'this-year': $query->whereYear('date', \Carbon\Carbon::now()->year); break;
            }
        }

        if ($productType !== 'all') {
            $query->where('product', $productType);
        }

        $products = $query->orderByRaw('COALESCE(tgl_kirim, date) ASC')->get();

        // Variabel Total Footer
        $totalQtyOut = 0; $totalQtySampai = 0; $totalGross = 0;
        $totalDeductions = 0; $totalNet = 0; $totalKeping = 0;

        // [FIX UTAMA] Mapping Data Secara Manual
        $processedData = $products->map(function ($item) use (&$totalQtyOut, &$totalQtySampai, &$totalGross, &$totalDeductions, &$totalNet, &$totalKeping) {

            $usedQty = ($item->qty_sampai > 0) ? $item->qty_sampai : $item->qty_out;
            $price = $item->selling_price ?? 0;

            $gross = $usedQty * $price;
            $deduction = ($item->pph_value ?? 0) + ($item->ob_cost ?? 0) + ($item->extra_cost ?? 0);
            $net = $gross - $deduction;
            $keping = ($item->keping_out > 0) ? $item->keping_out : $item->keping;

            // Akumulasi Total
            $totalQtyOut += $item->qty_out;
            $totalQtySampai += $item->qty_sampai;
            $totalGross += $gross;
            $totalDeductions += $deduction;
            $totalNet += $net;
            $totalKeping += $keping;

            // Susun Array Manual (Menjamin no_po masuk)
            return [
                'id' => $item->id,
                'no_po' => $item->no_po,
                'date' => $item->date,
                'tgl_kirim' => $item->tgl_kirim,
                'tgl_sampai' => $item->tgl_sampai,
                'shipping_method' => $item->shipping_method,

                // Data Relasi (Fixed Name)
                'fixed_customer_name' => $item->customer ? $item->customer->name : ($item->nm_supplier ?? '-'),
                'fixed_product_name' => $item->product ? $item->product->name : ($item->j_brg ?? '-'),
                'fixed_price' => $price,

                // Data Fisik
                'j_brg' => $item->j_brg,
                'kualitas_out' => $item->kualitas_out,
                'qty_out' => $item->qty_out,
                'qty_sampai' => $item->qty_sampai,
                'final_keping' => $keping,

                // Data Hitungan
                'calculated_gross' => $gross,
                'calculated_deduction' => $deduction,
                'calculated_net' => $net,
            ];
        });

        return Inertia::render('Products/Report', [
            'data' => $processedData,
            'filters' => [
                'period' => $timePeriod,
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'type' => $productType,
            ],
            'totals' => [
                'qty' => $totalQtyOut,
                'qty_sampai' => $totalQtySampai,
                'gross' => $totalGross,
                'deductions' => $totalDeductions,
                'amount' => $totalNet,
                'keping' => $totalKeping,
            ]
        ]);
    }

    // ... (Fungsi show_buy, gka, tsa, agro, allof, destroy, exportExcel TETAP SAMA) ...
    public function show_buy(Product $product)
    {
        return inertia('Products/show_buy', [
            'product' => $product,
        ]);
    }

    public function gka(Request $request)
    {
        $perPage = 20;
        $searchTerm = $request->input('search');

        // [PERBAIKAN 1] Default filter di Backend juga 'all-time'
        $timePeriod = $request->input('time_period', 'all-time');

        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);
        $productType = $request->input('product_type', 'all');

        // ... (Bagian Query Filter Tabel biarkan sama) ...

        $baseQuery = Product::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });

        $dateFilterQuery = clone $baseQuery;

        if ($timePeriod === 'specific-month') {
            $dateFilterQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
        } elseif ($timePeriod !== 'all-time') {
            switch ($timePeriod) {
                case 'today': $dateFilterQuery->whereDate('date', Carbon::today()); break;
                case 'this-week': $dateFilterQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month': $dateFilterQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month':
                    $lastMonth = Carbon::now()->subMonth();
                    $dateFilterQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year);
                    break;
                case 'this-year': $dateFilterQuery->whereYear('date', Carbon::now()->year); break;
            }
        }

        // --- [PERBAIKAN 2] UPDATE LOGIKA GRAFIK ---
        // Pastikan 'qty_sampai' digunakan untuk Penjualan
        $chartQueryYear = $request->input('year', Carbon::now()->year);

        $monthlyStats = Product::selectRaw('
            MONTH(date) as month,
            -- Produksi (Masuk Gudang GKA): qty_out
            SUM(CASE WHEN status = "gka" AND product = "karet" THEN qty_out ELSE 0 END) as produksi,

            -- Penjualan (Keluar ke Buyer): qty_sampai (Berat Terima Buyer)
            -- Menggunakan COALESCE agar jika qty_sampai kosong, dianggap 0
            SUM(CASE WHEN status = "buyer" AND product = "karet" THEN COALESCE(qty_sampai, 0) ELSE 0 END) as penjualan,

            SUM(CASE WHEN status = "buyer" AND product = "karet" THEN amount_out ELSE 0 END) as pendapatan
        ')
        ->whereYear('date', $chartQueryYear)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Mapping Data Chart (Tetap sama)
        $chartData = collect(range(1, 12))->map(function ($m) use ($monthlyStats) {
            $stat = $monthlyStats->firstWhere('month', $m);
            return [
                'name' => Carbon::create()->month($m)->locale('id')->isoFormat('MMM'),
                'Produksi' => $stat ? (float)$stat->produksi : 0,
                'Penjualan' => $stat ? (float)$stat->penjualan : 0,
                'Pendapatan' => $stat ? (float)$stat->pendapatan : 0,
            ];
        });

        // ... (Sisa kode seperti query $products, stats card dll biarkan seperti file Anda sebelumnya) ...

        $products = $dateFilterQuery->clone()->where('product', 'karet')->where('qty_out', '>', 0)->where('status', 'gka')->orderBy('created_at', 'DESC')->paginate($perPage);
        $product2 = $dateFilterQuery->clone()->where('product', 'karet')->where('qty_out', '>', 0)->where('status', 'buyer')->orderBy('created_at', 'DESC')->paginate($perPage);

        $product2->getCollection()->transform(function ($item) {
            $item->susut_value = $item->qty_out - ($item->qty_sampai ?? 0);
            return $item;
        });

        $products3 = $dateFilterQuery->clone()->where('product', 'pupuk')->where('qty_out', '>', 0)->where('status', 'gka')->orderBy('created_at', 'DESC')->paginate($perPage);
        $product4 = $dateFilterQuery->clone()->where('product', 'pupuk')->where('qty_out', '>', 0)->where('status', 'buyer')->orderBy('created_at', 'DESC')->paginate($perPage);
        $product4->getCollection()->transform(function ($item) { $item->susut_value = $item->qty_out - ($item->qty_sampai ?? 0); return $item; });

        $products5 = $dateFilterQuery->clone()->where('product', 'kelapa')->where('qty_out', '>', 0)->where('status', 'gka')->orderBy('created_at', 'DESC')->paginate($perPage);
        $product6 = $dateFilterQuery->clone()->where('product', 'kelapa')->where('qty_out', '>', 0)->where('status', 'buyer')->orderBy('created_at', 'DESC')->paginate($perPage);
        $product6->getCollection()->transform(function ($item) { $item->susut_value = $item->qty_out - ($item->qty_sampai ?? 0); return $item; });

        // Logic Statistik Cards
        $statsQuery = Product::query()
             ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });

        if ($timePeriod === 'specific-month') {
            $statsQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
        } elseif ($timePeriod !== 'all-time') {
             switch ($timePeriod) {
                case 'today': $statsQuery->whereDate('date', Carbon::today()); break;
                case 'this-week': $statsQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month': $statsQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month': $lastMonth = Carbon::now()->subMonth(); $statsQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                case 'this-year': $statsQuery->whereYear('date', Carbon::now()->year); break;
            }
        }

        $tm_slin = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->SUM('amount_out');
        $tm_slou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'karet')->SUM('amount_out');
        $tm_sin = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->SUM('qty_out');
        $tm_sou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'karet')->SUM('qty_out');
        $tm_sampai = $statsQuery->clone()->where('status', 'buyer')->where('product', 'karet')->sum('qty_sampai');

        $ppk_slin = $statsQuery->clone()->where('status', 'gka')->where('product', 'pupuk')->SUM('amount_out');
        $ppk_slou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'pupuk')->SUM('amount_out');
        $ppk_sin = $statsQuery->clone()->where('status', 'gka')->where('product', 'pupuk')->SUM('qty_out');
        $ppk_sou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'pupuk')->SUM('qty_out');

        $klp_slin = $statsQuery->clone()->where('status', 'gka')->where('product', 'kelapa')->SUM('amount_out');
        $klp_slou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'kelapa')->SUM('amount_out');
        $klp_sin = $statsQuery->clone()->where('status', 'gka')->where('product', 'kelapa')->SUM('qty_out');
        $klp_sou = $statsQuery->clone()->where('status', 'buyer')->where('product', 'kelapa')->SUM('qty_out');

        $dataSusut = $statsQuery->clone()->where('status', 'buyer')->SUM(DB::raw('qty_out - COALESCE(qty_sampai, 0)'));
        $s_ready = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->SUM('qty_out') - $statsQuery->clone()->where('status', 'buyer')->where('product', 'karet')->SUM('qty_out');
        $p_ready = $statsQuery->clone()->where('status', 'gka')->where('product', 'pupuk')->SUM('qty_out') - $statsQuery->clone()->where('status', 'buyer')->where('product', 'pupuk')->SUM('qty_out');
        $klp_ready = $statsQuery->clone()->where('status', 'gka')->where('product', 'kelapa')->SUM('qty_out') - $statsQuery->clone()->where('status', 'buyer')->where('product', 'kelapa')->SUM('qty_out');

        $keping_in = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->SUM('keping_out');
        $keping_out = $statsQuery->clone()->where('status', 'buyer')->where('product', 'karet')->SUM('keping_out');

        return Inertia::render("Products/gka", [
            "products" => $products, "products2" => $product2,
            "products3" => $products3, "products4" => $product4,
            "products5" => $products5, "products6" => $product6,
            "filter" => $request->only(['search', 'time_period', 'month', 'year', 'product_type']),
            "currentMonth" => (int)$selectedMonth, "currentYear" => (int)$selectedYear,
            "keping_in" => $keping_in, "keping_out" => $keping_out,
            "tm_slin" => $tm_slin, "tm_slou" => $tm_slou,
            "tm_sin" => $tm_sin, "tm_sou" => $tm_sou, "tm_sampai" => $tm_sampai,
            "s_ready" => $s_ready, "p_ready" => $p_ready, "klp_ready" => $klp_ready,
            "ppk_slin" => $ppk_slin, "ppk_slou" => $ppk_slou, "ppk_sin" => $ppk_sin, "ppk_sou" => $ppk_sou,
            "klp_slin" => $klp_slin, "klp_slou" => $klp_slou, "klp_sin" => $klp_sin, "klp_sou" => $klp_sou,
            "dataSusut" => $dataSusut,
            "chartData" => $chartData,
        ]);
    }

    public function tsa(Request $request)
    {
        // ... (Biarkan fungsi tsa sama) ...
        $perPage = 10;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);

        $baseQuery = Product::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });
            if ($timePeriod === 'specific-month') {
                $baseQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
            } elseif ($timePeriod !== 'all-time') {
                switch ($timePeriod) {
                    case 'today': $baseQuery->whereDate('date', Carbon::today()); break;
                    case 'this-week': $baseQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                    case 'this-month': $baseQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                    case 'last-month': $lastMonth = Carbon::now()->subMonth(); $baseQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                    case 'this-year': $baseQuery->whereYear('date', Carbon::now()->year); break;
                }
            }

        $products = $baseQuery->clone()->where('product', 'karet')->where('qty_kg', '>', 0)->where('status', 'tsa')->orderBy('date', 'DESC')->paginate($perPage, ['*'], 'page')->withQueryString();
        $product2 = $baseQuery->clone()->where('product', 'karet')->where('qty_out', '>', 0)->where('status', 'gka')->orderBy('date', 'DESC')->paginate($perPage, ['*'], 'page2')->withQueryString();

        $statsQuery = Product::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });
            if ($timePeriod === 'specific-month') {
                $statsQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
            } elseif ($timePeriod !== 'all-time') {
                switch ($timePeriod) {
                    case 'today': $statsQuery->whereDate('date', Carbon::today()); break;
                    case 'this-week': $statsQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                    case 'this-month': $statsQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                    case 'last-month': $lastMonth = Carbon::now()->subMonth(); $statsQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                    case 'this-year': $statsQuery->whereYear('date', Carbon::now()->year); break;
                }
            }

        $tm_slin = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'tsa')->where('product', 'karet')->sum('amount');
        $tm_slou = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'gka')->where('product', 'karet')->sum('amount_out');
        $tm_sin = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');
        $tm_sou = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'gka')->where('product', 'karet')->sum('qty_out');

        $ts_slin = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'tsa')->where('product', 'karet')->sum('amount');
        $ts_slou = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'gka')->where('product', 'karet')->sum('amount_out');
        $ts_sin = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');
        $ts_sou = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'gka')->where('product', 'karet')->sum('qty_out');

        $karet = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');
        $karet2 = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');

        $keping = $statsQuery->clone()->where('status', 'tsa')->where('product', 'karet')->sum('keping');
        $keping2 = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->sum('keping_out');
        $keping_sbyr = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'tsa')->where('product', 'karet')->sum('keping');
        $keping_sbyr2 = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'gka')->where('product', 'karet')->sum('keping_out');
        $keping_tmd = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'tsa')->where('product', 'karet')->sum('keping');
        $keping_tmd2 = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'gka')->where('product', 'karet')->sum('keping_out');

        $jual = $statsQuery->clone()->where('nm_supplier', 'Sebayar')->where('status', 'gka')->where('product', 'karet')->sum('qty_out');
        $jual2 = $statsQuery->clone()->where('nm_supplier', 'Temadu')->where('status', 'gka')->where('product', 'karet')->sum('qty_out');

        $saldoin = $statsQuery->clone()->where('status', 'tsa')->where('product', 'karet')->sum('amount');
        $saldoout = $statsQuery->clone()->where('status', 'gka')->where('product', 'karet')->sum('amount_out');

        $susut_awal = Product::where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');
        $susut_akhir = Product::where('status', 'gka')->where('product', 'karet')->sum('qty_out');

        $st_awal = Product::where('status', 'gka')->where('product', 'karet')->sum('qty_out');
        $st_akhir = Product::where('status', 'gka')->where('product', 'karet')->sum('qty_sampai');

        return Inertia::render("Products/tsa", [
            "products" => $products, "products2" => $product2,
            "filter" => $request->only(['search', 'time_period', 'month', 'year']),
            "currentMonth" => (int)$selectedMonth, "currentYear" => (int)$selectedYear,
            "hsl_karet" => $karet + $karet2, "hsl_jual" => $jual + $jual2,
            "keping_in" => $keping, "keping_out" => $keping2,
            "keping_sbyr" => $keping_sbyr, "keping_sbyr2" => $keping_sbyr2,
            "keping_tmd" => $keping_tmd, "keping_tmd2" => $keping_tmd2,
            "saldoin" => $saldoin, "saldoout" => $saldoout,
            "tm_slin" => $tm_slin, "tm_slou" => $tm_slou, "tm_sin" => $tm_sin, "tm_sou" => $tm_sou,
            "ts_slin" => $ts_slin, "ts_slou" => $ts_slou, "ts_sin" => $ts_sin, "ts_sou" => $ts_sou,
            "s_ready" => $st_awal - $st_akhir,
        ]);
    }

    public function agro(Request $request)
    {
        // ... (Biarkan fungsi agro sama) ...
        $perPage = 5;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);

        $baseQuery = Product::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });
            if ($timePeriod === 'specific-month') {
                $baseQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
            } elseif ($timePeriod !== 'all-time') {
                switch ($timePeriod) {
                    case 'today': $baseQuery->whereDate('date', Carbon::today()); break;
                    case 'this-week': $baseQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                    case 'this-month': $baseQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                    case 'last-month': $lastMonth = Carbon::now()->subMonth(); $baseQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                    case 'this-year': $baseQuery->whereYear('date', Carbon::now()->year); break;
                }
            }

        $products = $baseQuery->clone()->where('product', 'Pupuk')->where('qty_kg', '>', 0)->where('status', 'agro')->orderBy('created_at', 'DESC')->paginate($perPage, ['*'], 'page')->withQueryString();
        $product2 = $baseQuery->clone()->where('product', 'Pupuk')->where('qty_kg', '>', 0)->where('status', 'gka')->orderBy('created_at', 'DESC')->paginate($perPage, ['*'], 'page2')->withQueryString();

        $statsQuery = Product::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nm_supplier', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%");
                });
            });
            if ($timePeriod === 'specific-month') {
                $statsQuery->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
            } elseif ($timePeriod !== 'all-time') {
                switch ($timePeriod) {
                    case 'today': $statsQuery->whereDate('date', Carbon::today()); break;
                    case 'this-week': $statsQuery->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                    case 'this-month': $statsQuery->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                    case 'last-month': $lastMonth = Carbon::now()->subMonth(); $statsQuery->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                    case 'this-year': $statsQuery->whereYear('date', Carbon::now()->year); break;
                }
            }

        $ppk_in = $statsQuery->clone()->where('status', 'agro')->where('product', 'pupuk')->sum('qty_kg');
        $ppk_out = $statsQuery->clone()->where('status', 'agro')->where('product', 'pupuk')->sum('qty_out');
        $saldoin = $statsQuery->clone()->where('status', 'agro')->where('product', 'pupuk')->sum('amount');
        $saldoout = $statsQuery->clone()->where('status', 'agro')->where('product', 'pupuk')->sum('amount_out');

        $tm_slin = $statsQuery->clone()->where('nm_supplier', 'agro')->where('status', 'agro')->where('product', 'pupuk')->sum('amount');
        $tm_slou = $statsQuery->clone()->where('nm_supplier', 'agro')->where('status', 'gka')->where('product', 'pupuk')->sum('amount');
        $tm_sin = $statsQuery->clone()->where('nm_supplier', 'agro')->where('status', 'agro')->where('product', 'pupuk')->sum('qty_kg');
        $tm_sou = $statsQuery->clone()->where('nm_supplier', 'agro')->where('status', 'gka')->where('product', 'pupuk')->sum('qty_kg');

        return Inertia::render("Products/agro", [
            "products" => $products, "products2" => $product2,
            "filter" => $request->only(['search', 'time_period', 'month', 'year']),
            "currentMonth" => (int)$selectedMonth, "currentYear" => (int)$selectedYear,
            "hsl_karet" => $ppk_in - $ppk_out, "saldoin" => $saldoin, "saldoout" => $saldoout,
            "tm_slin" => $tm_slin, "tm_slou" => $tm_slou, "tm_sin" => $tm_sin, "tm_sou" => $tm_sou,
        ]);
    }

    public function allof(Request $request)
    {
        // ... (Biarkan fungsi allof sama) ...
        $perPage = 10;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $selectedMonth = $request->input('month', Carbon::now()->month);
        $selectedYear = $request->input('year', Carbon::now()->year);

        $query = Product::query()
            ->when($searchTerm, function ($q, $search) {
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('product', 'like', "%{$search}%")
                             ->orWhere('no_invoice', 'like', "%{$search}%")
                             ->orWhere('nm_supplier', 'like', "%{$search}%")
                             ->orWhere('j_brg', 'like', "%{$search}%")
                             ->orWhere('status', 'like', "%{$search}%")
                             ->orWhere('date', 'like', "%{$search}%");
                });
            });
            if ($timePeriod === 'specific-month') {
                $query->whereMonth('date', $selectedMonth)->whereYear('date', $selectedYear);
            } elseif ($timePeriod !== 'all-time') {
                switch ($timePeriod) {
                    case 'today': $query->whereDate('date', Carbon::today()); break;
                    case 'this-week': $query->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                    case 'this-month': $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                    case 'last-month': $lastMonth = Carbon::now()->subMonth(); $query->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year); break;
                    case 'this-year': $query->whereYear('date', Carbon::now()->year); break;
                }
            }

        $filteredQueryForStats = clone $query;
        $products = $query->orderBy('created_at', 'DESC')->paginate($perPage)->appends($request->input());

        $karet_in = $filteredQueryForStats->clone()->where('status', 'tsa')->where('product', 'karet')->sum('qty_kg');
        $karet_out = $filteredQueryForStats->clone()->where('status', 'gka')->where('product', 'karet')->sum('qty_out');
        $saldoin = $filteredQueryForStats->clone()->where('product', 'karet')->sum('amount');
        $saldoout = $filteredQueryForStats->clone()->where('product', 'karet')->sum('amount_out');

        $klp_in = $filteredQueryForStats->clone()->where('product', 'kelapa')->sum('qty_kg');
        $klp_out = $filteredQueryForStats->clone()->where('product', 'kelapa')->sum('qty_out');
        $saldoinklp = $filteredQueryForStats->clone()->where('product', 'kelapa')->sum('amount');
        $saldooutklp = $filteredQueryForStats->clone()->where('product', 'kelapa')->sum('amount_out');

        $ppk_in = $filteredQueryForStats->clone()->where('product', 'pupuk')->sum('qty_kg');
        $ppk_out = $filteredQueryForStats->clone()->where('product', 'pupuk')->sum('qty_out');
        $saldoinppk = $filteredQueryForStats->clone()->where('product', 'pupuk')->sum('amount');
        $saldooutppk = $filteredQueryForStats->clone()->where('product', 'pupuk')->sum('amount_out');

        return Inertia::render("Products/allof", [
            "products" => $products,
            "filter" => $request->only(['search', 'time_period', 'month', 'year']),
            "currentMonth" => (int)$selectedMonth, "currentYear" => (int)$selectedYear,
            "hsl_karet" => $karet_in - $karet_out, "saldoin" => $saldoin, "saldoout" => $saldoout,
            "hsl_kelapa" => $klp_in - $klp_out, "saldoinklp" => $saldoinklp, "saldooutklp" => $saldooutklp,
            "hsl_pupuk" => $ppk_in - $ppk_out, "saldoinppk" => $saldoinppk, "saldooutppk" => $saldooutppk,
        ]);
    }

    public function destroy(Product $product){
        $product->delete();
        return redirect()->route('products.index')->with('message', 'Product deleted Successfully');
    }
}
