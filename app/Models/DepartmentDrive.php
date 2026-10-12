<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepartmentDrive extends Model
{
    protected $table = 'department_drives';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'dept_name',
        'drive_link',
        'updated_at',
    ];
}
