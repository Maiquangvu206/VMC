<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyBirthdayConfig extends Model
{
    protected $table = 'monthly_birthday_config';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'config_month',
        'config_year',
        'wish_template',
        'card_url',
        'updated_at',
    ];

    protected $casts = [
        'config_month' => 'integer',
        'config_year' => 'integer',
    ];
}
