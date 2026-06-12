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
        Schema::create('rubber_estimations', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('sebayar_keping')->default(0);
            $table->integer('temadu_keping')->default(0);
            $table->integer('total_keping')->default(0);
            $table->decimal('kg_per_keping', 8, 2)->default(0);
            $table->decimal('total_kg', 10, 2)->default(0);
            $table->decimal('price_per_kg', 15, 2)->default(0);
            $table->integer('profit_sharing')->default(40); // 40 or 50
            $table->decimal('rubber_purchase_total', 15, 2)->default(0);
            $table->decimal('weighing_wage_price', 15, 2)->default(0);
            $table->decimal('weighing_wage_total', 15, 2)->default(0);
            $table->string('meal_allowance_name')->nullable();
            $table->decimal('meal_allowance_price', 15, 2)->default(0);
            $table->integer('meal_allowance_qty')->default(0);
            $table->decimal('meal_allowance_total', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rubber_estimations');
    }
};
