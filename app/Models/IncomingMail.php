<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncomingMail extends Model
{
    protected $fillable = [
        'letter_number',
        'letter_date',
        'received_date',
        'sender',
        'subject',
        'file_path',
        'notes'
    ];
}
