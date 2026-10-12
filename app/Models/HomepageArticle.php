<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageArticle extends Model
{
    protected $table = 'homepage_articles';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'title',
        'category',
        'author',
        'summary',
        'content',
        'cover_image',
        'video_url',
        'images',
        'date',
        'is_pinned',
        'view_count',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'view_count' => 'integer',
        'images' => 'array',
    ];
}
