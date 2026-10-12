<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Send email via Laravel SMTP with channel separation:
     * - 'task' (Mặc định cho nhiệm vụ & công việc): bandoingoainhansuvmc@gmail.com
     * - 'auth' (Dành riêng cho mật khẩu & tài khoản): itvmcportal2020@gmail.com
     *
     * @param string $to
     * @param string $subject
     * @param string $htmlContent
     * @param array $attachments
     * @param string|null $channel 'task' | 'auth' | null (auto-detect)
     * @return bool
     */
    public static function send(string $to, string $subject, string $htmlContent, array $attachments = [], ?string $channel = null): bool
    {
        try {
            // 1. Phân loại kênh gửi: Nhiệm vụ hay Mật khẩu/Tài khoản
            $resolvedChannel = $channel;
            if (!$resolvedChannel) {
                $subLower = mb_strtolower($subject, 'UTF-8');
                $isAuthMail = str_contains($subLower, 'mật khẩu')
                    || str_contains($subLower, 'password')
                    || str_contains($subLower, 'tài khoản')
                    || str_contains($subLower, 'cấp lại')
                    || str_contains($subLower, 'khôi phục');

                $resolvedChannel = $isAuthMail ? 'auth' : 'task';
            }

            if ($resolvedChannel === 'auth') {
                $fromEmail = env('MAIL_AUTH_FROM_ADDRESS', 'itvmcportal2020@gmail.com');
                $fromName = env('MAIL_AUTH_FROM_NAME', 'BỘ PHẬN KỸ THUẬT IT (VMC PORTAL)');
                $mailerName = 'auth_smtp';
                $noticeDept = 'BỘ PHẬN KỸ THUẬT IT • CỔNG THÔNG TIN VMC PORTAL';
            } else {
                $fromEmail = env('MAIL_TASK_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', 'bandoingoainhansuvmc@gmail.com'));
                $fromName = env('MAIL_TASK_FROM_NAME', env('MAIL_FROM_NAME', 'BAN ĐỐI NGOẠI - NHÂN SỰ (VMC)'));
                $mailerName = 'task_smtp';
                $noticeDept = 'BAN ĐỐI NGOẠI - NHÂN SỰ • CLB TRUYỀN THÔNG THPT VĨNH BẢO (VMC)';
            }

            $autoReplyNotice = '
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
                  ' . htmlspecialchars($noticeDept) . '<br/>
                  (Đây là email tự động gửi từ hệ thống VMC Portal [' . htmlspecialchars($fromEmail) . '], vui lòng không phản hồi trực tiếp email này).
                </div>
            ';

            $innerContent = str_contains($htmlContent, 'Đây là email tự động') 
                ? $htmlContent 
                : ($htmlContent . $autoReplyNotice);

            $sendCallback = function ($message) use ($to, $subject, $fromEmail, $fromName, $innerContent, $attachments) {
                $recipients = array_map('trim', explode(',', $to));
                $message->to($recipients)
                    ->from($fromEmail, $fromName)
                    ->subject($subject);

                // Nhúng Logo CLB VMC qua CID inline (Không làm phình to HTML, tránh bị Gmail cắt bớt)
                $logoPath = public_path('vmc-logo.jpg');
                $logoCid = '';
                if (file_exists($logoPath)) {
                    $logoCid = $message->embed($logoPath);
                }

                $logoHtml = $logoCid 
                    ? '<img src="' . $logoCid . '" alt="VMC Logo" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: inline-block; vertical-align: middle; margin-bottom: 10px;" />' 
                    : '<div style="font-size: 32px; margin-bottom: 6px;">✨</div>';

                // Dựng layout HTML siêu nhẹ (< 5 KB), hiển thị hoàn hảo trên mọi thiết bị & ứng dụng mail
                $finalHtml = '
                    <!DOCTYPE html>
                    <html lang="vi">
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>' . htmlspecialchars($subject) . '</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                      <div style="background-color: #f1f5f9; padding: 24px 12px; margin: 0; min-height: 100%;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);">
                          
                          <!-- Top Header Banner với Logo VMC sắc nét -->
                          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%); padding: 22px 20px; text-align: center;">
                            ' . $logoHtml . '
                            <div style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 0.8px; margin: 0; text-transform: uppercase;">
                              CLB TRUYỀN THÔNG VMC
                            </div>
                            <div style="color: #93c5fd; font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-top: 5px; text-transform: uppercase;">
                              TRƯỜNG THPT VĨNH BẢO • VMC PORTAL
                            </div>
                          </div>

                          <!-- Nội dung email chính -->
                          <div style="padding: 26px 28px; background-color: #ffffff;">
                            ' . $innerContent . '
                          </div>

                        </div>
                      </div>
                    </body>
                    </html>
                ';

                $message->html($finalHtml);

                // Đính kèm tệp nếu có
                foreach ($attachments as $att) {
                    if (is_array($att)) {
                        $filename = $att['filename'] ?? ($att['name'] ?? 'attachment');
                        if (!empty($att['content'])) {
                            $mime = $att['contentType'] ?? 'application/octet-stream';
                            $message->attachData($att['content'], $filename, ['mime' => $mime]);
                        } elseif (!empty($att['path']) && file_exists($att['path'])) {
                            $message->attach($att['path'], ['as' => $filename]);
                        }
                    }
                }
            };

            // Gửi qua mailer chuyên dụng (auth_smtp hoặc task_smtp)
            try {
                Mail::mailer($mailerName)->send([], [], $sendCallback);
                Log::info("📧 [MailService:{$resolvedChannel}] Email sent successfully via [{$mailerName}] from [{$fromEmail}] to {$to} ({$subject})");
                return true;
            } catch (\Throwable $mailerEx) {
                Log::warning("⚠️ [MailService] Mailer [{$mailerName}] failed ({$mailerEx->getMessage()}), attempting fallback to default smtp...");
                Mail::mailer('smtp')->send([], [], $sendCallback);
                Log::info("📧 [MailService] Email sent via fallback [smtp] to {$to} ({$subject})");
                return true;
            }
        } catch (\Throwable $e) {
            Log::error("❌ [MailService] Failed to send email to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Tiện ích gửi thông báo nhiệm vụ từ bandoingoainhansuvmc@gmail.com
     */
    public static function sendTaskNotification(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'task');
    }

    /**
     * Tiện ích gửi thông báo mật khẩu từ itvmcportal2020@gmail.com
     */
    public static function sendPasswordNotification(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'auth');
    }
}
