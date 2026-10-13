<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageMedia extends Model
{
    protected $table = 'homepage_media';
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
            if (\Illuminate\Support\Facades\Schema::hasTable('homepage_media')) {
                return $resolved = 'homepage_media';
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('Homepage_Media')) {
                return $resolved = 'Homepage_Media';
            }
        } catch (\Throwable $e) {}

        return $resolved = 'homepage_media';
    }

    protected $fillable = [
        'id',
        'title',
        'type',
        'category',
        'media_url',
        'thumbnail',
        'images',
        'description',
        'date',
    ];

    protected $casts = [
        'images' => 'array',
    ];
}
