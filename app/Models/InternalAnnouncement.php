<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternalAnnouncement extends Model
{
    protected $table = 'internal_announcements';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'content',
        'author_id',
        'is_pinned',
        'created_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];
}
