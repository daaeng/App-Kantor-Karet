<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokoMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_unit',
        'nama_toko',
        'nomor_telepon',
        'alamat',
        'total_hutang',
        'total_dibayar'
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

    public function materialReceipts()
    {
        return $this->hasMany(MaterialReceipt::class);
    }
}
