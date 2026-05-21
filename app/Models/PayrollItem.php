<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollItem extends Model
{
    use HasFactory;

    // 👇 TAMBAHKAN BARIS INI AGAR LARAVEL TIDAK SALAH BACA TABEL 'items'
    protected $table = 'payroll_items';

    protected $fillable = [
        'payroll_id',
        'deskripsi',
        'tipe',
        'jumlah'
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }
}
