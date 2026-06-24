<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Kasbon;
use App\Models\KasbonPayment;
use App\Models\FinancialTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SyncKasbonToJurnal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:kasbon-jurnal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync historical Kasbon and Kasbon Payments to Financial Transactions (Jurnal Umum)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai sinkronisasi Kasbon ke Jurnal Umum...');
        DB::beginTransaction();

        try {
            $kasbons = Kasbon::where('status', 'Approved')->get();
            $kasbonCount = 0;

            foreach ($kasbons as $kasbon) {
                $refString = "Auto-Kasbon Ref: {$kasbon->id} - Pencairan Kasbon";
                
                $exists = FinancialTransaction::where('description', 'like', "Auto-Kasbon Ref: {$kasbon->id} -%")->exists();

                if (!$exists) {
                    $category = $kasbon->kasbonable_type === 'App\Models\Employee' ? 'Kasbon Pegawai' : 'Kasbon Penoreh';
                    $txDate = $kasbon->transaction_date ? Carbon::parse($kasbon->transaction_date) : $kasbon->created_at;
                    $monthYear = $txDate->format('my');
                    $transactionCode = 'KSB-' . $monthYear;

                    $lastTrx = FinancialTransaction::where('business_unit', FinancialTransaction::BUSINESS_KARET)
                        ->where('transaction_code', $transactionCode)
                        ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
                        ->first();

                    $nextSeq = 1;
                    if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
                        $nextSeq = intval($lastTrx->transaction_number) + 1;
                    }
                    $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

                    FinancialTransaction::create([
                        'business_unit' => FinancialTransaction::BUSINESS_KARET,
                        'type' => 'expense',
                        'source' => 'cash',
                        'category' => $category,
                        'description' => $refString,
                        'amount' => $kasbon->kasbon,
                        'transaction_date' => $txDate,
                        'transaction_code' => $transactionCode,
                        'transaction_number' => $transactionNumber,
                        'db_cr' => 'debit',
                    ]);
                    $kasbonCount++;
                }
            }

            $this->info("Berhasil sinkronisasi {$kasbonCount} data Pencairan Kasbon.");

            $payments = KasbonPayment::all();
            $paymentCount = 0;

            foreach ($payments as $payment) {
                $refString = "Auto-KasbonPayment Ref: {$payment->id} - Pembayaran Kasbon";
                
                $exists = FinancialTransaction::where('description', 'like', "Auto-KasbonPayment Ref: {$payment->id} -%")->exists();

                if (!$exists) {
                    $txDate = $payment->payment_date ? Carbon::parse($payment->payment_date) : $payment->created_at;
                    $monthYear = $txDate->format('my');
                    $transactionCode = 'PKB-' . $monthYear; // Pembayaran KasBon

                    $lastTrx = FinancialTransaction::where('business_unit', FinancialTransaction::BUSINESS_KARET)
                        ->where('transaction_code', $transactionCode)
                        ->orderByRaw('CAST(transaction_number AS UNSIGNED) DESC')
                        ->first();

                    $nextSeq = 1;
                    if ($lastTrx && is_numeric($lastTrx->transaction_number)) {
                        $nextSeq = intval($lastTrx->transaction_number) + 1;
                    }
                    $transactionNumber = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

                    FinancialTransaction::create([
                        'business_unit' => FinancialTransaction::BUSINESS_KARET,
                        'type' => 'income', // Uang masuk kembali ke Kas
                        'source' => 'cash',
                        'category' => 'Pembayaran Kasbon',
                        'description' => $refString,
                        'amount' => $payment->amount,
                        'transaction_date' => $txDate,
                        'transaction_code' => $transactionCode,
                        'transaction_number' => $transactionNumber,
                        'db_cr' => 'debit', // standar cash in GKA
                    ]);
                    $paymentCount++;
                }
            }

            $this->info("Berhasil sinkronisasi {$paymentCount} data Pembayaran Kasbon.");

            DB::commit();
            $this->info('Sinkronisasi selesai!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
