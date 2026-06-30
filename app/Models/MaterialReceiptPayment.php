<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialReceiptPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_receipt_id',
        'financial_transaction_id',
        'amount',
        'source',
        'payment_date',
        'notes',
    ];

    public function materialReceipt()
    {
        return $this->belongsTo(MaterialReceipt::class);
    }

    public function financialTransaction()
    {
        return $this->belongsTo(FinancialTransaction::class);
    }
}
