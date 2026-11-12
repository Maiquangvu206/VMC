<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Mailer
    |--------------------------------------------------------------------------
    |
    | This option controls the default mailer that is used to send all email
    | messages unless another mailer is explicitly specified when sending
    | the message. All additional mailers can be configured within the
    | "mailers" array. Examples of each type of mailer are provided.
    |
    */

    'default' => env('MAIL_MAILER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Mailer Configurations
    |--------------------------------------------------------------------------
    |
    | Here you may configure all of the mailers used by your application plus
    | their respective settings. Several examples have been configured for
    | you and you are free to add your own as your application requires.
    |
    | Laravel supports a variety of mail "transport" drivers that can be used
    | when delivering an email. You may specify which one you're using for
    | your mailers below. You may also add additional mailers if needed.
    |
    | Supported: "smtp", "sendmail", "mailgun", "ses", "ses-v2",
    |            "postmark", "resend", "log", "array",
    |            "failover", "roundrobin"
    |
    */

    'mailers' => [

        'smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', 'smtp.gmail.com'),
            'port' => env('MAIL_PORT', 465),
            'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
            'username' => env('MAIL_USERNAME', 'bandoingoainhansuvmc@gmail.com'),
            'password' => env('MAIL_PASSWORD'),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        // SMTP kênh thông báo nghiệp vụ (nhiệm vụ, họp, sinh nhật, tuyển dụng, tài chính...)
        'task_smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', 'smtp.gmail.com'),
            'port' => env('MAIL_PORT', 465),
            'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
            'username' => env('MAIL_TASK_USERNAME', env('MAIL_USERNAME', 'bandoingoainhansuvmc@gmail.com')),
            'password' => env('MAIL_TASK_PASSWORD', env('MAIL_PASSWORD')),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        // SMTP kênh hệ thống/bảo mật (mật khẩu, tài khoản, xác thực)
        'auth_smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', 'smtp.gmail.com'),
            'port' => env('MAIL_PORT', 465),
            'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
            'username' => env('MAIL_AUTH_USERNAME', 'itvmcportal2020@gmail.com'),
            'password' => env('MAIL_AUTH_PASSWORD', env('MAIL_PASSWORD')),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        // Mailer logic cho 2 loại mail (có thể trỏ tới smtp/task_smtp/auth_smtp hoặc https provider như resend/postmark/ses)
        // Ví dụ: MAIL_SYSTEM_MAILER=resend, MAIL_NOTIFICATION_MAILER=resend để gửi qua HTTPS bên thứ 3
        'system' => [
            'transport' => env('MAIL_SYSTEM_TRANSPORT', 'smtp'),
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', 'smtp.gmail.com'),
            'port' => env('MAIL_PORT', 465),
            'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
            'username' => env('MAIL_AUTH_USERNAME', env('MAIL_USERNAME')),
            'password' => env('MAIL_AUTH_PASSWORD', env('MAIL_PASSWORD')),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        'notification' => [
            'transport' => env('MAIL_NOTIFICATION_TRANSPORT', 'smtp'),
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', 'smtp.gmail.com'),
            'port' => env('MAIL_PORT', 465),
            'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
            'username' => env('MAIL_TASK_USERNAME', env('MAIL_USERNAME')),
            'password' => env('MAIL_TASK_PASSWORD', env('MAIL_PASSWORD')),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        'ses' => [
            'transport' => 'ses',
        ],

        'postmark' => [
            'transport' => 'postmark',
            // 'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
            // 'client' => [
            //     'timeout' => 5,
            // ],
        ],

        // HTTPS mail provider (Resend)
        'resend' => [
            'transport' => 'resend',
        ],

        // HTTPS mail provider (Brevo, formerly Sendinblue) - dùng Symfony Brevo bridge nếu có (DSN)
        // MAIL_MAILER=brevo hoặc MAIL_SYSTEM_MAILER=brevo với BREVO_API_KEY
        'brevo' => [
            'transport' => 'brevo',
            'key' => env('BREVO_API_KEY', env('BREVO_KEY')),
        ],

        'sendmail' => [
            'transport' => 'sendmail',
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ],

        'log' => [
            'transport' => 'log',
            'channel' => env('MAIL_LOG_CHANNEL'),
        ],

        'array' => [
            'transport' => 'array',
        ],

        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'smtp',
                'log',
            ],
            'retry_after' => 60,
        ],

        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
            'retry_after' => 60,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Mail Type Routing (2 loại mail)
    |--------------------------------------------------------------------------
    | - system: bảo mật/tài khoản/mật khẩu/xác thực
    | - notification: nghiệp vụ (nhiệm vụ, họp, sinh nhật, tuyển dụng, tài chính...)
    | Mỗi loại có thể dùng mailer riêng (smtp/auth_smtp/task_smtp/resend/postmark/ses...)
    */
    'types' => [
        'system' => [
            'mailer' => env('MAIL_SYSTEM_MAILER', 'auth_smtp'),
            'from' => [
                'address' => env('MAIL_SYSTEM_FROM_ADDRESS', env('MAIL_AUTH_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', 'itvmcportal2020@gmail.com'))),
                'name' => env('MAIL_SYSTEM_FROM_NAME', env('MAIL_AUTH_FROM_NAME', 'BỘ PHẬN KỸ THUẬT IT (VMC PORTAL)')),
            ],
            'subject_prefix' => env('MAIL_SYSTEM_SUBJECT_PREFIX', '[HỆ THỐNG]'),
        ],
        'notification' => [
            'mailer' => env('MAIL_NOTIFICATION_MAILER', 'task_smtp'),
            'from' => [
                'address' => env('MAIL_NOTIFICATION_FROM_ADDRESS', env('MAIL_TASK_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', 'bandoingoainhansuvmc@gmail.com'))),
                'name' => env('MAIL_NOTIFICATION_FROM_NAME', env('MAIL_TASK_FROM_NAME', 'BAN ĐỐI NGOẠI - NHÂN SỰ (VMC)')),
            ],
            'subject_prefix' => env('MAIL_NOTIFICATION_SUBJECT_PREFIX', '[THÔNG BÁO]'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Global "From" Address
    |--------------------------------------------------------------------------
    |
    | You may wish for all emails sent by your application to be sent from
    | the same address. Here you may specify a name and address that is
    | used globally for all emails that are sent by your application.
    |
    */

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
        'name' => env('MAIL_FROM_NAME', env('APP_NAME', 'Laravel')),
    ],

];
