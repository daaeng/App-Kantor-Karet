<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksi_keuangans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_project_id')->nullable()->constrained('housing_projects')->onDelete('cascade');
            $table->enum('tipe_transaksi', ['Pemasukan', 'Pengeluaran']);
            $table->string('kategori'); // Booking Fee, DP, Pelunasan Material, Tukang, dll.
            $table->date('tanggal');
            $table->decimal('nominal', 15, 2);
            $table->text('keterangan')->nullable();
            $table->foreignId('penjualan_kavling_id')->nullable()->constrained('penjualan_kavlings')->onDelete('set null');
            $table->foreignId('material_receipt_id')->nullable()->constrained('material_receipts')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_keuangans');
    }
};
