<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Resolve mail type: 'system' (auth/security/password) or 'notification' (tasks/ops)
     */
    protected static function resolveType(?string $channel, string $subject = '', string $htmlContent = ''): string
    {
        if ($channel) {
            $c = strtolower(trim($channel));
            if (in_array($c, ['auth', 'system', 'security', 'password', 'account'], true)) return 'system';
            if (in_array($c, ['task', 'notification', 'notify', 'ops', 'operation'], true)) return 'notification';
        }

        $subLower = mb_strtolower($subject, 'UTF-8');
        $htmlLower = mb_strtolower($htmlContent, 'UTF-8');
        $isSystem = str_contains($subLower, 'mật khẩu')
            || str_contains($subLower, 'password')
            || str_contains($subLower, 'tài khoản')
            || str_contains($subLower, 'cấp lại')
            || str_contains($subLower, 'khôi phục')
            || str_contains($subLower, 'đăng nhập')
            || str_contains($subLower, 'bảo mật')
            || str_contains($htmlLower, 'mật khẩu')
            || str_contains($htmlLower, 'cấp lại mật khẩu');

        return $isSystem ? 'system' : 'notification';
    }

    /**
     * Send email with 2 mail types (system / notification).
     * Supports SMTP mailers and HTTPS providers configured in Laravel (resend, postmark, ses, etc.)
     * via mailer routing in config/mail.php (MAIL_SYSTEM_MAILER / MAIL_NOTIFICATION_MAILER).
     *
     * @param string $to
     * @param string $subject
     * @param string $htmlContent
     * @param array $attachments
     * @param string|null $channel 'system'|'notification'|'auth'|'task'|null (auto-detect)
     * @return bool
     */
    public static function send(string $to, string $subject, string $htmlContent, array $attachments = [], ?string $channel = null): bool
    {
        try {
            $type = self::resolveType($channel, $subject, $htmlContent);
            $typeConfig = config("mail.types.$type", []);

            $mailerName = $typeConfig['mailer'] ?? ($type === 'system' ? 'auth_smtp' : 'task_smtp');
            $fromEmail = $typeConfig['from']['address'] ?? env('MAIL_FROM_ADDRESS', 'hello@example.com');
            $fromName = $typeConfig['from']['name'] ?? env('MAIL_FROM_NAME', 'VMC Portal');
            $subjectPrefix = $typeConfig['subject_prefix'] ?? ($type === 'system' ? '[HỆ THỐNG]' : '[THÔNG BÁO]');
            $noticeDept = $type === 'system'
                ? ($fromName . ' • VMC PORTAL')
                : ($fromName . ' • VMC PORTAL');

            $finalSubject = trim((string) $subject);
            if ($subjectPrefix && $finalSubject !== '' && stripos($finalSubject, $subjectPrefix) !== 0) {
                $finalSubject = $subjectPrefix . ' ' . $finalSubject;
            } elseif ($finalSubject === '') {
                $finalSubject = $subjectPrefix . ' ' . ($type === 'system' ? 'Thông báo từ hệ thống' : 'Thông báo');
            }

            $autoReplyNotice = '
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
                  ' . htmlspecialchars($noticeDept) . '<br/>
                  (Đây là email tự động gửi từ hệ thống VMC Portal, vui lòng không phản hồi trực tiếp email này).
                </div>
            ';

            $innerContent = str_contains($htmlContent, 'Đây là email tự động')
                ? $htmlContent
                : ($htmlContent . $autoReplyNotice);

            $sendCallback = function ($message) use ($to, $finalSubject, $fromEmail, $fromName, $innerContent, $attachments) {
                $recipients = array_filter(array_map('trim', preg_split('/[;,]+/', (string) $to)));
                if (empty($recipients)) {
                    $recipients = [trim((string) $to)];
                }
                $message->to($recipients)
                    ->from($fromEmail, $fromName)
                    ->subject($finalSubject);

                // Nhúng Logo CLB VMC qua CID inline (best-effort)
                $logoCid = '';
                try {
                    $logoPath = public_path('vmc-logo.jpg');
                    if (file_exists($logoPath)) {
                        $logoCid = $message->embed($logoPath);
                    }
                } catch (\Throwable $e) {
                    $logoCid = '';
                }

                $logoHtml = $logoCid
                    ? '<img src="' . $logoCid . '" alt="VMC Logo" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: inline-block; vertical-align: middle; margin-bottom: 10px;" />'
                    : '<div style="font-size: 32px; margin-bottom: 6px;">✨</div>';

                $finalHtml = '
                    <!DOCTYPE html>
                    <html lang="vi">
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>' . htmlspecialchars($finalSubject) . '</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                      <div style="background-color: #f1f5f9; padding: 24px 12px; margin: 0; min-height: 100%;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);">
                          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%); padding: 22px 20px; text-align: center;">
                            ' . $logoHtml . '
                            <div style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 0.8px; margin: 0; text-transform: uppercase;">
                              CLB TRUYỀN THÔNG VMC
                            </div>
                            <div style="color: #93c5fd; font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-top: 5px; text-transform: uppercase;">
                              TRƯỜNG THPT VĨNH BẢO • VMC PORTAL
                            </div>
                          </div>
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
                    if (!is_array($att)) continue;
                    $filename = $att['filename'] ?? ($att['name'] ?? 'attachment');
                    if (!empty($att['content'])) {
                        $mime = $att['contentType'] ?? 'application/octet-stream';
                        $message->attachData($att['content'], $filename, ['mime' => $mime]);
                    } elseif (!empty($att['path']) && file_exists($att['path'])) {
                        $message->attach($att['path'], ['as' => $filename]);
                    }
                }
            };

            // Gửi qua mailer được cấu hình cho loại mail (có thể là smtp/auth_smtp/task_smtp hoặc resend/postmark/ses...)
            try {
                Mail::mailer($mailerName)->send([], [], $sendCallback);
                Log::info("📧 [MailService:$type] Email sent via [$mailerName] from [$fromEmail] to {$to} ($finalSubject)");
                return true;
            } catch (\Throwable $mailerEx) {
                Log::warning("⚠️ [MailService:$type] Mailer [$mailerName] failed ({$mailerEx->getMessage()}), attempting fallback...");
                // Fallback chain: default mailer -> smtp -> log (best effort)
                $fallbacks = array_values(array_unique(array_filter([
                    config('mail.default'),
                    'smtp',
                ], fn($m) => $m && $m !== $mailerName)));
                foreach ($fallbacks as $fb) {
                    try {
                        Mail::mailer($fb)->send([], [], $sendCallback);
                        Log::info("📧 [MailService:$type] Email sent via fallback [$fb] to {$to} ($finalSubject)");
                        return true;
                    } catch (\Throwable $fbEx) {
                        Log::warning("⚠️ [MailService:$type] Fallback [$fb] failed: " . $fbEx->getMessage());
                    }
                }
                throw $mailerEx;
            }
        } catch (\Throwable $e) {
            Log::error("❌ [MailService] Failed to send email to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Tiện ích gửi thông báo nghiệp vụ (loại Thông báo)
     */
    public static function sendTaskNotification(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'notification');
    }

    /**
     * Tiện ích gửi thông báo hệ thống/bảo mật (loại Hệ thống)
     */
    public static function sendPasswordNotification(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'system');
    }

    public static function sendSystem(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'system');
    }

    public static function sendNotification(string $to, string $subject, string $htmlContent, array $attachments = []): bool
    {
        return self::send($to, $subject, $htmlContent, $attachments, 'notification');
    }
}
