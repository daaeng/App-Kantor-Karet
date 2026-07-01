<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaterialReceipt;
use App\Models\MaterialReceiptPayment;
use App\Models\TokoMaterial;
use App\Models\ProjectPhase;
use App\Models\FinancialTransaction;
use Inertia\Inertia;
use Carbon\Carbon;
use DB;

class MaterialReceiptController extends Controller
{
    public function index()
    {
        $receipts  = MaterialReceipt::with(['tokoMaterial', 'projectPhase', 'payments'])->latest()->get();
        $suppliers = TokoMaterial::latest()->get();
        $phases    = ProjectPhase::where('status', '!=', 'Selesai')->get();

        return Inertia::render('RealEstate/MaterialReceipt/Index', [
            'receipts'  => $receipts,
            'suppliers' => $suppliers,
            'phases'    => $phases,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_unit'      => 'required|in:properti,karet',
            'toko_material_id'   => 'required|exists:toko_materials,id',
            'project_phase_id'   => 'nullable|exists:project_phases,id',
            'nomor_nota'         => 'required|string|max:255',
            'tanggal_penerimaan' => 'required|date',
            'total_harga'        => 'required|numeric|min:0',
            'status_pembayaran'  => 'required|in:Belum Lunas,Sebagian,Lunas',
            'payment_method'     => 'required|in:cash,bank,credit',
            'keterangan'         => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $materialReceipt = MaterialReceipt::create($validated);
            $this->createOrUpdateFinancialTransaction($materialReceipt);
            $this->updateSupplierHutang($validated['toko_material_id']);
            DB::commit();
            return redirect()->back()->with('success', 'Nota Penerimaan berhasil dicatat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mencatat nota: ' . $e->getMessage());
        }
    }

    public function update(Request $request, MaterialReceipt $materialReceipt)
    {
        $validated = $request->validate([
            'business_unit'      => 'required|in:properti,karet',
            'toko_material_id'   => 'required|exists:toko_materials,id',
            'project_phase_id'   => 'nullable|exists:project_phases,id',
            'nomor_nota'         => 'required|string|max:255',
            'tanggal_penerimaan' => 'required|date',
            'total_harga'        => 'required|numeric|min:0',
            'status_pembayaran'  => 'required|in:Belum Lunas,Sebagian,Lunas',
            'payment_method'     => 'required|in:cash,bank,credit',
            'keterangan'         => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $oldSupplierId = $materialReceipt->toko_material_id;
            $materialReceipt->update($validated);
            $this->createOrUpdateFinancialTransaction($materialReceipt);

            $this->updateSupplierHutang($oldSupplierId);
            if ($oldSupplierId != $validated['toko_material_id']) {
                $this->updateSupplierHutang($validated['toko_material_id']);
            }
            DB::commit();
            return redirect()->back()->with('success', 'Nota Penerimaan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui nota: ' . $e->getMessage());
        }
    }

    public function destroy(MaterialReceipt $materialReceipt)
    {
        DB::beginTransaction();
        try {
            // Delete related financial transactions
            FinancialTransaction::where('material_receipt_id', $materialReceipt->id)->delete();

            $supplierId = $materialReceipt->toko_material_id;
            $materialReceipt->delete();
            $this->updateSupplierHutang($supplierId);
            DB::commit();
            return redirect()->back()->with('success', 'Nota Penerimaan berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus nota: ' . $e->getMessage());
        }
    }

    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'receipt_ids'    => 'required|array|min:1',
            'receipt_ids.*'  => 'exists:material_receipts,id',
            'total_amount'   => 'required|numeric|min:0',
            'source'         => 'required|in:cash,bank',
            'payment_date'   => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $receipts = MaterialReceipt::whereIn('id', $validated['receipt_ids'])->get();
            $totalRemainingAll = $receipts->sum(fn($r) => max(0, $r->total_harga - $r->total_paid));

            if ($validated['total_amount'] > $totalRemainingAll) {
                return redirect()->back()->with('error', 'Jumlah pembayaran melebihi total hutang yang dipilih.');
            }

            $remainingToAllocate = $validated['total_amount'];
            $payments = [];

            // Alokasikan pembayaran ke setiap nota secara proporsional atau sesuai sisa
            foreach ($receipts as $receipt) {
                $remaining = max(0, $receipt->total_harga - $receipt->total_paid);
                if ($remaining <= 0 || $remainingToAllocate <= 0) continue;

                $allocate = min($remaining, $remainingToAllocate);
                $payments[] = ['receipt' => $receipt, 'amount' => $allocate];
                $remainingToAllocate -= $allocate;
            }

            foreach ($payments as $paymentData) {
                $receipt = $paymentData['receipt'];
                $amount = $paymentData['amount'];

                // Generate transaction number
                [$code, $number] = $this->generateTransactionNumber('Pembayaran Hutang Supplier', $validated['payment_date']);

                // Buat financial transaction
                $financialTrans = FinancialTransaction::create([
                    'business_unit'         => $receipt->business_unit === 'properti' ? 'realestate' : 'karet',
                    'type'                  => 'expense',
                    'source'                => $validated['source'],
                    'category'              => 'Pembayaran Hutang Supplier',
                    'description'           => "Pembayaran hutang nota {$receipt->nomor_nota} - {$receipt->tokoMaterial->nama_toko}",
                    'amount'                => $amount,
                    'transaction_date'      => $validated['payment_date'],
                    'transaction_code'      => $code,
                    'transaction_number'    => $number,
                    'db_cr'                 => 'credit',
                    'counterparty'          => $receipt->tokoMaterial->nama_toko,
                    'housing_project_id'    => $receipt->projectPhase?->housing_project_id,
                    'project_phase_id'      => $receipt->project_phase_id,
                    'material_receipt_id'   => $receipt->id,
                ]);

                // Buat payment record
                MaterialReceiptPayment::create([
                    'material_receipt_id'      => $receipt->id,
                    'financial_transaction_id' => $financialTrans->id,
                    'amount'                   => $amount,
                    'source'                   => $validated['source'],
                    'payment_date'             => $validated['payment_date'],
                    'notes'                    => $validated['notes'] ?? null,
                ]);

                // Update total paid dan status
                $newTotalPaid = $receipt->total_paid + $amount;
                $newStatus = 'Lunas';
                if ($newTotalPaid < $receipt->total_harga) {
                    $newStatus = $newTotalPaid > 0 ? 'Sebagian' : 'Belum Lunas';
                }

                $receipt->update([
                    'total_paid'       => $newTotalPaid,
                    'status_pembayaran' => $newStatus,
                ]);

                $this->updateSupplierHutang($receipt->toko_material_id);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Pembayaran berhasil diproses.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
        }
    }

    private function createOrUpdateFinancialTransaction(MaterialReceipt $receipt): void
    {
        // Find existing financial transaction for this receipt
        $existingTransaction = FinancialTransaction::where('material_receipt_id', $receipt->id)
            ->where('category', $receipt->business_unit === 'properti' ? 'Material Bangunan' : 'Pembelian Material Supplier')
            ->first();

        $businessUnit = $receipt->business_unit === 'properti' ? 'realestate' : 'karet';
        $category = $businessUnit === 'realestate' ? 'Material Bangunan' : 'Pembelian Material Supplier';
        [$code, $number] = $this->generateTransactionNumber($category, $receipt->tanggal_penerimaan);

        $source = $receipt->payment_method === 'credit' ? 'bank' : $receipt->payment_method;

        $transactionData = [
            'business_unit'         => $businessUnit,
            'type'                  => 'expense',
            'source'                => $source,
            'category'              => $category,
            'description'           => "Pembelian material nota {$receipt->nomor_nota} - {$receipt->tokoMaterial->nama_toko}",
            'amount'                => $receipt->total_harga,
            'transaction_date'      => $receipt->tanggal_penerimaan,
            'db_cr'                 => 'debit',
            'counterparty'          => $receipt->tokoMaterial->nama_toko,
            'housing_project_id'    => $receipt->projectPhase?->housing_project_id,
            'project_phase_id'      => $receipt->project_phase_id,
            'material_receipt_id'   => $receipt->id,
        ];

        if ($existingTransaction) {
            $transactionData['transaction_code'] = $existingTransaction->transaction_code;
            $transactionData['transaction_number'] = $existingTransaction->transaction_number;
            $existingTransaction->update($transactionData);
        } else {
            $transactionData['transaction_code'] = $code;
            $transactionData['transaction_number'] = $number;
            FinancialTransaction::create($transactionData);
        }
    }

    private function generateTransactionNumber(string $category, string $date): array
    {
        $prefix = match ($category) {
            'Booking Fee' => 'BFE',
            'DP Kavling' => 'DPK',
            'Cicilan DP' => 'CDP',
            'Pencairan KPR' => 'KPR',
            'Pelunasan Material' => 'PLM',
            'Upah Tukang' => 'UTK',
            'Material Bangunan' => 'MTB',
            'Overhead Proyek' => 'OVP',
            'Marketing' => 'MKT',
            'Pendapatan Lain' => 'PDL',
            'Pembelian Material Supplier' => 'PMS',
            'Pembayaran Hutang Supplier' => 'PHS',
            default => 'RE',
        };

        $monthYear = Carbon::parse($date)->format('my');
        $transactionCode = $prefix . '-' . $monthYear;
        $businessUnit = in_array($prefix, ['BFE', 'DPK', 'CDP', 'KPR', 'PLM', 'UTK', 'MTB', 'OVP', 'MKT', 'PDL'])
            ? FinancialTransaction::BUSINESS_REALESTATE
            : FinancialTransaction::BUSINESS_KARET;

        $lastTrx = FinancialTransaction::where('business_unit', $businessUnit)
            ->where('transaction_code', $transactionCode)
            ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
            ->first();

        $nextSeq = 1;
        if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
            $nextSeq = (int) $lastTrx->transaction_number + 1;
        }

        return [$transactionCode, str_pad($nextSeq, 3, '0', STR_PAD_LEFT)];
    }

    private function updateSupplierHutang($tokoId)
    {
        $toko = TokoMaterial::find($tokoId);
        if ($toko) {
            $totalHutang = MaterialReceipt::where('toko_material_id', $tokoId)
                ->selectRaw('SUM(total_harga - total_paid) as remaining')
                ->first()
                ->remaining ?? 0;
            $toko->update(['total_hutang' => max(0, $totalHutang)]);
        }
    }
}
