<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Member;
use App\Models\TaskDeadlineMailLog;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;

class SendTaskDeadlineReminders extends Command
{
    protected $signature = 'vmc:send-task-reminders';
    protected $description = 'Quét hạn chót nhiệm vụ và gửi email nhắc nhở cho thành viên';

    public function handle()
    {
        $todayStr = date('Y-m-d');
        $tomorrowStr = date('Y-m-d', strtotime('+1 day'));

        $this->info("⏰ [VMC Task Reminder] Quét hạn chót nhiệm vụ (Hôm nay: {$todayStr}, Ngày mai: {$tomorrowStr})...");

        $tasks = DB::table('Tasks')
            ->where('status', '!=', 'done')
            ->whereNotNull('deadline')
            ->where(function ($q) use ($todayStr, $tomorrowStr) {
                $q->whereDate('deadline', $todayStr)
                  ->orWhereDate('deadline', $tomorrowStr);
            })
            ->get();

        $count = 0;
        foreach ($tasks as $t) {
            $taskDeadlineStr = substr((string) $t->deadline, 0, 10);
            $isDueToday = ($taskDeadlineStr === $todayStr);
            $type = $isDueToday ? 'today' : 'tomorrow';

            $alreadySent = DB::table('Task_Deadline_Mail_Logs')
                ->where('task_id', (string) $t->id)
                ->where('sent_date', $todayStr)
                ->exists();

            if ($alreadySent) continue;

            $assignee = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $t->assignee_id])
                ->orWhere('member_code', (string) $t->assignee_id)
                ->first();

            if (!$assignee || !$assignee->email) continue;

            $mailSubject = $isDueToday
                ? "⚠️ [VMC Task] Hạn chót nhiệm vụ hôm nay: \"{$t->title}\""
                : "⏰ [VMC Task] Nhiệm vụ sắp tới hạn ngày mai: \"{$t->title}\"";

            $warningBanner = $isDueToday
                ? '<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #991b1b; font-weight: bold; font-size: 15px;">
                    ⚠️ NHIỆM VỤ NÀY HẾT HẠN HÔM NAY!
                   </div>'
                : '<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #92400e; font-weight: bold; font-size: 15px;">
                    ⏰ NHIỆM VỤ SẼ HẾT HẠN VÀO NGÀY MAI!
                   </div>';

            $html = '
                <div style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🔔</span>
                    <h2 style="color: #0f172a; margin: 10px 0 5px 0;">Nhắc nhở hạn chót công việc</h2>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">CLB Truyền Thông THPT Vĩnh Bảo (VMC)</p>
                  </div>

                  ' . $warningBanner . '

                  <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 15px; margin-top: 0;">Chào <strong>' . htmlspecialchars($assignee->full_name) . '</strong>,</p>
                    <p style="font-size: 14px; color: #334155;">Đây là thông báo nhắc nhở tự động từ hệ thống VMC Portal về công việc được giao của bạn:</p>
                    
                    <div style="margin-top: 15px; padding: 15px; background-color: #f1f5f9; border-radius: 8px; font-size: 14px;">
                      <p style="margin: 0 0 8px 0;"><strong>📋 Công việc:</strong> ' . htmlspecialchars($t->title) . '</p>
                      <p style="margin: 0 0 8px 0;"><strong>📝 Chi tiết:</strong> ' . htmlspecialchars($t->description ?: 'Không có mô tả chi tiết') . '</p>
                      <p style="margin: 0 0 8px 0;"><strong>⏰ Hạn chót:</strong> <strong style="color: #dc2626;">' . htmlspecialchars($taskDeadlineStr) . '</strong></p>
                      <p style="margin: 0;"><strong>⚡ Trạng thái hiện tại:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #f59e0b;">' . htmlspecialchars($t->status) . '</span></p>
                    </div>

                    <p style="font-size: 13px; color: #475569; margin-top: 15px; line-height: 1.5;">Vui lòng hoàn thành công việc đúng hạn và cập nhật trạng thái nhiệm vụ lên VMC Portal!</p>
                  </div>

                  <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #64748b;">
                    <p style="margin: 0;">Trân trọng,<br/><strong>BAN CHỦ NHIỆM VMC</strong></p>
                  </div>
                </div>
            ';

            $sent = MailService::send($assignee->email, $mailSubject, $html);
            if ($sent) {
                DB::table('Task_Deadline_Mail_Logs')->insertOrIgnore([
                    'task_id' => (string) $t->id,
                    'sent_date' => $todayStr,
                    'type' => $type,
                ]);
                $count++;
            }
        }

        $this->info("✅ Đã gửi {$count} email nhắc nhở hạn chót nhiệm vụ.");
        return 0;
    }
}
