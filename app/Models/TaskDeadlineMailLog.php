<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskDeadlineMailLog extends Model
{
    protected $table = 'task_deadline_mail_logs';
    public $timestamps = false;

    protected $fillable = [
        'task_id',
        'sent_date',
        'type',
        'created_at',
    ];
}
