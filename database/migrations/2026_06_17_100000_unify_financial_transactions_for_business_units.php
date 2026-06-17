<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->enum('business_unit', ['karet', 'realestate'])->default('karet')->after('id');
            $table->foreignId('housing_project_id')->nullable()->after('counterparty')->constrained('housing_projects')->nullOnDelete();
            $table->foreignId('penjualan_kavling_id')->nullable()->after('housing_project_id')->constrained('penjualan_kavlings')->nullOnDelete();
            $table->foreignId('material_receipt_id')->nullable()->after('penjualan_kavling_id')->constrained('material_receipts')->nullOnDelete();
        });

        // Tandai transaksi karet yang sudah ada
        DB::table('financial_transactions')->update(['business_unit' => 'karet']);

        // Migrasi data dari transaksi_keuangans jika tabel ada
        if (Schema::hasTable('transaksi_keuangans')) {
            $rows = DB::table('transaksi_keuangans')->orderBy('id')->get();

            foreach ($rows as $row) {
                DB::table('financial_transactions')->insert([
                    'business_unit' => 'realestate',
                    'type' => $row->tipe_transaksi === 'Pemasukan' ? 'income' : 'expense',
                    'source' => 'cash',
                    'category' => $row->kategori,
                    'description' => $row->keterangan,
                    'amount' => $row->nominal,
                    'transaction_date' => $row->tanggal,
                    'db_cr' => $row->tipe_transaksi === 'Pemasukan' ? 'debit' : 'credit',
                    'housing_project_id' => $row->housing_project_id,
                    'penjualan_kavling_id' => $row->penjualan_kavling_id,
                    'material_receipt_id' => $row->material_receipt_id,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);
            }

            Schema::dropIfExists('transaksi_keuangans');
        }
    }

    public function down(): void
    {
        Schema::create('transaksi_keuangans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_project_id')->nullable()->constrained('housing_projects')->onDelete('cascade');
            $table->enum('tipe_transaksi', ['Pemasukan', 'Pengeluaran']);
            $table->string('kategori');
            $table->date('tanggal');
            $table->decimal('nominal', 15, 2);
            $table->text('keterangan')->nullable();
            $table->foreignId('penjualan_kavling_id')->nullable()->constrained('penjualan_kavlings')->onDelete('set null');
            $table->foreignId('material_receipt_id')->nullable()->constrained('material_receipts')->onDelete('set null');
            $table->timestamps();
        });

        $reRows = DB::table('financial_transactions')
            ->where('business_unit', 'realestate')
            ->orderBy('id')
            ->get();

        foreach ($reRows as $row) {
            DB::table('transaksi_keuangans')->insert([
                'housing_project_id' => $row->housing_project_id,
                'tipe_transaksi' => $row->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                'kategori' => $row->category,
                'tanggal' => $row->transaction_date,
                'nominal' => $row->amount,
                'keterangan' => $row->description,
                'penjualan_kavling_id' => $row->penjualan_kavling_id,
                'material_receipt_id' => $row->material_receipt_id,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        DB::table('financial_transactions')->where('business_unit', 'realestate')->delete();

        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropForeign(['housing_project_id']);
            $table->dropForeign(['penjualan_kavling_id']);
            $table->dropForeign(['material_receipt_id']);
            $table->dropColumn([
                'business_unit',
                'housing_project_id',
                'penjualan_kavling_id',
                'material_receipt_id',
            ]);
        });
    }
};
