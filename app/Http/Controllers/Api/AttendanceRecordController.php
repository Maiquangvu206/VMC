<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AttendanceRecord;

class AttendanceRecordController extends Controller
{
    public function index()
    {
        try {
            $rows = AttendanceRecord::orderBy('created_at', 'desc')->get();
            $data = $rows->map(function ($a) {
                $presentIds = [];
                if (!empty($a->present_members)) {
                    $presentIds = is_string($a->present_members) ? (json_decode($a->present_members, true) ?: []) : $a->present_members;
                }
                return [
                    'id' => $a->id,
                    'sessionName' => $a->session_name,
                    'date' => $a->record_date,
                    'presentMemberIds' => $presentIds,
                    'status' => $a->status ?: 'approved',
                    'createdAt' => $a->created_at,
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
            $recId = $request->input('id') ?: ('att-' . time() . '-' . rand(100, 999));
            $sName = $request->input('sessionName') ?: ($request->input('session_name') ?: ('Buổi Sinh Hoạt ngày ' . date('d/m/Y')));
            $rDate = $request->input('date') ?: ($request->input('record_date') ?: date('d/m/Y'));
            $presentIds = $request->input('presentMemberIds') ?: ($request->input('present_members') ?: []);
            $pMembersStr = is_array($presentIds) ? json_encode($presentIds, JSON_UNESCAPED_UNICODE) : (string) $presentIds;

            AttendanceRecord::create([
                'id' => $recId,
                'session_name' => $sName,
                'record_date' => $rDate,
                'present_members' => $pMembersStr,
                'status' => $request->input('status', 'approved'),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $recId,
                    'sessionName' => $sName,
                    'date' => $rDate,
                    'presentMemberIds' => is_array($presentIds) ? $presentIds : [],
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $rec = AttendanceRecord::find($id);
            if (!$rec) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy điểm danh'], 404);
            }

            if ($request->has('status')) $rec->status = $request->input('status');
            if ($request->has('presentMemberIds') || $request->has('present_members')) {
                $presentIds = $request->input('presentMemberIds') ?: $request->input('present_members');
                $rec->present_members = is_array($presentIds) ? json_encode($presentIds, JSON_UNESCAPED_UNICODE) : $presentIds;
            }

            $rec->save();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
