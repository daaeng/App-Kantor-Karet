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
        Schema::create('penjualan_kavlings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('konsumen_id')->constrained('konsumens')->onDelete('cascade');
            $table->foreignId('blok_kavling_id')->constrained('blok_kavlings')->onDelete('cascade');
            $table->date('tanggal_pemesanan');
            $table->decimal('harga_deal', 15, 2);
            $table->enum('skema_pembayaran', ['Cash Keras', 'Cash Bertahap', 'KPR Bank']);
            $table->enum('status_dokumen_kpr', ['Belum Diajukan', 'Proses Bank', 'Disetujui', 'Ditolak', 'Tidak Pakai KPR'])->default('Tidak Pakai KPR');
            $table->boolean('ppjb_selesai')->default(false);
            $table->boolean('bast_selesai')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjualan_kavlings');
    }
};
