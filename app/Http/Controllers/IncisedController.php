<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incised;
use App\Models\Incisor;
use App\Models\MasterProduct;
use App\Models\Kasbon;
use App\Models\KasbonPayment;
use App\Models\IncomingStock;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\FinancialTransaction;

class IncisedController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 15;
        $searchTerm = $request->input('search');
        $timePeriod = $request->input('time_period', 'this-month');
        $specificMonth = $request->input('month');
        $specificYear = $request->input('year');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($perPage === 'all') $perPage = 999999;
        else $perPage = intval($perPage);

        $applyTimeFilter = function ($query) use ($timePeriod, $specificMonth, $specificYear, $startDate, $endDate) {
            switch ($timePeriod) {
                case 'today': $query->whereDate('date', Carbon::today()); break;
                case 'this-week': $query->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]); break;
                case 'this-month': $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); break;
                case 'last-month': $query->whereMonth('date', Carbon::now()->subMonth()->month)->whereYear('date', Carbon::now()->subMonth()->year); break;
                case 'this-year': $query->whereYear('date', Carbon::now()->year); break;
                case 'specific-month': if ($specificMonth && $specificYear) $query->whereMonth('date', $specificMonth)->whereYear('date', $specificYear); break;
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
        $applyTimeFilter($incisedsQuery);

        $baseStatQuery = Incised::query();
        $applySearch($baseStatQuery, $searchTerm);
        $applyTimeFilter($baseStatQuery);

        $totalKebunA = (clone $baseStatQuery)->where('lok_kebun', 'Temadu')->sum('qty_kg');
        $totalKebunA_keping = (clone $baseStatQuery)->where('lok_kebun', 'Temadu')->sum('keping');

        $totalKebunB = (clone $baseStatQuery)->whereIn('lok_kebun', ['Sebayar A', 'Sebayar B', 'Sebayar C', 'Sebayar D'])->sum('qty_kg');
        $totalKebunB_keping = (clone $baseStatQuery)->whereIn('lok_kebun', ['Sebayar A', 'Sebayar B', 'Sebayar C', 'Sebayar D'])->sum('keping');
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
            "filter" => $request->only(['search', 'time_period', 'month', 'year', 'per_page', 'start_date', 'end_date']),
            'totalKebunA' => (float)$totalKebunA,
            'totalKebunA_keping' => (int)$totalKebunA_keping,
            'totalKebunB' => (float)$totalKebunB,
            'totalKebunB_keping' => (int)$totalKebunB_keping,
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
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

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

        if ($timePeriod == 'specific-month') { $query->whereMonth('date', $specificMonth)->whereYear('date', $specificYear); }
        elseif ($timePeriod == 'today') { $query->whereDate('date', Carbon::today()); }
        elseif ($timePeriod == 'this-month') { $query->whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year); }
        elseif ($timePeriod == 'custom' && $startDate && $endDate) { $query->whereBetween('date', [$startDate, $endDate]); }

        $rawInciseds = $query->orderBy('date', 'ASC')->get();

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
                'incisor_name' => $item->incisor ? $item->incisor->name : 'Tanpa Nama',
            ];
        });

        return Inertia::render('Inciseds/PrintReport', [
            'inciseds' => $inciseds,
            'totals' => ['qty' => $rawInciseds->sum('qty_kg'), 'amount' => $rawInciseds->sum('amount'), 'net_received' => $rawInciseds->sum('net_received')],
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
    // UPDATE LOGIC PEMBAYARAN: TAMBAH PARAMETER POTONG KASBON
    // =========================================================================

    public function bulkSettle(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:inciseds,id',
            'potong_kasbon' => 'required|boolean' // Validasi Pilihan
        ]);

        $ids = $request->input('ids');
        $potongKasbon = $request->input('potong_kasbon');
        $successCount = 0;
        $successIds = [];

        DB::beginTransaction();
        try {
            foreach ($ids as $id) {
                $incised = Incised::with('incisor')->find($id);

                if (!$incised || $incised->payment_status === 'paid') continue;

                // Kirim pilihan ke fungsi pemrosesan
                $result = $this->processSingleSettle($incised, $potongKasbon);

                if ($result['status']) {
                    $successCount++;
                    $successIds[] = $incised->id;
                }
            }

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

    // Tambah Request $request untuk menangkap pilihan potong kasbon
    public function settle(Request $request, $id)
    {
        $request->validate([
            'potong_kasbon' => 'required|boolean'
        ]);

        $potongKasbon = $request->input('potong_kasbon');

        DB::beginTransaction();
        try {
            $incised = Incised::with('incisor')->findOrFail($id);

            if ($incised->payment_status === 'paid') {
                return redirect()->back()->with('error', 'Transaksi ini sudah lunas sebelumnya.');
            }

            $result = $this->processSingleSettle($incised, $potongKasbon);

            if (!$result['status']) {
                DB::rollBack();
                return redirect()->back()->with('error', $result['message']);
            }

            $this->integrateBatchToWarehouse([$incised->id]);

            DB::commit();
            return redirect()->back()->with('message', $result['message'] . " Data otomatis masuk stok gudang.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error System: ' . $e->getMessage());
        }
    }

    /**
     * [PRIVATE] Logika Inti Pembayaran
     * Menerima opsi $potongKasbon (True/False)
     */
    private function processSingleSettle($incised, $potongKasbon)
    {
        $incisor = $incised->incisor;

        if (!$incisor) {
            return ['status' => false, 'message' => "Gagal: Invoice {$incised->no_invoice} tidak ditemukan."];
        }

        $pendapatan = $incised->amount;
        $sisaUang = $pendapatan;
        $totalPotongan = 0;

        // JIKA OPSI POTONG KASBON DIPILIH
        if ($potongKasbon) {
            $activeKasbons = Kasbon::where('kasbonable_type', Incisor::class)
                ->where('kasbonable_id', $incisor->id)
                ->where('status', 'Approved')
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->orderBy('transaction_date', 'asc')
                ->get();

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
        }

        // UPDATE STATUS INCISED
        $incised->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'total_deduction' => $totalPotongan,
            'net_received' => $sisaUang
        ]);

        // JIKA ADA SISA UANG YANG DITERIMA PENOREH, CATAT PENGELUARAN KAS
        if ($sisaUang > 0) {
            FinancialTransaction::create([
                'business_unit' => FinancialTransaction::BUSINESS_KARET,
                'type' => 'expense',
                'source' => 'cash',
                'category' => 'Pembayaran Penoreh',
                'amount' => $sisaUang,
                'transaction_date' => now(),
                'description' => "Bayar Toreh {$incisor->name} (Inv: {$incised->no_invoice})",
                'transaction_code' => 'KK-Karet',
                'transaction_number' => (string) $incised->id,
                'db_cr' => 'credit',
                'counterparty' => $incisor->name
            ]);
        }

        $msg = "Berhasil. Total: Rp " . number_format($pendapatan,0,',','.') . ", Potongan: Rp " . number_format($totalPotongan,0,',','.');
        return ['status' => true, 'message' => $msg];
    }

    private function integrateBatchToWarehouse(array $incisedIds)
    {
        $items = Incised::whereIn('id', $incisedIds)->get();
        if ($items->isEmpty()) return;

        $grouped = $items->groupBy(function($item) {
            return $item->date . '|' . $item->lok_kebun . '|' . $item->product;
        });

        foreach ($grouped as $key => $groupItems) {
            list($date, $lokasi, $productName) = explode('|', $key);

            $masterProduct = MasterProduct::where('name', $productName)->first();
            if (!$masterProduct) {
                $masterProduct = MasterProduct::first();
            }
            if (!$masterProduct) continue;

            $totalQty = $groupItems->sum('qty_kg');
            $totalAmount = $groupItems->sum('amount');
            $totalKeping = $groupItems->sum('keping');
            $qualitySample = $groupItems->first()->kualitas;

            $noPo = $this->generateNoPo($date, $lokasi);

            IncomingStock::create([
                'date' => $date,
                'product_id' => $masterProduct->id,
                'nm_supplier' => $lokasi,
                'qty_net' => $totalQty,
                'price_per_kg' => ($totalQty > 0) ? ($totalAmount / $totalQty) : 0,
                'total_amount' => $totalAmount,
                'keping' => $totalKeping,
                'kualitas' => $qualitySample . ' (Batch Auto)',
                'no_po' => $noPo,
            ]);
        }
    }

    private function generateNoPo($dateInput, $supplier)
    {
        $dt = Carbon::parse($dateInput);
        $year2Digit = $dt->format('y');
        $monthRomawi = $this->getRomawi($dt->format('n'));

        $locCode = 'GEN';
        if (stripos($supplier, 'Temadu') !== false) $locCode = 'TMD';
        if (stripos($supplier, 'Sebayar') !== false) $locCode = 'SBYR';
        if (stripos($supplier, 'Agro') !== false) $locCode = 'AGR';

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
        
        if ($incised->incisor) {
            $kasbons = \App\Models\Kasbon::where('kasbonable_id', $incised->incisor->id)
                ->where('kasbonable_type', \App\Models\Incisor::class)
                ->where('status', 'Approved')
                ->get();
            $totalKasbon = $kasbons->sum('kasbon');
            $totalPaid = \App\Models\KasbonPayment::whereIn('kasbon_id', $kasbons->pluck('id'))->sum('amount');
            $incised->sisa_kasbon = max(0, $totalKasbon - $totalPaid);
        } else {
            $incised->sisa_kasbon = 0;
        }

        return Inertia::render('Inciseds/Print', ['incised' => $incised]);
    }

    public function bulkPrint(Request $request)
    {
        $ids = $request->input('ids');
        if (!$ids) {
            return redirect()->back()->with('error', 'Tidak ada data yang dipilih untuk dicetak.');
        }

        $idArray = explode(',', $ids);
        $inciseds = Incised::with('incisor')->whereIn('id', $idArray)->get();

        foreach ($inciseds as $incised) {
            if ($incised->incisor) {
                $kasbons = \App\Models\Kasbon::where('kasbonable_id', $incised->incisor->id)
                    ->where('kasbonable_type', \App\Models\Incisor::class)
                    ->where('status', 'Approved')
                    ->get();
                $totalKasbon = $kasbons->sum('kasbon');
                $totalPaid = \App\Models\KasbonPayment::whereIn('kasbon_id', $kasbons->pluck('id'))->sum('amount');
                $incised->sisa_kasbon = max(0, $totalKasbon - $totalPaid);
            } else {
                $incised->sisa_kasbon = 0;
            }
        }

        return Inertia::render('Inciseds/PrintBulkStruk', [
            'inciseds' => $inciseds
        ]);
    }

    public function destroy(Incised $incised)
    {
        $incised->delete();
        return redirect()->route('inciseds.index')->with('message', 'Data Berhasil Dihapus');
    }

    public function updateNetReceived(Request $request, Incised $incised)
    {
        $request->validate([
            'net_received' => 'required|numeric'
        ]);

        $newNet = $request->input('net_received');
        
        $incised->update([
            'net_received' => $newNet
        ]);

        return redirect()->back()->with('message', 'Total Diterima (Net) berhasil diperbarui.');
    }
}
