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
        Schema::create('tipe_rumahs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tipe');
            $table->integer('luas_bangunan');
            $table->integer('luas_tanah_standar');
            $table->decimal('harga_standar', 15, 2);
            $table->decimal('rab_standar', 15, 2)->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipe_rumahs');
    }
};
