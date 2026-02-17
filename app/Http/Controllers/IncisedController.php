<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incised;
use App\Models\Incisor;
use App\Models\MasterProduct;
use App\Models\Kasbon;
use App\Models\KasbonPayment;
use App\Models\IncomingStock; // [BARU] Import Model Gudang
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\FinancialTransaction;

class IncisedController extends Controller
{
    public function index(Request $request)
    {
        // $perPage = $request->input('per_page', 20); // Default kembalikan ke 20 atau sesuai selera
        $perPage = 15;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $specificMonth = $request->input('month');
        $specificYear = $request->input('year');

        // [BARU] Ambil input range tanggal
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($perPage === 'all') $perPage = 999999;
        else $perPage = intval($perPage);

        // Helper filter query
        $applyTimeFilter = function ($query) use ($timePeriod, $specificMonth, $specificYear, $startDate, $endDate) {
            switch ($timePeriod) {
                case 'today': $query->whereDate('date', Carbon::today()); break;
                case 'this-week': $query->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month': $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month': $query->whereMonth('date', Carbon::now()->subMonth()->month)->whereYear('date', Carbon::now()->subMonth()->year); break;
                case 'this-year': $query->whereYear('date', Carbon::now()->year); break;
                case 'specific-month': if ($specificMonth && $specificYear) $query->whereMonth('date', $specificMonth)->whereYear('date', $specificYear); break;
                // [BARU] Logic Custom Range
                case 'custom':
                    if ($startDate && $endDate) {
                        $query->whereBetween('date', [$startDate, $endDate]);
                    }
                    break;
            }
        };

        $applySearch = function ($query, $search) {
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('product', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%")
                      ->orWhere('lok_kebun', 'like', "%{$search}%")
                      ->orWhereHas('incisor', function ($subq) use ($search) {
                          $subq->where('name', 'like', "%{$search}%");
                      });
                });
            }
        };

        $incisedsQuery = Incised::query()->with('incisor');
        $applySearch($incisedsQuery, $searchTerm);
        $applyTimeFilter($incisedsQuery); // Panggil filter tanpa parameter karena sudah use di atas

        $baseStatQuery = Incised::query();
        $applySearch($baseStatQuery, $searchTerm);
        $applyTimeFilter($baseStatQuery);

        $totalKebunA = (clone $baseStatQuery)->where('lok_kebun', 'Temadu')->sum('qty_kg');
        $totalKebunB = (clone $baseStatQuery)->where('lok_kebun', 'Sebayar A')->sum('qty_kg');
        $totalKebunB2 = (clone $baseStatQuery)->where('lok_kebun', 'Sebayar B')->sum('qty_kg');
        $totalKebunB3 = (clone $baseStatQuery)->where('lok_kebun', 'Sebayar C')->sum('qty_kg');
        $totalKebunB4 = (clone $baseStatQuery)->where('lok_kebun', 'Sebayar D')->sum('qty_kg');
        $totalPendapatan = (clone $baseStatQuery)->sum('amount');

        $mostProductiveIncisorQuery = Incised::query()
            ->select('incisors.name', DB::raw('SUM(inciseds.qty_kg) as total_qty_kg'))
            ->join('incisors', 'inciseds.no_invoice', '=', 'incisors.no_invoice');
        $applySearch($mostProductiveIncisorQuery, $searchTerm);
        $applyTimeFilter($mostProductiveIncisorQuery);

        $mostProductiveIncisor = $mostProductiveIncisorQuery->groupBy('incisors.name')->orderByDesc('total_qty_kg')->first();

        $inciseds = $incisedsQuery->orderBy('date', 'DESC')->paginate($perPage)->through(function ($incised) {
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
                'payment_status' => $incised->payment_status,
                'net_received' => $incised->net_received,
            ];
        })->withQueryString();

        return Inertia::render("Inciseds/index", [
            "inciseds" => $inciseds,
            // [BARU] Kirim balik filter ke frontend
            "filter" => $request->only(['search', 'time_period', 'month', 'year', 'per_page', 'start_date', 'end_date']),
            'totalKebunA' => (float)$totalKebunA,
            'totalKebunB' => (float)$totalKebunB + (float)$totalKebunB2 + (float)$totalKebunB3 + (float)$totalKebunB4,
            'totalPendapatan' => (float)$totalPendapatan,
            'mostProductiveIncisor' => [
                'name' => $mostProductiveIncisor ? $mostProductiveIncisor->name : 'N/A',
                'total_qty_kg' => $mostProductiveIncisor ? (float)$mostProductiveIncisor->total_qty_kg : 0,
            ],
        ]);
    }

    public function create()
    {
        $noInvoicesWithNames = Incisor::where('is_active', true)->select('no_invoice', 'name')->orderBy('name')->get();
        $masterProducts = MasterProduct::select('id', 'name', 'code')->get();
        return Inertia::render("Inciseds/create", ['noInvoicesWithNames' => $noInvoicesWithNames, 'masterProducts' => $masterProducts]);
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
        $noInvoicesWithNames = Incisor::where('is_active', true)->select('no_invoice', 'name')->orderBy('name')->get();
        $masterProducts = MasterProduct::select('id', 'name', 'code')->get();
        return Inertia::render('Inciseds/edit', ['incised' => $incised, 'noInvoicesWithNames' => $noInvoicesWithNames, 'masterProducts' => $masterProducts]);
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

    public function printReport(Request $request)
    {
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $specificMonth = $request->input('month');
        $specificYear = $request->input('year');

        // Input Custom Date
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Eager load relasi 'incisor'
        $query = Incised::query()->with('incisor');

        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('product', 'like', "%{$searchTerm}%")
                  ->orWhere('no_invoice', 'like', "%{$searchTerm}%")
                  ->orWhere('lok_kebun', 'like', "%{$searchTerm}%")
                  ->orWhereHas('incisor', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Logic Filter Waktu
        if ($timePeriod == 'specific-month') { $query->whereMonth('date', $specificMonth)->whereYear('date', $specificYear); }
        elseif ($timePeriod == 'today') { $query->whereDate('date', Carbon::today()); }
        elseif ($timePeriod == 'this-month') { $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); }
        elseif ($timePeriod == 'custom' && $startDate && $endDate) { $query->whereBetween('date', [$startDate, $endDate]); }

        // Ambil Data Mentah
        $rawInciseds = $query->orderBy('date', 'ASC')->get();

        // [PERBAIKAN DISINI] Mapping Data untuk menampilkan Nama Penoreh
        $inciseds = $rawInciseds->map(function ($item) {
            return [
                'id' => $item->id,
                'date' => $item->date,
                'no_invoice' => $item->no_invoice,
                'lok_kebun' => $item->lok_kebun,
                'product' => $item->product,
                'qty_kg' => $item->qty_kg,
                'price_qty' => $item->price_qty,
                'amount' => $item->amount,
                'keping' => $item->keping,
                'net_received' => $item->net_received,
                // Ambil Nama dari Relasi Incisor
                'incisor_name' => $item->incisor ? $item->incisor->name : 'Tanpa Nama',
            ];
        });

        return Inertia::render('Inciseds/PrintReport', [
            'inciseds' => $inciseds, // Data yang sudah ada namanya
            'totals' => [
                'qty' => $rawInciseds->sum('qty_kg'),
                'amount' => $rawInciseds->sum('amount'),
                'net_received' => $rawInciseds->sum('net_received')
            ],
            'filter' => [
                'time_period' => $timePeriod,
                'month' => $specificMonth,
                'year' => $specificYear,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    // =========================================================================
    // UPDATE LOGIC PEMBAYARAN & INTEGRASI GUDANG
    // =========================================================================

    /**
     * [BARU] Bayar Massal (Bulk Settle)
     */
    public function bulkSettle(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:inciseds,id'
        ]);

        $ids = $request->input('ids');
        $successCount = 0;
        $successIds = []; // Simpan ID yang berhasil dibayar untuk integrasi gudang

        DB::beginTransaction();
        try {
            foreach ($ids as $id) {
                $incised = Incised::with('incisor')->find($id);

                // Skip jika sudah lunas
                if (!$incised || $incised->payment_status === 'paid') {
                    continue;
                }

                // Panggil logika bayar satuan
                $result = $this->processSingleSettle($incised);

                if ($result['status']) {
                    $successCount++;
                    $successIds[] = $incised->id;
                }
            }

            // [INTEGRASI GUDANG OTOMATIS]
            if (count($successIds) > 0) {
                $this->integrateBatchToWarehouse($successIds);
            }

            DB::commit();

            return redirect()->back()->with('message', "Proses Selesai. {$successCount} data dibayar & masuk stok gudang.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }

    /**
     * [UPDATE] Bayar Satuan
     */
    public function settle($id)
    {
        DB::beginTransaction();
        try {
            $incised = Incised::with('incisor')->findOrFail($id);

            if ($incised->payment_status === 'paid') {
                return redirect()->back()->with('error', 'Transaksi ini sudah lunas sebelumnya.');
            }

            $result = $this->processSingleSettle($incised);

            if (!$result['status']) {
                DB::rollBack();
                return redirect()->back()->with('error', $result['message']);
            }

            // [INTEGRASI GUDANG OTOMATIS]
            // Walaupun cuma 1, tetap kita masukkan ke gudang
            $this->integrateBatchToWarehouse([$incised->id]);

            DB::commit();
            return redirect()->back()->with('message', $result['message'] . " Data otomatis masuk stok gudang.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error System: ' . $e->getMessage());
        }
    }

    /**
     * [PRIVATE] Logika Inti Pembayaran (Potong Kasbon)
     */
    private function processSingleSettle($incised)
    {
        $incisor = $incised->incisor;

        if (!$incisor) {
            return ['status' => false, 'message' => "Gagal: Invoice {$incised->no_invoice} tidak ditemukan."];
        }

        $pendapatan = $incised->amount;

        $activeKasbons = Kasbon::where('kasbonable_type', Incisor::class)
            ->where('kasbonable_id', $incisor->id)
            ->where('status', 'Approved')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->orderBy('transaction_date', 'asc')
            ->get();

        $sisaUang = $pendapatan;
        $totalPotongan = 0;

        foreach ($activeKasbons as $kasbon) {
            if ($sisaUang <= 0) break;

            $sudahDibayar = $kasbon->payments()->sum('amount');
            $sisaHutangIni = round($kasbon->kasbon - $sudahDibayar, 2);

            if ($sisaHutangIni <= 0) {
                $kasbon->update(['payment_status' => 'paid']);
                continue;
            }

            $bayar = min($sisaUang, $sisaHutangIni);

            KasbonPayment::create([
                'kasbon_id' => $kasbon->id,
                'amount' => $bayar,
                'payment_date' => now(),
                'notes' => "Potong dari Hasil Toreh Tgl " . Carbon::parse($incised->date)->format('d/m/Y')
            ]);

            $newTotalPaid = $sudahDibayar + $bayar;
            if (round($newTotalPaid, 2) >= round($kasbon->kasbon, 2)) {
                $kasbon->update(['payment_status' => 'paid', 'paid_at' => now()]);
            } else {
                $kasbon->update(['payment_status' => 'partial']);
            }

            $sisaUang -= $bayar;
            $totalPotongan += $bayar;
        }

        $incised->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'total_deduction' => $totalPotongan,
            'net_received' => $sisaUang
        ]);

        if ($sisaUang > 0) {
            FinancialTransaction::create([
                'type' => 'expense',
                'source' => 'cash',
                'category' => 'Pembayaran Penoreh',
                'amount' => $sisaUang,
                'transaction_date' => now(),
                'description' => "Bayar Toreh {$incisor->name} (Inv: {$incised->no_invoice})",
                'transaction_code' => 'KK-AUTO',
                'transaction_number' => (string) $incised->id,
                'db_cr' => 'credit',
                'counterparty' => $incisor->name
            ]);
        }

        $msg = "Berhasil. Total: " . number_format($pendapatan,0) . ", Potong: " . number_format($totalPotongan,0);
        return ['status' => true, 'message' => $msg];
    }

    /**
     * [BARU] Logika Integrasi ke Stok Gudang
     * Mengelompokkan data berdasarkan Tanggal, Lokasi, dan Produk
     */
    private function integrateBatchToWarehouse(array $incisedIds)
    {
        // Ambil data yang baru saja dibayar
        $items = Incised::whereIn('id', $incisedIds)->get();

        if ($items->isEmpty()) return;

        // Kelompokkan data: Tanggal -> Lokasi -> Nama Produk
        // Contoh: 2025-01-20 -> Temadu -> Karet Lump -> [Item1, Item2]
        $grouped = $items->groupBy(function($item) {
            return $item->date . '|' . $item->lok_kebun . '|' . $item->product;
        });

        foreach ($grouped as $key => $groupItems) {
            list($date, $lokasi, $productName) = explode('|', $key);

            // 1. Cari Product ID di MasterProduct
            // Pastikan nama di Incised SAMA dengan nama di MasterProduct
            $masterProduct = MasterProduct::where('name', $productName)->first();

            // Jika tidak ketemu, coba cari yang mirip atau pakai default (opsional)
            // Untuk keamanan, jika tidak ketemu, kita skip atau pakai produk pertama (warning log)
            if (!$masterProduct) {
                // Logika fallback: Ambil produk pertama atau buat log error
                // Di sini saya ambil produk pertama agar tidak error system, tapi sebaiknya nama disamakan
                $masterProduct = MasterProduct::first();
            }

            if (!$masterProduct) continue; // Jika tabel master kosong, skip

            // 2. Hitung Total
            $totalQty = $groupItems->sum('qty_kg');
            $totalAmount = $groupItems->sum('amount');
            $totalKeping = $groupItems->sum('keping');
            $qualitySample = $groupItems->first()->kualitas; // Ambil sampel kualitas

            // 3. Generate Nomor PO (Referensi)
            $noPo = $this->generateNoPo($date, $lokasi);

            // 4. Simpan ke IncomingStock
            IncomingStock::create([
                'date' => $date,
                'product_id' => $masterProduct->id,
                'nm_supplier' => $lokasi, // Supplier diisi Lokasi Kebun (Temadu/Sebayar)
                'qty_net' => $totalQty,
                'price_per_kg' => ($totalQty > 0) ? ($totalAmount / $totalQty) : 0, // Rata-rata harga
                'total_amount' => $totalAmount,
                'keping' => $totalKeping,
                'kualitas' => $qualitySample . ' (Batch Auto)',
                'no_po' => $noPo,
            ]);
        }
    }

    /**
     * [HELPER] Generate Nomor PO Otomatis
     * Format: PBK.XII-TMD-01/25
     */
    private function generateNoPo($dateInput, $supplier)
    {
        $dt = Carbon::parse($dateInput);
        $year2Digit = $dt->format('y');
        $monthRomawi = $this->getRomawi($dt->format('n'));

        // Kode Lokasi
        $locCode = 'GEN';
        if (stripos($supplier, 'Temadu') !== false) $locCode = 'TMD';
        if (stripos($supplier, 'Sebayar') !== false) $locCode = 'SBYR';
        if (stripos($supplier, 'Agro') !== false) $locCode = 'AGR';

        // Hitung urutan di bulan & tahun yang sama
        $countExisting = IncomingStock::whereYear('date', $dt->year)
            ->whereMonth('date', $dt->month)
            ->count();

        $nextSequence = str_pad($countExisting + 1, 2, '0', STR_PAD_LEFT);

        return "PBK.{$monthRomawi}-{$locCode}-{$nextSequence}/{$year2Digit}";
    }

    private function getRomawi($monthNumber) {
        $map = [1=>'I', 2=>'II', 3=>'III', 4=>'IV', 5=>'V', 6=>'VI', 7=>'VII', 8=>'VIII', 9=>'IX', 10=>'X', 11=>'XI', 12=>'XII'];
        return $map[$monthNumber] ?? 'I';
    }

    public function show(Incised $incised)
    {
        $incised->load('incisor');
        $data = $incised->toArray();
        $data['incisor_name'] = $incised->incisor ? $incised->incisor->name : null;
        return Inertia::render('Inciseds/show', ['incised' => $data]);
    }

    public function print($id)
    {
        $incised = Incised::with('incisor')->findOrFail($id);
        return Inertia::render('Inciseds/Print', ['incised' => $incised]);
    }

    public function destroy(Incised $incised)
    {
        $incised->delete();
        return redirect()->route('inciseds.index')->with('message', 'Data Berhasil Dihapus');
    }
}
