<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Members
        if (!Schema::hasTable('Members')) {
            Schema::create('Members', function (Blueprint $table) {
                $table->increments('id');
                $table->string('member_code', 50)->unique();
                $table->string('username', 100)->unique();
                $table->string('password', 255);
                $table->string('full_name', 255);
                $table->string('role', 50)->default('member');
                $table->string('role_title', 100)->default('Thành Viên VMC');
                $table->string('class_name', 50)->nullable();
                $table->string('department', 100)->nullable();
                $table->string('term', 50)->nullable();
                $table->longText('avatar_url')->nullable();
                $table->string('phone', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->string('dob', 50)->nullable();
                $table->text('address')->nullable();
                $table->text('facebook')->nullable();
                $table->integer('points')->default(0);
                $table->boolean('is_first_login')->default(true);
                $table->string('status', 50)->default('Active');
                $table->longText('milestones')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 2. Member_Milestones
        if (!Schema::hasTable('Member_Milestones')) {
            Schema::create('Member_Milestones', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('member_id', 100);
                $table->string('date', 50)->nullable();
                $table->text('title')->nullable();
                $table->string('badge_text', 100)->nullable();
                $table->string('badge_style', 255)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 3. Generations
        if (!Schema::hasTable('Generations')) {
            Schema::create('Generations', function (Blueprint $table) {
                $table->string('id', 50)->primary();
                $table->string('name', 100);
                $table->string('years', 100)->nullable();
                $table->string('description', 255)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });

            DB::table('Generations')->insertOrIgnore([
                ['id' => 'gen-6', 'name' => 'Gen 6', 'years' => '2025-2026', 'description' => '✨ Gen 6 (2025 - 2026)'],
                ['id' => 'gen-5', 'name' => 'Gen 5', 'years' => '2024-2025', 'description' => '🎓 Gen 5 (2024 - 2025)'],
                ['id' => 'gen-4', 'name' => 'Gen 4', 'years' => '2023-2024', 'description' => '🏆 Gen 4 (2023 - 2024)'],
                ['id' => 'gen-3', 'name' => 'Gen 3', 'years' => '2022-2023', 'description' => '👑 Gen 3 (2022 - 2023)'],
                ['id' => 'gen-2', 'name' => 'Gen 2', 'years' => '2021-2022', 'description' => '🚀 Gen 2 (2021 - 2022)'],
                ['id' => 'gen-1', 'name' => 'Gen 1', 'years' => '2020-2021', 'description' => '🌟 Gen 1 (2020 - 2021)'],
            ]);
        }

        // 4. User_Sessions
        if (!Schema::hasTable('User_Sessions')) {
            Schema::create('User_Sessions', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('member_id', 100);
                $table->string('username', 100)->nullable();
                $table->string('name', 255)->nullable();
                $table->string('role_title', 100)->nullable();
                $table->string('ip_address', 100)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('device_type', 50)->nullable();
                $table->dateTime('login_time')->useCurrent();
                $table->dateTime('last_active')->useCurrent()->useCurrentOnUpdate();
                $table->tinyInteger('is_active')->default(1);
                $table->string('logout_reason', 50)->nullable();
            });
        }

        // 5. Tasks
        if (!Schema::hasTable('Tasks')) {
            Schema::create('Tasks', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->string('department', 100)->default('hr_external');
                $table->string('assignee_id', 100)->nullable();
                $table->string('created_by', 100)->nullable();
                $table->dateTime('deadline')->nullable();
                $table->string('status', 50)->default('todo');
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 6. Fanpage_Drafts
        if (!Schema::hasTable('Fanpage_Drafts')) {
            Schema::create('Fanpage_Drafts', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->text('content_link')->nullable();
                $table->string('author_id', 100)->nullable();
                $table->string('status', 50)->default('pending');
                $table->dateTime('publishDate')->nullable();
                $table->string('graderId', 100)->nullable();
                $table->string('gradingStatus', 50)->default('none');
                $table->longText('content')->nullable();
                $table->string('author', 255)->nullable();
                $table->integer('likes_count')->default(0);
                $table->integer('shares_count')->default(0);
                $table->integer('comments_count')->default(0);
                $table->integer('content_score')->default(0);
                $table->integer('final_score')->default(0);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 7. Equipment
        if (!Schema::hasTable('Equipment')) {
            Schema::create('Equipment', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('code', 100);
                $table->string('name', 255);
                $table->string('category', 100)->nullable();
                $table->string('condition_status', 50)->default('Tốt');
                $table->string('status', 50)->default('available');
                $table->string('borrower_id', 100)->nullable();
                $table->dateTime('return_date')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 8. Internal_Announcements
        if (!Schema::hasTable('Internal_Announcements')) {
            Schema::create('Internal_Announcements', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->longText('content')->nullable();
                $table->string('author_id', 100)->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 9. Finances
        if (!Schema::hasTable('Finances')) {
            Schema::create('Finances', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('type', 50)->default('income');
                $table->integer('amount')->default(0);
                $table->text('description')->nullable();
                $table->string('record_date', 50)->nullable();
                $table->string('recorded_by', 255)->nullable();
                $table->string('date', 50)->nullable();
                $table->string('logged_by', 255)->nullable();
                $table->string('status', 50)->default('approved');
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 10. Meetings & Meeting_Attendance
        if (!Schema::hasTable('Meetings')) {
            Schema::create('Meetings', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->string('meeting_date', 50)->nullable();
                $table->string('meeting_time', 50)->nullable();
                $table->string('attendance_taker_id', 100)->nullable();
                $table->string('minute_taker_id', 100)->nullable();
                $table->string('status', 50)->default('pending');
                $table->text('minutes_link')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Meeting_Attendance')) {
            Schema::create('Meeting_Attendance', function (Blueprint $table) {
                $table->string('meeting_id', 100);
                $table->string('member_id', 100);
                $table->string('status', 50)->default('present');
                $table->timestamp('created_at')->useCurrent();
                $table->primary(['meeting_id', 'member_id']);
            });
        }

        // 11. Birthday_Assignments & Config & Logs
        if (!Schema::hasTable('Birthday_Assignments')) {
            Schema::create('Birthday_Assignments', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->integer('assign_month');
                $table->integer('assign_year');
                $table->string('member_id', 100);
                $table->text('link_image')->nullable();
                $table->string('status', 50)->default('pending');
                $table->longText('submissions')->nullable();
                $table->text('excuse_reason')->nullable();
                $table->string('excuse_status', 50)->default('none');
                $table->tinyInteger('is_penalized')->default(0);
                $table->text('wishes_template')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Monthly_Birthday_Config')) {
            Schema::create('Monthly_Birthday_Config', function (Blueprint $table) {
                $table->string('id', 50)->primary();
                $table->integer('config_month');
                $table->integer('config_year');
                $table->text('wish_template')->nullable();
                $table->text('card_url')->nullable();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                $table->unique(['config_month', 'config_year'], 'uq_month_year');
            });
        }

        if (!Schema::hasTable('Birthday_Mail_Logs')) {
            Schema::create('Birthday_Mail_Logs', function (Blueprint $table) {
                $table->increments('id');
                $table->string('member_id', 100);
                $table->date('sent_date');
                $table->integer('sent_year');
                $table->string('status', 50)->default('success');
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['member_id', 'sent_year'], 'unique_member_year');
            });
        }

        if (!Schema::hasTable('Task_Deadline_Mail_Logs')) {
            Schema::create('Task_Deadline_Mail_Logs', function (Blueprint $table) {
                $table->increments('id');
                $table->string('task_id', 100);
                $table->date('sent_date');
                $table->string('type', 50);
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['task_id', 'sent_date'], 'unique_task_date');
            });
        }

        // 12. Resources & Department_Drives & Attendance_Records
        if (!Schema::hasTable('Resources')) {
            Schema::create('Resources', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->string('category', 100)->nullable();
                $table->text('link')->nullable();
                $table->string('uploader_id', 100)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Department_Drives')) {
            Schema::create('Department_Drives', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('dept_name', 100)->unique();
                $table->text('drive_link')->nullable();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });

            DB::table('Department_Drives')->insertOrIgnore([
                ['id' => 'drive-bcn', 'dept_name' => 'Ban Chủ Nhiệm', 'drive_link' => 'https://drive.google.com'],
                ['id' => 'drive-cv', 'dept_name' => 'Ban Cố Vấn', 'drive_link' => 'https://drive.google.com'],
                ['id' => 'drive-dnns', 'dept_name' => 'Ban Đối Ngoại - Nhân Sự', 'drive_link' => 'https://drive.google.com'],
                ['id' => 'drive-sx', 'dept_name' => 'Ban Sản Xuất Media', 'drive_link' => 'https://drive.google.com'],
                ['id' => 'drive-ndpt', 'dept_name' => 'Ban Nội Dung - Phát Thanh', 'drive_link' => 'https://drive.google.com'],
            ]);
        }

        if (!Schema::hasTable('Attendance_Records')) {
            Schema::create('Attendance_Records', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('session_name', 255)->nullable();
                $table->string('record_date', 50)->nullable();
                $table->longText('present_members')->nullable();
                $table->string('status', 50)->default('approved');
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 13. Recruitment Module
        if (!Schema::hasTable('Recruitment_Seasons')) {
            Schema::create('Recruitment_Seasons', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('name', 255);
                $table->integer('quota')->default(0);
                $table->string('department', 255)->nullable();
                $table->longText('scoring_type')->nullable();
                $table->longText('interviewer_ids')->nullable();
                $table->tinyInteger('is_active')->default(0);
                $table->string('created_by', 100)->nullable();
                $table->string('active_round', 50)->default('don');
                $table->text('teamwork_scorer_ids')->nullable();
                $table->text('challenge_process_scorer_ids')->nullable();
                $table->text('challenge_result_scorer_ids')->nullable();
                $table->string('lead_interviewer_id', 100)->nullable();
                $table->text('selected_questions')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Recruitment_Criteria')) {
            Schema::create('Recruitment_Criteria', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('season_id', 100);
                $table->string('criteria_name', 255);
                $table->integer('max_score')->default(10);
                $table->integer('sort_order')->default(0);
                $table->string('round_type', 50)->default('teamwork');
                $table->string('difficulty', 50)->default('Trung bình');
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Recruitment_Candidates')) {
            Schema::create('Recruitment_Candidates', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('interview_code', 100)->nullable();
                $table->string('season_id', 100);
                $table->string('full_name', 255);
                $table->string('class_name', 50)->nullable();
                $table->string('phone', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->string('desired_dept', 100)->nullable();
                $table->string('interviewer_id', 100)->nullable();
                $table->text('interviewer_ids')->nullable();
                $table->text('teamwork_scorer_ids')->nullable();
                $table->text('challenge_process_scorer_ids')->nullable();
                $table->text('challenge_result_scorer_ids')->nullable();
                $table->string('status', 50)->default('pending');
                $table->text('notes')->nullable();
                $table->text('application_answers')->nullable();
                $table->string('lead_interviewer_id', 100)->nullable();
                $table->text('selected_questions')->nullable();
                $table->text('facebook')->nullable();
                $table->text('challenge_topic')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Recruitment_Scores')) {
            Schema::create('Recruitment_Scores', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('season_id', 100)->nullable();
                $table->string('candidate_id', 100);
                $table->string('interviewer_id', 100);
                $table->string('criteria_id', 100);
                $table->decimal('score', 5, 2)->default(0);
                $table->text('comments')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('Recruitment_Evaluations')) {
            Schema::create('Recruitment_Evaluations', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('season_id', 100);
                $table->string('candidate_id', 100);
                $table->string('interview_code', 100)->nullable();
                $table->string('interviewer_id', 100);
                $table->string('round_type', 50);
                $table->decimal('total_score', 5, 2)->default(0);
                $table->decimal('avg_score', 5, 2)->default(0);
                $table->longText('scores_json')->nullable();
                $table->text('comments')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                $table->unique(['candidate_id', 'interviewer_id', 'round_type'], 'candidate_interviewer_round');
            });
        }

        // 14. System_Settings
        if (!Schema::hasTable('System_Settings')) {
            Schema::create('System_Settings', function (Blueprint $table) {
                $table->string('setting_key', 100)->primary();
                $table->longText('setting_value')->nullable();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });

            DB::table('System_Settings')->insertOrIgnore([
                ['setting_key' => 'recruitment_season_active', 'setting_value' => '0'],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe down: do nothing to prevent accidental loss
    }
};
