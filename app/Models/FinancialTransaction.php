<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    use HasFactory;

    public const BUSINESS_KARET = 'karet';
    public const BUSINESS_REALESTATE = 'realestate';

    protected $table = 'financial_transactions';

    protected $fillable = [
        'business_unit',
        'type',
        'source',
        'category',
        'description',
        'amount',
        'transaction_date',
        'transaction_code',
        'transaction_number',
        'db_cr',
        'counterparty',
        'housing_project_id',
        'penjualan_kavling_id',
        'material_receipt_id',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function scopeKaret(Builder $query): Builder
    {
        return $query->where('business_unit', self::BUSINESS_KARET);
    }

    public function scopeRealEstate(Builder $query): Builder
    {
        return $query->where('business_unit', self::BUSINESS_REALESTATE);
    }

    public function housingProject()
    {
        return $this->belongsTo(HousingProject::class);
    }

    public function penjualanKavling()
    {
        return $this->belongsTo(PenjualanKavling::class);
    }

    public function materialReceipt()
    {
        return $this->belongsTo(MaterialReceipt::class);
    }

    public function isIncome(): bool
    {
        return $this->type === 'income';
    }

    public function isExpense(): bool
    {
        return $this->type === 'expense';
    }
}
