<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyDocument extends Model
{
    protected $fillable = [
        'document_name',
        'category',
        'document_date',
        'file_path',
        'notes'
    ];
}
