<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class HomepageArticle extends Model
{
    protected $table = 'homepage_articles';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    /**
     * Tự động tương thích với cả 2 định dạng chữ hoa/thường trên Linux MySQL (Ubuntu 26.04)
     */
    public function getTable()
    {
        static $resolved = null;
        if ($resolved !== null) {
            return $resolved;
        }

        try {
            if (Schema::hasTable('homepage_articles')) {
                return $resolved = 'homepage_articles';
            }
            if (Schema::hasTable('Homepage_Articles')) {
                return $resolved = 'Homepage_Articles';
            }
        } catch (\Throwable $e) {}

        return $resolved = 'homepage_articles';
    }

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
