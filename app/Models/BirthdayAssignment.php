<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthdayAssignment extends Model
{
    protected $table = 'birthday_assignments';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'assign_month',
        'assign_year',
        'member_id',
        'link_image',
        'status',
        'submissions',
        'excuse_reason',
        'excuse_status',
        'is_penalized',
        'wishes_template',
        'created_at',
    ];

    protected $casts = [
        'assign_month' => 'integer',
        'assign_year' => 'integer',
        'is_penalized' => 'boolean',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }
}
