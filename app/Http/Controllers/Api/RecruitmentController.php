<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RecruitmentSeason;
use App\Models\RecruitmentCriteria;
use App\Models\RecruitmentCandidate;
use App\Models\RecruitmentScore;
use App\Models\RecruitmentEvaluation;
use App\Models\Member;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;

class RecruitmentController extends Controller
{
    // ======================== SEASONS ========================
    public function indexSeasons()
    {
        try {
            $rows = RecruitmentSeason::orderBy('created_at', 'desc')->get();
            $data = $rows->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'quota' => (int) $r->quota,
                    'department' => $r->department,
                    'is_active' => (int) $r->is_active,
                    'active_round' => $r->active_round ?: 'don',
                    'lead_interviewer_id' => $r->lead_interviewer_id,
                    'created_by' => $r->created_by,
                    'created_at' => $r->created_at,
                    'interviewer_ids' => json_decode($r->interviewer_ids ?: '[]', true) ?: [],
                    'teamwork_scorer_ids' => json_decode($r->teamwork_scorer_ids ?: '[]', true) ?: [],
                    'challenge_process_scorer_ids' => json_decode($r->challenge_process_scorer_ids ?: '[]', true) ?: [],
                    'challenge_result_scorer_ids' => json_decode($r->challenge_result_scorer_ids ?: '[]', true) ?: [],
                    'selected_questions' => json_decode($r->selected_questions ?: '[]', true) ?: [],
                    'scoring_type' => is_array($parsedSt = json_decode($r->scoring_type ?: '', true)) ? $parsedSt : ($r->scoring_type ?: 'teamwork'),
                ];
            });
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function storeSeason(Request $request)
    {
        try {
            $sid = $request->input('id') ?: ('season-' . time() . '-' . rand(100, 999));
            $name = $request->input('name', '');
            $quota = (int) $request->input('quota', 0);
            $department = $request->input('department');
            $scoringType = $request->input('scoring_type', 'teamwork');
            $scoringTypeVal = is_array($scoringType) ? json_encode($scoringType, JSON_UNESCAPED_UNICODE) : (string) $scoringType;
            $creatorId = $request->input('created_by', 'ADMIN');

            RecruitmentSeason::create([
                'id' => $sid,
                'name' => $name,
                'quota' => $quota,
                'department' => $department,
                'scoring_type' => $scoringTypeVal,
                'created_by' => (string) $creatorId,
                'is_active' => 0,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $sid,
                    'name' => $name,
                    'quota' => $quota,
                    'department' => $department,
                    'scoring_type' => $scoringType,
                    'is_active' => 0,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateSeason(Request $request, $id)
    {
        try {
            $season = RecruitmentSeason::find($id);
            if (!$season) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy mùa tuyển sinh'], 404);
            }

            $fields = [
                'name', 'quota', 'department', 'is_active', 'active_round', 'lead_interviewer_id'
            ];

            foreach ($fields as $f) {
                if ($request->has($f)) $season->{$f} = $request->input($f);
            }

            if ($request->has('scoring_type')) {
                $val = $request->input('scoring_type');
                $season->scoring_type = is_array($val) ? json_encode($val, JSON_UNESCAPED_UNICODE) : (string) $val;
            }

            $jsonFields = ['interviewer_ids', 'teamwork_scorer_ids', 'challenge_process_scorer_ids', 'challenge_result_scorer_ids', 'selected_questions'];
            foreach ($jsonFields as $jf) {
                if ($request->has($jf)) {
                    $val = $request->input($jf);
                    $season->{$jf} = is_array($val) ? json_encode($val, JSON_UNESCAPED_UNICODE) : (string) $val;
                }
            }

            $season->save();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroySeason($id)
    {
        try {
            RecruitmentSeason::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ======================== CRITERIA ========================
    public function indexCriteria($seasonId)
    {
        try {
            $rows = RecruitmentCriteria::where('season_id', $seasonId)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            if ($rows->isEmpty() && $seasonId) {
                $defaultCriteria = [
                    ['name' => 'Đánh giá Đơn đăng ký', 'round' => 'don', 'max' => 10, 'difficulty' => 'Dễ', 'sort' => 1],
                    ['name' => 'Kỹ năng Phỏng vấn & Giao tiếp', 'round' => 'phongvan', 'max' => 10, 'difficulty' => 'Trung bình', 'sort' => 2],
                    ['name' => 'Thái độ & Làm việc nhóm (Teamwork)', 'round' => 'teamwork', 'max' => 10, 'difficulty' => 'Trung bình', 'sort' => 3],
                    ['name' => 'Tiến độ & Thái độ Thực hiện Thử thách', 'round' => 'thuthach_quatrinh', 'max' => 10, 'difficulty' => 'Trung bình', 'sort' => 4],
                    ['name' => 'Chất lượng Sản phẩm Thử thách', 'round' => 'thuthach_ketqua', 'max' => 10, 'difficulty' => 'Khó', 'sort' => 5],
                ];
                foreach ($defaultCriteria as $dc) {
                    $cid = 'crit-' . $seasonId . '-' . $dc['round'];
                    RecruitmentCriteria::create([
                        'id' => $cid,
                        'season_id' => $seasonId,
                        'criteria_name' => $dc['name'],
                        'max_score' => $dc['max'],
                        'sort_order' => $dc['sort'],
                        'round_type' => $dc['round'],
                        'difficulty' => $dc['difficulty'],
                    ]);
                }
                $rows = RecruitmentCriteria::where('season_id', $seasonId)
                    ->orderBy('sort_order', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();
            }

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function storeCriteria(Request $request)
    {
        try {
            $cid = $request->input('id') ?: ('crit-' . time() . '-' . rand(100, 999));
            $crit = RecruitmentCriteria::create([
                'id' => $cid,
                'season_id' => $request->input('season_id'),
                'criteria_name' => $request->input('criteria_name'),
                'max_score' => (int) $request->input('max_score', 10),
                'sort_order' => (int) $request->input('sort_order', 0),
                'round_type' => $request->input('round_type', 'teamwork'),
                'difficulty' => $request->input('difficulty', 'Trung bình'),
            ]);

            return response()->json(['success' => true, 'data' => $crit]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateCriteria(Request $request, $id)
    {
        try {
            $crit = RecruitmentCriteria::find($id);
            if (!$crit) return response()->json(['success' => false, 'message' => 'Không tìm thấy tiêu chí'], 404);

            if ($request->has('criteria_name')) $crit->criteria_name = $request->input('criteria_name');
            if ($request->has('max_score')) $crit->max_score = (int) $request->input('max_score');
            if ($request->has('round_type')) $crit->round_type = $request->input('round_type');
            if ($request->has('difficulty')) $crit->difficulty = $request->input('difficulty');
            if ($request->has('sort_order')) $crit->sort_order = (int) $request->input('sort_order');

            $crit->save();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroyCriteria($id)
    {
        try {
            RecruitmentCriteria::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ======================== CANDIDATES ========================
    public function indexCandidates(Request $request, $seasonId)
    {
        try {
            $interviewerId = $request->query('interviewer_id');
            $query = RecruitmentCandidate::where('season_id', $seasonId);

            if ($interviewerId) {
                $query->where(function ($q) use ($interviewerId) {
                    $q->where('interviewer_id', $interviewerId)
                      ->orWhere('interviewer_ids', 'LIKE', '%"' . $interviewerId . '"%')
                      ->orWhere('teamwork_scorer_ids', 'LIKE', '%"' . $interviewerId . '"%')
                      ->orWhere('challenge_process_scorer_ids', 'LIKE', '%"' . $interviewerId . '"%')
                      ->orWhere('challenge_result_scorer_ids', 'LIKE', '%"' . $interviewerId . '"%');
                });
            }

            $rows = $query->orderBy('created_at', 'asc')->get();
            $data = $rows->map(function ($r) {
                return [
                    'id' => $r->id,
                    'interview_code' => $r->interview_code ?: $r->id,
                    'season_id' => $r->season_id,
                    'full_name' => $r->full_name,
                    'class_name' => $r->class_name,
                    'phone' => $r->phone,
                    'email' => $r->email,
                    'desired_dept' => $r->desired_dept,
                    'interviewer_id' => $r->interviewer_id,
                    'interviewer_ids' => json_decode($r->interviewer_ids ?: '[]', true) ?: [],
                    'teamwork_scorer_ids' => json_decode($r->teamwork_scorer_ids ?: '[]', true) ?: [],
                    'challenge_process_scorer_ids' => json_decode($r->challenge_process_scorer_ids ?: '[]', true) ?: [],
                    'challenge_result_scorer_ids' => json_decode($r->challenge_result_scorer_ids ?: '[]', true) ?: [],
                    'selected_questions' => json_decode($r->selected_questions ?: '[]', true) ?: [],
                    'status' => $r->status,
                    'notes' => $r->notes,
                    'application_answers' => $r->application_answers,
                    'lead_interviewer_id' => $r->lead_interviewer_id,
                    'facebook' => $r->facebook,
                    'challenge_topic' => $r->challenge_topic,
                    'created_at' => $r->created_at,
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function storeCandidate(Request $request)
    {
        try {
            $cid = trim($request->input('id') ?: ('cand-' . time() . '-' . rand(100, 999)));
            $codeVal = trim($request->input('interview_code') ?: $cid);

            $cand = RecruitmentCandidate::create([
                'id' => $cid,
                'interview_code' => $codeVal,
                'season_id' => $request->input('season_id'),
                'full_name' => $request->input('full_name'),
                'class_name' => $request->input('class_name'),
                'phone' => $request->input('phone'),
                'email' => $request->input('email'),
                'desired_dept' => $request->input('desired_dept'),
                'interviewer_id' => $request->input('interviewer_id'),
                'interviewer_ids' => is_array($request->input('interviewer_ids')) ? json_encode($request->input('interviewer_ids'), JSON_UNESCAPED_UNICODE) : $request->input('interviewer_ids'),
                'teamwork_scorer_ids' => is_array($request->input('teamwork_scorer_ids')) ? json_encode($request->input('teamwork_scorer_ids'), JSON_UNESCAPED_UNICODE) : $request->input('teamwork_scorer_ids'),
                'challenge_process_scorer_ids' => is_array($request->input('challenge_process_scorer_ids')) ? json_encode($request->input('challenge_process_scorer_ids'), JSON_UNESCAPED_UNICODE) : $request->input('challenge_process_scorer_ids'),
                'challenge_result_scorer_ids' => is_array($request->input('challenge_result_scorer_ids')) ? json_encode($request->input('challenge_result_scorer_ids'), JSON_UNESCAPED_UNICODE) : $request->input('challenge_result_scorer_ids'),
                'notes' => $request->input('notes'),
                'application_answers' => $request->input('application_answers'),
                'lead_interviewer_id' => $request->input('lead_interviewer_id'),
                'selected_questions' => is_array($request->input('selected_questions')) ? json_encode($request->input('selected_questions'), JSON_UNESCAPED_UNICODE) : $request->input('selected_questions'),
                'facebook' => $request->input('facebook'),
                'challenge_topic' => $request->input('challenge_topic'),
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cid,
                    'interview_code' => $codeVal,
                    'season_id' => $cand->season_id,
                    'full_name' => $cand->full_name,
                    'status' => 'pending',
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateCandidate(Request $request, $id)
    {
        try {
            $cand = RecruitmentCandidate::where('id', $id)->orWhere('interview_code', $id)->first();
            if (!$cand) return response()->json(['success' => false, 'message' => 'Không tìm thấy ứng viên'], 404);

            $oldInterviewerIds = json_decode($cand->interviewer_ids ?: '[]', true) ?: [];
            $oldScorerIds = json_decode($cand->teamwork_scorer_ids ?: '[]', true) ?: [];

            $fields = [
                'full_name', 'interview_code', 'class_name', 'phone', 'email', 'desired_dept',
                'interviewer_id', 'status', 'notes', 'application_answers', 'lead_interviewer_id',
                'facebook', 'challenge_topic'
            ];

            foreach ($fields as $f) {
                if ($request->has($f)) $cand->{$f} = $request->input($f);
            }

            $jsonFields = ['interviewer_ids', 'teamwork_scorer_ids', 'challenge_process_scorer_ids', 'challenge_result_scorer_ids', 'selected_questions'];
            foreach ($jsonFields as $jf) {
                if ($request->has($jf)) {
                    $val = $request->input($jf);
                    $cand->{$jf} = is_array($val) ? json_encode($val, JSON_UNESCAPED_UNICODE) : $val;
                }
            }

            $cand->save();

            // Send notification emails to newly assigned interviewers / scorers
            if ($request->has('interviewer_ids') || $request->has('teamwork_scorer_ids')) {
                $newInterviewerIds = is_array($request->input('interviewer_ids')) ? $request->input('interviewer_ids') : [];
                $newScorerIds = is_array($request->input('teamwork_scorer_ids')) ? $request->input('teamwork_scorer_ids') : [];
                self::sendAssignmentEmails($cand->full_name, $oldInterviewerIds, $newInterviewerIds, $oldScorerIds, $newScorerIds);
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroyCandidate($id)
    {
        try {
            RecruitmentCandidate::where('id', $id)->orWhere('interview_code', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateCandidateResult(Request $request, $id)
    {
        try {
            $status = $request->input('status');
            $allowed = ['passed', 'failed', 'reserve', 'pending', 'scored'];
            if (!in_array($status, $allowed)) {
                return response()->json(['success' => false, 'error' => 'Trạng thái không hợp lệ'], 400);
            }

            $cand = RecruitmentCandidate::where('id', $id)->orWhere('interview_code', $id)->first();
            if ($cand) {
                $cand->status = $status;
                if ($request->has('notes')) $cand->notes = $request->input('notes');
                $cand->save();
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ======================== SCORES ========================
    public function storeScores(Request $request)
    {
        try {
            $seasonId = $request->input('season_id');
            $candidateId = $request->input('candidate_id');
            $interviewerId = $request->input('interviewer_id');
            $scores = $request->input('scores');
            $comments = $request->input('comments');

            if (!is_array($scores) || empty($scores)) {
                return response()->json(['success' => false, 'error' => 'Thiếu dữ liệu điểm'], 400);
            }

            $cand = RecruitmentCandidate::where('id', $candidateId)->orWhere('interview_code', $candidateId)->first();
            $targetId = $cand ? $cand->id : $candidateId;
            $targetCode = $cand ? ($cand->interview_code ?: $cand->id) : $candidateId;

            foreach ($scores as $s) {
                $critId = $s['criteria_id'] ?? null;
                $scoreVal = (float) ($s['score'] ?? 0);
                $commentVal = $s['comments'] ?? ($comments ?: null);

                $existing = RecruitmentScore::where(function ($q) use ($targetId, $targetCode) {
                    $q->where('candidate_id', $targetId)->orWhere('candidate_id', $targetCode);
                })
                ->where('interviewer_id', $interviewerId)
                ->where('criteria_id', $critId)
                ->first();

                if ($existing) {
                    $existing->score = $scoreVal;
                    $existing->comments = $commentVal;
                    $existing->season_id = $seasonId;
                    $existing->save();
                } else {
                    RecruitmentScore::create([
                        'id' => 'score-' . time() . '-' . bin2hex(random_bytes(3)),
                        'season_id' => $seasonId,
                        'candidate_id' => $targetId,
                        'interviewer_id' => $interviewerId,
                        'criteria_id' => $critId,
                        'score' => $scoreVal,
                        'comments' => $commentVal,
                    ]);
                }
            }

            // Upsert into Recruitment_Evaluations
            try {
                $firstCritId = $scores[0]['criteria_id'] ?? null;
                $rType = 'teamwork';
                if ($firstCritId) {
                    $crit = RecruitmentCriteria::find($firstCritId);
                    if ($crit && $crit->round_type) {
                        $rType = $crit->round_type;
                        if ($rType === 'thuthach') $rType = 'thuthach_ketqua';
                    }
                }

                $totalSum = array_reduce($scores, fn($carry, $item) => $carry + (float) ($item['score'] ?? 0), 0);
                $scoresCount = count($scores);
                $avgScore = $scoresCount > 0 ? round($totalSum / $scoresCount, 2) : 0;
                $evalId = 'eval-' . $targetId . '-' . $interviewerId . '-' . $rType;

                DB::table('recruitment_evaluations')->upsert([
                    'id' => $evalId,
                    'season_id' => $seasonId,
                    'candidate_id' => $targetId,
                    'interview_code' => $targetCode,
                    'interviewer_id' => $interviewerId,
                    'round_type' => $rType,
                    'total_score' => $totalSum,
                    'avg_score' => $avgScore,
                    'scores_json' => json_encode($scores, JSON_UNESCAPED_UNICODE),
                    'comments' => $comments ?: null,
                    'updated_at' => now(),
                ], ['id'], ['total_score', 'avg_score', 'scores_json', 'comments', 'updated_at']);
            } catch (\Throwable $e) {}

            RecruitmentCandidate::where('id', $targetId)->orWhere('interview_code', $targetCode)->update(['status' => 'scored']);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function scoresSummary(Request $request, $seasonId)
    {
        try {
            $threshold = (float) $request->query('threshold', 0);
            $season = RecruitmentSeason::find($seasonId);
            $quota = $season ? (int) $season->quota : 0;

            $candidates = RecruitmentCandidate::where('season_id', $seasonId)
                ->orWhereNull('season_id')
                ->orWhere('season_id', '')
                ->get();

            $findCandidateKeys = function ($rawCandId, $rawInterviewCode = null) use ($candidates) {
                $targetStr = trim((string) $rawCandId);
                $codeStr = trim((string) $rawInterviewCode);
                $cand = $candidates->first(function ($c) use ($targetStr, $codeStr) {
                    return (trim((string) $c->id) === $targetStr)
                        || (trim((string) $c->interview_code) === $targetStr)
                        || ($codeStr && trim((string) $c->id) === $codeStr)
                        || ($codeStr && trim((string) $c->interview_code) === $codeStr);
                });

                $keys = [];
                if ($targetStr) $keys[] = $targetStr;
                if ($codeStr) $keys[] = $codeStr;
                if ($cand) {
                    if ($cand->id) $keys[] = trim((string) $cand->id);
                    if ($cand->interview_code) $keys[] = trim((string) $cand->interview_code);
                }
                return array_unique($keys);
            };

            // Auto-backfill scores into Recruitment_Evaluations with MySQL 8.4 ONLY_FULL_GROUP_BY compliance
            try {
                DB::statement("
                    INSERT INTO `recruitment_evaluations` (`id`, `candidate_id`, `interview_code`, `season_id`, `interviewer_id`, `round_type`, `total_score`, `avg_score`, `comments`)
                    SELECT 
                      CONCAT('eval-', `s`.`candidate_id`, '-', COALESCE(`s`.`interviewer_id`, '0'), '-', COALESCE(ANY_VALUE(`cr`.`round_type`), 'don')) AS `id`,
                      `s`.`candidate_id`,
                      ANY_VALUE(COALESCE(`c`.`interview_code`, `s`.`candidate_id`)),
                      ANY_VALUE(COALESCE(`s`.`season_id`, `c`.`season_id`, ?)),
                      `s`.`interviewer_id`,
                      COALESCE(NULLIF(ANY_VALUE(`cr`.`round_type`), ''), 'don') AS `round_type`,
                      ROUND(COALESCE(SUM(`s`.`score`), 0), 2) AS `total_score`,
                      ROUND(COALESCE(SUM(`s`.`score`) / NULLIF(COUNT(`s`.`score`), 0), AVG(`s`.`score`), 0), 2) AS `avg_score`,
                      MAX(`s`.`comments`) AS `comments`
                    FROM `recruitment_scores` `s`
                    LEFT JOIN `recruitment_criteria` `cr` ON `s`.`criteria_id` = `cr`.`id`
                    LEFT JOIN `recruitment_candidates` `c` ON (`s`.`candidate_id` = `c`.`id` OR `s`.`candidate_id` = `c`.`interview_code`)
                    WHERE (`s`.`season_id` = ? OR `s`.`season_id` IS NULL OR `s`.`season_id` = ''
                       OR `s`.`candidate_id` IN (SELECT `id` FROM `recruitment_candidates` WHERE `season_id` = ?)
                       OR `s`.`candidate_id` IN (SELECT `interview_code` FROM `recruitment_candidates` WHERE `season_id` = ?))
                    GROUP BY `s`.`candidate_id`, `s`.`interviewer_id`, COALESCE(NULLIF(`cr`.`round_type`, ''), 'don')
                    ON DUPLICATE KEY UPDATE 
                      `total_score` = VALUES(`total_score`),
                      `avg_score` = VALUES(`avg_score`),
                      `comments` = VALUES(`comments`),
                      `season_id` = VALUES(`season_id`)
                ", [$seasonId, $seasonId, $seasonId, $seasonId]);
            } catch (\Throwable $e) {}

            // Fetch detailed scores joined with criteria and members
            $detailedScoresRows = DB::table('recruitment_scores as s')
                ->leftJoin('members as u', function ($j) {
                    $j->on('s.interviewer_id', '=', 'u.id')
                      ->orOn('s.interviewer_id', '=', 'u.member_code')
                      ->orOn('s.interviewer_id', '=', 'u.username');
                })
                ->leftJoin('recruitment_criteria as cr', 's.criteria_id', '=', 'cr.id')
                ->select(
                    's.candidate_id', 's.interviewer_id', 's.criteria_id', 's.score', 's.comments', 's.created_at',
                    DB::raw("COALESCE(u.full_name, s.interviewer_id) as interviewer_name"),
                    DB::raw("cr.criteria_name as criteria_title"),
                    DB::raw("COALESCE(NULLIF(CASE WHEN cr.round_type = 'thuthach' THEN 'thuthach_ketqua' ELSE cr.round_type END, ''), 'teamwork') as round_type")
                )
                ->where(function ($q) use ($seasonId) {
                    $q->where('s.season_id', $seasonId)
                      ->orWhereNull('s.season_id')
                      ->orWhere('s.season_id', '')
                      ->orWhereIn('s.candidate_id', RecruitmentCandidate::where('season_id', $seasonId)->pluck('id'))
                      ->orWhereIn('s.candidate_id', RecruitmentCandidate::where('season_id', $seasonId)->pluck('interview_code'));
                })
                ->get();

            $commentsRows = DB::table('recruitment_scores as s')
                ->leftJoin('members as u', function ($j) {
                    $j->on('s.interviewer_id', '=', 'u.id')
                      ->orOn('s.interviewer_id', '=', 'u.member_code')
                      ->orOn('s.interviewer_id', '=', 'u.username');
                })
                ->leftJoin('recruitment_criteria as cr', 's.criteria_id', '=', 'cr.id')
                ->select(
                    's.candidate_id', 's.interviewer_id', 's.comments',
                    DB::raw("COALESCE(u.full_name, s.interviewer_id) as interviewer_name"),
                    DB::raw("COALESCE(NULLIF(CASE WHEN cr.round_type = 'thuthach' THEN 'thuthach_ketqua' ELSE cr.round_type END, ''), 'teamwork') as round_type")
                )
                ->whereNotNull('s.comments')
                ->whereRaw("TRIM(s.comments) != ''")
                ->distinct()
                ->get();

            $detailedScoresMap = [];
            foreach ($detailedScoresRows as $r) {
                $keys = $findCandidateKeys($r->candidate_id);
                foreach ($keys as $k) {
                    $detailedScoresMap[$k][] = [
                        'interviewer_id' => $r->interviewer_id,
                        'interviewer_name' => $r->interviewer_name ?: $r->interviewer_id,
                        'criteria_id' => $r->criteria_id,
                        'criteria_title' => $r->criteria_title ?: $r->criteria_id,
                        'round_type' => $r->round_type,
                        'score' => (float) $r->score,
                        'comments' => $r->comments ?: '',
                        'created_at' => $r->created_at,
                    ];
                }
            }

            $commentsMap = [];
            foreach ($commentsRows as $r) {
                $keys = $findCandidateKeys($r->candidate_id);
                foreach ($keys as $k) {
                    $commentsMap[$k][] = [
                        'interviewer_id' => $r->interviewer_id,
                        'interviewer_name' => $r->interviewer_name ?: $r->interviewer_id,
                        'round_type' => $r->round_type,
                        'comments' => $r->comments,
                    ];
                }
            }

            // Group by candidate key and round_type
            $candidateScoresGroup = [];
            foreach ($detailedScoresRows as $r) {
                $keys = $findCandidateKeys($r->candidate_id);
                $rType = $r->round_type ?: 'don';
                foreach ($keys as $k) {
                    if ($k) $candidateScoresGroup[$k][$rType][] = $r;
                }
            }

            $submittedScorersMap = [];
            foreach ($detailedScoresRows as $r) {
                $keys = $findCandidateKeys($r->candidate_id);
                $rType = $r->round_type ?: 'teamwork';
                foreach ($keys as $k) {
                    if (!isset($submittedScorersMap[$k][$rType])) $submittedScorersMap[$k][$rType] = [];
                    if (!in_array($r->interviewer_id, $submittedScorersMap[$k][$rType])) {
                        $submittedScorersMap[$k][$rType][] = $r->interviewer_id;
                    }
                }
            }

            $roundScoresMap = [];
            $allKeys = array_unique(array_merge(
                array_keys($candidateScoresGroup),
                $candidates->pluck('id')->map(fn($v) => trim((string) $v))->toArray(),
                $candidates->pluck('interview_code')->filter()->map(fn($v) => trim((string) $v))->toArray()
            ));

            foreach ($allKeys as $k) {
                if (!$k) continue;
                $roundScoresMap[$k] = [];
                $rounds = $candidateScoresGroup[$k] ?? [];

                // 1. Vòng đơn (TB Đơn)
                if (!empty($rounds['don'])) {
                    $byScorer = [];
                    foreach ($rounds['don'] as $s) $byScorer[$s->interviewer_id][] = (float) $s->score;
                    $scorerAvgs = [];
                    foreach ($byScorer as $arr) {
                        $cCount = count($arr);
                        if ($cCount > 0) $scorerAvgs[] = array_sum($arr) / $cCount;
                    }
                    $sCount = count($scorerAvgs);
                    if ($sCount > 0) $roundScoresMap[$k]['don'] = round(array_sum($scorerAvgs) / $sCount, 2);
                }

                // 2. Vòng phỏng vấn (TB PV: tổng điểm trung bình các câu)
                if (!empty($rounds['phongvan'])) {
                    $byCrit = [];
                    foreach ($rounds['phongvan'] as $s) $byCrit[$s->criteria_id][] = (float) $s->score;
                    $pvSum = 0;
                    foreach ($byCrit as $arr) {
                        $cCount = count($arr);
                        if ($cCount > 0) $pvSum += (array_sum($arr) / $cCount);
                    }
                    $roundScoresMap[$k]['phongvan'] = round($pvSum, 2);
                }

                // 3. Vòng thử thách (2/3 quá trình + 1/3 kết quả)
                if (!empty($rounds['thuthach_quatrinh'])) {
                    $byScorer = [];
                    foreach ($rounds['thuthach_quatrinh'] as $s) $byScorer[$s->interviewer_id][] = (float) $s->score;
                    $scorerAvgs = [];
                    foreach ($byScorer as $arr) {
                        $cCount = count($arr);
                        if ($cCount > 0) $scorerAvgs[] = array_sum($arr) / $cCount;
                    }
                    $sCount = count($scorerAvgs);
                    if ($sCount > 0) $roundScoresMap[$k]['thuthach_quatrinh'] = round(array_sum($scorerAvgs) / $sCount, 2);
                }

                if (!empty($rounds['thuthach_ketqua'])) {
                    $byScorer = [];
                    foreach ($rounds['thuthach_ketqua'] as $s) $byScorer[$s->interviewer_id][] = (float) $s->score;
                    $scorerAvgs = [];
                    foreach ($byScorer as $arr) {
                        $cCount = count($arr);
                        if ($cCount > 0) $scorerAvgs[] = array_sum($arr) / $cCount;
                    }
                    $sCount = count($scorerAvgs);
                    if ($sCount > 0) $roundScoresMap[$k]['thuthach_ketqua'] = round(array_sum($scorerAvgs) / $sCount, 2);
                }

                $proc = $roundScoresMap[$k]['thuthach_quatrinh'] ?? null;
                $res = $roundScoresMap[$k]['thuthach_ketqua'] ?? null;
                if ($proc !== null && $res !== null) {
                    $roundScoresMap[$k]['thuthach'] = round((2/3) * $proc + (1/3) * $res, 2);
                } elseif ($proc !== null) {
                    $roundScoresMap[$k]['thuthach'] = $proc;
                } elseif ($res !== null) {
                    $roundScoresMap[$k]['thuthach'] = $res;
                }

                // 4. Vòng teamwork (TB TW)
                if (!empty($rounds['teamwork'])) {
                    $byScorer = [];
                    foreach ($rounds['teamwork'] as $s) $byScorer[$s->interviewer_id][] = (float) $s->score;
                    $scorerAvgs = [];
                    foreach ($byScorer as $arr) {
                        $cCount = count($arr);
                        if ($cCount > 0) $scorerAvgs[] = array_sum($arr) / $cCount;
                    }
                    $sCount = count($scorerAvgs);
                    if ($sCount > 0) $roundScoresMap[$k]['teamwork'] = round(array_sum($scorerAvgs) / $sCount, 2);
                }
            }

            $data = $candidates->map(function ($c) use ($roundScoresMap, $submittedScorersMap, $commentsMap, $detailedScoresMap, $threshold, $quota) {
                $candIdStr = trim((string) $c->id);
                $codeStr = trim((string) ($c->interview_code ?: ''));

                $rScoresRaw = array_merge(
                    $roundScoresMap[$candIdStr] ?? [],
                    $roundScoresMap[$codeStr] ?? []
                );

                $rScores = $rScoresRaw;
                $rawVals = array_filter($rScoresRaw, fn($v) => is_numeric($v) && $v > 0);
                $sumTotals = !empty($rawVals) ? round(array_sum($rawVals), 2) : 0;
                $countRaw = count($rawVals);
                $overallAvg = $countRaw > 0 ? round(array_sum($rawVals) / $countRaw, 2) : 0;

                $submittedScorers = array_merge(
                    $submittedScorersMap[$candIdStr] ?? [],
                    $submittedScorersMap[$codeStr] ?? []
                );

                $comments = array_merge(
                    $commentsMap[$candIdStr] ?? [],
                    $commentsMap[$codeStr] ?? []
                );

                $detailedScores = array_merge(
                    $detailedScoresMap[$candIdStr] ?? [],
                    $detailedScoresMap[$codeStr] ?? []
                );

                $resStatus = 'pending';
                if ($c->status === 'passed') $resStatus = 'passed';
                elseif ($c->status === 'failed') $resStatus = 'failed';
                elseif ($c->status === 'reserve') $resStatus = 'reserve';
                elseif ($threshold > 0) {
                    if ($overallAvg >= $threshold) $resStatus = 'passed';
                    elseif ($overallAvg >= $threshold * 0.8) $resStatus = 'reserve';
                    else $resStatus = 'failed';
                }

                $parseIds = fn($v) => is_array($v) ? $v : (json_decode($v ?: '[]', true) ?: []);

                return [
                    'candidate_id' => $c->id,
                    'interview_code' => $c->interview_code ?: $c->id,
                    'full_name' => $c->full_name,
                    'class_name' => $c->class_name,
                    'desired_dept' => $c->desired_dept,
                    'status' => $c->status,
                    'notes' => $c->notes,
                    'interviewer_ids' => $parseIds($c->interviewer_ids),
                    'teamwork_scorer_ids' => $parseIds($c->teamwork_scorer_ids),
                    'challenge_process_scorer_ids' => $parseIds($c->challenge_process_scorer_ids),
                    'challenge_result_scorer_ids' => $parseIds($c->challenge_result_scorer_ids),
                    'comments' => $comments,
                    'detailed_scores' => $detailedScores,
                    'round_scores' => $rScores,
                    'submitted_scorers' => $submittedScorers,
                    'avg_score' => $overallAvg,
                    'total_score' => $sumTotals,
                    'result_status' => $resStatus,
                    'quota' => $quota,
                ];
            })->toArray();

            // Sort by total_score descending
            usort($data, function ($a, $b) {
                if ($b['total_score'] != $a['total_score']) {
                    return $b['total_score'] <=> $a['total_score'];
                }
                if ($b['avg_score'] != $a['avg_score']) {
                    return $b['avg_score'] <=> $a['avg_score'];
                }
                return strnatcasecmp($a['interview_code'], $b['interview_code']);
            });

            foreach ($data as $idx => &$item) {
                $item['rank'] = $idx + 1;
            }

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function submittedScores(Request $request)
    {
        try {
            $seasonId = $request->query('season_id');
            $interviewerId = $request->query('interviewer_id');
            $roundType = $request->query('round_type');

            $query = DB::table('recruitment_scores as s')
                ->leftJoin('recruitment_criteria as cr', 's.criteria_id', '=', 'cr.id')
                ->where('s.interviewer_id', $interviewerId)
                ->where(function ($q) use ($seasonId) {
                    $q->where('s.season_id', $seasonId)
                      ->orWhereNull('s.season_id')
                      ->orWhere('s.season_id', '')
                      ->orWhereIn('s.candidate_id', RecruitmentCandidate::where('season_id', $seasonId)->pluck('id'))
                      ->orWhereIn('s.candidate_id', RecruitmentCandidate::where('season_id', $seasonId)->pluck('interview_code'));
                });

            if ($roundType) {
                $query->whereRaw("COALESCE(NULLIF(cr.round_type, ''), 'teamwork') = ?", [$roundType]);
            }

            $rows = $query->select('s.candidate_id')->distinct()->get();

            $candidates = RecruitmentCandidate::where('season_id', $seasonId)->select('id', 'interview_code')->get();

            $resultIds = [];
            foreach ($rows as $r) {
                $resultIds[] = (string) $r->candidate_id;
                $cand = $candidates->first(fn($c) => (string) $c->id === (string) $r->candidate_id || (string) $c->interview_code === (string) $r->candidate_id);
                if ($cand) {
                    if ($cand->id) $resultIds[] = (string) $cand->id;
                    if ($cand->interview_code) $resultIds[] = (string) $cand->interview_code;
                }
            }

            return response()->json(['success' => true, 'data' => array_values(array_unique($resultIds))]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private static function sendAssignmentEmails($candidateName, $oldInterviewerIds, $newInterviewerIds, $oldScorerIds, $newScorerIds)
    {
        try {
            $addedInterviewers = array_diff($newInterviewerIds, $oldInterviewerIds);
            foreach ($addedInterviewers as $memId) {
                $m = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memId])->orWhere('member_code', (string) $memId)->first();
                if ($m && $m->email) {
                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #db2777; text-align: center; margin-bottom: 20px;">Phân công phỏng vấn tuyển sinh</h2>
                          <p>Chào <strong>' . htmlspecialchars($m->full_name) . '</strong>,</p>
                          <p>Ban Đối Ngoại - Nhân Sự xin thông báo bạn vừa được phân công làm <strong>Người phỏng vấn</strong> cho ứng viên sau:</p>
                          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>👤 Họ tên ứng viên:</strong> ' . htmlspecialchars($candidateName) . '</p>
                            <p style="margin: 0;"><strong>📌 Vòng tuyển sinh:</strong> Phỏng Vấn (Vòng 2)</p>
                          </div>
                          <p>Vui lòng đăng nhập vào <strong>VMC Portal</strong> mục tuyển sinh để chọn câu hỏi phỏng vấn, chấm điểm và nhận xét chi tiết cho ứng viên!</p>
                        </div>
                    ';
                    MailService::send($m->email, "🔔 [VMC Recruitment] Bạn được phân công Phỏng vấn ứng viên \"{$candidateName}\"", $html);
                }
            }

            $addedScorers = array_diff($newScorerIds, $oldScorerIds);
            foreach ($addedScorers as $memId) {
                $m = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memId])->orWhere('member_code', (string) $memId)->first();
                if ($m && $m->email) {
                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #0f766e; text-align: center; margin-bottom: 20px;">Phân công chấm điểm Teamwork</h2>
                          <p>Chào <strong>' . htmlspecialchars($m->full_name) . '</strong>,</p>
                          <p>Ban Đối Ngoại - Nhân Sự xin thông báo bạn vừa được phân công làm <strong>Người chấm điểm Teamwork</strong> cho ứng viên sau:</p>
                          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>👤 Họ tên ứng viên:</strong> ' . htmlspecialchars($candidateName) . '</p>
                            <p style="margin: 0;"><strong>📌 Vòng tuyển sinh:</strong> Teamwork (Vòng 3)</p>
                          </div>
                          <p>Vui lòng đăng nhập vào <strong>VMC Portal</strong> mục tuyển sinh để thực hiện theo dõi, chấm điểm và nhận xét chi tiết kỹ năng làm việc nhóm của ứng viên!</p>
                        </div>
                    ';
                    MailService::send($m->email, "🔔 [VMC Recruitment] Bạn được phân công chấm điểm Teamwork ứng viên \"{$candidateName}\"", $html);
                }
            }
        } catch (\Throwable $e) {}
    }
}
