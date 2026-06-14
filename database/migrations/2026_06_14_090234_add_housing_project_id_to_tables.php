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
            $table->foreignId('housing_project_id')->nullable()->constrained('housing_projects')->onDelete('cascade');
        });
        Schema::table('project_phases', function (Blueprint $table) {
            $table->foreignId('housing_project_id')->nullable()->constrained('housing_projects')->onDelete('cascade');
        });
        Schema::table('tipe_rumahs', function (Blueprint $table) {
            $table->foreignId('housing_project_id')->nullable()->constrained('housing_projects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
