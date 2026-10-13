<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskDeadlineMailLog extends Model
{
    protected $table = 'Task_Deadline_Mail_Logs';
    public $timestamps = false;

    protected $fillable = [
        'task_id',
        'sent_date',
        'type',
        'created_at',
    ];
}
