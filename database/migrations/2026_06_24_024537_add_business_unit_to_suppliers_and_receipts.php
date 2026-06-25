<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah kolom business_unit ke toko_materials
        Schema::table('toko_materials', function (Blueprint $table) {
            $table->enum('business_unit', ['properti', 'karet'])->default('properti')->after('id');
        });

        // Tambah kolom business_unit ke material_receipts
        Schema::table('material_receipts', function (Blueprint $table) {
            $table->enum('business_unit', ['properti', 'karet'])->default('properti')->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('toko_materials', function (Blueprint $table) {
            $table->dropColumn('business_unit');
        });

        Schema::table('material_receipts', function (Blueprint $table) {
            $table->dropColumn('business_unit');
        });
    }
};
