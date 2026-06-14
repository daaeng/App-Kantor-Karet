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
        Schema::create('material_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toko_material_id')->constrained('toko_materials')->onDelete('restrict');
            $table->foreignId('project_phase_id')->nullable()->constrained('project_phases')->onDelete('set null');
            $table->string('nomor_nota');
            $table->date('tanggal_penerimaan');
            $table->decimal('total_harga', 15, 2);
            $table->enum('status_pembayaran', ['Belum Lunas', 'Sebagian', 'Lunas'])->default('Belum Lunas');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_receipts');
    }
};
