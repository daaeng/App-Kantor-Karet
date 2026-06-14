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
        Schema::create('blok_kavlings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipe_rumah_id')->constrained('tipe_rumahs')->onDelete('cascade');
            $table->string('nomor_blok');
            $table->integer('luas_tanah_aktual');
            $table->decimal('harga_jual_final', 15, 2);
            $table->enum('status_jual', ['Tersedia', 'Booking', 'Sold Out'])->default('Tersedia');
            $table->enum('status_konstruksi', ['Belum Dibangun', 'Sedang Dibangun', 'Selesai'])->default('Belum Dibangun');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blok_kavlings');
    }
};
