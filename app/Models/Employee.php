<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'position',
        'salary',
        'status',
    ];

    /**
     * Relasi ke Riwayat Gaji (Jika masih digunakan)
     */
    public function salaryHistories(): HasMany
    {
        return $this->hasMany(SalaryHistory::class);
    }

    /**
     * Relasi ke Payroll (Penggajian Bulanan)
     */
    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * [PERBAIKAN] Relasi ke Kasbon menggunakan Polimorfik (MorphMany).
     * Pastikan hanya ada SATU method kasbons() di file ini.
     */
    public function kasbons(): MorphMany
    {
        return $this->morphMany(Kasbon::class, 'kasbonable');
    }
}
