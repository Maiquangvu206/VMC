<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MailService;

class EmailController extends Controller
{
    /**
     * POST /api/send-email
     */
    public function send(Request $request)
    {
        $to = $request->input('to');
        $subject = $request->input('subject');
        $text = $request->input('text');
        $html = $request->input('html');
        $greeting = $request->input('greeting');
        $messageBody = $request->input('messageBody');
        $attachments = $request->input('attachments', []);

        $hasBody = (bool) ($text || $html || $greeting || $messageBody);
        if (!$to || !$subject || !$hasBody) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu thông tin người nhận, tiêu đề hoặc nội dung!'
            ], 400);
        }

        $cleanTo = trim((string) $to);
        if (!filter_var($cleanTo, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'message' => 'Địa chỉ email người nhận không hợp lệ!'
            ], 400);
        }

        // Sanitize subject to prevent email header injection
        $subject = str_replace(["\r", "\n"], ' ', trim((string) $subject));

        $htmlBody = $html ?: (
            ($greeting ? "<p style='font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;'>" . htmlspecialchars($greeting) . "</p>" : '') .
            ($messageBody ? "<div style='font-size: 14px; line-height: 1.7; color: #1f2937;'>" . nl2br(htmlspecialchars($messageBody)) . "</div>" : '')
        );

        $parsedAttachments = [];
        if (is_array($attachments)) {
            foreach ($attachments as $att) {
                if (!is_array($att)) continue;
                $filename = $att['filename'] ?? ($att['name'] ?? 'attachment');
                $item = ['filename' => $filename];

                if (!empty($att['content'])) {
                    $val = (string) $att['content'];
                    if (preg_match('/^data:(.+);base64,(.+)$/i', $val, $matches)) {
                        $item['content'] = base64_decode($matches[2]);
                        $item['contentType'] = $matches[1];
                    } else {
                        $item['content'] = base64_decode(str_replace(' ', '', $val)) ?: $val;
                    }
                    $parsedAttachments[] = $item;
                } elseif (!empty($att['base64'])) {
                    $item['content'] = base64_decode(str_replace(' ', '', (string) $att['base64']));
                    $parsedAttachments[] = $item;
                } elseif (!empty($att['path'])) {
                    $item['path'] = $att['path'];
                    $parsedAttachments[] = $item;
                }
            }
        }

        $sent = MailService::send($to, $subject, $htmlBody, $parsedAttachments);

        if ($sent) {
            return response()->json([
                'success' => true,
                'message' => 'Đã gửi email thành công!',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP.',
        ], 500);
    }
}
