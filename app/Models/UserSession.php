<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    protected $table = 'user_sessions';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'member_id',
        'username',
        'name',
        'role_title',
        'ip_address',
        'user_agent',
        'device_type',
        'login_time',
        'last_active',
        'is_active',
        'logout_reason',
    ];

    protected $casts = [
        'is_active' => 'integer',
    ];
}
