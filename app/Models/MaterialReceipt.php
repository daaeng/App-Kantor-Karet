<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'toko_material_id',
        'project_phase_id',
        'nomor_nota',
        'tanggal_penerimaan',
        'total_harga',
        'status_pembayaran',
        'keterangan'
    ];

    public function tokoMaterial()
    {
        return $this->belongsTo(TokoMaterial::class);
    }

    public function projectPhase()
    {
        return $this->belongsTo(ProjectPhase::class);
    }
}
