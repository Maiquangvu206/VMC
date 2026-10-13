<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentCandidate extends Model
{
    protected $table = 'Recruitment_Candidates';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'interview_code',
        'season_id',
        'full_name',
        'class_name',
        'phone',
        'email',
        'desired_dept',
        'interviewer_id',
        'interviewer_ids',
        'teamwork_scorer_ids',
        'challenge_process_scorer_ids',
        'challenge_result_scorer_ids',
        'status',
        'notes',
        'application_answers',
        'lead_interviewer_id',
        'selected_questions',
        'facebook',
        'challenge_topic',
        'created_at',
    ];

    public function season()
    {
        return $this->belongsTo(RecruitmentSeason::class, 'season_id', 'id');
    }

    public function scores()
    {
        return $this->hasMany(RecruitmentScore::class, 'candidate_id', 'id');
    }
}
