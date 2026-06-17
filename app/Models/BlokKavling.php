<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlokKavling extends Model
{
    protected $fillable = [
        'housing_project_id',
        'tipe_rumah_id',
        'nomor_blok',
        'luas_tanah_aktual',
        'harga_jual_final',
        'status_jual',
        'status_konstruksi',
        'keterangan',
        'x_coord',
        'y_coord',
    ];

    public function housingProject()
    {
        return $this->belongsTo(HousingProject::class);
    }

    public function tipeRumah()
    {
        return $this->belongsTo(TipeRumah::class);
    }
}
