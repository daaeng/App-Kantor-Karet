<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Incisor;
use App\Models\Incised;
use App\Models\Kasbon;
use App\Models\KasbonPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Throwable;
use Illuminate\Validation\Rule;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class KasbonController extends Controller
{
    private $statuses = ['Pending', 'Approved', 'Rejected'];

    public function index(Request $request)
    {
        $perPage = 30;
        // [MODIFIED] Ambil filter dari request
        $searchTerm = $request->input('search');
        $filterType = $request->input('type'); // 'pegawai' or 'penoreh'
        $filterLocation = $request->input('location'); // 'Kantor', 'Temadu', 'Sebayar'

        // [MODIFIED] Buat query dasar Kasbon yang akan menerapkan semua filter
        $kasbonBaseQuery = Kasbon::query();

        // [MODIFIED] Terapkan filter ke query dasar
        if ($searchTerm) {
            $kasbonBaseQuery->where(function ($q) use ($searchTerm) {
                $q->whereHasMorph('kasbonable', [Employee::class], function ($query, $type) use ($searchTerm) {
                    $query->where('name', 'like', "%{$searchTerm}%")
                          ->orWhere('employee_id', 'like', "%{$searchTerm}%");
                })->orWhereHasMorph('kasbonable', [Incisor::class], function ($query, $type) use ($searchTerm) {
                    $query->where('name', 'like', "%{$searchTerm}%")
                          ->orWhere('no_invoice', 'like', "%{$searchTerm}%");
                });
            });
        }

        // [MODIFIED] Terapkan filter Tipe ke query dasar
        if ($filterType) {
            if ($filterType === 'pegawai') {
                $kasbonBaseQuery->where('kasbonable_type', Employee::class);
            } elseif ($filterType === 'penoreh') {
                $kasbonBaseQuery->where('kasbonable_type', Incisor::class);
            }
        }

        // [MODIFIED] Terapkan filter Lokasi ke query dasar
        if ($filterLocation) {
            if ($filterLocation === 'Kantor') {
                // Lokasi 'Kantor' hanya untuk Pegawai
                $kasbonBaseQuery->where('kasbonable_type', Employee::class);
            } else {
                // Lokasi 'Temadu' atau 'Sebayar' hanya untuk Penoreh
                $kasbonBaseQuery->whereHasMorph('kasbonable', [Incisor::class], function ($q) use ($filterLocation) {
                    $q->where('lok_toreh', $filterLocation);
                });
                // Pastikan juga tipenya adalah Incisor
                $kasbonBaseQuery->where('kasbonable_type', Incisor::class);
            }
        }

        // [MODIFIED] Buat query untuk tabel (grup) DARI query dasar
        // Kita clone() agar grouping tidak mempengaruhi query stats
        $query = $kasbonBaseQuery->clone()
            ->select('kasbonable_id', 'kasbonable_type')
            ->groupBy('kasbonable_id', 'kasbonable_type');

        $allGroups = $query->get();

        $processedGroups = $allGroups->map(function ($group) {
            // [MODIFIED] Hitung total kasbon dan pembayaran berdasarkan ID grup
            $kasbonsForGroup = Kasbon::where('kasbonable_id', $group->kasbonable_id)
                ->where('kasbonable_type', $group->kasbonable_type);

            $totalKasbon = $kasbonsForGroup->clone()
                ->where('status', 'Approved')
                ->sum('kasbon');

            $kasbonIds = $kasbonsForGroup->clone()->pluck('id');

            $totalPaid = KasbonPayment::whereIn('kasbon_id', $kasbonIds)->sum('amount');

            $owner = $group->kasbonable;
            $ownerName = 'N/A';
            $ownerIdentifier = 'N/A';
            $kasbonType = 'Tidak Diketahui';

            if ($owner) {
                $ownerName = $owner->name;
                if ($group->kasbonable_type === Employee::class) {
                    $ownerIdentifier = 'NIP: ' . $owner->employee_id;
                    $kasbonType = 'Pegawai';
                } elseif ($group->kasbonable_type === Incisor::class) {
                    $ownerIdentifier = 'No. Invoice: ' . $owner->no_invoice;
                    $kasbonType = 'Penoreh';
                }
            }

            $remaining = $totalKasbon - $totalPaid;

            return [
                'owner_id' => $group->kasbonable_id,
                'owner_type' => $group->kasbonable_type,
                'owner_name' => $ownerName,
                'owner_identifier' => $ownerIdentifier,
                'kasbon_type' => $kasbonType,
                'total_kasbon' => (float) $totalKasbon,
                'total_paid' => (float) $totalPaid,
                'remaining' => $remaining > 0 ? $remaining : 0,
            ];
        });

        $sortedGroups = $processedGroups->sortBy('owner_name')->values();

        $currentPage = Paginator::resolveCurrentPage('page');
        $currentPageItems = $sortedGroups->slice(($currentPage - 1) * $perPage, $perPage)->all();

        $kasbonGroups = new LengthAwarePaginator($currentPageItems, count($sortedGroups), $perPage, $currentPage, [
            'path' => Paginator::resolveCurrentPath(),
            'query' => $request->query(),
        ]);

        // [MODIFIED] Hitung STAT CARDS menggunakan query dasar yang sudah terfilter

        // Stat 1: Total Pending (Sesuai Filter)
        $totalPendingKasbon = $kasbonBaseQuery->clone()->where('status', 'Pending')->count();

        // Stat 2: Total Perlu Dibayar (Sesuai Filter)
        $totalApprovedKasbon = $kasbonBaseQuery->clone()
            ->where('status', 'Approved')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->count();

        // Stat 3: Total Sisa Utang (Sesuai Filter)
        $approvedKasbons = $kasbonBaseQuery->clone()
            ->where('status', 'Approved')
            ->get(['id', 'kasbon']);

        $totalApprovedPaid = KasbonPayment::whereIn('kasbon_id', $approvedKasbons->pluck('id'))->sum('amount');
        $sumRemainingAmount = $approvedKasbons->sum('kasbon') - $totalApprovedPaid;


        return Inertia::render("Kasbons/index", [
            'kasbons' => $kasbonGroups,
            // [MODIFIED] Kirim semua filter ke frontend
            'filter' => $request->only('search', 'type', 'location'),
            'totalPendingKasbon' => $totalPendingKasbon, // <-- Sudah terfilter
            'totalApprovedKasbon' => $totalApprovedKasbon, // <-- Sudah terfilter
            'sumApprovedKasbonAmount' => $sumRemainingAmount, // <-- Sudah terfilter
        ]);
    }

    public function showByUser($type, $id)
    {
        $modelType = ($type === 'employee') ? Employee::class : Incisor::class;
        $owner = $modelType::findOrFail($id);

        $ownerData = [];
        if ($modelType === Employee::class) {
            $ownerData = ['name' => $owner->name, 'identifier' => 'NIP: ' . $owner->employee_id];
        } else {
            $ownerData = ['name' => $owner->name, 'identifier' => 'No. Invoice: ' . $owner->no_invoice];
        }

        $kasbons = Kasbon::where('kasbonable_id', $id)
            ->where('kasbonable_type', $modelType)
            ->get();

        $kasbonIds = $kasbons->pluck('id');
        $payments = KasbonPayment::whereIn('kasbon_id', $kasbonIds)->with('kasbon')->get();

        $transactions = collect([]);
        foreach ($kasbons as $kasbon) {
            $transactions->push([
                'id' => 'k-'.$kasbon->id,
                'date' => $kasbon->transaction_date,
                'description' => 'Pinjaman Dana (Kasbon) - ' . $kasbon->status,
                'debit' => $kasbon->kasbon,
                'credit' => 0,
                'transaction_type' => 'kasbon',
                'transaction_ref' => $kasbon,
            ]);
        }
        foreach ($payments as $payment) {
            $transactions->push([
                'id' => 'p-'.$payment->id,
                'date' => $payment->payment_date,
                'description' => $payment->notes ?: 'Pembayaran Cicilan',
                'debit' => 0,
                'credit' => $payment->amount,
                'transaction_type' => 'payment',
                'transaction_ref' => $payment,
            ]);
        }

        $sortedTransactions = $transactions->sortBy('date')->values();

        $runningBalance = 0;
        $balanceMap = [];

        foreach ($sortedTransactions as $tx) {
            $kasbonStatus = $tx['transaction_type'] === 'kasbon'
                ? $tx['transaction_ref']['status']
                : ($tx['transaction_ref']['kasbon']['status'] ?? 'Approved');

            if ($kasbonStatus === 'Approved') {
                 $runningBalance += $tx['debit'] - $tx['credit'];
            }
            $balanceMap[$tx['id']] = $runningBalance;
        }

        $history = $sortedTransactions->map(function ($item) use ($balanceMap) {
            $item['balance'] = $balanceMap[$item['id']] ?? 0;
            $carbonDate = Carbon::parse($item['date']);
            $item['date_formatted'] = $carbonDate->isoFormat('D MMM YYYY, HH:mm');
            $item['date_input_format'] = $carbonDate->format('Y-m-d');
            return $item;
        });

        $payableKasbons = Kasbon::where('kasbonable_id', $id)
            ->where('kasbonable_type', $modelType)
            ->where('status', 'Approved')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'kasbon', 'created_at', 'transaction_date']);

        return Inertia::render('Kasbons/Detail', [
            'owner' => $ownerData,
            'history' => $history->sortBy('date')->values()->all(),
            'payableKasbons' => $payableKasbons,
            'kasbon_owner_id' => $id,
            'kasbon_owner_type' => $type,
            'errors' => session()->get('errors') ? session()->get('errors')->getBag('default')->getMessages() : (object)[],
        ]);
    }

    public function pay(Request $request)
    {
        $validated = $request->validate([
            'kasbon_id' => 'required|exists:kasbons,id',
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $kasbon = Kasbon::with('payments')->findOrFail($validated['kasbon_id']);

            if ($kasbon->status !== 'Approved') {
                return back()->with('error', 'Hanya kasbon yang sudah disetujui yang bisa dibayar.')->withInput();
            }

            $totalPaid = $kasbon->payments->sum('amount');
            $remaining = $kasbon->kasbon - $totalPaid;

            if ($validated['amount'] > ($remaining + 0.001)) {
                 return back()->withErrors(['amount' => 'Jumlah pembayaran melebihi sisa utang.'])->withInput();
            }

            $kasbon->payments()->create($validated);

            $this->updateKasbonPaymentStatus($kasbon);

            DB::commit();

            return redirect()->route('kasbons.showByUser', [
                'type' => $request->input('owner_type'),
                'id' => $request->input('owner_id')
            ])->with('message', 'Pembayaran berhasil dicatat.');

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memproses pembayaran kasbon.", ['error' => $e->getMessage()]);
            return back()->with('error', 'Terjadi kesalahan server saat memproses pembayaran.');
        }
    }

    public function updatePayment(Request $request, KasbonPayment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $kasbon = $payment->kasbon()->with('payments')->firstOrFail();

            $otherPaymentsTotal = $kasbon->payments->where('id', '!=', $payment->id)->sum('amount');
            $remaining = $kasbon->kasbon - $otherPaymentsTotal;
            if ($validated['amount'] > ($remaining + 0.001)) {
                return back()->withErrors(['amount' => 'Jumlah pembayaran melebihi sisa utang.'])->withInput();
            }

            $payment->update($validated);

            $this->updateKasbonPaymentStatus($kasbon);

            DB::commit();
            return back()->with('message', 'Data pembayaran berhasil diperbarui.');
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Gagal update pembayaran kasbon', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Terjadi kesalahan saat memperbarui pembayaran.');
        }
    }

    public function destroyPayment(KasbonPayment $payment)
    {
        DB::beginTransaction();
        try {
            $kasbon = $payment->kasbon;
            $payment->delete();
            $this->updateKasbonPaymentStatus($kasbon);
            DB::commit();
            return back()->with('message', 'Data pembayaran berhasil dihapus.');
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Gagal hapus pembayaran kasbon', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Terjadi kesalahan saat menghapus pembayaran.');
        }
    }

    private function updateKasbonPaymentStatus(Kasbon $kasbon)
    {
        $kasbon->refresh()->load('payments');
        $totalPaid = $kasbon->payments->sum('amount');

        if (bccomp((string)$totalPaid, (string)$kasbon->kasbon, 2) >= 0) {
            $kasbon->payment_status = 'paid';
            $kasbon->paid_at = now();
        } elseif ($totalPaid > 0) {
            $kasbon->payment_status = 'partial';
            $kasbon->paid_at = null;
        } else {
            $kasbon->payment_status = 'unpaid';
            $kasbon->paid_at = null;
        }
        $kasbon->save();
    }

    public function createPegawai()
    {
        $employees = Employee::select('id', 'name', 'salary', 'employee_id')->get()->map(fn ($e) => [
            'id' => $e->id,
            'label' => "{$e->employee_id} - {$e->name}",
            'salary' => $e->salary
        ]);
        return Inertia::render("Kasbons/create_pegawai", [
            'employees' => $employees,
            'statuses' => $this->statuses
        ]);
    }

   public function storePegawai(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'gaji'        => 'required|numeric|min:0',
            'kasbon'      => 'required|numeric|min:1',
            'status'      => 'required|string',
            'reason'      => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);

        if ($validated['status'] === 'Approved' && $validated['kasbon'] > $employee->salary) {
            return back()->withErrors(['kasbon' => 'Jumlah kasbon tidak boleh melebihi gaji pegawai.'])->withInput();
        }

        $dataToCreate = $validated;
        $dataToCreate['kasbonable_type'] = Employee::class;
        $dataToCreate['kasbonable_id'] = $validated['employee_id'];
        $dataToCreate['month'] = Carbon::parse($validated['transaction_date'])->month;
        $dataToCreate['year'] = Carbon::parse($validated['transaction_date'])->year;

        Kasbon::create($dataToCreate);

        return redirect()->route('kasbons.index')->with('message', 'Kasbon pegawai berhasil dibuat.');
    }

    public function create()
    {
        $incisors = Incisor::select('id', 'no_invoice', 'name')->get()->map(fn ($i) => ['id' => $i->id, 'label' => "{$i->no_invoice} - {$i->name}"]);
        $monthsYears = Incised::select(DB::raw('YEAR(date) as year, MONTH(date) as month'))
            ->groupBy('year', 'month')->orderBy('year', 'desc')->orderBy('month', 'desc')->get()
            ->map(function ($item) {
                $monthName = Carbon::createFromDate($item->year, $item->month, 1)->translatedFormat('F');
                return ['year' => $item->year, 'month' => $item->month, 'label' => "{$monthName} {$item->year}"];
            });

        return Inertia::render('Kasbons/create', [
            'incisors' => $incisors,
            'monthsYears' => $monthsYears,
            'statuses' => $this->statuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'incisor_id' => 'required|exists:incisors,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'kasbon' => 'required|numeric|min:1',
            'status' => ['required', 'string', Rule::in($this->statuses)],
            'reason' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $incisor = Incisor::findOrFail($validated['incisor_id']);
        $totalAmount = Incised::where('no_invoice', $incisor->no_invoice)
            ->whereMonth('date', $validated['month'])
            ->whereYear('date', $validated['year'])
            ->sum('amount');
        $gaji = $totalAmount;

        DB::beginTransaction();
        try {
            $dataToCreate = $validated;
            $dataToCreate['gaji'] = $gaji;
            $dataToCreate['kasbonable_type'] = Incisor::class;
            $dataToCreate['kasbonable_id'] = $validated['incisor_id'];

            Kasbon::create($dataToCreate);

            DB::commit();
            return redirect()->route('kasbons.index')->with('message', 'Kasbon Penoreh berhasil dibuat.');
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menyimpan kasbon penoreh.", ['error_message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Terjadi kesalahan server saat menyimpan data.')->withInput();
        }
    }

    public function edit(Kasbon $kasbon)
    {
        $kasbon->load('kasbonable');
        $isEmployee = $kasbon->kasbonable_type === Employee::class;

        $props = [
            'kasbon' => [
                'id' => $kasbon->id,
                'kasbonable_type' => $kasbon->kasbonable_type,
                'kasbonable_id' => $kasbon->kasbonable_id,
                'kasbon' => $kasbon->kasbon,
                'gaji' => $kasbon->gaji,
                'status' => $kasbon->status,
                'reason' => $kasbon->reason,
                'month' => $kasbon->month,
                'year' => $kasbon->year,
                'transaction_date' => Carbon::parse($kasbon->transaction_date ?? $kasbon->created_at)->format('Y-m-d'),
                'owner' => $kasbon->kasbonable,
            ],
            'statuses' => $this->statuses,
        ];

        if ($isEmployee) {
            $props['employees'] = Employee::select('id', 'name', 'salary', 'employee_id')->get()->map(fn ($e) => [
                'id' => $e->id,
                'label' => "{$e->employee_id} - {$e->name}",
                'salary' => $e->salary
            ]);
            return Inertia::render('Kasbons/edit_pegawai', $props);
        }

        $props['incisors'] = Incisor::select('id', 'no_invoice', 'name')->get()->map(fn ($i) => [
            'id' => $i->id,
            'label' => "{$i->no_invoice} - {$i->name}"
        ]);
        $props['monthsYears'] = Incised::select(DB::raw('YEAR(date) as year, MONTH(date) as month'))
            ->groupBy('year', 'month')->orderBy('year', 'desc')->orderBy('month', 'desc')->get()
            ->map(function ($item) {
                $monthName = Carbon::createFromDate($item->year, $item->month, 1)->translatedFormat('F');
                return ['year' => $item->year, 'month' => $item->month, 'label' => "{$monthName} {$item->year}"];
            });

        return Inertia::render('Kasbons/edit', $props);
    }

    public function update(Request $request, Kasbon $kasbon)
    {
        $isEmployee = $kasbon->kasbonable_type === Employee::class;

        try {
            if ($isEmployee) {
                $validated = $request->validate([
                    'employee_id' => 'required|exists:employees,id',
                    'kasbon'      => 'required|numeric|min:0',
                    'status'      => 'required|string|in:' . implode(',', $this->statuses),
                    'reason'      => 'nullable|string|max:255',
                    'transaction_date'  => 'required|date',
                ]);

                $employee = Employee::findOrFail($validated['employee_id']);

                if ($validated['status'] === 'Approved' && $validated['kasbon'] > $employee->salary) {
                     return back()->withErrors(['kasbon' => 'Jumlah kasbon tidak boleh melebihi gaji pegawai.'])->withInput();
                }

                $dataToUpdate = $validated;
                $dataToUpdate['kasbonable_id'] = $validated['employee_id'];
                $dataToUpdate['kasbonable_type'] = Employee::class;
                $dataToUpdate['gaji'] = $employee->salary;

                $kasbon->update($dataToUpdate);

            } else {
                $validated = $request->validate([
                    'incisor_id' => 'required|exists:incisors,id',
                    'month'      => 'required|integer|between:1,12',
                    'year'       => 'required|integer',
                    'kasbon'     => 'required|numeric|min:0',
                    'status'      => 'required|string|in:' . implode(',', $this->statuses),
                    'reason'     => 'nullable|string|max:255',
                    'transaction_date' => 'required|date',
                ]);

                $incisor = Incisor::findOrFail($validated['incisor_id']);
                $totalAmount = Incised::where('no_invoice', $incisor->no_invoice)
                    ->whereMonth('date', $validated['month'])
                    ->whereYear('date', $validated['year'])
                    ->sum('amount');
                $gaji = $totalAmount;

                // if ($validated['status'] === 'Approved' && $validated['kasbon'] > $gaji) {
                //      return back()->withErrors(['kasbon' => 'Jumlah kasbon tidak boleh melebihi total gaji penoreh pada periode ini.'])->withInput();
                // }

                $dataToUpdate = $validated;
                $dataToUpdate['kasbonable_id'] = $validated['incisor_id'];
                $dataToUpdate['kasbonable_type'] = Incisor::class;
                $dataToUpdate['gaji'] = $gaji;

                $kasbon->update($dataToUpdate);
            }

            return redirect()->route('kasbons.index')->with('message', 'Kasbon berhasil diperbarui.');

        } catch (Throwable $e) {
            Log::error("Gagal mengupdate kasbon.", [ 'kasbon_id' => $kasbon->id, 'error_message' => $e->getMessage() ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan server saat mengupdate data.')->withInput();
        }
    }

    public function destroy(Kasbon $kasbon)
    {
        $kasbon->delete();
        return redirect()->route('kasbons.index')->with('message', 'Kasbon berhasil dihapus.');
    }

    public function getIncisorData(Request $request)
    {
        $request->validate([
            'incisor_id' => 'required|exists:incisors,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $incisor = Incisor::find($request->incisor_id);

        if (!$incisor) {
            return response()->json(['message' => 'Penoreh tidak ditemukan.'], 404);
        }

        $totalAmount = Incised::where('no_invoice', $incisor->no_invoice)
            ->whereMonth('date', $request->month)
            ->whereYear('date', $request->year)
            ->sum('amount');

        $gaji = $totalAmount;

        return response()->json([
            'incisor' => $incisor,
            'total_toreh_bulan_ini' => $totalAmount,
            'gaji_bulan_ini' => $gaji,
            'max_kasbon_amount' => $gaji,
        ]);
    }

    public function print(Request $request)
    {
        // [MODIFIED] Ambil semua filter dari request
        $searchTerm = $request->input('search');
        $filterType = $request->input('type');
        $filterLocation = $request->input('location');

        // [MODIFIED] Logika filter sama dengan function index()
        $kasbonBaseQuery = Kasbon::query();

        if ($searchTerm) {
            $kasbonBaseQuery->where(function ($q) use ($searchTerm) {
                $q->whereHasMorph('kasbonable', [Employee::class], function ($query) use ($searchTerm) {
                    $query->where('name', 'like', "%{$searchTerm}%")
                          ->orWhere('employee_id', 'like', "%{$searchTerm}%");
                })->orWhereHasMorph('kasbonable', [Incisor::class], function ($query) use ($searchTerm) {
                    $query->where('name', 'like', "%{$searchTerm}%")
                          ->orWhere('no_invoice', 'like', "%{$searchTerm}%");
                });
            });
        }

        if ($filterType) {
            if ($filterType === 'pegawai') {
                $kasbonBaseQuery->where('kasbonable_type', Employee::class);
            } elseif ($filterType === 'penoreh') {
                $kasbonBaseQuery->where('kasbonable_type', Incisor::class);
            }
        }

        if ($filterLocation) {
            if ($filterLocation === 'Kantor') {
                $kasbonBaseQuery->where('kasbonable_type', Employee::class);
            } else {
                $kasbonBaseQuery->whereHasMorph('kasbonable', [Incisor::class], function ($q) use ($filterLocation) {
                    $q->where('lok_toreh', $filterLocation);
                });
                $kasbonBaseQuery->where('kasbonable_type', Incisor::class);
            }
        }

        $query = $kasbonBaseQuery->clone()
            ->select('kasbonable_id', 'kasbonable_type')
            ->groupBy('kasbonable_id', 'kasbonable_type');

        $allGroups = $query->get();

        $processedGroups = $allGroups->map(function ($group) {
            $kasbonsForGroup = Kasbon::where('kasbonable_id', $group->kasbonable_id)
                ->where('kasbonable_type', $group->kasbonable_type);

            $totalKasbon = $kasbonsForGroup->clone()
                ->where('status', 'Approved')
                ->sum('kasbon');

            $kasbonIds = $kasbonsForGroup->clone()->pluck('id');

            $totalPaid = KasbonPayment::whereIn('kasbon_id', $kasbonIds)->sum('amount');

            $owner = $group->kasbonable;
            $ownerName = 'N/A';
            $location = '-';

            if ($owner) {
                $ownerName = $owner->name;
                 if ($group->kasbonable_type === Employee::class) {
                    $location = 'Kantor';
                } elseif ($group->kasbonable_type === Incisor::class) {
                    $location = $owner->lok_toreh ?? '-';
                }
            }

            $remaining = $totalKasbon - $totalPaid;

            $status = 'Lunas';
            if ($remaining > 0) {
                $status = 'Belum Lunas';
            }

            return [
                'owner_name' => $ownerName,
                'location' => $location,
                'total_kasbon' => (float) $totalKasbon,
                'remaining' => $remaining > 0 ? $remaining : 0,
                'status' => $status,
            ];
        });

        $kasbons = $processedGroups->sortBy('owner_name')->values();

        return Inertia::render("Kasbons/Print", [
            'kasbons' => $kasbons,
            // [MODIFIED] Kirim semua filter ke view print
            'filters' => $request->only(['search', 'type', 'location']),
            'printDate' => now()->translatedFormat('d F Y'),
        ]);
    }

    public function printDetail($type, $id)
    {
        $modelType = ($type === 'employee') ? Employee::class : Incisor::class;
        $owner = $modelType::findOrFail($id);

        $ownerData = [];
        if ($modelType === Employee::class) {
            $ownerData = ['name' => $owner->name, 'identifier' => 'NIP: ' . $owner->employee_id];
        } else {
            $ownerData = ['name' => $owner->name, 'identifier' => 'No. Invoice: ' . $owner->no_invoice];
        }

        $kasbons = Kasbon::where('kasbonable_id', $id)
            ->where('kasbonable_type', $modelType)
            ->get();

        $kasbonIds = $kasbons->pluck('id');
        $payments = KasbonPayment::whereIn('kasbon_id', $kasbonIds)->with('kasbon')->get();

        $transactions = collect([]);
        foreach ($kasbons as $kasbon) {
            $transactions->push([
                'id' => 'k-'.$kasbon->id,
                'date' => $kasbon->transaction_date,
                'description' => 'Pinjaman Dana (Kasbon) - ' . $kasbon->status,
                'debit' => $kasbon->kasbon,
                'credit' => 0,
                'transaction_type' => 'kasbon',
                'transaction_ref' => $kasbon,
            ]);
        }
        foreach ($payments as $payment) {
            $transactions->push([
                'id' => 'p-'.$payment->id,
                'date' => $payment->payment_date,
                'description' => $payment->notes ?: 'Pembayaran Cicilan',
                'debit' => 0,
                'credit' => $payment->amount,
                'transaction_type' => 'payment',
                'transaction_ref' => $payment,
            ]);
        }

        $sortedTransactions = $transactions->sortBy('date')->values();

        $runningBalance = 0;
        $balanceMap = [];

        foreach ($sortedTransactions as $tx) {
            $kasbonStatus = $tx['transaction_type'] === 'kasbon'
                ? $tx['transaction_ref']['status']
                : ($tx['transaction_ref']['kasbon']['status'] ?? 'Approved');

            if ($kasbonStatus === 'Approved') {
                 $runningBalance += $tx['debit'] - $tx['credit'];
            }
            $balanceMap[$tx['id']] = $runningBalance;
        }

        $history = $sortedTransactions->map(function ($item) use ($balanceMap) {
            $item['balance'] = $balanceMap[$item['id']] ?? 0;
            $carbonDate = Carbon::parse($item['date']);
            $item['date_formatted'] = $carbonDate->isoFormat('D MMMM YYYY');
            return $item;
        });

        return Inertia::render('Kasbons/PrintDetail', [
            'owner' => $ownerData,
            'history' => $history->sortBy('date')->values()->all(),
            'printDate' => now()->translatedFormat('d F Y, H:i'),
        ]);
    }
}

