<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BirthdayAssignment;
use App\Models\MonthlyBirthdayConfig;
use App\Models\BirthdayMailLog;
use App\Models\Member;
use App\Services\MailService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class BirthdayController extends Controller
{
    public function index()
    {
        try {
            $rows = BirthdayAssignment::orderBy('assign_year', 'desc')
                ->orderBy('assign_month', 'desc')
                ->get();

            $data = $rows->map(function ($b) {
                $subs = [];
                if (!empty($b->submissions)) {
                    $subs = is_string($b->submissions) ? (json_decode($b->submissions, true) ?: []) : $b->submissions;
                }
                return [
                    'id' => $b->id,
                    'month' => (int) $b->assign_month,
                    'year' => (int) $b->assign_year,
                    'memberId' => $b->member_id,
                    'link' => $b->link_image,
                    'wishesTemplate' => $b->wishes_template ?: '',
                    'status' => $b->status ?: 'pending',
                    'submissions' => $subs,
                    'excuseReason' => $b->excuse_reason ?: '',
                    'excuseStatus' => $b->excuse_status ?: 'none',
                    'isPenalized' => (bool) $b->is_penalized,
                    'createdAt' => $b->created_at,
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $bdayId = $request->input('id') ?: ('bday-' . time() . '-' . rand(100, 999));
            $mMonth = (int) ($request->input('month') ?: $request->input('assign_month'));
            $mYear = (int) ($request->input('year') ?: $request->input('assign_year'));
            $memId = $request->input('memberId') ?: $request->input('member_id');
            $link = $request->input('link') ?: $request->input('link_image');
            $status = $request->input('status', 'pending');
            $subs = $request->input('submissions', []);
            $subsStr = is_array($subs) ? json_encode($subs, JSON_UNESCAPED_UNICODE) : (string) $subs;

            BirthdayAssignment::create([
                'id' => $bdayId,
                'assign_month' => $mMonth,
                'assign_year' => $mYear,
                'member_id' => (string) $memId,
                'link_image' => $link,
                'status' => $status,
                'submissions' => $subsStr,
            ]);

            if ($memId) {
                $assignee = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memId])
                    ->orWhere('member_code', (string) $memId)
                    ->orWhere('username', (string) $memId)
                    ->first();

                if ($assignee && $assignee->email) {
                    $allMembers = Member::select('full_name', 'class_name', 'department', 'dob')->get();
                    $monthMembers = $allMembers->filter(function ($m) use ($mMonth) {
                        if (empty($m->dob)) return false;
                        $parts = preg_split('/[\/\-]/', (string) $m->dob);
                        if (count($parts) >= 2) {
                            $monthNum = (strlen($parts[0]) === 4) ? (int) $parts[1] : (int) $parts[1];
                            return $monthNum === $mMonth;
                        }
                        return false;
                    })->values();

                    $tableRows = '';
                    foreach ($monthMembers as $idx => $m) {
                        $tableRows .= '
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">' . ($idx + 1) . '</td>
                              <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">' . htmlspecialchars($m->full_name) . '</td>
                              <td style="padding: 8px; border: 1px solid #cbd5e1; color: #db2777; font-weight: bold;">' . htmlspecialchars($m->dob) . '</td>
                              <td style="padding: 8px; border: 1px solid #cbd5e1;">' . htmlspecialchars($m->class_name ?: 'N/A') . '</td>
                              <td style="padding: 8px; border: 1px solid #cbd5e1;">' . htmlspecialchars($m->department ?: 'Thành Viên') . '</td>
                            </tr>
                        ';
                    }

                    $bdayTableHtml = $monthMembers->isNotEmpty() ? '
                        <h4 style="color: #ec4899; margin-top: 18px; margin-bottom: 8px;">📋 Danh sách tổng quan thành viên sinh nhật tháng ' . $mMonth . ':</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 5px;">
                          <thead>
                            <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
                              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">STT</th>
                              <th style="padding: 8px; border: 1px solid #cbd5e1;">Họ và Tên</th>
                              <th style="padding: 8px; border: 1px solid #cbd5e1;">Ngày Sinh</th>
                              <th style="padding: 8px; border: 1px solid #cbd5e1;">Lớp</th>
                              <th style="padding: 8px; border: 1px solid #cbd5e1;">Ban Chuyên Môn</th>
                            </tr>
                          </thead>
                          <tbody>' . $tableRows . '</tbody>
                        </table>
                    ' : '<p style="font-style: italic; color: #64748b; margin-top: 10px;">Chưa có dữ liệu ngày sinh thành viên trong tháng này.</p>';

                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                          <h3 style="color: #ec4899; margin-top: 0;">🎂 Phân Công Trực Mừng Sinh Nhật Tháng ' . $mMonth . '/' . $mYear . '</h3>
                          <p>Xin chào <strong>' . htmlspecialchars($assignee->full_name) . '</strong>,</p>
                          <p>Bạn đã được phân công phụ trách mừng sinh nhật thành viên trong <strong>Tháng ' . $mMonth . '/' . $mYear . '</strong>.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p><strong>Nhiệm vụ:</strong> Soạn lời chúc và đăng/nộp ảnh chúc mừng sinh nhật cho từng thành viên có sinh nhật trong tháng ' . $mMonth . '.</p>
                          ' . $bdayTableHtml . '
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 18px 0;"/>
                          <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    MailService::send($assignee->email, "🎂 [VMC Birthday] Phân công trực mừng sinh nhật tháng {$mMonth}/{$mYear}", $html);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $bdayId,
                    'month' => $mMonth,
                    'year' => $mYear,
                    'memberId' => $memId,
                    'status' => $status,
                    'submissions' => $subs,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $assignment = BirthdayAssignment::find($id);
            if (!$assignment) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy phân công sinh nhật'], 404);
            }

            if ($request->has('link') || $request->has('link_image')) {
                $assignment->link_image = $request->input('link') ?: $request->input('link_image');
            }
            if ($request->has('status')) $assignment->status = $request->input('status');
            if ($request->has('excuseReason') || $request->has('excuse_reason')) {
                $assignment->excuse_reason = $request->input('excuseReason') ?: $request->input('excuse_reason');
            }
            if ($request->has('excuseStatus') || $request->has('excuse_status')) {
                $assignment->excuse_status = $request->input('excuseStatus') ?: $request->input('excuse_status');
            }
            if ($request->has('isPenalized') || $request->has('is_penalized')) {
                $assignment->is_penalized = (bool) ($request->input('isPenalized') ?? $request->input('is_penalized'));
            }

            if ($request->has('submissions')) {
                $subs = $request->input('submissions');
                $newSubs = is_string($subs) ? (json_decode($subs, true) ?: []) : $subs;
                $oldSubs = !empty($assignment->submissions) 
                    ? (is_string($assignment->submissions) ? json_decode($assignment->submissions, true) : $assignment->submissions) 
                    : [];

                $assignment->submissions = is_array($subs) ? json_encode($subs, JSON_UNESCAPED_UNICODE) : $subs;

                // Check for new explanation reasons
                $newNoPhotoMemberId = null;
                $noPhotoReason = '';
                if (is_array($newSubs)) {
                    foreach ($newSubs as $k => $val) {
                        $valStr = (string) $val;
                        if (str_starts_with($valStr, 'Lý do:') && (!isset($oldSubs[$k]) || $oldSubs[$k] !== $valStr)) {
                            $newNoPhotoMemberId = $k;
                            $noPhotoReason = preg_replace('/^Lý do:\s*/iu', '', $valStr);
                            break;
                        }
                    }
                }

                if ($newNoPhotoMemberId) {
                    $bdayMember = Member::find($newNoPhotoMemberId);
                    $assignee = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $assignment->member_id])
                        ->orWhere('member_code', (string) $assignment->member_id)
                        ->first();

                    $reviewers = Member::where('role', 'admin')
                        ->orWhereRaw("LOWER(department) LIKE '%đối ngoại%'")
                        ->orWhereRaw("LOWER(department) LIKE '%nhân sự%'")
                        ->orWhereRaw("LOWER(department) LIKE '%đn-ns%'")
                        ->get();

                    $emails = $reviewers->pluck('email')->filter()->values()->toArray();
                    if (!empty($emails)) {
                        $html = '
                            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                              <h3 style="color: #d97706;">⚠️ Báo cáo không có ảnh sinh nhật thành viên</h3>
                              <p>Chào bạn,</p>
                              <p>Thành viên <strong>' . htmlspecialchars($assignee ? $assignee->full_name : 'Người phụ trách') . '</strong> vừa nộp giải trình không có ảnh/video cho thành viên mừng sinh nhật.</p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p><strong>Thành viên sinh nhật:</strong> ' . htmlspecialchars($bdayMember ? $bdayMember->full_name : 'Thành viên') . '</p>
                              <p><strong>Tháng sinh nhật:</strong> Tháng ' . $assignment->assign_month . '/' . $assignment->assign_year . '</p>
                              <p><strong>Lý do giải trình:</strong> <span style="color: #b45309; font-weight: bold;">"' . htmlspecialchars($noPhotoReason) . '"</span></p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                            </div>
                        ';
                        MailService::send(implode(',', $emails), "⚠️ [VMC Birthday] Giải trình không nộp ảnh sinh nhật tháng {$assignment->assign_month}/{$assignment->assign_year}", $html);
                    }
                }
            }

            $assignment->save();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getConfig(Request $request)
    {
        $month = (int) $request->query('month');
        $year = (int) $request->query('year');

        if (!$month || !$year) {
            return response()->json(['success' => false, 'error' => 'Thiếu tham số month/year'], 400);
        }

        $config = MonthlyBirthdayConfig::where('config_month', $month)
            ->where('config_year', $year)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $config ? [
                'wishTemplate' => $config->wish_template ?: '',
                'cardUrl' => $config->card_url ?: '',
            ] : [
                'wishTemplate' => '',
                'cardUrl' => '',
            ]
        ]);
    }

    public function updateConfig(Request $request)
    {
        $month = (int) $request->input('month');
        $year = (int) $request->input('year');

        if (!$month || !$year) {
            return response()->json(['success' => false, 'error' => 'Thiếu tham số month/year'], 400);
        }

        $id = "bday-cfg-{$month}-{$year}";
        MonthlyBirthdayConfig::updateOrCreate(
            ['config_month' => $month, 'config_year' => $year],
            [
                'id' => $id,
                'wish_template' => $request->input('wishTemplate', ''),
                'card_url' => $request->input('cardUrl', ''),
            ]
        );

        return response()->json(['success' => true]);
    }

    public function uploadCard(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy file!'], 400);
        }

        $file = $request->file('file');
        $filename = 'thiep-sinh-nhat-' . time() . '-' . $file->getClientOriginalName();
        $path = $file->storeAs('birthday_cards', $filename, 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'webViewLink' => $url,
        ]);
    }

    public function uploadBirthdayMedia(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy file tải lên!'], 400);
        }

        $file = $request->file('file');
        $filename = 'bday-media-' . time() . '-' . $file->getClientOriginalName();
        $path = $file->storeAs('birthday_uploads', $filename, 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'webViewLink' => $url,
            'fileId' => $filename,
        ]);
    }

    /**
     * POST /api/birthdays/trigger-daily-emails
     */
    public function triggerDailyEmails()
    {
        $results = self::sendDailyBirthdayEmails();
        return response()->json([
            'success' => true,
            'count' => count($results),
            'data' => $results,
        ]);
    }

    public static function sendDailyBirthdayEmails(): array
    {
        $results = [];
        try {
            $today = getdate();
            $todayDay = $today['mday'];
            $todayMonth = $today['mon'];
            $currentYear = $today['year'];

            $assignment = BirthdayAssignment::where('assign_month', $todayMonth)
                ->orderBy('assign_year', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();

            $customTemplate = ($assignment && !empty($assignment->wishes_template))
                ? trim($assignment->wishes_template)
                : '';

            $members = Member::whereNotNull('email')
                ->where('email', '!=', '')
                ->where(function ($q) {
                    $q->whereNull('status')->orWhere('status', 'Active');
                })
                ->get();

            foreach ($members as $m) {
                if (empty($m->dob)) continue;
                $parts = preg_split('/[\/\-]/', (string) $m->dob);
                if (count($parts) < 2) continue;

                $dDay = (strlen($parts[0]) === 4) ? (int) $parts[2] : (int) $parts[0];
                $dMonth = (int) $parts[1];

                if ($dDay === $todayDay && $dMonth === $todayMonth) {
                    $alreadySent = BirthdayMailLog::where('member_id', (string) $m->id)
                        ->where('sent_year', $currentYear)
                        ->exists();

                    if ($alreadySent) continue;

                    if ($customTemplate) {
                        $formattedWish = str_replace(
                            ['{name}', '{full_name}', '{class}', '{department}'],
                            [$m->full_name, $m->full_name, $m->class_name ?: 'VMC', $m->department ?: 'Thành Viên VMC'],
                            $customTemplate
                        );
                        $formattedWish = nl2br(htmlspecialchars($formattedWish));
                        $wishContentHtml = '
                            <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f472b6; line-height: 1.6;">
                              <p style="font-size: 16px; margin-top: 0;">Thân gửi <strong>' . htmlspecialchars($m->full_name) . '</strong> (' . htmlspecialchars($m->department ?: 'Thành Viên VMC') . ' - Lớp ' . htmlspecialchars($m->class_name ?: 'VMC') . '),</p>
                              <div style="font-size: 15px; color: #334155; margin: 15px 0;">' . $formattedWish . '</div>
                            </div>
                        ';
                    } else {
                        $wishContentHtml = '
                            <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f472b6; line-height: 1.6;">
                              <p style="font-size: 16px; margin-top: 0;">Thân gửi <strong>' . htmlspecialchars($m->full_name) . '</strong> (' . htmlspecialchars($m->department ?: 'Thành Viên VMC') . ' - Lớp ' . htmlspecialchars($m->class_name ?: 'VMC') . '),</p>
                              <p>Hôm nay là một ngày vô cùng đặc biệt! Thay mặt cho toàn thể Đại gia đình <strong>CLB Truyền Thông Trường THPT Vĩnh Bảo (VMC)</strong>, Ban Đối Ngoại - Nhân Sự xin gửi tới bạn những lời chúc mừng sinh nhật ấm áp và rực rỡ nhất! 🥳🎈</p>
                              <p>Chúc bạn tuổi mới luôn ngập tràn niềm vui, sức khỏe, học tập xuất sắc và luôn giữ vững ngọn lửa nhiệt huyết để tiếp tục cùng VMC tạo nên những thước phim, bài viết và kỷ niệm thanh xuân tuyệt vời nhất! 💖✨</p>
                              <div style="background-color: #fdf2f8; padding: 15px 20px; border-radius: 12px; border-left: 4px solid #ec4899; margin: 20px 0; font-style: italic; color: #831843;">
                                "Tuổi mới tỏa sáng rực rỡ, luôn tự tin và gặt hái được thật nhiều thành công mới cùng gia đình VMC!" 🌟
                              </div>
                            </div>
                        ';
                    }

                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%); border-radius: 20px; border: 1px solid #fbcfe8; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(236,72,153,0.1);">
                          <div style="text-align: center; margin-bottom: 25px;">
                            <span style="font-size: 50px;">🎂🎉✨</span>
                            <h1 style="color: #db2777; margin: 10px 0 5px 0; font-size: 24px;">HAPPY BIRTHDAY!</h1>
                            <p style="color: #64748b; font-size: 14px; margin: 0;">CLB Truyền Thông THPT Vĩnh Bảo (VMC)</p>
                          </div>
                          ' . $wishContentHtml . '
                          <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b;">
                            <p style="margin: 0;">Trân trọng & Thân yêu,<br/><strong style="color: #db2777;">BAN CHỦ NHIỆM & BAN ĐỐI NGOẠI - NHÂN SỰ VMC</strong></p>
                          </div>
                        </div>
                    ';

                    $sent = MailService::send($m->email, "🎂🎉 Chúc Mừng Sinh Nhật {$m->full_name}! - CLB Truyền Thông Trường THPT Vĩnh Bảo", $html);

                    if ($sent) {
                        BirthdayMailLog::create([
                            'member_id' => (string) $m->id,
                            'sent_date' => date('Y-m-d'),
                            'sent_year' => $currentYear,
                            'status' => 'success',
                        ]);
                        $results[] = ['name' => $m->full_name, 'email' => $m->email, 'status' => 'sent'];
                    } else {
                        $results[] = ['name' => $m->full_name, 'email' => $m->email, 'status' => 'failed'];
                    }
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error in sendDailyBirthdayEmails: ' . $e->getMessage());
        }
        return $results;
    }
}
