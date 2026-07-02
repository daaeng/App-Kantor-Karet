<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class TransactionCategory extends Model
{
    protected $fillable = [
        'name',
        'business_unit',
        'type',
        'prefix',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeKaret(Builder $query): Builder
    {
        return $query->where('business_unit', FinancialTransaction::BUSINESS_KARET);
    }

    public function scopeRealEstate(Builder $query): Builder
    {
        return $query->where('business_unit', FinancialTransaction::BUSINESS_REALESTATE);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    // Relationship to financial transactions
    public function financialTransactions()
    {
        return $this->hasMany(FinancialTransaction::class, 'category', 'name')
            ->where('business_unit', $this->business_unit);
    }
}
