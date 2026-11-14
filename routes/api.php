<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\DraftController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\BirthdayController;
use App\Http\Controllers\Api\UserSessionController;
use App\Http\Controllers\Api\MilestoneController;
use App\Http\Controllers\Api\GenerationController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\DepartmentDriveController;
use App\Http\Controllers\Api\AttendanceRecordController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\HomepageController;

/*
|--------------------------------------------------------------------------
| VMC Portal API Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Email notification
Route::post('/send-email', [EmailController::class, 'send']);

// Members Management
Route::get('/members', [MemberController::class, 'index']);
Route::post('/members/create', [MemberController::class, 'store']);
Route::put('/members/{id}', [MemberController::class, 'update']);
Route::delete('/members/{id}', [MemberController::class, 'destroy']);
Route::post('/members/reset-password', [MemberController::class, 'resetPassword']);

// Tasks Management
Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

// Fanpage Drafts
Route::get('/drafts', [DraftController::class, 'index']);
Route::post('/drafts', [DraftController::class, 'store']);
Route::put('/drafts/{id}', [DraftController::class, 'update']);

// Equipment Inventory
Route::get('/equipment', [EquipmentController::class, 'index']);
Route::post('/equipment', [EquipmentController::class, 'store']);
Route::put('/equipment/{id}', [EquipmentController::class, 'update']);

// Internal Announcements
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::post('/announcements', [AnnouncementController::class, 'store']);
Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

// Finances Management
Route::get('/finances', [FinanceController::class, 'index']);
Route::post('/finances', [FinanceController::class, 'store']);
Route::put('/finances/{id}', [FinanceController::class, 'update']);
Route::delete('/finances/{id}', [FinanceController::class, 'destroy']);

// Meetings & Meeting Attendance
Route::get('/meetings', [MeetingController::class, 'index']);
Route::post('/meetings', [MeetingController::class, 'store']);
Route::put('/meetings/{id}', [MeetingController::class, 'update']);
Route::delete('/meetings/{id}', [MeetingController::class, 'destroy']);

// Birthday Management
Route::get('/birthday-assignments', [BirthdayController::class, 'index']);
Route::post('/birthday-assignments', [BirthdayController::class, 'store']);
Route::put('/birthday-assignments/{id}', [BirthdayController::class, 'update']);
Route::get('/birthday-config', [BirthdayController::class, 'getConfig']);
Route::put('/birthday-config', [BirthdayController::class, 'updateConfig']);
Route::post('/birthday-config/upload-card', [BirthdayController::class, 'uploadCard']);
Route::post('/birthday/upload', [BirthdayController::class, 'uploadBirthdayMedia']);
Route::post('/birthdays/trigger-daily-emails', [BirthdayController::class, 'triggerDailyEmails']);

// User Sessions (Super Admin)
Route::get('/sessions', [UserSessionController::class, 'index']);
Route::post('/sessions/login', [UserSessionController::class, 'login']);
Route::post('/sessions/heartbeat', [UserSessionController::class, 'heartbeat']);
Route::delete('/sessions/{id}', [UserSessionController::class, 'destroy']);
Route::post('/sessions/logout', [UserSessionController::class, 'logout']);
Route::post('/sessions/revoke-all', [UserSessionController::class, 'revokeAll']);

// Milestones
Route::get('/milestones', [MilestoneController::class, 'index']);
Route::post('/milestones', [MilestoneController::class, 'store']);
Route::delete('/milestones/{id}', [MilestoneController::class, 'destroy']);

// Generations
Route::get('/generations', [GenerationController::class, 'index']);
Route::post('/generations', [GenerationController::class, 'store']);
Route::delete('/generations/{id}', [GenerationController::class, 'destroy']);

// Resources Library
Route::get('/resources', [ResourceController::class, 'index']);
Route::post('/resources', [ResourceController::class, 'store']);
Route::delete('/resources/{id}', [ResourceController::class, 'destroy']);

// Department Drives
Route::get('/department-drives', [DepartmentDriveController::class, 'index']);
Route::put('/department-drives/{id}', [DepartmentDriveController::class, 'update']);

// Attendance Records
Route::get('/attendance-records', [AttendanceRecordController::class, 'index']);
Route::post('/attendance-records', [AttendanceRecordController::class, 'store']);
Route::put('/attendance-records/{id}', [AttendanceRecordController::class, 'update']);

// Recruitment Module
Route::get('/recruitment/seasons', [RecruitmentController::class, 'indexSeasons']);
Route::post('/recruitment/seasons', [RecruitmentController::class, 'storeSeason']);
Route::put('/recruitment/seasons/{id}', [RecruitmentController::class, 'updateSeason']);
Route::delete('/recruitment/seasons/{id}', [RecruitmentController::class, 'destroySeason']);

Route::get('/recruitment/criteria/{seasonId}', [RecruitmentController::class, 'indexCriteria']);
Route::post('/recruitment/criteria', [RecruitmentController::class, 'storeCriteria']);
Route::put('/recruitment/criteria/{id}', [RecruitmentController::class, 'updateCriteria']);
Route::delete('/recruitment/criteria/{id}', [RecruitmentController::class, 'destroyCriteria']);

Route::get('/recruitment/candidates/{seasonId}', [RecruitmentController::class, 'indexCandidates']);
Route::post('/recruitment/candidates', [RecruitmentController::class, 'storeCandidate']);
Route::put('/recruitment/candidates/{id}', [RecruitmentController::class, 'updateCandidate']);
Route::delete('/recruitment/candidates/{id}', [RecruitmentController::class, 'destroyCandidate']);
Route::put('/recruitment/candidates/{id}/result', [RecruitmentController::class, 'updateCandidateResult']);

Route::post('/recruitment/scores', [RecruitmentController::class, 'storeScores']);
Route::get('/recruitment/scores/summary/{seasonId}', [RecruitmentController::class, 'scoresSummary']);
Route::get('/recruitment/scores/submitted', [RecruitmentController::class, 'submittedScores']);

// System Settings
Route::get('/admin/system-settings', [SystemSettingController::class, 'index']);
Route::post('/admin/system-settings', [SystemSettingController::class, 'updateSetting']);
Route::put('/admin/recruitment-season/toggle', [SystemSettingController::class, 'toggleSeason']);
Route::post('/homepage/upload-image', [SystemSettingController::class, 'uploadImage']);

// Health check (deploy)
Route::get('/health', function () {
    $db = 'up';
    $dbError = null;

    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        \Illuminate\Support\Facades\DB::connection()->select('select 1');
    } catch (\Throwable $e) {
        $db = 'down';
        $dbError = get_class($e) . ': ' . $e->getMessage();
    }

    $connection = strtolower((string) config('database.default'));
    $config = config("database.connections.{$connection}", []);

    // Khi dùng DATABASE_URL/DB_URL thì host/port/database thật nằm trong URL,
    // các key DB_HOST... chỉ là giá trị mặc định không dùng tới.
    $effective = [
        'host' => $config['host'] ?? null,
        'port' => $config['port'] ?? null,
        'database' => $config['database'] ?? null,
    ];
    if (!empty($config['url'])) {
        $parts = parse_url((string) $config['url']);
        if (is_array($parts)) {
            $effective = [
                'host' => $parts['host'] ?? $effective['host'],
                'port' => $parts['port'] ?? $effective['port'],
                'database' => isset($parts['path']) ? ltrim($parts['path'], '/') : $effective['database'],
            ];
        }
    }

    // Table diagnostics: shows which tables exist and how many rows each one has.
    // This makes it obvious when a page is empty because a table is missing/not migrated.
    $expectedTables = [
        'Members', 'User_Sessions', 'Member_Milestones', 'Generations',
        'Tasks', 'Fanpage_Drafts', 'Equipment', 'Internal_Announcements',
        'Finances', 'Meetings', 'Meeting_Attendance', 'Birthday_Assignments',
        'Monthly_Birthday_Config', 'Birthday_Mail_Logs', 'Task_Deadline_Mail_Logs',
        'Resources', 'Department_Drives', 'Attendance_Records',
        'Recruitment_Seasons', 'Recruitment_Criteria', 'Recruitment_Candidates',
        'Recruitment_Scores', 'Recruitment_Evaluations', 'System_Settings',
        'homepage_articles', 'homepage_media',
    ];
    $tables = [];
    // Render gọi endpoint này liên tục làm health check, nên mặc định chỉ ping DB.
    // Thêm ?tables=1 (hoặc ?full=1) để lấy bảng chẩn đoán đầy đủ.
    $detailed = request()->boolean('tables') || request()->boolean('full');
    if ($db === 'up' && $detailed) {
        foreach ($expectedTables as $table) {
            try {
                if (!\Illuminate\Support\Facades\Schema::hasTable($table)) {
                    $tables[$table] = ['exists' => false, 'rows' => null];
                    continue;
                }
                $tables[$table] = [
                    'exists' => true,
                    'rows' => \Illuminate\Support\Facades\DB::table($table)->count(),
                ];
            } catch (\Throwable $e) {
                $tables[$table] = ['exists' => null, 'rows' => null, 'error' => $e->getMessage()];
            }
        }
    }

    return response()->json([
        'success' => true,
        'status' => $db === 'up' ? 'ok' : 'degraded',
        'database' => $db,
        'db_error' => $dbError,
        'db' => [
            'connection' => $connection,
            'host' => $effective['host'] ?? null,
            'port' => $effective['port'] ?? null,
            'database' => $effective['database'] ?? null,
            'sslmode' => $config['sslmode'] ?? null,
        ],
        'app_key_configured' => !empty(config('app.key')),
        'tables' => $tables,
        'mail' => [
            'provider' => config('mail.default'),
            'system_mailer' => config('mail.types.system.mailer'),
            'notification_mailer' => config('mail.types.notification.mailer'),
        ],
    ]);
});

// Homepage Articles & Media (Dedicated Relational Tables)
Route::get('/homepage/articles', [HomepageController::class, 'indexArticles']);
Route::post('/homepage/articles', [HomepageController::class, 'storeArticle']);
Route::delete('/homepage/articles/{id}', [HomepageController::class, 'destroyArticle']);

Route::get('/homepage/media', [HomepageController::class, 'indexMedia']);
Route::post('/homepage/media', [HomepageController::class, 'storeMedia']);
Route::delete('/homepage/media/{id}', [HomepageController::class, 'destroyMedia']);

