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
        Schema::create('inciseds', function (Blueprint $table) {
            $table->id();

            $table->string('product');
            $table->date('date');
            $table->string('no_invoice');
            $table->string('lok_kebun');
            $table->string('j_brg');
            $table->text('desk')->nullable();

            $table->integer('qty_kg');
            $table->decimal('price_qty', 12, 2);
            $table->decimal('amount', 16, 2);
            $table->integer('keping');
            $table->string('kualitas');
            $table->string('payment_status')->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->index(['no_invoice', 'date']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inciseds');
    }
};
