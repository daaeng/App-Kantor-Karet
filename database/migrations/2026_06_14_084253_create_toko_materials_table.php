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
        Schema::create('toko_materials', function (Blueprint $table) {
            $table->id();
            $table->string('nama_toko');
            $table->string('nomor_telepon')->nullable();
            $table->text('alamat')->nullable();
            $table->decimal('total_hutang', 15, 2)->default(0);
            $table->decimal('total_dibayar', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toko_materials');
    }
};
