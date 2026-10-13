<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberMilestone extends Model
{
    protected $table = 'Member_Milestones';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'member_id',
        'date',
        'title',
        'badge_text',
        'badge_style',
        'created_at',
    ];
}
