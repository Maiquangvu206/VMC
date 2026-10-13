<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $table = 'Meetings';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'meeting_date',
        'meeting_time',
        'attendance_taker_id',
        'minute_taker_id',
        'status',
        'minutes_link',
        'created_at',
    ];

    public function attendance()
    {
        return $this->hasMany(MeetingAttendance::class, 'meeting_id', 'id');
    }
}
