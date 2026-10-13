<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SystemSettingController extends Controller
{
    /**
     * GET /api/admin/system-settings
     * Lấy toàn bộ cấu hình hệ thống và dữ liệu trang chủ, CLB từ MySQL
     * Tự động khởi tạo dữ liệu vào MySQL nếu bảng còn trống
     */
    public function index()
    {
        try {
            $this->ensureSchemaAndDefaults();

            $rows = SystemSetting::all();
            $settings = [];
            foreach ($rows as $r) {
                $settings[$r->setting_key] = $r->setting_value;
            }
            return response()->json(['success' => true, 'data' => $settings]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function toggleSeason()
    {
        try {
            $setting = SystemSetting::firstOrNew(['setting_key' => 'recruitment_season_active']);
            $currentVal = $setting->setting_value ?: '0';
            $newVal = $currentVal === '1' ? '0' : '1';

            $setting->setting_value = $newVal;
            $setting->save();

            return response()->json([
                'success' => true,
                'isActive' => $newVal === '1',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateSetting(Request $request)
    {
        try {
            $key = $request->input('key') ?: $request->input('setting_key');
            $val = $request->input('value') !== null ? $request->input('value') : $request->input('setting_value');

            if (!$key) {
                return response()->json(['success' => false, 'error' => 'Setting key is required'], 400);
            }

            $setting = SystemSetting::firstOrNew(['setting_key' => $key]);
            $setting->setting_value = is_string($val) ? $val : json_encode($val, JSON_UNESCAPED_UNICODE);
            $setting->save();

            return response()->json([
                'success' => true,
                'key' => $key,
                'data' => $setting->setting_value
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/homepage/upload-image
     * Hỗ trợ lưu ảnh tải lên thành file tĩnh tại public/storage/homepage_media để tối ưu tốc độ & không nặng CSDL
     */
    public function uploadImage(Request $request)
    {
        try {
            // 1. Dạng multipart file
            if ($request->hasFile('file') || $request->hasFile('image')) {
                $file = $request->file('file') ?: $request->file('image');
                $ext = $file->getClientOriginalExtension() ?: 'jpg';
                $filename = 'media-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
                $path = $file->storeAs('homepage_media', $filename, 'public');
                $url = '/storage/' . $path;
                return response()->json(['success' => true, 'url' => $url]);
            }

            // 2. Dạng base64 string
            $b64 = $request->input('base64') ?: $request->input('image');
            if ($b64 && str_starts_with($b64, 'data:image/')) {
                $parts = explode(',', $b64, 2);
                if (count($parts) === 2) {
                    $header = $parts[0];
                    $data = base64_decode($parts[1]);
                    $ext = 'jpg';
                    if (str_contains($header, 'png')) $ext = 'png';
                    elseif (str_contains($header, 'webp')) $ext = 'webp';

                    $filename = 'media-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
                    $saveDir = storage_path('app/public/homepage_media');
                    if (!file_exists($saveDir)) {
                        mkdir($saveDir, 0755, true);
                    }
                    file_put_contents($saveDir . '/' . $filename, $data);

                    try {
                        $pubDir = public_path('storage/homepage_media');
                        if (!file_exists($pubDir)) {
                            mkdir($pubDir, 0755, true);
                        }
                        file_put_contents($pubDir . '/' . $filename, $data);
                    } catch (\Throwable $e) {}

                    $url = '/storage/homepage_media/' . $filename;
                    return response()->json(['success' => true, 'url' => $url]);
                }
            }

            return response()->json(['success' => false, 'error' => 'No valid file or image data provided'], 400);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Đảm bảo CSDL MySQL lưu trữ 100% dữ liệu gốc của CLB và Trang chủ
     */
    private function ensureSchemaAndDefaults()
    {
        try {
            static $checked = false;
            if ($checked) return;
            $checked = true;

            $defaults = $this->getDefaultSettings();
            foreach ($defaults as $k => $v) {
                $setting = SystemSetting::where('setting_key', $k)->first();
                $isMissing = !$setting || $setting->setting_value === null;
                if ($isMissing) {
                    if (!$setting) {
                        $setting = new SystemSetting(['setting_key' => $k]);
                    }
                    $setting->setting_value = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                    $setting->save();
                }
            }

            // Tự động thanh trừng triệt để dữ liệu mẫu (art-1, med-1) còn sót lại trong MySQL máy chủ production
            $staleArticles = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_ARTICLES')->first();
            if ($staleArticles && (str_contains($staleArticles->setting_value, 'art-1') || str_contains($staleArticles->setting_value, 'Hành Trình 6 Năm'))) {
                $staleArticles->setting_value = '[]';
                $staleArticles->save();
            }

            $staleMedia = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_MEDIA')->first();
            if ($staleMedia && (str_contains($staleMedia->setting_value, 'med-1') || str_contains($staleMedia->setting_value, 'unsplash.com'))) {
                $staleMedia->setting_value = '[]';
                $staleMedia->save();
            }
        } catch (\Throwable $e) {
            // Log without failing
        }
    }

    private function getDefaultSettings()
    {
        return [
            'recruitment_season_active' => '0',

            'VMC_CLUB_INFO' => json_encode([
                'name' => 'VMC Intranet',
                'fullName' => 'Hệ Thống Quản Trị Nội Bộ - CLB Truyền Thông THPT Vĩnh Bảo',
                'englishName' => 'VINH BAO HIGH SCHOOL MEDIA CLUB - INTERNAL PORTAL',
                'slogan' => 'Quản Lý Công Việc • Phát Thanh Học Đường • Sản Xuất & Đối Ngoại',
                'affiliation' => 'Trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo',
                'accountManager' => 'Bộ Phận Kỹ Thuật - Ban Đối Ngoại & Nhân Sự',
                'departments' => [
                    [
                        'id' => 'bcn',
                        'name' => 'Ban Chủ Nhiệm',
                        'icon' => 'Crown',
                        'count' => 0,
                        'lead' => 'Chủ Nhiệm CLB',
                        'desc' => 'Điều hành chung toàn bộ hoạt động CLB, duyệt bài đăng Fanpage, duyệt ngân sách & chỉ đạo sự kiện.'
                    ],
                    [
                        'id' => 'content_radio',
                        'name' => 'Ban Nội Dung - Phát Thanh',
                        'icon' => 'Mic',
                        'count' => 0,
                        'lead' => 'Trưởng Ban Nội Dung',
                        'desc' => 'Phụ trách biên tập bài đăng Fanpage, viết kịch bản phát thanh giờ ra chơi, bản tin VMC News & biên tập báo chí.'
                    ],
                    [
                        'id' => 'production',
                        'name' => 'Ban Sản Xuất',
                        'icon' => 'Film',
                        'count' => 0,
                        'lead' => 'Trưởng Ban Sản Xuất',
                        'desc' => 'Phụ trách quay phim, chụp ảnh sự kiện trường, dựng video highlight, hậu kỳ âm thanh & thiết kế đồ họa.'
                    ],
                    [
                        'id' => 'hr_external',
                        'name' => 'Ban Đối Ngoại - Nhân Sự',
                        'icon' => 'Users',
                        'count' => 0,
                        'lead' => 'Trưởng Ban Đối Ngoại - Nhân Sự',
                        'desc' => 'Quản lý nhân sự, điểm danh sinh hoạt, quản trị hệ thống kỹ thuật portal VMC và xin tài trợ sự kiện.'
                    ],
                    [
                        'id' => 'advisory',
                        'name' => 'Ban Cố Vấn',
                        'icon' => 'Award',
                        'count' => 0,
                        'lead' => 'Cố Vấn CLB',
                        'desc' => 'Cố vấn định hướng chiến lược, hỗ trợ chuyên môn, tư vấn phát triển và giám sát hoạt động cho CLB VMC.'
                    ]
                ]
            ], JSON_UNESCAPED_UNICODE),

            'VMC_HOMEPAGE_INFO' => json_encode([
                'name' => 'CLB TRUYỀN THÔNG THPT VĨNH BẢO',
                'shortName' => 'VMC',
                'slogan' => 'Sáng Tạo Đột Phá • Nhiệt Huyết Tuổi Trẻ • Tỏa Sáng Tương Lai',
                'description' => 'Câu lạc bộ Truyền thông trường THPT Vĩnh Bảo (Vinh Bao High School Media Club - VMC) là tổ chức trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo, quy tụ những học sinh năng động, đam mê sáng tạo nội dung, nhiếp ảnh, quay dựng video và phát thanh học đường.',
                'establishedYear' => '2020',
                'stats' => [
                    'membersCount' => '150+',
                    'productionsCount' => '120+',
                    'awardsCount' => '16+',
                    'yearsActive' => '6+'
                ],
                'mission' => 'Xây dựng nhịp cầu thông tin chính thống, chuyên nghiệp và lan tỏa những giá trị tích cực, hình ảnh đẹp của thầy và trò trường THPT Vĩnh Bảo đến cộng đồng.',
                'vision' => 'Trở thành một trong những CLB truyền thông học đường dẫn đầu thành phố Hải Phòng với các sản phẩm truyền thông giàu tính nhân văn và chất lượng nghệ thuật cao.',
                'coreValues' => [
                    ['title' => 'Sáng Tạo Đột Phá', 'desc' => 'Không ngừng đổi mới tư duy, khai phá những góc nhìn độc đáo và hiện đại trong từng sản phẩm.'],
                    ['title' => 'Trách Nhiệm & Kỷ Luật', 'desc' => 'Đảm bảo tính chính xác, chuẩn mực văn hóa học đường và hoàn thành nhiệm vụ đúng tiến độ.'],
                    ['title' => 'Đoàn Kết & Gắn Kết', 'desc' => 'Mỗi thế hệ Gen là một gia đình, chia sẻ kinh nghiệm, hỗ trợ và cùng nhau trưởng thành.'],
                    ['title' => 'Nhiệt Huyết Cống Hiến', 'desc' => 'Lăn xả trong mọi sự kiện, cháy hết mình vì màu cờ sắc áo của trường THPT Vĩnh Bảo.']
                ]
            ], JSON_UNESCAPED_UNICODE),

            'VMC_HOMEPAGE_ARTICLES' => '[]',
            'VMC_HOMEPAGE_MEDIA' => '[]',

            'VMC_HOMEPAGE_ORG' => json_encode([
                [
                    'group' => 'Ban Cố Vấn',
                    'desc' => 'Định hướng chiến lược, hỗ trợ chuyên môn và cố vấn phát triển toàn diện cho CLB.',
                    'members' => [
                        [
                            'name' => 'Đoàn TNCS Hồ Chí Minh THPT Vĩnh Bảo',
                            'role' => 'Đơn vị chỉ đạo trực tiếp',
                            'avatar' => '/logo_dtn.jpg',
                            'badge' => 'Chỉ Đạo',
                            'dept' => 'Đoàn Trường'
                        ],
                        [
                            'name' => 'Ban Cố Vấn CLB',
                            'role' => 'Cố vấn chuyên môn & cựu cán sự tiêu biểu',
                            'avatar' => '/vmc-logo.jpg',
                            'badge' => 'Cố Vấn',
                            'dept' => 'Ban Cố Vấn'
                        ]
                    ]
                ],
                [
                    'group' => 'Ban Chủ Nhiệm',
                    'desc' => 'Bộ phận đầu não lãnh đạo, điều hành chung mọi hoạt động, kiểm duyệt sản phẩm và đại diện CLB.',
                    'members' => [
                        [
                            'name' => 'Vũ Thị Thùy Linh',
                            'role' => 'Chủ Nhiệm CLB',
                            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
                            'badge' => 'Chủ Nhiệm',
                            'dept' => 'Ban Chủ Nhiệm',
                            'class' => '12A1',
                            'bio' => 'Điều hành tổng thể, định hướng chiến lược nội dung và quan hệ đối ngoại.'
                        ],
                        [
                            'name' => 'Bùi Phương Thảo',
                            'role' => 'Phó Chủ Nhiệm CLB',
                            'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
                            'badge' => 'Phó Chủ Nhiệm',
                            'dept' => 'Ban Chủ Nhiệm',
                            'class' => '12A3',
                            'bio' => 'Phụ trách điều phối hoạt động phong trào và công tác phát thanh học đường.'
                        ],
                        [
                            'name' => 'Đặng Nguyệt Minh',
                            'role' => 'Phó Chủ Nhiệm CLB (kiêm Trưởng Ban ĐN-NS)',
                            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                            'badge' => 'Phó Chủ Nhiệm',
                            'dept' => 'Ban Chủ Nhiệm',
                            'class' => '12A2',
                            'bio' => 'Phụ trách công tác quản trị nhân sự, hệ thống công nghệ thông tin và phong trào thi đua CLB.'
                        ]
                    ]
                ],
                [
                    'group' => 'Ban Chuyên Môn Trực Thuộc',
                    'desc' => '3 trụ cột chuyên môn nòng cốt thực hiện các nhiệm vụ chuyên biệt của CLB.',
                    'departments' => [
                        [
                            'name' => 'Ban Đối Ngoại - Nhân Sự',
                            'officers' => [
                                ['role' => 'Trưởng Ban', 'name' => 'Đặng Nguyệt Minh', 'isHead' => true, 'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'],
                                ['role' => 'Phó Ban', 'name' => 'Đào Trung Kiên', 'isHead' => false, 'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'],
                                ['role' => 'Phó Ban', 'name' => 'Hoàng Khánh Ly', 'isHead' => false, 'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400']
                            ],
                            'lead' => 'Đặng Nguyệt Minh (Trưởng Ban) • Đào Trung Kiên, Hoàng Khánh Ly (Phó Ban)',
                            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                            'color' => 'from-blue-600/20 to-cyan-600/20',
                            'borderColor' => 'border-blue-500/40',
                            'icon' => 'Users',
                            'tasks' => [
                                'Quản lý hồ sơ, điểm danh và đánh giá thi đua thành viên',
                                'Quản trị hệ thống phần mềm Portal VMC nội bộ',
                                'Liên hệ tài trợ, đối ngoại các CLB bạn và hỗ trợ sự kiện'
                            ]
                        ],
                        [
                            'name' => 'Ban Nội Dung - Phát Thanh',
                            'officers' => [
                                ['role' => 'Trưởng Ban', 'name' => 'Phạm Thanh Thảo', 'isHead' => true, 'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'],
                                ['role' => 'Phó Ban', 'name' => 'Hoàng Linh Chi', 'isHead' => false, 'avatar' => 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400'],
                                ['role' => 'Phó Ban', 'name' => 'Vũ Hà My', 'isHead' => false, 'avatar' => 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400']
                            ],
                            'lead' => 'Phạm Thanh Thảo (Trưởng Ban) • Hoàng Linh Chi, Vũ Hà My (Phó Ban)',
                            'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
                            'color' => 'from-purple-600/20 to-pink-600/20',
                            'borderColor' => 'border-purple-500/40',
                            'icon' => 'Mic',
                            'tasks' => [
                                'Biên tập bài viết truyền thông Fanpage và website',
                                'Xây dựng kịch bản chương trình phát thanh giờ ra chơi',
                                'Sáng tạo nội dung podcast, phóng sự và bản tin VMC News'
                            ]
                        ],
                        [
                            'name' => 'Ban Sản Xuất',
                            'officers' => [
                                ['role' => 'Trưởng Ban', 'name' => 'Nguyễn Bảo Châu', 'isHead' => true, 'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'],
                                ['role' => 'Phó Ban', 'name' => 'Hà Minh Khang', 'isHead' => false, 'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400']
                            ],
                            'lead' => 'Nguyễn Bảo Châu (Trưởng Ban) • Hà Minh Khang (Phó Ban)',
                            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
                            'color' => 'from-amber-600/20 to-orange-600/20',
                            'borderColor' => 'border-amber-500/40',
                            'icon' => 'Film',
                            'tasks' => [
                                'Chụp ảnh phóng sự, chân dung sự kiện toàn trường',
                                'Quay phim, dựng video highlight, recap và phim ngắn',
                                'Thiết kế ấn phẩm đồ họa, poster, banner và infographic'
                            ]
                        ]
                    ]
                ]
            ], JSON_UNESCAPED_UNICODE)
        ];
    }
}
