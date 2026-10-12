<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentSeason extends Model
{
    protected $table = 'recruitment_seasons';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'quota',
        'department',
        'scoring_type',
        'interviewer_ids',
        'is_active',
        'created_by',
        'active_round',
        'teamwork_scorer_ids',
        'challenge_process_scorer_ids',
        'challenge_result_scorer_ids',
        'lead_interviewer_id',
        'selected_questions',
        'created_at',
    ];

    protected $casts = [
        'quota' => 'integer',
        'is_active' => 'integer',
    ];

    public function criteria()
    {
        return $this->hasMany(RecruitmentCriteria::class, 'season_id', 'id');
    }

    public function candidates()
    {
        return $this->hasMany(RecruitmentCandidate::class, 'season_id', 'id');
    }
}
