<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstimationExpense extends Model
{
    protected $fillable = [
        'rubber_estimation_id',
        'description',
        'amount',
        'is_auto'
    ];

    public function estimation()
    {
        return $this->belongsTo(RubberEstimation::class, 'rubber_estimation_id');
    }
}
