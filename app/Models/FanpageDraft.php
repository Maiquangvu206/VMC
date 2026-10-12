<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FanpageDraft extends Model
{
    protected $table = 'fanpage_drafts';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'content_link',
        'author_id',
        'status',
        'publishDate',
        'graderId',
        'gradingStatus',
        'content',
        'author',
        'likes_count',
        'shares_count',
        'comments_count',
        'content_score',
        'final_score',
        'created_at',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'shares_count' => 'integer',
        'comments_count' => 'integer',
        'content_score' => 'integer',
        'final_score' => 'integer',
    ];
}
