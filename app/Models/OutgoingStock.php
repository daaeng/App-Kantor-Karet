<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutgoingStock extends Model
{

    protected $fillable = [
        'id',
        'product_id',
        'customer_id',
        'no_invoice',
        'no_po',
        'date',
        'qty_out',
        'keping_out',
        'kualitas_out',
        'tgl_kirim',
        'tgl_sampai',
        'qty_sampai',
        'shipping_method',
        'status',
        'notes',
        'person_in_charge',
        'selling_price',
        'pph_value',
        'ob_cost',
        'extra_cost',
        'grand_total'
    ];

    protected $guarded = ['id'];

    // Relasi balik ke Induk Produk
    public function product(): BelongsTo
    {
        return $this->belongsTo(MasterProduct::class, 'product_id');
    }

    // Relasi ke Customer
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}
