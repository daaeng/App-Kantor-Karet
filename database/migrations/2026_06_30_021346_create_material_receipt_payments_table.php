<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_receipt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_receipt_id')->constrained('material_receipts')->onDelete('cascade');
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->enum('source', ['cash', 'bank'])->default('cash');
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_receipt_payments');
    }
};
