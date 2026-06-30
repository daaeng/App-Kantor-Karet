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
        // Backfill total_paid for existing MaterialReceipt records
        \App\Models\MaterialReceipt::whereNull('total_paid')->update(['total_paid' => 0]);
        
        // Backfill payment_method for existing MaterialReceipt records
        \App\Models\MaterialReceipt::whereNull('payment_method')->update(['payment_method' => 'credit']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse, since this is a backfill
    }
};
