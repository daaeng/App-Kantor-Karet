<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollSetting;
use App\Models\Kasbon;
use App\Models\SalaryHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'period' => 'nullable|date_format:Y-m',
        ]);

        $selectedPeriod = $request->input('period');

        $payrollsQuery = Payroll::query()
            ->with('employee')
            ->when($selectedPeriod, function ($query, $period) {
                return $query->where('payroll_period', $period);
            });

        $statsQuery = clone $payrollsQuery;
        $totalGajiPeriod = $statsQuery->sum('gaji_bersih');
        $jumlahKaryawan = $statsQuery->count();

        $periodeAktif = 'Semua Periode';
        if ($selectedPeriod) {
            $periodeAktif = Carbon::createFromFormat('Y-m', $selectedPeriod)->translatedFormat('F Y');
        }

        $payrolls = $payrollsQuery
            ->orderBy('payroll_period', 'desc')
            ->orderBy('id', 'asc')
            ->paginate(15)
            ->withQueryString();

        $availablePeriods = DB::table('payrolls')
            ->select('payroll_period')
            ->distinct()
            ->orderBy('payroll_period', 'desc')
            ->get()
            ->map(function ($item) {
                $date = Carbon::createFromFormat('Y-m', $item->payroll_period);
                return [
                    'value' => $item->payroll_period,
                    'label' => $date->translatedFormat('F Y'),
                ];
            });

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'availablePeriods' => $availablePeriods,
            'filters' => $request->only(['period']),
            'totalGajiPeriod' => $totalGajiPeriod,
            'jumlahKaryawan' => $jumlahKaryawan,
            'periodeAktif' => $periodeAktif,
        ]);
    }

    public function create()
    {
        return Inertia::render('Payroll/Create');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'period_month' => 'required|integer|between:1,12',
            'period_year' => 'required|integer',
        ]);

        $period = Carbon::create($request->period_year, $request->period_month, 1);
        $periodString = $period->format('Y-m');

        if (Payroll::where('payroll_period', $periodString)->exists()) {
            return redirect()->route('payroll.create')->with('error', 'Penggajian untuk periode ini sudah pernah dibuat.');
        }

        // Ambil karyawan aktif beserta data kasbonnya
        $employees = Employee::where('status', 'active')
            ->with(['kasbons' => function ($query) {
                // Ambil kasbon yang belum lunas atau lunas sebagian
                $query->whereIn('payment_status', ['unpaid', 'partial']);
            }, 'kasbons.payments']) // Load juga payment untuk hitung sisa
            ->get();

        $payrollData = [];

        foreach ($employees as $employee) {
            // 1. Ambil Gaji Pokok langsung dari tabel Employee
            $gajiPokok = $employee->salary ?? 0;

            // 2. Hitung Sisa Hutang Kasbon
            // Rumus: Total Pinjam - Total Sudah Bayar
            $sisaHutang = $employee->kasbons->sum(function ($kasbon) {
                $sudahDibayar = $kasbon->payments->sum('amount');
                return max(0, $kasbon->kasbon - $sudahDibayar);
            });

            // Logika Saran Potongan:
            // Misalnya maksimal potongan adalah 50% dari Gaji Pokok atau Sisa Hutang (mana yang lebih kecil)
            // Agar karyawan tetap bawa pulang uang.
            // Jika ingin memotong SEMUA hutang sekaligus, ganti baris ini jadi: $saranPotongan = $sisaHutang;
            $maxPotongan = $gajiPokok * 0.5;
            $saranPotongan = min($sisaHutang, $maxPotongan);

            $payrollData[] = [
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'gaji_pokok' => (int) $gajiPokok,
                'hari_hadir' => 26, // Default 26 hari kerja (bisa diubah manual nanti)
                'insentif' => 0,
                'potongan_kasbon' => (int) $saranPotongan, // Value otomatis terisi
            ];
        }

        $uangMakanHarian = PayrollSetting::where('setting_key', 'uang_makan_harian')->first()->setting_value ?? 20000;

        return Inertia::render('Payroll/Generate', [
            'payrollData' => $payrollData,
            'period' => $period->translatedFormat('F Y'),
            'period_string' => $periodString,
            'uang_makan_harian' => (int)$uangMakanHarian,
        ]);
    }

    public function store(Request $request)
    {
        // ... (Validasi tetap sama) ...
        $request->validate([
            'payrolls' => 'required|array',
            // ...
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->payrolls as $empPayroll) {
                // ... (Perhitungan Gaji tetap sama) ...
                $gajiPokok = $empPayroll['gaji_pokok'];
                $insentif = $empPayroll['insentif'];
                $uangMakan = $empPayroll['hari_hadir'] * $request->uang_makan_harian;
                $potonganKasbon = $empPayroll['potongan_kasbon'];

                $totalPendapatan = $gajiPokok + $insentif + $uangMakan;
                $totalPotongan = $potonganKasbon;
                $gajiBersih = $totalPendapatan - $totalPotongan;

                // 1. Simpan Data Payroll
                $payroll = Payroll::create([
                    'employee_id' => $empPayroll['employee_id'],
                    'payroll_period' => $request->period_string,
                    'total_pendapatan' => $totalPendapatan,
                    'total_potongan' => $totalPotongan,
                    'gaji_bersih' => $gajiBersih,
                    'status' => 'final', // Langsung final
                    'tanggal_pembayaran' => now(), // Anggap lunas saat generate
                ]);

                // 2. Simpan Rincian Item Gaji (Payroll Items)
                // ... (Code simpan item gaji pokok, uang makan, insentif sama seperti sebelumnya) ...
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Gaji Pokok', 'tipe' => 'pendapatan', 'jumlah' => $gajiPokok]);

                if ($uangMakan > 0) {
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => "Uang Makan ({$empPayroll['hari_hadir']} hari)", 'tipe' => 'pendapatan', 'jumlah' => $uangMakan]);
                }
                if ($insentif > 0) {
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Insentif', 'tipe' => 'pendapatan', 'jumlah' => $insentif]);
                }

                // 3. [FITUR BARU] PROSES PEMBAYARAN KASBON OTOMATIS
                if ($potonganKasbon > 0) {
                    // Catat sebagai item potongan di slip gaji
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Potongan Kasbon', 'tipe' => 'potongan', 'jumlah' => $potonganKasbon]);

                    // Panggil fungsi untuk memotong saldo di tabel kasbon
                    $this->processKasbonPayment($empPayroll['employee_id'], $potonganKasbon, $payroll->id);
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
        return redirect()->route('payroll.index')->with('message', 'Penggajian berhasil disimpan & Kasbon diperbarui.');
    }

    /**
     * Helper: Potong hutang kasbon karyawan secara otomatis (FIFO - Hutang lama lunas duluan)
     */
    private function processKasbonPayment($employeeId, $amountToPay, $payrollId)
    {
        // Ambil kasbon yang belum lunas, urutkan dari yang terlama (FIFO)
        $activeKasbons = \App\Models\Kasbon::where('kasbonable_type', 'App\Models\Employee')
            ->where('kasbonable_id', $employeeId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->orderBy('transaction_date', 'asc') // Bayar hutang lama dulu
            ->get();

        $remainingPayment = $amountToPay;

        foreach ($activeKasbons as $kasbon) {
            if ($remainingPayment <= 0) break;

            // Hitung sisa hutang per transaksi kasbon ini
            $alreadyPaid = $kasbon->payments()->sum('amount');
            $debtBalance = $kasbon->kasbon - $alreadyPaid;

            if ($debtBalance <= 0) {
                // Jika error data (status unpaid tapi saldo 0), update status jadi paid
                $kasbon->update(['payment_status' => 'paid', 'paid_at' => now()]);
                continue;
            }

            // Tentukan berapa yang dibayar untuk kasbon ini
            $paymentAmount = min($remainingPayment, $debtBalance);

            // Buat record pembayaran
            \App\Models\KasbonPayment::create([
                'kasbon_id' => $kasbon->id,
                'amount' => $paymentAmount,
                'payment_date' => now(),
                'notes' => "Potong Gaji (Payroll ID: #$payrollId)"
            ]);

            // Kurangi sisa uang yang dialokasikan untuk bayar
            $remainingPayment -= $paymentAmount;

            // Cek apakah kasbon ini sudah lunas sepenuhnya?
            $newTotalPaid = $alreadyPaid + $paymentAmount;
            if ($newTotalPaid >= $kasbon->kasbon) {
                $kasbon->update([
                    'payment_status' => 'paid',
                    'paid_at' => now()
                ]);
            } else {
                $kasbon->update([
                    'payment_status' => 'partial'
                ]);
            }
        }
    }

    public function show(Payroll $payroll)
    {
        $payroll->load(['employee', 'items']);
        return Inertia::render('Payroll/Show', ['payroll' => $payroll]);
    }

    public function edit(Payroll $payroll)
    {
        $payroll->load('items', 'employee');

        $gajiPokok = $payroll->items->where('deskripsi', 'Gaji Pokok')->first()->jumlah ?? 0;
        $insentif = $payroll->items->where('deskripsi', 'Insentif')->first()->jumlah ?? 0;
        $potonganKasbon = $payroll->items->where('deskripsi', 'Potongan Kasbon')->first()->jumlah ?? 0;

        $uangMakanItem = $payroll->items->first(function ($item) {
            return str_starts_with($item->deskripsi, 'Uang Makan');
        });

        $hariHadir = 0;
        if ($uangMakanItem) {
            preg_match('/\((\d+)\s*hari\)/', $uangMakanItem->deskripsi, $matches);
            $hariHadir = $matches[1] ?? 0;
        }

        $uangMakanHarian = PayrollSetting::where('setting_key', 'uang_makan_harian')->first()->setting_value ?? 20000;

        return Inertia::render('Payroll/Edit', [
            'payroll' => [
                'id' => $payroll->id,
                'status' => $payroll->status,
                'payroll_period' => $payroll->payroll_period,
                'employee_name' => $payroll->employee->name,
                'gaji_pokok' => $gajiPokok,
                'hari_hadir' => (int)$hariHadir,
                'insentif' => $insentif,
                'potongan_kasbon' => $potonganKasbon,
            ],
            'uang_makan_harian' => (int)$uangMakanHarian
        ]);
    }

    public function update(Request $request, Payroll $payroll)
    {
        $request->validate([
            'status' => ['required', Rule::in(['draft', 'final', 'paid'])],
            'gaji_pokok' => 'required|numeric|min:0',
            'hari_hadir' => 'required|integer|min:0',
            'insentif' => 'required|numeric|min:0',
            'potongan_kasbon' => 'required|numeric|min:0',
            'uang_makan_harian' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $gajiPokok = $request->gaji_pokok;
            $insentif = $request->insentif;
            $uangMakan = $request->hari_hadir * $request->uang_makan_harian;
            $potonganKasbon = $request->potongan_kasbon;

            $totalPendapatan = $gajiPokok + $insentif + $uangMakan;
            $totalPotongan = $potonganKasbon;
            $gajiBersih = $totalPendapatan - $totalPotongan;

            $payroll->update([
                'total_pendapatan' => $totalPendapatan,
                'total_potongan' => $totalPotongan,
                'gaji_bersih' => $gajiBersih,
                'status' => $request->status,
                'tanggal_pembayaran' => $request->status === 'paid' ? now() : null,
            ]);

            $payroll->items()->delete();

            PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Gaji Pokok', 'tipe' => 'pendapatan', 'jumlah' => $gajiPokok]);

            if ($uangMakan > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => "Uang Makan ({$request->hari_hadir} hari)", 'tipe' => 'pendapatan', 'jumlah' => $uangMakan]);
            }
            if ($insentif > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Insentif', 'tipe' => 'pendapatan', 'jumlah' => $insentif]);
            }
            if ($potonganKasbon > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Potongan Kasbon', 'tipe' => 'potongan', 'jumlah' => $potonganKasbon]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payroll Update Failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage());
        }

        return redirect()->route('payroll.index')->with('message', 'Data penggajian berhasil diperbarui.');
    }

    /**
     * Cetak Slip Gaji (Tab Baru)
     */
    public function printSlip(Payroll $payroll)
    {
        $payroll->load(['employee', 'items']);

        return Inertia::render('Payroll/PrintSlip', [
            'payroll' => $payroll,
            'company_name' => 'PT. Garuda Karya Amanat', // Bisa diambil dari setting
        ]);
    }

    /**
     * Hapus Data Gaji
     */
    public function destroy(Payroll $payroll)
    {
        DB::beginTransaction();
        try {
            // 1. BATALKAN PEMBAYARAN KASBON (PENTING!)
            // Kita cari pembayaran kasbon yang punya catatan ID Payroll ini
            // Format notes di method store: "Potong Gaji (Payroll ID: #...)"
            $relatedPayments = \App\Models\KasbonPayment::where('notes', 'LIKE', "%Payroll ID: #{$payroll->id})")->get();

            foreach ($relatedPayments as $payment) {
                $kasbon = $payment->kasbon;

                // Hapus data pembayaran ini
                $payment->delete();

                // Cek ulang status Kasbon Induk
                // Hitung total bayar tersisa (jika ada cicilan lain)
                $totalPaidNow = $kasbon->payments()->sum('amount');

                if ($totalPaidNow <= 0) {
                    // Kalau jadi 0, berarti kembali 'unpaid'
                    $kasbon->update(['payment_status' => 'unpaid', 'paid_at' => null]);
                } else {
                    // Kalau masih ada cicilan lain, berarti 'partial'
                    $kasbon->update(['payment_status' => 'partial', 'paid_at' => null]);
                }
            }

            // 2. Hapus Rincian Item Gaji (Payroll Items)
            $payroll->items()->delete();

            // 3. Hapus Data Payroll Utama
            $payroll->delete();

            DB::commit();
            return redirect()->back()->with('message', 'Data gaji berhasil dihapus. Status kasbon pegawai telah dikembalikan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
