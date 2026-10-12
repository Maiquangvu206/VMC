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
