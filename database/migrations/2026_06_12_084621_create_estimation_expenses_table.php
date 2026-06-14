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
        Schema::create('estimation_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rubber_estimation_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->decimal('amount', 15, 2)->default(0);
            $table->boolean('is_auto')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estimation_expenses');
    }
};
