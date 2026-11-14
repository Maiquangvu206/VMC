<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Lỗi gần nhất khi gửi mail (dùng để trả về cho UI/API chẩn đoán).
     */
    public static ?string $lastError = null;

    /** Các mailer chỉ ghi log, không gửi thật. */
    protected const DUMMY_MAILERS = ['log', 'array', 'null'];
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
        self::$lastError = null;
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

            // Dựng HTML 1 lần, dùng chung cho cả đường SMTP và đường HTTPS API.
            $buildHtml = function (string $logoHtml) use ($finalSubject, $innerContent): string {
                return '
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
            };

            $sendCallback = function ($message) use ($to, $finalSubject, $fromEmail, $fromName, $buildHtml, $attachments) {
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

                $message->html($buildHtml($logoHtml));

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

            // Ưu tiên đường HTTPS API nếu được cấu hình: Render chặn outbound SMTP
            // (port 25/465/587) nên SMTP thường không gửi được từ Render.
            $apiProvider = strtolower(trim((string) (config('mail.api_provider') ?: env('MAIL_API_PROVIDER', ''))));
            $apiKey = (string) (config('mail.api_key') ?: env('MAIL_API_KEY', ''));
            if ($apiProvider !== '' && in_array($apiProvider, ['brevo', 'sendinblue', 'resend'], true)) {
                $recipientList = array_values(array_filter(array_map('trim', preg_split('/[;,]+/', (string) $to))));
                if ($recipientList === []) {
                    $recipientList = [trim((string) $to)];
                }

                $logoUrl = '';
                try {
                    if (file_exists(public_path('vmc-logo.jpg'))) {
                        $base = rtrim((string) env('APP_URL', ''), '/');
                        if ($base !== '') {
                            $logoUrl = $base . '/vmc-logo.jpg';
                        }
                    }
                } catch (\Throwable $e) {
                    $logoUrl = '';
                }

                $logoHtml = $logoUrl
                    ? '<img src="' . htmlspecialchars($logoUrl) . '" alt="VMC Logo" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: inline-block; vertical-align: middle; margin-bottom: 10px;" />'
                    : '<div style="font-size: 32px; margin-bottom: 6px;">✨</div>';

                [$ok, $apiError] = self::sendViaApi(
                    $apiProvider,
                    $apiKey,
                    $recipientList,
                    $fromEmail,
                    $fromName,
                    $finalSubject,
                    $buildHtml($logoHtml),
                    $attachments
                );

                if ($ok) {
                    Log::info("📧 [MailService:$type] Email sent via HTTPS API [$apiProvider] from [$fromEmail] to {$to} ($finalSubject)");
                    return true;
                }

                self::$lastError = $apiError ?: 'Gửi email qua HTTPS API thất bại.';
                Log::error("❌ [MailService] HTTPS API [$apiProvider] failed: " . self::$lastError);
                return false;
            }

            // Gửi qua mailer được cấu hình cho loại mail (có thể là smtp/auth_smtp/task_smtp hoặc resend/postmark/ses...)
            $attempts = [];
            if (!in_array(strtolower((string) $mailerName), self::DUMMY_MAILERS, true)) {
                $attempts[] = $mailerName;
            } else {
                Log::warning("⚠️ [MailService:$type] Mailer [$mailerName] chỉ ghi log, không gửi thật. Kiểm tra MAIL_MAILER/MAIL_SYSTEM_MAILER/MAIL_NOTIFICATION_MAILER.");
            }

            // Fallback chain: default mailer -> smtp (bỏ qua các mailer chỉ ghi log).
            foreach (array_values(array_unique(array_filter([
                config('mail.default'),
                'smtp',
            ], fn($m) => $m && $m !== $mailerName && !in_array(strtolower((string) $m), self::DUMMY_MAILERS, true)))) as $fb) {
                $attempts[] = $fb;
            }

            if ($attempts === []) {
                self::$lastError = "Chưa cấu hình mailer SMTP thật (mailer hiện tại: {$mailerName}). "
                    . 'Đặt MAIL_MAILER=smtp và MAIL_SYSTEM_MAILER/MAIL_NOTIFICATION_MAILER kèm tài khoản SMTP trên Render.';
                Log::error('❌ [MailService] ' . self::$lastError);
                return false;
            }

            $lastException = null;
            foreach ($attempts as $name) {
                try {
                    Mail::mailer($name)->send([], [], $sendCallback);
                    Log::info("📧 [MailService:$type] Email sent via [$name] from [$fromEmail] to {$to} ($finalSubject)");
                    return true;
                } catch (\Throwable $ex) {
                    $lastException = $ex;
                    Log::warning("⚠️ [MailService:$type] Mailer [$name] failed: " . $ex->getMessage());
                }
            }

            self::$lastError = $lastException?->getMessage() ?: 'Không gửi được email.';
            if (empty(config('mail.api_provider'))) {
                self::$lastError .= ' — Nếu chạy trên Render (chặn SMTP 25/465/587), hãy đặt MAIL_API_PROVIDER=brevo|resend + MAIL_API_KEY.';
            }
            Log::error("❌ [MailService] Failed to send email to {$to}: " . self::$lastError);
            return false;
        } catch (\Throwable $e) {
            self::$lastError = $e->getMessage();
            Log::error("❌ [MailService] Failed to send email to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Gửi email qua HTTPS API (Brevo/Resend) để không phụ thuộc SMTP port bị Render chặn.
     *
     * @return array{0: bool, 1: ?string} [thành công?, thông báo lỗi]
     */
    protected static function sendViaApi(
        string $provider,
        string $apiKey,
        array $recipients,
        string $fromEmail,
        string $fromName,
        string $subject,
        string $html,
        array $attachments = []
    ): array {
        if ($apiKey === '') {
            return [false, "Thiếu API key cho {$provider}. Đặt MAIL_API_KEY trên Render."];
        }

        $apiAttachments = [];
        foreach ($attachments as $att) {
            if (!is_array($att)) {
                continue;
            }
            $name = $att['filename'] ?? ($att['name'] ?? 'attachment');
            if (!empty($att['content'])) {
                $apiAttachments[] = ['name' => $name, 'content' => base64_encode($att['content'])];
            } elseif (!empty($att['path']) && is_file($att['path'])) {
                $apiAttachments[] = ['name' => $name, 'content' => base64_encode((string) file_get_contents($att['path']))];
            }
        }

        try {
            if ($provider === 'resend') {
                $payload = [
                    'from' => $fromName !== '' ? "{$fromName} <{$fromEmail}>" : $fromEmail,
                    'to' => $recipients,
                    'subject' => $subject,
                    'html' => $html,
                ];
                if ($apiAttachments !== []) {
                    $payload['attachments'] = array_map(
                        fn ($a) => ['filename' => $a['name'], 'content' => $a['content']],
                        $apiAttachments
                    );
                }
                $response = \Illuminate\Support\Facades\Http::timeout((int) env('MAIL_API_TIMEOUT', 20))
                    ->withToken($apiKey)
                    ->acceptJson()
                    ->post('https://api.resend.com/emails', $payload);
            } else {
                // brevo / sendinblue
                $payload = [
                    'sender' => ['email' => $fromEmail, 'name' => $fromName ?: 'VMC Portal'],
                    'to' => array_map(fn ($e) => ['email' => $e], $recipients),
                    'subject' => $subject,
                    'htmlContent' => $html,
                ];
                if ($apiAttachments !== []) {
                    $payload['attachment'] = array_map(
                        fn ($a) => ['name' => $a['name'], 'content' => $a['content']],
                        $apiAttachments
                    );
                }
                $response = \Illuminate\Support\Facades\Http::timeout((int) env('MAIL_API_TIMEOUT', 20))
                    ->withHeaders(['api-key' => $apiKey])
                    ->acceptJson()
                    ->post('https://api.brevo.com/v3/smtp/email', $payload);
            }

            if ($response->successful()) {
                return [true, null];
            }

            $body = trim((string) $response->body());
            return [false, "{$provider} HTTP {$response->status()}: " . mb_substr($body, 0, 300)];
        } catch (\Throwable $e) {
            return [false, "{$provider} API lỗi: " . $e->getMessage()];
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
