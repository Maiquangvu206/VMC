<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Services\MailService;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $memberCode = $request->input('memberCode');
        $password = $request->input('password');

        if (!$memberCode || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng nhập đầy đủ mã thành viên và mật khẩu!'
            ], 400);
        }

        $user = Member::whereRaw('UPPER(member_code) = UPPER(?)', [$memberCode])
            ->orWhereRaw('LOWER(username) = LOWER(?)', [$memberCode])
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Mã Thành Viên hoặc Mật khẩu không chính xác!'
            ], 401);
        }

        $storedPassword = (string) $user->password;
        $isValidPassword = false;

        if (str_starts_with($storedPassword, '$2')) {
            try {
                if (password_verify($password, $storedPassword)) {
                    $isValidPassword = true;
                }
            } catch (\Throwable $e) {
                // Ignore and fallback
            }

            if (!$isValidPassword) {
                try {
                    if (Hash::check($password, $storedPassword)) {
                        $isValidPassword = true;
                    }
                } catch (\Throwable $e) {
                    // Ignore algorithm check exception
                }
            }

            // Auto-rehash $2b$/legacy hashes to standard $2y$ Bcrypt format
            if ($isValidPassword && (str_starts_with($storedPassword, '$2b$') || password_needs_rehash($storedPassword, PASSWORD_BCRYPT))) {
                $user->password = Hash::make($password);
                $user->save();
            }
        } elseif (strlen($storedPassword) > 0) {
            $isValidPassword = ($password === $storedPassword);
            if ($isValidPassword) {
                // Auto migrate plain text to bcrypt
                $user->password = Hash::make($password);
                $user->save();
            }
        }

        if (!$isValidPassword) {
            return response()->json([
                'success' => false,
                'message' => 'Mã Thành Viên hoặc Mật khẩu không chính xác!'
            ], 401);
        }

        if ($user->status === 'Suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản này đã bị tạm khóa bởi Bộ Phận Kỹ Thuật!'
            ], 403);
        }

        $parsedMilestones = [];
        if (!empty($user->milestones)) {
            $parsedMilestones = is_string($user->milestones) 
                ? (json_decode($user->milestones, true) ?: []) 
                : $user->milestones;
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'id' => $user->id,
                'memberCode' => $user->member_code,
                'username' => $user->username,
                'name' => $user->full_name,
                'role' => $user->role,
                'roleTitle' => $user->role_title,
                'class' => $user->class_name,
                'deptName' => $user->department,
                'term' => $user->term,
                'avatar' => $user->avatar_url,
                'phone' => $user->phone,
                'email' => $user->email,
                'dob' => $user->dob,
                'address' => $user->address,
                'facebook' => $user->facebook,
                'points' => $user->points,
                'isFirstLogin' => (bool) $user->is_first_login,
                'status' => $user->status,
                'milestones' => $parsedMilestones,
            ]
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     * Kiểm tra Mã TV và Email, nếu khớp thì tự sinh mật khẩu mới, đặt is_first_login = true và gửi email
     */
    public function forgotPassword(Request $request)
    {
        try {
            $memberCode = trim((string) $request->input('memberCode'));
            $email = trim((string) $request->input('email'));

            if (!$memberCode || !$email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng nhập đầy đủ Mã Thành Viên và Địa chỉ Email!'
                ], 400);
            }

            $user = Member::whereRaw('UPPER(member_code) = UPPER(?)', [$memberCode])
                ->orWhereRaw('LOWER(username) = LOWER(?)', [$memberCode])
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thành viên với Mã Thành Viên này trong hệ thống!'
                ], 404);
            }

            if (empty($user->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản thành viên này chưa được cập nhật email trong hệ thống! Vui lòng liên hệ Ban Đối Ngoại - Nhân Sự để được hỗ trợ.'
                ], 400);
            }

            if (strtolower(trim($user->email)) !== strtolower(trim($email))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email không khớp với địa chỉ email đã đăng ký trong hồ sơ thành viên!'
                ], 400);
            }

            // Tự động tạo mật khẩu ngẫu nhiên mới (mạnh & an toàn)
            $newPassword = 'Vmc@' . rand(100000, 999999);
            $user->password = Hash::make($newPassword);
            $user->is_first_login = true;
            $user->save();

            // Gửi email chứa mật khẩu mới
            $userName = $user->full_name ?: $user->name ?: 'Thành viên VMC';
            $userCode = $user->member_code ?: $user->username;

            $html = '
                <div style="font-family: Arial, sans-serif; padding: 20px 0; color: #1e293b; max-width: 580px; margin: 0 auto;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #0284c7; margin: 0; font-size: 22px;">🔐 CẤP LẠI MẬT KHẨU TÀI KHOẢN</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Cổng thông tin nội bộ CLB Truyền Thông THPT Vĩnh Bảo (VMC Portal)</p>
                  </div>

                  <p style="font-size: 14px; line-height: 1.6;">Xin chào <strong>' . htmlspecialchars($userName) . '</strong>,</p>
                  <p style="font-size: 14px; line-height: 1.6; color: #334155;">Hệ thống VMC Portal đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản có Mã thành viên: <strong style="color: #0284c7;">' . htmlspecialchars($userCode) . '</strong>.</p>
                  
                  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0284c7; padding: 18px 20px; margin: 22px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #0369a1; font-weight: bold;">MẬT KHẨU MỚI CỦA BẠN LÀ:</p>
                    <div style="font-size: 24px; color: #1e40af; font-weight: bold; font-family: Consolas, monospace; letter-spacing: 2px;">' . htmlspecialchars($newPassword) . '</div>
                  </div>

                  <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 10px; font-size: 13px; color: #92400e; line-height: 1.6;">
                    <p style="margin: 0; font-weight: bold;">⚠️ QUY ĐỊNH BẮT BUỘC ĐỔI MẬT KHẨU:</p>
                    <p style="margin: 6px 0 0 0;">Khi bạn đăng nhập lại bằng mật khẩu này, hệ thống sẽ <strong>bắt buộc bạn phải đổi sang mật khẩu riêng tư mới</strong> (tương tự như lần đầu đăng nhập) để bảo vệ an toàn cho tài khoản.</p>
                  </div>

                  <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ ngay với Ban Chủ Nhiệm hoặc Ban Đối Ngoại - Nhân Sự.</p>

                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự • CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                </div>
            ';

            $emailSent = MailService::send(
                $user->email,
                '🔐 [VMC Portal] Cấp Lại Mật Khẩu Khởi Tạo - CLB Truyền Thông VMC',
                $html
            );

            return response()->json([
                'success' => (bool) $emailSent,
                'emailSent' => (bool) $emailSent,
                'message' => $emailSent
                    ? 'Mật khẩu mới đã được tạo và gửi thành công tới email ' . $user->email . '! Vui lòng kiểm tra hộp thư.'
                    : 'Đã tạo lại mật khẩu mới nhưng không thể gửi email tự động. Vui lòng liên hệ Ban Đối Ngoại - Nhân Sự để được hỗ trợ!'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xử lý khôi phục mật khẩu: ' . $e->getMessage()
            ], 500);
        }
    }
}
