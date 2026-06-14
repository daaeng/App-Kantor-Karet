<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokoMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_toko',
        'nomor_telepon',
        'alamat',
        'total_hutang',
        'total_dibayar'
    ];

    public function materialReceipts()
    {
        return $this->hasMany(MaterialReceipt::class);
    }
}
