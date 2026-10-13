<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\MemberMilestone;
use App\Services\MailService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    /**
     * GET /api/members
     */
    public function index()
    {
        try {
            $members = Member::where('username', '!=', 'admin')
                ->where('member_code', '!=', 'ADMIN')
                ->orderBy('id', 'asc')
                ->get();

            $allMilestones = MemberMilestone::orderBy('created_at', 'asc')->get();

            $milestonesGrouped = [];
            foreach ($allMilestones as $ms) {
                $item = [
                    'id' => $ms->id,
                    'date' => $ms->date,
                    'title' => $ms->title,
                    'badgeText' => $ms->badge_text,
                    'badgeStyle' => $ms->badge_style,
                ];
                $mid = (string) $ms->member_id;
                $milestonesGrouped[$mid][] = $item;
                $milestonesGrouped[strtoupper($mid)][] = $item;
            }

            $data = $members->map(function ($m) use ($milestonesGrouped) {
                $parsed = [];
                if (!empty($m->milestones)) {
                    $parsed = is_string($m->milestones) 
                        ? (json_decode($m->milestones, true) ?: []) 
                        : $m->milestones;
                }
                if (!is_array($parsed)) $parsed = [];

                $mid = (string) $m->id;
                $mCode = strtoupper((string) $m->member_code);
                $msFromTable = $milestonesGrouped[$mid] ?? ($milestonesGrouped[$mCode] ?? []);

                $combined = array_merge($msFromTable, $parsed);
                // Unique by id or title+date
                $unique = [];
                $seen = [];
                foreach ($combined as $item) {
                    $key = ($item['id'] ?? '') . '-' . ($item['title'] ?? '') . '-' . ($item['date'] ?? '');
                    if (!isset($seen[$key])) {
                        $seen[$key] = true;
                        $unique[] = $item;
                    }
                }

                return [
                    'id' => $m->id,
                    'memberCode' => $m->member_code,
                    'username' => $m->username,
                    'name' => $m->full_name,
                    'role' => $m->role,
                    'roleTitle' => $m->role_title,
                    'class' => $m->class_name,
                    'deptName' => $m->department,
                    'term' => $m->term,
                    'avatar' => $m->avatar_url,
                    'avatar_url' => $m->avatar_url,
                    'phone' => $m->phone,
                    'email' => $m->email,
                    'dob' => $m->dob,
                    'address' => $m->address,
                    'facebook' => $m->facebook,
                    'status' => $m->status,
                    'points' => $m->points,
                    'isFirstLogin' => (bool) $m->is_first_login,
                    'milestones' => $unique,
                ];
            });

            return response()->json([
                'success' => true,
                'total' => $data->count(),
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể truy vấn CSDL!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/members/create
     */
    public function store(Request $request)
    {
        try {
            $memberCode = $request->input('member_code') ?: $request->input('username');
            $username = $request->input('username') ?: $memberCode;
            
            // Tự động tạo mật khẩu ngẫu nhiên bảo mật nếu chưa có
            $rawPassword = $request->input('password');
            if (!$rawPassword || $rawPassword === $memberCode || $rawPassword === $username) {
                $rawPassword = 'Vmc@' . rand(100000, 999999);
            }

            $fullName = $request->input('full_name') ?: $request->input('name');
            $email = trim((string) $request->input('email'));
            $dept = $request->input('deptName') ?: $request->input('department', 'Ban Sản Xuất Media');
            $roleTitle = $request->input('roleTitle') ?: $request->input('role_title', 'Thành Viên VMC');

            $member = Member::create([
                'member_code' => $memberCode,
                'username' => $username,
                'password' => Hash::make($rawPassword),
                'full_name' => $fullName,
                'role' => $request->input('role', 'member'),
                'role_title' => $roleTitle,
                'class_name' => $request->input('class') ?: $request->input('class_name'),
                'department' => $dept,
                'term' => $request->input('term', 'Gen 8'),
                'avatar_url' => ('NULL'),
                'phone' => $request->input('phone'),
                'email' => $email ?: null,
                'dob' => $request->input('dob'),
                'address' => $request->input('address'),
                'facebook' => $request->input('facebook'),
                'is_first_login' => true,
                'status' => 'Active',
            ]);

            // Create initial milestone
            $createdId = (string) $member->id;
            MemberMilestone::create([
                'id' => 'm-' . time() . '-' . rand(100, 999),
                'member_id' => $createdId,
                'date' => date('d/m/Y'),
                'title' => 'Bắt đầu làm thành viên VMC (' . $dept . ')',
                'badge_text' => '[Gia nhập]',
                'badge_style' => 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            ]);

            // Tự động gửi email cấp tài khoản nếu có địa chỉ email
            $emailSent = false;
            if (!empty($email)) {
                $html = '
                    <div style="font-family: Arial, sans-serif; padding: 20px 0; color: #1e293b; max-width: 580px; margin: 0 auto;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #0284c7; margin: 0; font-size: 22px;">🎉 CHÚC MỪNG BẠN GIA NHẬP CLB VMC</h2>
                        <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Thông tin tài khoản thành viên hệ thống VMC Portal</p>
                      </div>

                      <p style="font-size: 14px; line-height: 1.6;">Xin chào <strong>' . htmlspecialchars($fullName) . '</strong>,</p>
                      <p style="font-size: 14px; line-height: 1.6; color: #334155;">Ban Chủ Nhiệm & Ban Đối Ngoại - Nhân Sự nhiệt liệt chào mừng bạn đã chính thức trở thành thành viên của <strong>CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong>.</p>
                      
                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0284c7; padding: 18px 20px; margin: 22px 0; border-radius: 10px;">
                        <p style="margin: 0 0 12px 0; font-size: 13px; color: #0369a1; font-weight: bold; text-transform: uppercase;">THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP:</p>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                          <tr>
                            <td style="padding: 6px 0; color: #64748b; width: 140px;">Mã thành viên:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-family: Consolas, monospace;">' . htmlspecialchars($memberCode) . '</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748b;">Mật khẩu khởi tạo:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #1e40af; font-family: Consolas, monospace; font-size: 16px;">' . htmlspecialchars($rawPassword) . '</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748b;">Ban chuyên môn:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">' . htmlspecialchars($dept) . '</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748b;">Chức danh / Vị trí:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">' . htmlspecialchars($roleTitle) . '</td>
                          </tr>
                        </table>
                      </div>

                      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 10px; font-size: 13px; color: #92400e; line-height: 1.6;">
                        <p style="margin: 0; font-weight: bold;">⚠️ BẮT BUỘC ĐỔI MẬT KHẨU LẦN ĐẦU:</p>
                        <p style="margin: 6px 0 0 0;">Trong lần đầu tiên đăng nhập vào hệ thống VMC Portal, bạn sẽ được <strong>yêu cầu đổi sang mật khẩu cá nhân mới</strong> để đảm bảo an toàn tuyệt đối cho tài khoản.</p>
                      </div>

                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự • CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                    </div>
                ';

                $emailSent = MailService::send(
                    $email,
                    '🎉 [VMC Portal] Cấp Tài Khoản Thành Viên CLB Truyền Thông VMC',
                    $html
                );
            }

            return response()->json([
                'success' => true,
                'message' => $emailSent
                    ? 'Đã tạo tài khoản thành công và gửi thông tin mật khẩu tới email ' . $email . '!'
                    : 'Đã tạo thành công thành viên mới vào CSDL SQL! (Mật khẩu: ' . $rawPassword . ')',
                'password' => $rawPassword,
                'emailSent' => (bool) $emailSent
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo tài khoản CSDL!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/members/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $member = Member::whereRaw('CAST(id AS CHAR) = ?', [$id])
                ->orWhereRaw('UPPER(member_code) = UPPER(?)', [$id])
                ->orWhereRaw('LOWER(username) = LOWER(?)', [$id])
                ->first();

            if (!$member) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thành viên!'], 404);
            }

            $fields = [
                'full_name', 'role', 'role_title', 'member_code', 'class_name',
                'department', 'term', 'phone', 'dob', 'email', 'points', 'address',
                'facebook', 'status'
            ];

            foreach ($fields as $f) {
                if ($request->has($f)) {
                    $member->{$f} = $request->input($f);
                }
            }

            if ($request->has('avatar_url') || $request->has('avatar')) {
                $member->avatar_url = $request->input('avatar_url') ?? $request->input('avatar');
            }

            if ($request->has('is_first_login') || $request->has('isFirstLogin')) {
                $val = $request->input('is_first_login');
                if ($val === null) {
                    $val = $request->input('isFirstLogin');
                }
                $member->is_first_login = filter_var($val, FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->filled('password')) {
                $member->password = Hash::make($request->input('password'));
            }

            if ($request->has('milestones')) {
                $milestones = $request->input('milestones');
                $member->milestones = is_array($milestones) ? json_encode($milestones, JSON_UNESCAPED_UNICODE) : $milestones;

                // Sync Member_Milestones table
                MemberMilestone::where('member_id', (string) $member->id)
                    ->orWhere('member_id', (string) $member->member_code)
                    ->delete();

                if (is_array($milestones)) {
                    foreach ($milestones as $ms) {
                        if (!empty($ms['title'])) {
                            MemberMilestone::create([
                                'id' => $ms['id'] ?? ('m-' . time() . '-' . rand(100, 999)),
                                'member_id' => (string) $member->id,
                                'date' => $ms['date'] ?? date('d/m/Y'),
                                'title' => $ms['title'],
                                'badge_text' => $ms['badgeText'] ?? ($ms['badge_text'] ?? '[Cột mốc]'),
                                'badge_style' => $ms['badgeStyle'] ?? ($ms['badge_style'] ?? 'bg-blue-500/10 text-blue-400 border-blue-500/30'),
                            ]);
                        }
                    }
                }
            }

            $member->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật thông tin thành viên vào CSDL SQL!'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật CSDL!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/members/{id}
     */
    public function destroy($id)
    {
        try {
            $member = Member::whereRaw('CAST(id AS CHAR) = ?', [$id])
                ->orWhereRaw('UPPER(member_code) = UPPER(?)', [$id])
                ->orWhereRaw('LOWER(username) = LOWER(?)', [$id])
                ->first();

            if (!$member) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thành viên trong CSDL!'], 404);
            }

            $mId = (string) $member->id;
            $mCode = (string) $member->member_code;
            $mUser = (string) $member->username;

            DB::table('Member_Milestones')->where('member_id', $mId)->orWhere('member_id', $mCode)->delete();
            DB::table('Birthday_Assignments')->where('member_id', $mId)->orWhere('member_id', $mCode)->delete();
            DB::table('Birthday_Mail_Logs')->where('member_id', $mId)->orWhere('member_id', $mCode)->delete();
            DB::table('Meeting_Attendance')->where('member_id', $mId)->orWhere('member_id', $mCode)->delete();
            DB::table('User_Sessions')->where('member_id', $mId)->orWhere('member_id', $mCode)->orWhere('username', $mUser)->delete();
            if (DB::getSchemaBuilder()->hasTable('User_Logins')) {
                DB::table('User_Logins')->where('member_id', $mId)->orWhere('member_id', $mCode)->orWhere('username', $mUser)->delete();
            }
            DB::table('Tasks')->where('assignee_id', $mId)->orWhere('created_by', $mId)->delete();

            $member->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa vĩnh viễn toàn bộ dữ liệu thành viên khỏi CSDL MySQL!'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa thành viên khỏi CSDL!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/members/reset-password
     */
    public function resetPassword(Request $request)
    {
        try {
            $memberId = $request->input('memberId') ?: $request->input('id');
            $email = trim((string) $request->input('email'));
            $name = trim((string) $request->input('name'));

            $member = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memberId])
                ->orWhereRaw('UPPER(member_code) = UPPER(?)', [(string) $memberId])
                ->orWhereRaw('LOWER(username) = LOWER(?)', [(string) $memberId])
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thành viên trong CSDL!'
                ], 404);
            }

            // Đồng bộ định dạng mật khẩu ngẫu nhiên bảo mật chuẩn Vmc@ + 6 số (giống Tạo tài khoản mới & Quên mật khẩu)
            $pwd = $request->input('password');
            if (empty($pwd) || $pwd === $member->member_code || $pwd === 'VMC2026@VinhBao') {
                $pwd = 'Vmc@' . rand(100000, 999999);
            }

            $member->password = Hash::make($pwd);
            $member->is_first_login = true;
            $member->save();

            if (empty($email) && !empty($member->email)) {
                $email = $member->email;
            }
            if (empty($name) && !empty($member->full_name)) {
                $name = $member->full_name;
            }

            $userCode = $member->member_code ?: $member->username;
            $dept = $member->department ?: 'Ban Chuyên Môn';
            $roleTitle = $member->role_title ?: 'Thành Viên VMC';

            $emailSent = false;
            if (!empty($email)) {
                try {
                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px 0; color: #1e293b; max-width: 580px; margin: 0 auto;">
                          <div style="text-align: center; margin-bottom: 24px;">
                            <h2 style="color: #0284c7; margin: 0; font-size: 22px;">🔐 CẤP LẠI MẬT KHẨU TÀI KHOẢN VMC</h2>
                            <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Cổng thông tin nội bộ CLB Truyền Thông THPT Vĩnh Bảo (VMC Portal)</p>
                          </div>

                          <p style="font-size: 14px; line-height: 1.6;">Xin chào <strong>' . htmlspecialchars($name ?: 'Thành Viên VMC') . '</strong>,</p>
                          <p style="font-size: 14px; line-height: 1.6; color: #334155;">Ban Quản Trị hệ thống VMC Portal đã thực hiện đặt lại mật khẩu đăng nhập cho tài khoản của bạn.</p>
                          
                          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0284c7; padding: 18px 20px; margin: 22px 0; border-radius: 10px;">
                            <p style="margin: 0 0 12px 0; font-size: 13px; color: #0369a1; font-weight: bold; text-transform: uppercase;">THÔNG TIN ĐĂNG NHẬP MỚI:</p>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                              <tr>
                                <td style="padding: 6px 0; color: #64748b; width: 140px;">Mã thành viên:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-family: Consolas, monospace;">' . htmlspecialchars($userCode) . '</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Mật khẩu mới:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #1e40af; font-family: Consolas, monospace; font-size: 18px; letter-spacing: 1px;">' . htmlspecialchars($pwd) . '</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Ban chuyên môn:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">' . htmlspecialchars($dept) . '</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Chức danh:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">' . htmlspecialchars($roleTitle) . '</td>
                              </tr>
                            </table>
                          </div>

                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 10px; font-size: 13px; color: #92400e; line-height: 1.6;">
                            <p style="margin: 0; font-weight: bold;">⚠️ BẮT BUỘC ĐỔI MẬT KHẨU LẦN ĐẦU:</p>
                            <p style="margin: 6px 0 0 0;">Khi đăng nhập lại bằng mật khẩu này, hệ thống sẽ <strong>bắt buộc bạn phải thay đổi sang mật khẩu cá nhân mới</strong> để kích hoạt tài khoản và đảm bảo an toàn tuyệt đối.</p>
                          </div>

                          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                          <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự • CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    $emailSent = MailService::send($email, '🔑 [VMC Portal] Cấp Lại Mật Khẩu Tài Khoản VMC', $html);
                } catch (\Throwable $mailEx) {
                    \Log::warning('⚠️ Không thể gửi mail reset password: ' . $mailEx->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'password' => $pwd,
                'emailSent' => (bool) $emailSent,
                'email' => $email,
                'message' => $emailSent
                    ? "Đã đặt lại mật khẩu ({$pwd}) & gửi email thông báo thành công cho " . ($name ?: $email) . "!"
                    : "Đã đặt lại mật khẩu ({$pwd}) cho thành viên " . ($name ?: $userCode) . "!"
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
