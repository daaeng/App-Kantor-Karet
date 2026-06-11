<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollSetting;
use App\Models\Kasbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $month = $request->input('month', $currentMonth);
        $year = $request->input('year', $currentYear);
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');

        $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);

        $payrollsQuery = Payroll::query()
            ->with(['employee', 'items'])
            ->where('payroll_period', $periodString);

        if (!empty($search)) {
            $payrollsQuery->whereHas('employee', function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            });
        }

        if ($status !== 'all') {
            $payrollsQuery->where('status', $status);
        }

        $basePeriodQuery = Payroll::where('payroll_period', $periodString);
        $totalGajiPeriod = $basePeriodQuery->sum('gaji_bersih');
        $jumlahKaryawan = $basePeriodQuery->count();
        $totalDraft = $basePeriodQuery->clone()->where('status', 'draft')->count();
        $totalFinal = $basePeriodQuery->clone()->whereIn('status', ['final', 'paid'])->count();

        $payrolls = $payrollsQuery
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $payrolls->getCollection()->transform(function ($item) {
            return $item;
        });

        $periodeAktif = Carbon::createFromFormat('Y-m', $periodString)->translatedFormat('F Y');

        $uangMakanHarian = PayrollSetting::where('setting_key', 'uang_makan_harian')->first()->setting_value ?? 20000;

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'filters' => [
                'month' => (string) $month,
                'year' => (string) $year,
                'search' => $search,
                'status' => $status,
            ],
            'summary' => [
                'totalGajiPeriod' => $totalGajiPeriod,
                'jumlahKaryawan' => $jumlahKaryawan,
                'totalDraft' => $totalDraft,
                'totalFinal' => $totalFinal,
            ],
            'periodeAktif' => $periodeAktif,
            'uangMakanHarian' => (int) $uangMakanHarian
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

        $employees = Employee::where('status', 'active')
            ->with(['kasbons' => function ($query) {
                $query->whereIn('payment_status', ['unpaid', 'partial']);
            }, 'kasbons.payments'])
            ->get();

        $payrollData = [];

        foreach ($employees as $employee) {
            $gajiPokok = $employee->salary ?? 0;

            $sisaHutang = $employee->kasbons->sum(function ($kasbon) {
                $sudahDibayar = $kasbon->payments->sum('amount');
                return max(0, $kasbon->kasbon - $sudahDibayar);
            });

            $maxPotongan = $gajiPokok * 0.5;
            $saranPotongan = min($sisaHutang, $maxPotongan);

            $payrollData[] = [
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'gaji_pokok' => (int) $gajiPokok,
                'hari_hadir' => 0,
                'insentif' => 0,
                'potongan_kasbon' => (int) $saranPotongan,
                'is_paid' => true,
                'uang_makan_rate' => 0,
            ];
        }

        return Inertia::render('Payroll/Generate', [
            'payrollData' => $payrollData,
            'period' => $period->translatedFormat('F Y'),
            'period_string' => $periodString,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'payrolls' => 'required|array',
            'period_string' => 'required|string',
        ]);

        $includeGaji = $request->boolean('include_gaji', true);
        $includeMakan = $request->boolean('include_makan', true);
        $includeKasbon = $request->boolean('include_kasbon', true);

        DB::beginTransaction();
        try {
            foreach ($request->payrolls as $empPayroll) {
                $isPaid = $empPayroll['is_paid'] ?? true;
                if (!$isPaid) continue;

                $gajiPokok = $includeGaji ? (int)$empPayroll['gaji_pokok'] : 0;
                $insentif = (int)$empPayroll['insentif'];
                $hariHadir = (int)$empPayroll['hari_hadir'];
                $rateMakan = (int)($empPayroll['uang_makan_rate'] ?? 0);
                $uangMakan = $includeMakan ? ($hariHadir * $rateMakan) : 0;
                $potonganKasbon = $includeKasbon ? (int)$empPayroll['potongan_kasbon'] : 0;

                $totalPendapatan = $gajiPokok + $insentif + $uangMakan;
                $totalPotongan = $potonganKasbon;
                $gajiBersih = $totalPendapatan - $totalPotongan;

                if ($totalPendapatan == 0 && $totalPotongan == 0) continue;

                $payroll = Payroll::create([
                    'employee_id' => $empPayroll['employee_id'],
                    'payroll_period' => $request->period_string,
                    'total_pendapatan' => $totalPendapatan,
                    'total_potongan' => $totalPotongan,
                    'gaji_bersih' => $gajiBersih,
                    'status' => 'final',
                    'tanggal_pembayaran' => now(),
                ]);

                if ($gajiPokok > 0) {
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Gaji Pokok', 'tipe' => 'pendapatan', 'jumlah' => $gajiPokok]);
                }

                if ($uangMakan > 0) {
                    $formattedRate = number_format($rateMakan, 0, ',', '.');
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'deskripsi' => "Uang Makan ({$hariHadir} hari x Rp {$formattedRate})",
                        'tipe' => 'pendapatan',
                        'jumlah' => $uangMakan
                    ]);
                }

                if ($insentif > 0) {
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Insentif', 'tipe' => 'pendapatan', 'jumlah' => $insentif]);
                }

                if ($potonganKasbon > 0) {
                    PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Potongan Kasbon', 'tipe' => 'potongan', 'jumlah' => $potonganKasbon]);
                    $this->processKasbonPayment($empPayroll['employee_id'], $potonganKasbon, $payroll->id);
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
        return redirect()->route('payroll.index')->with('success', 'Penggajian berhasil disimpan.');
    }

    private function processKasbonPayment($employeeId, $amountToPay, $payrollId)
    {
        $activeKasbons = \App\Models\Kasbon::where('kasbonable_type', 'App\Models\Employee')
            ->where('kasbonable_id', $employeeId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->orderBy('transaction_date', 'asc')
            ->get();

        $remainingPayment = $amountToPay;

        foreach ($activeKasbons as $kasbon) {
            if ($remainingPayment <= 0) break;

            $alreadyPaid = $kasbon->payments()->sum('amount');
            $debtBalance = $kasbon->kasbon - $alreadyPaid;

            if ($debtBalance <= 0) {
                $kasbon->update(['payment_status' => 'paid', 'paid_at' => now()]);
                continue;
            }

            $paymentAmount = min($remainingPayment, $debtBalance);

            \App\Models\KasbonPayment::create([
                'kasbon_id' => $kasbon->id,
                'amount' => $paymentAmount,
                'payment_date' => now(),
                'notes' => "Potong Gaji (Payroll ID: #$payrollId)"
            ]);

            $remainingPayment -= $paymentAmount;

            $newTotalPaid = $alreadyPaid + $paymentAmount;
            if ($newTotalPaid >= $kasbon->kasbon) {
                $kasbon->update(['payment_status' => 'paid', 'paid_at' => now()]);
            } else {
                $kasbon->update(['payment_status' => 'partial']);
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
        return Inertia::render('Payroll/Edit', ['payroll' => $payroll, 'uang_makan_harian' => 0]);
    }

    public function update(Request $request, Payroll $payroll)
    {
        $request->validate([
            'hari_hadir'      => 'required|integer|min:0',
            'insentif'        => 'required|integer|min:0',
            'potongan_kasbon' => 'required|integer|min:0',
            'status'          => ['required', Rule::in(['draft', 'final', 'paid'])],
        ]);

        DB::beginTransaction();
        try {
            $hariHadir      = (int)$request->hari_hadir;
            $insentif       = (int)$request->insentif;
            $potonganKasbon = (int)$request->potongan_kasbon;
            $status         = $request->status;

            $gajiPokok = $payroll->items()->where('tipe', 'pendapatan')->where('deskripsi', 'Gaji Pokok')->first()->jumlah ?? 0;
            $uangMakanHarian = PayrollSetting::where('setting_key', 'uang_makan_harian')->first()->setting_value ?? 20000;
            $uangMakan = $hariHadir * $uangMakanHarian;

            $totalPendapatan = $gajiPokok + $insentif + $uangMakan;
            $totalPotongan   = $potonganKasbon;
            $gajiBersih      = $totalPendapatan - $totalPotongan;

            $payroll->update([
                'total_pendapatan' => $totalPendapatan,
                'total_potongan'   => $totalPotongan,
                'gaji_bersih'      => $gajiBersih,
                'status'           => $status,
                'tanggal_pembayaran' => $status === 'paid' ? now() : $payroll->tanggal_pembayaran,
            ]);

            $payroll->items()->delete();

            if ($gajiPokok > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Gaji Pokok', 'tipe' => 'pendapatan', 'jumlah' => $gajiPokok]);
            }
            if ($uangMakan > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => "Uang Makan ({$hariHadir} hari x Rp " . number_format($uangMakanHarian, 0, ',', '.') . ")", 'tipe' => 'pendapatan', 'jumlah' => $uangMakan]);
            }
            if ($insentif > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Insentif', 'tipe' => 'pendapatan', 'jumlah' => $insentif]);
            }
            if ($potonganKasbon > 0) {
                PayrollItem::create(['payroll_id' => $payroll->id, 'deskripsi' => 'Potongan Kasbon', 'tipe' => 'potongan', 'jumlah' => $potonganKasbon]);

                if ($status === 'paid') {
                    $this->processKasbonPayment($payroll->employee_id, $potonganKasbon, $payroll->id);
                }
            }

            DB::commit();
            return redirect()->route('payroll.index')->with('success', 'Data penggajian berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui data: ' . $e->getMessage());
        }
    }

    public function printSlip(Payroll $payroll)
    {
        $payroll->load(['employee', 'items']);
        return Inertia::render('Payroll/PrintSlip', ['payroll' => $payroll, 'company_name' => 'PT. Garuda Karya Amanat']);
    }

    public function bulkPrint(Request $request)
    {
        $type = $request->input('type', 'slip'); // 'slip' or 'receipt'
        $month = $request->input('month');
        $year = $request->input('year');
        $ids = $request->input('ids'); // comma separated

        $query = Payroll::with(['employee', 'items']);

        if (!empty($ids)) {
            $idArray = explode(',', $ids);
            $query->whereIn('id', $idArray);
            
            // to get period string for the view
            $firstPayroll = Payroll::whereIn('id', $idArray)->first();
            $periodString = $firstPayroll ? $firstPayroll->payroll_period : Carbon::now()->format('Y-m');
        } else {
            if ($month && $year) {
                $periodString = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            } else {
                $currentMonth = Carbon::now()->month;
                $currentYear = Carbon::now()->year;
                $periodString = $currentYear . '-' . str_pad($currentMonth, 2, '0', STR_PAD_LEFT);
            }
            $query->where('payroll_period', $periodString);
        }

        $payrolls = $query->get();
        $formattedPeriod = Carbon::createFromFormat('Y-m', $periodString)->translatedFormat('F Y');

        if ($type === 'receipt') {
            return Inertia::render('Payroll/PrintReceiptBulk', [
                'payrolls' => $payrolls,
                'company_name' => 'PT. Garuda Karya Amanat',
                'period_string' => $formattedPeriod
            ]);
        }

        return Inertia::render('Payroll/PrintSlipBulk', [
            'payrolls' => $payrolls,
            'company_name' => 'PT. Garuda Karya Amanat'
        ]);
    }

    public function destroy(Payroll $payroll)
    {
        DB::beginTransaction();
        try {
            $relatedPayments = \App\Models\KasbonPayment::where('notes', 'LIKE', "%Payroll ID: #{$payroll->id})")->get();
            foreach ($relatedPayments as $payment) {
                $kasbon = $payment->kasbon;
                $payment->delete();
                $totalPaidNow = $kasbon->payments()->sum('amount');
                $kasbon->update(['payment_status' => $totalPaidNow <= 0 ? 'unpaid' : 'partial', 'paid_at' => null]);
            }
            $payroll->items()->delete();
            $payroll->delete();
            DB::commit();
            return redirect()->back()->with('success', 'Data gaji berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
