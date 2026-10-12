<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MemberMilestone;

class MilestoneController extends Controller
{
    public function index()
    {
        try {
            $milestones = MemberMilestone::orderBy('created_at', 'asc')->get();
            $data = $milestones->map(function ($m) {
                return [
                    'id' => $m->id,
                    'memberId' => $m->member_id,
                    'date' => $m->date,
                    'title' => $m->title,
                    'badgeText' => $m->badge_text,
                    'badgeStyle' => $m->badge_style,
                    'createdAt' => $m->created_at,
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
            $msId = $request->input('id') ?: ('ms-' . time() . '-' . rand(100, 999));
            $targetMemId = (string) ($request->input('memberId') ?: $request->input('member_id'));
            $date = $request->input('date') ?: date('d/m/Y');
            $title = $request->input('title', 'Cập nhật cột mốc mới');
            $badgeText = $request->input('badgeText') ?: ($request->input('badge_text') ?: '[Cột mốc]');
            $badgeStyle = $request->input('badgeStyle') ?: ($request->input('badge_style') ?: 'bg-blue-500/10 text-blue-400 border-blue-500/30');

            MemberMilestone::create([
                'id' => $msId,
                'member_id' => $targetMemId,
                'date' => $date,
                'title' => $title,
                'badge_text' => $badgeText,
                'badge_style' => $badgeStyle,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $msId,
                    'memberId' => $targetMemId,
                    'date' => $date,
                    'title' => $title,
                    'badgeText' => $badgeText,
                    'badgeStyle' => $badgeStyle,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            MemberMilestone::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
