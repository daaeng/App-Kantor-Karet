<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MaterialReceipt;
use App\Models\FinancialTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SyncMaterialReceiptToJurnal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:material-receipt-jurnal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync historical Material Receipts to Financial Transactions (Jurnal Umum)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai sinkronisasi Nota Penerimaan ke Jurnal Umum...');
        DB::beginTransaction();

        try {
            $receipts = MaterialReceipt::with('tokoMaterial', 'projectPhase')->get();
            $receiptCount = 0;

            foreach ($receipts as $receipt) {
                $exists = FinancialTransaction::where('material_receipt_id', $receipt->id)->exists();

                if (!$exists) {
                    $businessUnit = $receipt->business_unit === 'properti' ? 'realestate' : 'karet';
                    $category = $businessUnit === 'realestate' ? 'Material Bangunan' : 'Pembelian Material Supplier';
                    $txDate = Carbon::parse($receipt->tanggal_penerimaan);
                    $monthYear = $txDate->format('my');
                    $prefix = $businessUnit === 'realestate' ? 'MTB' : 'PMS';
                    $transactionCode = $prefix . '-' . $monthYear;

                    $lastTrx = FinancialTransaction::where('business_unit', $businessUnit)
                        ->where('transaction_code', $transactionCode)
                        ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
                        ->first();

                    $nextSeq = 1;
                    if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
                        $nextSeq = intval($lastTrx->transaction_number) + 1;
                    }
                    $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

                    FinancialTransaction::create([
                        'business_unit'         => $businessUnit,
                        'type'                  => 'expense',
                        'source'                => $receipt->status_pembayaran === 'Lunas' ? 'cash' : 'bank',
                        'category'              => $category,
                        'description'           => "Pembelian material nota {$receipt->nomor_nota} - {$receipt->tokoMaterial?->nama_toko}",
                        'amount'                => $receipt->total_harga,
                        'transaction_date'      => $txDate,
                        'transaction_code'      => $transactionCode,
                        'transaction_number'    => $transactionNumber,
                        'db_cr'                 => 'debit',
                        'counterparty'          => $receipt->tokoMaterial?->nama_toko,
                        'housing_project_id'    => $receipt->projectPhase?->housing_project_id,
                        'material_receipt_id'   => $receipt->id,
                    ]);
                    $receiptCount++;
                }
            }

            $this->info("Berhasil sinkronisasi {$receiptCount} data Nota Penerimaan.");
            DB::commit();
            $this->info('Sinkronisasi selesai!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
