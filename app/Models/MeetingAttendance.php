<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingAttendance extends Model
{
    protected $table = 'Meeting_Attendance';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'meeting_id',
        'member_id',
        'status',
        'created_at',
    ];
}
