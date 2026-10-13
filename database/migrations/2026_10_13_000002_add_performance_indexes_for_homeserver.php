<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations to add high-performance B-Tree indexes for Homeserver MySQL 8.4.
     */
    public function up(): void
    {
        $this->safeAddIndex('Tasks', ['assignee_id'], 'idx_tasks_assignee_id');
        $this->safeAddIndex('Tasks', ['department', 'status'], 'idx_tasks_dept_status');
        $this->safeAddIndex('Tasks', ['status'], 'idx_tasks_status');
        $this->safeAddIndex('Tasks', ['created_at'], 'idx_tasks_created_at');

        $this->safeAddIndex('Members', ['department', 'status'], 'idx_members_dept_status');
        $this->safeAddIndex('Members', ['role', 'status'], 'idx_members_role_status');
        $this->safeAddIndex('Members', ['status'], 'idx_members_status');

        $this->safeAddIndex('Fanpage_Drafts', ['author_id', 'status'], 'idx_drafts_author_status');
        $this->safeAddIndex('Fanpage_Drafts', ['status'], 'idx_drafts_status');
        $this->safeAddIndex('Fanpage_Drafts', ['created_at'], 'idx_drafts_created_at');

        $this->safeAddIndex('Recruitment_Candidates', ['season_id', 'status'], 'idx_cand_season_status');
        $this->safeAddIndex('Recruitment_Candidates', ['interview_code'], 'idx_cand_interview_code');
        $this->safeAddIndex('Recruitment_Candidates', ['season_id', 'created_at'], 'idx_cand_season_created');

        $this->safeAddIndex('Recruitment_Scores', ['candidate_id', 'criteria_id'], 'idx_scores_cand_crit');
        $this->safeAddIndex('Recruitment_Scores', ['season_id'], 'idx_scores_season_id');
        $this->safeAddIndex('Recruitment_Scores', ['interviewer_id'], 'idx_scores_interviewer');
        $this->safeAddIndex('Recruitment_Scores', ['candidate_id', 'interviewer_id', 'criteria_id'], 'idx_scores_lookup');

        $this->safeAddIndex('Recruitment_Criteria', ['season_id', 'sort_order'], 'idx_criteria_season_sort');

        if (Schema::hasTable('Recruitment_Evaluations') || Schema::hasTable('recruitment_evaluations')) {
            $this->safeAddIndex('Recruitment_Evaluations', ['candidate_id', 'season_id'], 'idx_eval_cand_season');
            $this->safeAddIndex('Recruitment_Evaluations', ['interviewer_id'], 'idx_eval_interviewer');
        }

        $this->safeAddIndex('Finances', ['type', 'status'], 'idx_finances_type_status');
        $this->safeAddIndex('Finances', ['record_date'], 'idx_finances_record_date');
        $this->safeAddIndex('Finances', ['created_at'], 'idx_finances_created_at');

        $this->safeAddIndex('User_Sessions', ['is_active', 'last_active'], 'idx_sessions_active_last');
        $this->safeAddIndex('User_Sessions', ['member_id'], 'idx_sessions_member_id');

        $this->safeAddIndex('Homepage_Articles', ['is_pinned', 'created_at'], 'idx_hp_articles_pin_created');
        $this->safeAddIndex('Homepage_Media', ['type', 'created_at'], 'idx_hp_media_type_created');

        $this->safeAddIndex('Birthday_Assignments', ['assign_year', 'assign_month'], 'idx_bday_assign_date');
        $this->safeAddIndex('Birthday_Assignments', ['member_id'], 'idx_bday_member_id');

        $this->safeAddIndex('Equipment', ['status'], 'idx_equipment_status');
        $this->safeAddIndex('Equipment', ['borrower_id'], 'idx_equipment_borrower');

        $this->safeAddIndex('Internal_Announcements', ['is_pinned', 'created_at'], 'idx_ann_pin_created');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->safeDropIndex('Tasks', 'idx_tasks_assignee_id');
        $this->safeDropIndex('Tasks', 'idx_tasks_dept_status');
        $this->safeDropIndex('Tasks', 'idx_tasks_status');
        $this->safeDropIndex('Tasks', 'idx_tasks_created_at');

        $this->safeDropIndex('Members', 'idx_members_dept_status');
        $this->safeDropIndex('Members', 'idx_members_role_status');
        $this->safeDropIndex('Members', 'idx_members_status');

        $this->safeDropIndex('Fanpage_Drafts', 'idx_drafts_author_status');
        $this->safeDropIndex('Fanpage_Drafts', 'idx_drafts_status');
        $this->safeDropIndex('Fanpage_Drafts', 'idx_drafts_created_at');

        $this->safeDropIndex('Recruitment_Candidates', 'idx_cand_season_status');
        $this->safeDropIndex('Recruitment_Candidates', 'idx_cand_interview_code');
        $this->safeDropIndex('Recruitment_Candidates', 'idx_cand_season_created');

        $this->safeDropIndex('Recruitment_Scores', 'idx_scores_cand_crit');
        $this->safeDropIndex('Recruitment_Scores', 'idx_scores_season_id');
        $this->safeDropIndex('Recruitment_Scores', 'idx_scores_interviewer');
        $this->safeDropIndex('Recruitment_Scores', 'idx_scores_lookup');

        $this->safeDropIndex('Recruitment_Criteria', 'idx_criteria_season_sort');

        if (Schema::hasTable('Recruitment_Evaluations') || Schema::hasTable('recruitment_evaluations')) {
            $this->safeDropIndex('Recruitment_Evaluations', 'idx_eval_cand_season');
            $this->safeDropIndex('Recruitment_Evaluations', 'idx_eval_interviewer');
        }

        $this->safeDropIndex('Finances', 'idx_finances_type_status');
        $this->safeDropIndex('Finances', 'idx_finances_record_date');
        $this->safeDropIndex('Finances', 'idx_finances_created_at');

        $this->safeDropIndex('User_Sessions', 'idx_sessions_active_last');
        $this->safeDropIndex('User_Sessions', 'idx_sessions_member_id');

        $this->safeDropIndex('Homepage_Articles', 'idx_hp_articles_pin_created');
        $this->safeDropIndex('Homepage_Media', 'idx_hp_media_type_created');

        $this->safeDropIndex('Birthday_Assignments', 'idx_bday_assign_date');
        $this->safeDropIndex('Birthday_Assignments', 'idx_bday_member_id');

        $this->safeDropIndex('Equipment', 'idx_equipment_status');
        $this->safeDropIndex('Equipment', 'idx_equipment_borrower');

        $this->safeDropIndex('Internal_Announcements', 'idx_ann_pin_created');
    }

    /**
     * Safely add an index if the table exists and index doesn't already exist.
     */
    private function safeAddIndex(string $table, array $columns, string $indexName): void
    {
        $realTable = $this->resolveTableName($table);
        if (!$realTable) return;

        try {
            $existing = collect(DB::select("SHOW INDEX FROM `{$realTable}`"))
                ->pluck('Key_name')
                ->unique();

            if ($existing->contains($indexName)) {
                return;
            }

            Schema::table($realTable, function (Blueprint $t) use ($columns, $indexName) {
                $t->index($columns, $indexName);
            });
        } catch (\Throwable $e) {
            // Silently ignore if already created or column missing
        }
    }

    /**
     * Safely drop an index if exists.
     */
    private function safeDropIndex(string $table, string $indexName): void
    {
        $realTable = $this->resolveTableName($table);
        if (!$realTable) return;

        try {
            $existing = collect(DB::select("SHOW INDEX FROM `{$realTable}`"))
                ->pluck('Key_name')
                ->unique();

            if ($existing->contains($indexName)) {
                Schema::table($realTable, function (Blueprint $t) use ($indexName) {
                    $t->dropIndex($indexName);
                });
            }
        } catch (\Throwable $e) {}
    }

    /**
     * Resolve exact table name accounting for case differences between OS/MySQL configurations.
     */
    private function resolveTableName(string $table): ?string
    {
        if (Schema::hasTable($table)) return $table;
        $studly = \Illuminate\Support\Str::studly($table);
        if (Schema::hasTable($studly)) return $studly;
        $lower = strtolower($table);
        if (Schema::hasTable($lower)) return $lower;
        return null;
    }
};
