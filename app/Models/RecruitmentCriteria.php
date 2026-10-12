<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentCriteria extends Model
{
    protected $table = 'recruitment_criteria';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'season_id',
        'criteria_name',
        'max_score',
        'sort_order',
        'round_type',
        'difficulty',
        'created_at',
    ];

    protected $casts = [
        'max_score' => 'integer',
        'sort_order' => 'integer',
    ];

    public function season()
    {
        return $this->belongsTo(RecruitmentSeason::class, 'season_id', 'id');
    }
}
