<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_unit',
        'toko_material_id',
        'project_phase_id',
        'nomor_nota',
        'tanggal_penerimaan',
        'total_harga',
        'status_pembayaran',
        'keterangan'
    ];

    public const UNIT_PROPERTI = 'properti';
    public const UNIT_KARET   = 'karet';

    public function scopeProperti($query)
    {
        return $query->where('business_unit', self::UNIT_PROPERTI);
    }

    public function scopeKaret($query)
    {
        return $query->where('business_unit', self::UNIT_KARET);
    }

    public function tokoMaterial()
    {
        return $this->belongsTo(TokoMaterial::class);
    }

    public function projectPhase()
    {
        return $this->belongsTo(ProjectPhase::class);
    }
}
