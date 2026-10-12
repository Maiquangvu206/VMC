<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthdayMailLog extends Model
{
    protected $table = 'birthday_mail_logs';
    public $timestamps = false;

    protected $fillable = [
        'member_id',
        'sent_date',
        'sent_year',
        'status',
        'created_at',
    ];

    protected $casts = [
        'sent_year' => 'integer',
    ];
}
