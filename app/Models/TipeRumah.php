<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipeRumah extends Model
{
    protected $fillable = [
        'nama_tipe',
        'luas_bangunan',
        'luas_tanah_standar',
        'harga_standar',
        'rab_standar',
        'deskripsi',
    ];

    public function blokKavlings()
    {
        return $this->hasMany(BlokKavling::class);
    }
}
