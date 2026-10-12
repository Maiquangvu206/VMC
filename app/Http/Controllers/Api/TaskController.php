<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Member;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index()
    {
        try {
            $tasks = DB::table('tasks as t')
                ->select(
                    't.*',
                    DB::raw('(SELECT m2.full_name FROM `members` m2 WHERE CAST(m2.id AS CHAR) = CAST(t.assignee_id AS CHAR) LIMIT 1) as assignee_name_by_id'),
                    DB::raw('(SELECT m3.full_name FROM `members` m3 WHERE UPPER(m3.member_code) = UPPER(t.assignee_id) LIMIT 1) as assignee_name_by_code')
                )
                ->orderBy('t.created_at', 'desc')
                ->get();

            $data = $tasks->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'description' => $t->description,
                    'department' => $t->department ?: 'hr_external',
                    'assigneeId' => $t->assignee_id,
                    'assignee' => $t->assignee_name_by_id ?: ($t->assignee_name_by_code ?: 'Chưa phân công'),
                    'createdById' => $t->created_by,
                    'deadline' => $t->deadline ? substr($t->deadline, 0, 10) : null,
                    'status' => $t->status ?: 'todo',
                    'createdAt' => $t->created_at,
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
            $taskItems = $request->has('tasks') && is_array($request->input('tasks'))
                ? $request->input('tasks')
                : [$request->all()];

            $createdTasks = [];
            $rootCreatorId = $request->input('created_by') ?: $request->input('createdBy');

            foreach ($taskItems as $taskInput) {
                $taskId = $taskInput['id'] ?? ('task-' . time() . '-' . rand(100, 999));
                $title = $taskInput['title'] ?? 'Nhiệm vụ mới';
                $description = $taskInput['description'] ?? '';
                $assId = $taskInput['assignee_id'] ?? ($taskInput['assigneeId'] ?? null);
                $creatorId = $taskInput['created_by'] ?? ($taskInput['createdBy'] ?? $rootCreatorId);
                $deadline = $taskInput['deadline'] ?? null;
                $status = $taskInput['status'] ?? 'todo';

                Task::create([
                    'id' => $taskId,
                    'title' => $title,
                    'description' => $description,
                    'assignee_id' => $assId ? (string) $assId : null,
                    'created_by' => $creatorId ? (string) $creatorId : null,
                    'deadline' => $deadline,
                    'status' => $status,
                ]);

                // Send email notification to assignee
                if ($assId) {
                    $assignee = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $assId])
                        ->orWhere('member_code', (string) $assId)
                        ->orWhere('username', (string) $assId)
                        ->first();

                    if ($assignee && $assignee->email) {
                        $html = '
                            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                              <h3 style="color: #2563eb;">🔔 Nhiệm vụ mới được phân công</h3>
                              <p>Xin chào <strong>' . htmlspecialchars($assignee->full_name) . '</strong>,</p>
                              <p>Bạn vừa được giao một nhiệm vụ mới trên hệ thống VMC Portal.</p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p><strong>Nhiệm vụ:</strong> <strong style="font-size: 15px; color: #1e293b;">' . htmlspecialchars($title) . '</strong></p>
                              <p><strong>Mô tả:</strong> ' . htmlspecialchars($description ?: 'Không có mô tả chi tiết.') . '</p>
                              <p><strong>Hạn chót:</strong> ' . htmlspecialchars($deadline ?: 'Không giới hạn') . '</p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p style="font-size: 12px; color: #64748b;">Vui lòng truy cập hệ thống để cập nhật tiến độ công việc.</p>
                            </div>
                        ';
                        MailService::send($assignee->email, '🔔 [VMC Task] Bạn được giao nhiệm vụ mới!', $html);
                    }
                }

                $createdTasks[] = [
                    'id' => $taskId,
                    'title' => $title,
                    'description' => $description,
                    'assigneeId' => $assId,
                    'deadline' => $deadline,
                    'status' => $status,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $request->has('tasks') ? $createdTasks : ($createdTasks[0] ?? null),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $task = Task::find($id);
            if (!$task) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy nhiệm vụ'], 404);
            }

            $oldStatus = $task->status;
            $newStatus = $request->input('status');

            if ($request->has('status')) $task->status = $newStatus;
            if ($request->has('title')) $task->title = $request->input('title');
            if ($request->has('description')) $task->description = $request->input('description');
            if ($request->has('deadline')) $task->deadline = $request->input('deadline');
            if ($request->has('assignee_id') || $request->has('assigneeId')) {
                $task->assignee_id = $request->input('assignee_id') ?: $request->input('assigneeId');
            }

            $task->save();

            // Send completion email to task creator when status changes to 'done'
            if ($newStatus === 'done' && $oldStatus !== 'done' && $task->created_by) {
                $creator = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $task->created_by])
                    ->orWhere('member_code', (string) $task->created_by)
                    ->first();
                $assignee = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $task->assignee_id])
                    ->orWhere('member_code', (string) $task->assignee_id)
                    ->first();

                if ($creator && $creator->email) {
                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                          <h3 style="color: #10b981;">✅ Nhiệm vụ đã hoàn thành</h3>
                          <p>Xin chào <strong>' . htmlspecialchars($creator->full_name) . '</strong>,</p>
                          <p>Nhiệm vụ bạn giao đã được đánh dấu là hoàn thành.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p><strong>Nhiệm vụ:</strong> ' . htmlspecialchars($task->title) . '</p>
                          <p><strong>Người thực hiện:</strong> <strong>' . htmlspecialchars($assignee ? $assignee->full_name : 'Thành viên VMC') . '</strong></p>
                          <p><strong>Hạn chót:</strong> ' . htmlspecialchars($task->deadline ?: 'Không giới hạn') . '</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    MailService::send($creator->email, '✅ [VMC Task] Nhiệm vụ được giao đã hoàn thành!', $html);
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
            Task::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
