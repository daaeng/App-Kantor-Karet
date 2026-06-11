<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutgoingMail extends Model
{
    protected $fillable = [
        'letter_number',
        'division',
        'letter_date',
        'recipient',
        'subject',
        'file_path',
        'notes'
    ];
}
