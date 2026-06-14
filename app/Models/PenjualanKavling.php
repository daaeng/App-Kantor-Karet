<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PenjualanKavling extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function konsumen()
    {
        return $this->belongsTo(Konsumen::class);
    }

    public function blokKavling()
    {
        return $this->belongsTo(BlokKavling::class);
    }
}
