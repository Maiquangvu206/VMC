<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserSession;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class UserSessionController extends Controller
{
    public function index()
    {
        try {
            // Auto timeout inactive sessions without heartbeat in the last 10 minutes
            DB::table('User_Sessions')
                ->where('is_active', 1)
                ->where('last_active', '<', DB::raw('NOW() - INTERVAL 10 MINUTE'))
                ->update(['is_active' => 0, 'logout_reason' => 'timeout']);

            $sessions = DB::table('User_Sessions')
                ->orderBy('login_time', 'desc')
                ->orderBy('last_active', 'desc')
                ->get();

            $members = DB::table('Members')
                ->select('id', 'username', 'member_code', 'full_name', 'role_title')
                ->get();

            $memberMap = [];
            foreach ($members as $m) {
                $info = [
                    'full_name' => (string) $m->full_name,
                    'role_title' => (string) $m->role_title,
                ];
                if ($m->id !== null) {
                    $memberMap[(string) $m->id] = $info;
                }
                if (!empty($m->username)) {
                    $memberMap[strtolower((string) $m->username)] = $info;
                }
                if (!empty($m->member_code)) {
                    $memberMap[strtoupper((string) $m->member_code)] = $info;
                }
            }

            $data = $sessions->map(function ($s) use ($memberMap) {
                $mid = (string) $s->member_id;
                $uName = strtolower((string) $s->username);
                $mem = $memberMap[$mid] 
                    ?? ($memberMap[strtoupper($mid)] 
                    ?? ($memberMap[$uName] ?? null));

                $realName = ($mem && !empty($mem['full_name'])) ? $mem['full_name'] : $s->name;
                $realRole = ($mem && !empty($mem['role_title'])) ? $mem['role_title'] : ($s->role_title ?: 'Thành Viên VMC');

                return (array) $s + [
                    'real_name' => $realName,
                    'real_role_title' => $realRole,
                    'name' => $realName,
                    'role_title' => $realRole,
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $sessionId = $request->input('sessionId');
            $memberId = $request->input('memberId');
            $username = $request->input('username');
            $name = $request->input('name');
            $roleTitle = $request->input('roleTitle');
            $userAgent = $request->input('userAgent') ?: $request->userAgent();
            $ip = $request->ip() ?: '127.0.0.1';

            $realName = ($name && $name !== 'Quản Trị Viên') ? $name : '';
            $realRole = $roleTitle ?: '';

            if ($memberId || $username) {
                $mem = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memberId])
                    ->orWhere('username', (string) $username)
                    ->orWhere('member_code', (string) $username)
                    ->first();
                if ($mem && $mem->full_name && $mem->full_name !== 'Quản Trị Viên') {
                    $realName = $mem->full_name;
                    $realRole = $mem->role_title ?: $realRole;
                }
            }

            if (!$realName || $realName === 'Quản Trị Viên') {
                $realName = ($username === 'admin' || $memberId === 'ADMIN') ? 'Vũ Mai Quang' : ($name ?: 'Thành Viên VMC');
            }

            $sId = $sessionId ?: ('sess-' . time() . '-' . bin2hex(random_bytes(3)));

            $isMobile = preg_match('/mobile|android|iphone|ipad|ipod/i', $userAgent ?: '');
            $deviceType = $isMobile ? 'Mobile Phone' : 'Desktop / PC';

            DB::table('User_Sessions')->upsert([
                'id' => $sId,
                'member_id' => (string) $memberId,
                'username' => $username ?: '',
                'name' => $realName,
                'role_title' => $realRole,
                'ip_address' => $ip,
                'user_agent' => $userAgent ?: '',
                'device_type' => $deviceType,
                'login_time' => now(),
                'last_active' => now(),
                'is_active' => 1,
                'logout_reason' => null,
            ], ['id'], ['last_active', 'is_active', 'logout_reason', 'name', 'role_title', 'ip_address', 'user_agent', 'device_type']);

            return response()->json(['success' => true, 'sessionId' => $sId]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function heartbeat(Request $request)
    {
        try {
            $sessionId = $request->input('sessionId');
            if (!$sessionId) return response()->json(['success' => true, 'isActive' => true]);

            $session = DB::table('User_Sessions as s')
                ->leftJoin('Members as m', function ($join) {
                    $join->on('s.member_id', '=', 'm.id')
                        ->orOn('s.username', '=', 'm.username')
                        ->orOn('s.member_id', '=', 'm.member_code');
                })
                ->where('s.id', $sessionId)
                ->select('s.is_active', 's.logout_reason', 'm.status')
                ->first();

            if ($session) {
                // If member account itself is suspended
                if (strtolower((string) $session->status) === 'suspended' || $session->logout_reason === 'suspended') {
                    DB::table('User_Sessions')->where('id', $sessionId)->update([
                        'is_active' => 0,
                        'logout_reason' => 'suspended'
                    ]);
                    return response()->json([
                        'success' => true,
                        'isActive' => false,
                        'message' => 'Tài khoản đã bị tạm khóa. Phiên đăng nhập sẽ bị ngắt.'
                    ]);
                }

                // If session was explicitly revoked by Super Admin
                if ((int) $session->is_active === 0 && $session->logout_reason === 'revoked') {
                    return response()->json([
                        'success' => true,
                        'isActive' => false,
                        'message' => 'Phiên đăng nhập đã bị Super Admin hủy bỏ.'
                    ]);
                }

                // If session was inactive due to timeout or previous idle state, reactivate it seamlessly
                if ((int) $session->is_active === 0) {
                    DB::table('User_Sessions')->where('id', $sessionId)->update([
                        'is_active' => 1,
                        'logout_reason' => null,
                        'last_active' => now()
                    ]);
                    return response()->json(['success' => true, 'isActive' => true]);
                }
            } else {
                // If session record doesn't exist yet, do not kick user out
                return response()->json(['success' => true, 'isActive' => true]);
            }

            DB::table('User_Sessions')->where('id', $sessionId)->update(['last_active' => now()]);
            return response()->json(['success' => true, 'isActive' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::table('User_Sessions')->where('id', $id)->update([
                'is_active' => 0,
                'logout_reason' => 'revoked'
            ]);
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $sessionId = $request->input('sessionId');
            $memberId = $request->input('memberId');
            $username = $request->input('username');

            if ($sessionId) {
                DB::table('User_Sessions')->where('id', $sessionId)->update([
                    'is_active' => 0,
                    'logout_reason' => 'logout',
                    'last_active' => now()
                ]);
            }
            if ($memberId || $username) {
                DB::table('User_Sessions')
                    ->where('is_active', 1)
                    ->where(function ($q) use ($memberId, $username) {
                        $q->where('member_id', (string) $memberId)
                          ->orWhere('username', (string) $username)
                          ->orWhere('member_id', (string) $username);
                    })
                    ->update([
                        'is_active' => 0,
                        'logout_reason' => 'logout',
                        'last_active' => now()
                    ]);
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function revokeAll(Request $request)
    {
        try {
            $currentSessionId = $request->input('currentSessionId', '');
            DB::table('User_Sessions')
                ->where('id', '!=', $currentSessionId)
                ->update(['is_active' => 0, 'logout_reason' => 'revoked']);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
