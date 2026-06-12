<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RubberEstimation extends Model
{
    protected $fillable = [
        'date',
        'sebayar_keping',
        'temadu_keping',
        'total_keping',
        'kg_per_keping',
        'total_kg',
        'price_per_kg',
        'profit_sharing',
        'rubber_purchase_total',
        'weighing_wage_price',
        'weighing_wage_total',
        'meal_allowance_name',
        'meal_allowance_price',
        'meal_allowance_qty',
        'meal_allowance_total',
        'grand_total'
    ];

    public function expenses()
    {
        return $this->hasMany(EstimationExpense::class);
    }
}
