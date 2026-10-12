<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Meeting;
use App\Models\MeetingAttendance;
use App\Models\Member;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index()
    {
        try {
            $meetings = Meeting::orderBy('meeting_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
            $attendance = MeetingAttendance::all();

            $data = $meetings->map(function ($m) use ($attendance) {
                $attList = $attendance->filter(function ($a) use ($m) {
                    return (string) $a->meeting_id === (string) $m->id;
                })->map(function ($a) {
                    return [
                        'memberId' => $a->member_id,
                        'status' => $a->status,
                    ];
                })->values()->toArray();

                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'date' => $m->meeting_date ? substr($m->meeting_date, 0, 10) : '',
                    'time' => $m->meeting_time ? substr($m->meeting_time, 0, 5) : '08:00',
                    'attendanceTakerId' => $m->attendance_taker_id,
                    'minuteTakerId' => $m->minute_taker_id,
                    'status' => $m->status ?: 'pending',
                    'minutesLink' => $m->minutes_link,
                    'attendanceData' => $attList,
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
            $mtgId = $request->input('id') ?: ('mtg-' . time() . '-' . rand(100, 999));
            $title = $request->input('title', 'Cuộc họp');
            $date = $request->input('date', date('Y-m-d'));
            $time = $request->input('time', '08:00');
            $attTaker = $request->input('attendance_taker_id') ?: $request->input('attendanceTakerId');
            $minTaker = $request->input('minute_taker_id') ?: $request->input('minuteTakerId');
            $status = $request->input('status', 'pending');
            $minutesLink = $request->input('minutes_link') ?: $request->input('minutesLink');

            $meeting = Meeting::create([
                'id' => $mtgId,
                'title' => $title,
                'meeting_date' => $date,
                'meeting_time' => $time,
                'attendance_taker_id' => $attTaker ? (string) $attTaker : null,
                'minute_taker_id' => $minTaker ? (string) $minTaker : null,
                'status' => $status,
                'minutes_link' => $minutesLink,
            ]);

            // Helper to send email to assigned member
            $sendRoleEmail = function ($memberId, $roleTitle) use ($title, $date, $time) {
                if (!$memberId) return;
                $m = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $memberId])
                    ->orWhere('member_code', (string) $memberId)
                    ->orWhere('username', (string) $memberId)
                    ->first();

                if ($m && $m->email) {
                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                          <h3 style="color: #7c3aed;">📌 Phân Công Nhiệm Vụ Cuộc Họp CLB VMC</h3>
                          <p>Xin chào <strong>' . htmlspecialchars($m->full_name) . '</strong>,</p>
                          <p>Bạn vừa được phân công nhiệm vụ <strong>' . htmlspecialchars($roleTitle) . '</strong> cho buổi họp sắp tới trên hệ thống VMC Portal.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p><strong>Nội dung họp:</strong> <strong style="font-size: 15px; color: #1e293b;">' . htmlspecialchars($title) . '</strong></p>
                          <p><strong>Thời gian:</strong> ' . htmlspecialchars($time) . ' ngày ' . htmlspecialchars($date) . '</p>
                          <p><strong>Nhiệm vụ của bạn:</strong> <span style="color: #7c3aed; font-weight: bold;">' . htmlspecialchars($roleTitle) . '</span></p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    MailService::send($m->email, "📌 [VMC Meeting] Bạn được phân công nhiệm vụ: {$roleTitle}!", $html);
                }
            };

            if ($attTaker) $sendRoleEmail($attTaker, 'Phụ trách điểm danh cuộc họp');
            if ($minTaker && $minTaker !== $attTaker) $sendRoleEmail($minTaker, 'Ghi biên bản cuộc họp');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $mtgId,
                    'title' => $title,
                    'date' => $date,
                    'time' => $time,
                    'status' => $status,
                    'attendanceTakerId' => $attTaker,
                    'minuteTakerId' => $minTaker,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $meeting = Meeting::find($id);
            if (!$meeting) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy cuộc họp'], 404);
            }

            if ($request->has('title')) $meeting->title = $request->input('title');
            if ($request->has('date')) $meeting->meeting_date = $request->input('date');
            if ($request->has('time')) $meeting->meeting_time = $request->input('time');
            if ($request->has('status')) $meeting->status = $request->input('status');
            if ($request->has('minutes_link') || $request->has('minutesLink')) {
                $meeting->minutes_link = $request->input('minutes_link') ?: $request->input('minutesLink');
            }

            $meeting->save();

            if ($request->has('attendanceData') && is_array($request->input('attendanceData'))) {
                MeetingAttendance::where('meeting_id', $id)->delete();
                foreach ($request->input('attendanceData') as $att) {
                    $memId = $att['memberId'] ?? ($att['member_id'] ?? null);
                    if ($memId) {
                        MeetingAttendance::create([
                            'meeting_id' => (string) $id,
                            'member_id' => (string) $memId,
                            'status' => $att['status'] ?? 'present',
                        ]);
                    }
                }
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            MeetingAttendance::where('meeting_id', $id)->delete();
            Meeting::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
