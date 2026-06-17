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
        Schema::table('blok_kavlings', function (Blueprint $table) {
            $table->decimal('x_coord', 8, 4)->nullable()->after('keterangan');
            $table->decimal('y_coord', 8, 4)->nullable()->after('x_coord');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blok_kavlings', function (Blueprint $table) {
            $table->dropColumn(['x_coord', 'y_coord']);
        });
    }
};
