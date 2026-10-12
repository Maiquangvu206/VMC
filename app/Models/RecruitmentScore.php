<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentScore extends Model
{
    protected $table = 'recruitment_scores';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'season_id',
        'candidate_id',
        'interviewer_id',
        'criteria_id',
        'score',
        'comments',
        'created_at',
    ];

    protected $casts = [
        'score' => 'float',
    ];

    public function candidate()
    {
        return $this->belongsTo(RecruitmentCandidate::class, 'candidate_id', 'id');
    }

    public function criteria()
    {
        return $this->belongsTo(RecruitmentCriteria::class, 'criteria_id', 'id');
    }
}
