<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incised;
use App\Models\Incisor;
use App\Models\MasterProduct;
use App\Models\Kasbon; // [BARU]
use App\Models\KasbonPayment;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class IncisedController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $specificMonth = $request->input('month');
        $specificYear = $request->input('year');

        if ($perPage === 'all') {
            $perPage = 999999;
        } else {
            $perPage = intval($perPage);
        }

        // --- Logic Filter Waktu (Re-usable) ---
        $applyTimeFilter = function ($query, $period, $month, $year) {
            switch ($period) {
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
                case 'specific-month':
                    if ($month && $year) $query->whereMonth('date', $month)->whereYear('date', $year); break;
            }
        };

        // --- Logic Pencarian (Re-usable) ---
        $applySearch = function ($query, $search) {
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('product', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('lok_kebun', 'like', "%{$search}%")
                      ->orWhere('j_brg', 'like', "%{$search}%")
                      ->orWhereHas('incisor', function ($subq) use ($search) {
                          $subq->where('name', 'like', "%{$search}%");
                      });
                });
            }
        };

        // 1. Query Utama (Tabel)
        $incisedsQuery = Incised::query()->with('incisor');
        $applySearch($incisedsQuery, $searchTerm);
        $applyTimeFilter($incisedsQuery, $timePeriod, $specificMonth, $specificYear);

        // 2. Query Statistik (Agar Sinkron dengan Pencarian)
        $baseStatQuery = Incised::query();
        $applySearch($baseStatQuery, $searchTerm); // Terapkan pencarian juga di statistik
        $applyTimeFilter($baseStatQuery, $timePeriod, $specificMonth, $specificYear);

        $totalKebunA = (clone $baseStatQuery)->where('lok_kebun', 'Temadu')->sum('qty_kg');
        $totalKebunB = (clone $baseStatQuery)->where('lok_kebun', 'Sebayar')->sum('qty_kg');
        $totalPendapatan = (clone $baseStatQuery)->sum('amount');

        // 3. Query Top Penoreh (Agar Sinkron dengan Pencarian)
        $mostProductiveIncisorQuery = Incised::query()
            ->select('incisors.name', DB::raw('SUM(inciseds.qty_kg) as total_qty_kg'))
            ->join('incisors', 'inciseds.no_invoice', '=', 'incisors.no_invoice');

        $applySearch($mostProductiveIncisorQuery, $searchTerm); // Terapkan pencarian
        $applyTimeFilter($mostProductiveIncisorQuery, $timePeriod, $specificMonth, $specificYear);

        $mostProductiveIncisor = $mostProductiveIncisorQuery
            ->groupBy('incisors.name')
            ->orderByDesc('total_qty_kg')
            ->first();

        // Eksekusi Query Tabel
        $inciseds = $incisedsQuery
            ->orderBy('date', 'DESC')
            ->paginate($perPage)
            ->through(function ($incised) {
                return [
                    'id' => $incised->id,
                    'product' => $incised->product,
                    'date' => $incised->date,
                    'no_invoice' => $incised->no_invoice,
                    'lok_kebun' => $incised->lok_kebun,
                    'j_brg' => $incised->j_brg,
                    'desk' => $incised->desk,
                    'qty_kg' => $incised->qty_kg,
                    'price_qty' => $incised->price_qty,
                    'amount' => $incised->amount,
                    'keping' => $incised->keping,
                    'kualitas' => $incised->kualitas,
                    'incisor_name' => $incised->incisor ? $incised->incisor->name : null,
                ];
            })
            ->withQueryString();

        return Inertia::render("Inciseds/index", [
            "inciseds" => $inciseds,
            "filter" => $request->only(['search', 'time_period', 'month', 'year', 'per_page']),
            'totalKebunA' => (float)$totalKebunA,
            'totalKebunB' => (float)$totalKebunB,
            'totalPendapatan' => (float)$totalPendapatan,
            'mostProductiveIncisor' => [
                'name' => $mostProductiveIncisor ? $mostProductiveIncisor->name : 'N/A',
                'total_qty_kg' => $mostProductiveIncisor ? (float)$mostProductiveIncisor->total_qty_kg : 0,
            ],
        ]);
    }

    // Fungsi Cetak Laporan Rekapitulasi
    public function printReport(Request $request)
    {
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $specificMonth = $request->input('month');
        $specificYear = $request->input('year');

        // Copy Logic Filter agar konsisten
        $applyTimeFilter = function ($query, $period, $month, $year) {
            switch ($period) {
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
                case 'specific-month':
                    if ($month && $year) $query->whereMonth('date', $month)->whereYear('date', $year); break;
            }
        };

        $query = Incised::query()->with('incisor');

        // Apply Search (Sama persis dengan index)
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('product', 'like', "%{$searchTerm}%")
                  ->orWhere('no_invoice', 'like', "%{$searchTerm}%")
                  ->orWhere('lok_kebun', 'like', "%{$searchTerm}%")
                  ->orWhere('j_brg', 'like', "%{$searchTerm}%")
                  ->orWhereHas('incisor', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $applyTimeFilter($query, $timePeriod, $specificMonth, $specificYear);

        $inciseds = $query->orderBy('date', 'ASC')->get()->map(function ($item) {
            return [
                'date' => $item->date,
                'no_invoice' => $item->no_invoice,
                'incisor_name' => $item->incisor ? $item->incisor->name : 'N/A',
                'lok_kebun' => $item->lok_kebun,
                'product' => $item->product,
                'j_brg' => $item->j_brg,
                'qty_kg' => $item->qty_kg,
                'price_qty' => $item->price_qty,
                'amount' => $item->amount,
                'keping' => $item->keping
            ];
        });

        $totalQty = $inciseds->sum('qty_kg');
        $totalAmount = $inciseds->sum('amount');

        return Inertia::render('Inciseds/PrintReport', [
            'inciseds' => $inciseds,
            'totals' => [
                'qty' => $totalQty,
                'amount' => $totalAmount
            ],
            'filter' => [
                'time_period' => $timePeriod,
                'month' => $specificMonth,
                'year' => $specificYear
            ]
        ]);
    }

    public function create()
    {
        $noInvoicesWithNames = Incisor::where('is_active', true)
            ->select('no_invoice', 'name')
            ->orderBy('name')
            ->get();

        // [TAMBAHAN] Ambil data Master Product
        $masterProducts = MasterProduct::select('id', 'name', 'code')->get();

        return Inertia::render("Inciseds/create", [
            'noInvoicesWithNames' => $noInvoicesWithNames,
            'masterProducts' => $masterProducts, // Kirim ke frontend
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product' => 'required|string|max:250',
            'date' => 'required|date',
            'no_invoice' => 'required|string|max:250',
            'lok_kebun' => 'required|string|max:250',
            'j_brg' => 'required|string|max:250',
            'desk' => 'nullable|string',
            'qty_kg' => 'required|numeric',
            'price_qty' => 'required|numeric',
            'amount' => 'required|numeric',
            'keping' => 'required|numeric',
            'kualitas' => 'required|string|max:250',
        ]);

        Incised::create($request->all());
        return redirect()->route('inciseds.index')->with('message', 'Data Berhasil Ditambahkan');
    }

    public function edit($id)
    {
        $incised = Incised::with('incisor')->findOrFail($id);

        $noInvoicesWithNames = Incisor::where('is_active', true)
            ->select('no_invoice', 'name')
            ->orderBy('name')
            ->get();

        // [TAMBAHAN] Ambil data Master Product
        $masterProducts = MasterProduct::select('id', 'name', 'code')->get();

        return Inertia::render('Inciseds/edit', [
            'incised' => $incised,
            'noInvoicesWithNames' => $noInvoicesWithNames,
            'masterProducts' => $masterProducts, // Kirim ke frontend
        ]);
    }

    public function update(Request $request, Incised $incised)
    {
        $request->validate([
            'product' => 'required|string|max:250',
            'date' => 'required|date',
            'no_invoice' => 'required|string|max:250',
            'lok_kebun' => 'required|string|max:250',
            'j_brg' => 'required|string|max:250',
            'desk' => 'nullable|string',
            'qty_kg' => 'required|numeric',
            'price_qty' => 'required|numeric',
            'amount' => 'required|numeric',
            'keping' => 'required|numeric',
            'kualitas' => 'required|string|max:250',
        ]);

        $incised->update($request->all());
        return redirect()->route('inciseds.index')->with('message', 'Data Berhasil Diupdate');
    }

    public function settle($id)
    {
        DB::beginTransaction();
        try {
            $incised = Incised::with('incisor')->findOrFail($id);

            if ($incised->payment_status === 'paid') {
                return redirect()->back()->with('error', 'Transaksi ini sudah dibayarkan sebelumnya.');
            }

            // 1. Identifikasi Penoreh & Pendapatan
            $incisor = $incised->incisor;
            $pendapatan = $incised->amount; // Total uang hasil toreh

            if (!$incisor) {
                // Jika data lama tidak ada relasi incisor, update status saja tanpa potong kasbon
                $incised->update(['payment_status' => 'paid', 'paid_at' => now()]);
                DB::commit();
                return redirect()->back()->with('message', 'Pembayaran berhasil (Tanpa cek kasbon karena data penoreh tidak valid).');
            }

            // 2. Cek Hutang Kasbon (Hanya yang belum lunas)
            // Mengambil semua kasbon milik penoreh ini yang statusnya approved dan belum lunas
            $activeKasbons = Kasbon::where('kasbonable_type', 'App\Models\Incisor')
                ->where('kasbonable_id', $incisor->id)
                ->where('status', 'Approved') // Hanya kasbon yang disetujui
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->orderBy('transaction_date', 'asc') // Bayar hutang terlama dulu (FIFO)
                ->get();

            $sisaUang = $pendapatan;
            $totalPotongan = 0;

            // 3. Loop Kasbon untuk Pemotongan
            foreach ($activeKasbons as $kasbon) {
                if ($sisaUang <= 0) break; // Uang habis, stop bayar hutang

                // Hitung sisa hutang per nota kasbon
                $sudahDibayar = $kasbon->payments()->sum('amount');
                $sisaHutangIni = $kasbon->kasbon - $sudahDibayar;

                if ($sisaHutangIni <= 0) {
                    $kasbon->update(['payment_status' => 'paid']);
                    continue;
                }

                // Tentukan berapa yang akan dibayar untuk nota ini
                // Bayar full hutang ini ATAU habiskan sisa uang gaji
                $bayar = min($sisaUang, $sisaHutangIni);

                // Buat Record Pembayaran Kasbon
                KasbonPayment::create([
                    'kasbon_id' => $kasbon->id,
                    'amount' => $bayar,
                    'payment_date' => now(),
                    'notes' => "Potong otomatis dari Hasil Toreh Tgl " . Carbon::parse($incised->date)->format('d/m/Y') . " (Inv: $incised->no_invoice)"
                ]);

                // Update Status Kasbon Induk
                $newTotalPaid = $sudahDibayar + $bayar;
                if ($newTotalPaid >= $kasbon->kasbon) {
                    $kasbon->update(['payment_status' => 'paid', 'paid_at' => now()]);
                } else {
                    $kasbon->update(['payment_status' => 'partial']);
                }

                // Kurangi sisa uang di tangan
                $sisaUang -= $bayar;
                $totalPotongan += $bayar;
            }

            // 4. Update Status Transaksi Toreh jadi PAID
            $incised->update([
                'payment_status' => 'paid',
                'paid_at' => now()
            ]);

            DB::commit();

            $msg = "Pembayaran Berhasil. Pendapatan: Rp " . number_format($pendapatan,0,',','.');
            if ($totalPotongan > 0) {
                $msg .= ". Dipotong Kasbon: Rp " . number_format($totalPotongan,0,',','.') . ". Sisa Diterima: Rp " . number_format($sisaUang,0,',','.');
            } else {
                $msg .= ". Tidak ada potongan kasbon.";
            }

            return redirect()->back()->with('message', $msg);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memproses pembayaran: ' . $e->getMessage());
        }
    }

    public function show(Incised $incised)
    {
        $incised->load('incisor');
        $data = $incised->toArray();
        $data['incisor_name'] = $incised->incisor ? $incised->incisor->name : null;

        return Inertia::render('Inciseds/show', [
            'incised' => $data,
        ]);
    }

    public function print($id)
    {
        $incised = Incised::with('incisor')->findOrFail($id);
        return Inertia::render('Inciseds/Print', [
            'incised' => $incised,
        ]);
    }

    public function destroy(Incised $incised)
    {
        $incised->delete();
        return redirect()->route('inciseds.index')->with('message', 'Data Berhasil Dihapus');
    }
}
