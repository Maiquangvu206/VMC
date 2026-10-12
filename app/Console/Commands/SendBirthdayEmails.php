<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Api\BirthdayController;

class SendBirthdayEmails extends Command
{
    protected $signature = 'vmc:send-birthdays';
    protected $description = 'Quét và gửi email chúc mừng sinh nhật cho thành viên hôm nay';

    public function handle()
    {
        $this->info('🎂 [VMC] Đang kiểm tra ngày sinh nhật thành viên hôm nay...');
        $results = BirthdayController::sendDailyBirthdayEmails();
        $this->info('✅ Đã hoàn tất! Đã gửi ' . count($results) . ' email sinh nhật.');
        return 0;
    }
}
