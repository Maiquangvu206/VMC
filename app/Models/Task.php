<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'description',
        'department',
        'assignee_id',
        'created_by',
        'deadline',
        'status',
        'created_at',
    ];

    public function assignee()
    {
        return $this->belongsTo(Member::class, 'assignee_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(Member::class, 'created_by', 'id');
    }
}
