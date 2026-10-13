<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentEvaluation extends Model
{
    protected $table = 'Recruitment_Evaluations';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'season_id',
        'candidate_id',
        'interview_code',
        'interviewer_id',
        'round_type',
        'total_score',
        'avg_score',
        'scores_json',
        'comments',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'total_score' => 'float',
        'avg_score' => 'float',
    ];
}
