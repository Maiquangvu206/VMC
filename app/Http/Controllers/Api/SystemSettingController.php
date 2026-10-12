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
     * Đảm bảo CSDL MySQL lưu trữ 100% dữ liệu gốc của CLB và Trang chủ
     */
    private function ensureSchemaAndDefaults()
    {
        try {
            // Nâng cấp cột setting_value thành LONGTEXT nếu cần
            static $checked = false;
            if ($checked) return;
            $checked = true;

            $existingKeys = SystemSetting::pluck('setting_key')->toArray();

            $defaults = $this->getDefaultSettings();
            foreach ($defaults as $k => $v) {
                if (!in_array($k, $existingKeys)) {
                    SystemSetting::create([
                        'setting_key' => $k,
                        'setting_value' => is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE)
                    ]);
                }
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

            'VMC_HOMEPAGE_ARTICLES' => json_encode([
                [
                    'id' => 'art-1',
                    'title' => 'Hành Trình 6 Năm Trưởng Thành & Đổi Mới Của CLB Truyền Thông THPT Vĩnh Bảo (2020 - 2026)',
                    'category' => 'Giới Thiệu',
                    'date' => '10/10/2026',
                    'author' => 'Ban Chủ Nhiệm VMC',
                    'coverImage' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
                    'images' => [
                        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000'
                    ],
                    'summary' => 'Nhìn lại chặng đường từ những ngày đầu thành lập đến khi trở thành kênh truyền thông tin cậy hàng đầu của học sinh trường THPT Vĩnh Bảo.',
                    'content' => "Được thành lập từ năm 2020 dưới sự chỉ đạo của Đoàn TNCS Hồ Chí Minh trường THPT Vĩnh Bảo, CLB Truyền Thông VMC ban đầu chỉ là một nhóm nhỏ các bạn học sinh đam mê nhiếp ảnh và viết lách. Trải qua hơn 6 năm phát triển cùng các thế hệ từ Gen 1 đến Gen 7, VMC đã khẳng định vị thế là \"mạch nguồn thông tin\" quan trọng trong toàn trường.\n\nHiện nay, CLB sở hữu cơ cấu tổ chức chuyên nghiệp gồm Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất (Ảnh & Video), Ban Đối Ngoại - Nhân Sự và Ban Cố Vấn. Mỗi sự kiện lớn nhỏ của trường THPT Vĩnh Bảo từ Khai giảng, Bế giảng, Tri ân & Trưởng thành, Ngày Nhà giáo Việt Nam 20/11 đến các hội thao, giải bóng đá đều có dấu chân của các bạn phóng viên trẻ VMC.\n\nKhông chỉ ghi lại những khoảnh khắc đẹp, VMC còn là cái nôi ươm mầm kỹ năng mềm, nơi các bạn học sinh rèn luyện tư duy truyền thông, kỹ năng làm việc nhóm, quản lý dự án và tự tin bước vào cánh cửa đại học."
                ],
                [
                    'id' => 'art-2',
                    'title' => 'Phát Thanh Học Đường - Thanh Âm Thân Thương Nơi Giờ Ra Chơi Sân Trường',
                    'category' => 'Chuyên Mục',
                    'date' => '05/10/2026',
                    'author' => 'Ban Nội Dung - Phát Thanh',
                    'coverImage' => 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000',
                    'images' => [
                        'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000'
                    ],
                    'summary' => 'Chương trình phát thanh học đường VMC News là điểm hẹn quen thuộc mỗi sáng thứ Hai và giờ ra chơi với những giai điệu và thông tin bổ ích.',
                    'content' => "Cứ mỗi 15 phút chuyển tiết hoặc giờ ra chơi, thanh âm quen thuộc từ hệ thống loa phát thanh học đường lại vang lên khắp các dãy hành lang lớp học trường THPT Vĩnh Bảo. Đó là thành quả của những buổi biên tập kịch bản tỉ mỉ từ Ban Nội Dung - Phát Thanh VMC.\n\nChương trình bao gồm các chuyên mục đa dạng:\n1. Bản tin VMC News: Cập nhật hoạt động Đoàn trường, lịch thi cử, phong trào thi đua.\n2. Góc Âm Nhạc & Quà Tặng Âm Nhạc: Gửi gắm những lời chúc, những giai điệu tuổi học trò ấm áp.\n3. Chuyên đề Kỹ Năng & Góc Sống Xanh: Chia sẻ mẹo ôn thi, lối sống lành mạnh, kỹ năng ứng xử học đường.\n\nPhát thanh học đường đã và đang trở thành một nét văn hóa đặc trưng, gắn kết tình bạn, tình thầy trò dưới mái trường Vĩnh Bảo thân yêu."
                ],
                [
                    'id' => 'art-3',
                    'title' => 'Bản Lĩnh Đằng Sau Ống Kính: Hậu Trường Những Mùa Sản Xuất Media Cực Chất',
                    'category' => 'Hậu Trường',
                    'date' => '28/09/2026',
                    'author' => 'Ban Sản Xuất VMC',
                    'coverImage' => 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1000',
                    'images' => [
                        'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000'
                    ],
                    'summary' => 'Để có được những thước phim highlight triệu view và những bộ ảnh sắc nét, các kỹ thuật viên VMC đã trải qua những buổi làm việc nghiêm túc.',
                    'content' => "Để có những bức ảnh lung linh bắt trọn nụ cười rạng rỡ của thầy cô, hay những video highlight sắc nét chỉ vài giờ sau khi sự kiện kết thúc, đằng sau đó là sự cống hiến âm thầm của đội ngũ Ban Sản Xuất VMC.\n\nCác thành viên thường có mặt tại sân trường từ 6 giờ sáng để setup chân máy, kiểm tra thẻ nhớ, cân chỉnh âm thanh ánh sáng. Khi sự kiện kết thúc, trong khi mọi người ra về thì đội ngũ kỹ thuật lại tiếp tục ngồi lại phòng truyền thống để import dữ liệu, lọc ảnh và dựng video xuyên trưa.\n\nChính niềm đam mê với nghệ thuật thị giác và tinh thần trách nhiệm đã biến những vất vả thành niềm tự hào khi sản phẩm được đón nhận nồng nhiệt trên Fanpage CLB."
                ]
            ], JSON_UNESCAPED_UNICODE),

            'VMC_HOMEPAGE_MEDIA' => json_encode([
                [
                    'id' => 'med-1',
                    'title' => 'Trailer Giới Thiệu CLB Truyền Thông THPT Vĩnh Bảo',
                    'type' => 'video',
                    'mediaUrl' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'thumbnail' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
                    'date' => '01/10/2026',
                    'category' => 'Trailer',
                    'description' => 'Video giới thiệu các hoạt động nổi bật, cơ cấu tổ chức và tinh thần nhiệt huyết của các thành viên CLB VMC.'
                ],
                [
                    'id' => 'med-2',
                    'title' => 'Bộ Ảnh Khoảnh Khắc Khai Giảng Năm Học 2026 - 2027',
                    'type' => 'image',
                    'mediaUrl' => 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200',
                    'thumbnail' => 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600',
                    'date' => '05/09/2026',
                    'category' => 'Sự Kiện',
                    'description' => 'Toàn cảnh ngày hội tựu trường rực rỡ cờ hoa dưới mái trường THPT Vĩnh Bảo qua lăng kính Ban Sản Xuất.'
                ],
                [
                    'id' => 'med-3',
                    'title' => 'Hậu Trường Sản Xuất Bản Tin VMC News Tháng 10',
                    'type' => 'image',
                    'mediaUrl' => 'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=1200',
                    'thumbnail' => 'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=600',
                    'date' => '12/10/2026',
                    'category' => 'Hậu Trường',
                    'description' => 'Những góc máy chân thực, say mê của đội ngũ kỹ thuật viên VMC trong lúc làm việc.'
                ]
            ], JSON_UNESCAPED_UNICODE),

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
