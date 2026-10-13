<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    protected $table = 'Finances';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'type',
        'amount',
        'description',
        'record_date',
        'recorded_by',
        'date',
        'logged_by',
        'status',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];
}
