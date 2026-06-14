<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiKeuangan extends Model
{
    use HasFactory;
    protected $guarded = [];

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
}
