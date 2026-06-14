<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectPhase extends Model
{
    use HasFactory;

    protected $fillable = [
        'housing_project_id',
        'nama_fase',
        'tanggal_mulai',
        'tanggal_target_selesai',
        'status',
        'keterangan'
    ];

    public function housingProject()
    {
        return $this->belongsTo(HousingProject::class);
    }

    public function materialReceipts()
    {
        return $this->hasMany(MaterialReceipt::class);
    }
}
