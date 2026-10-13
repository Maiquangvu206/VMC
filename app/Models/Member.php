<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $table = 'Members';
    public $timestamps = false;

    protected $fillable = [
        'member_code',
        'username',
        'password',
        'full_name',
        'role',
        'role_title',
        'class_name',
        'department',
        'term',
        'avatar_url',
        'phone',
        'email',
        'dob',
        'address',
        'facebook',
        'points',
        'is_first_login',
        'status',
        'milestones',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'points' => 'integer',
        'is_first_login' => 'boolean',
    ];

    public function milestones()
    {
        return $this->hasMany(MemberMilestone::class, 'member_id', 'id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assignee_id', 'id');
    }
}
