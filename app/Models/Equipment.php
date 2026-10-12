<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipment';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'code',
        'name',
        'category',
        'condition_status',
        'status',
        'borrower_id',
        'return_date',
        'created_at',
    ];
}
