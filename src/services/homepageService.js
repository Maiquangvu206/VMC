/**
 * Homepage Data Service (Quản lý dữ liệu Trang Chủ VMC)
 * Lưu trữ đồng bộ MySQL (System_Settings) + LocalStorage Cache
 */

import { getCachedData, setCachedData, invalidateCache, CACHE_TTL } from './cacheService';

const STORAGE_KEY_ARTICLES = 'VMC_HOMEPAGE_ARTICLES';
const STORAGE_KEY_MEDIA = 'VMC_HOMEPAGE_MEDIA';
const STORAGE_KEY_INFO = 'VMC_HOMEPAGE_INFO';
const STORAGE_KEY_ORG = 'VMC_HOMEPAGE_ORG';

// Dữ liệu mẫu ban đầu chuẩn hóa cho CLB Truyền Thông THPT Vĩnh Bảo
export const DEFAULT_HOMEPAGE_INFO = {
  name: 'CLB TRUYỀN THÔNG THPT VĨNH BẢO',
  shortName: 'VMC',
  slogan: 'Sáng Tạo Đột Phá • Nhiệt Huyết Tuổi Trẻ • Tỏa Sáng Tương Lai',
  description: 'Câu lạc bộ Truyền thông trường THPT Vĩnh Bảo (Vinh Bao High School Media Club - VMC) là tổ chức trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo, quy tụ những học sinh năng động, đam mê sáng tạo nội dung, nhiếp ảnh, quay dựng video và phát thanh học đường.',
  establishedYear: '2020',
  stats: {
    membersCount: '150+',
    productionsCount: '120+',
    awardsCount: '16+',
    yearsActive: '6+'
  },
  mission: 'Xây dựng nhịp cầu thông tin chính thống, chuyên nghiệp và lan tỏa những giá trị tích cực, hình ảnh đẹp của thầy và trò trường THPT Vĩnh Bảo đến cộng đồng.',
  vision: 'Trở thành một trong những CLB truyền thông học đường dẫn đầu thành phố Hải Phòng với các sản phẩm truyền thông giàu tính nhân văn và chất lượng nghệ thuật cao.',
  coreValues: [
    { title: 'Sáng Tạo Đột Phá', desc: 'Không ngừng đổi mới tư duy, khai phá những góc nhìn độc đáo và hiện đại trong từng sản phẩm.' },
    { title: 'Trách Nhiệm & Kỷ Luật', desc: 'Đảm bảo tính chính xác, chuẩn mực văn hóa học đường và hoàn thành nhiệm vụ đúng tiến độ.' },
    { title: 'Đoàn Kết & Gắn Kết', desc: 'Mỗi thế hệ Gen là một gia đình, chia sẻ kinh nghiệm, hỗ trợ và cùng nhau trưởng thành.' },
    { title: 'Nhiệt Huyết Cống Hiến', desc: 'Lăn xả trong mọi sự kiện, cháy hết mình vì màu cờ sắc áo của trường THPT Vĩnh Bảo.' }
  ]
};

export const DEFAULT_HOMEPAGE_ARTICLES = [
  {
    id: 'art-1',
    title: 'Hành Trình 6 Năm Trưởng Thành & Đổi Mới Của CLB Truyền Thông THPT Vĩnh Bảo (2020 - 2026)',
    category: 'Giới Thiệu',
    date: '10/10/2026',
    author: 'Ban Chủ Nhiệm VMC',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000'
    ],
    summary: 'Nhìn lại chặng đường từ những ngày đầu thành lập đến khi trở thành kênh truyền thông tin cậy hàng đầu của học sinh trường THPT Vĩnh Bảo.',
    content: `Được thành lập từ năm 2020 dưới sự chỉ đạo của Đoàn TNCS Hồ Chí Minh trường THPT Vĩnh Bảo, CLB Truyền Thông VMC ban đầu chỉ là một nhóm nhỏ các bạn học sinh đam mê nhiếp ảnh và viết lách. Trải qua hơn 6 năm phát triển cùng các thế hệ từ Gen 1 đến Gen 7, VMC đã khẳng định vị thế là "mạch nguồn thông tin" quan trọng trong toàn trường.

Hiện nay, CLB sở hữu cơ cấu tổ chức chuyên nghiệp gồm Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất (Ảnh & Video), Ban Đối Ngoại - Nhân Sự và Ban Cố Vấn. Mỗi sự kiện lớn nhỏ của trường THPT Vĩnh Bảo từ Khai giảng, Bế giảng, Tri ân & Trưởng thành, Ngày Nhà giáo Việt Nam 20/11 đến các hội thao, giải bóng đá đều có dấu chân của các bạn phóng viên trẻ VMC.

Không chỉ ghi lại những khoảnh khắc đẹp, VMC còn là cái nôi ươm mầm kỹ năng mềm, nơi các bạn học sinh rèn luyện tư duy truyền thông, kỹ năng làm việc nhóm, quản lý dự án và tự tin bước vào cánh cửa đại học.`
  },
  {
    id: 'art-2',
    title: 'Phát Thanh Học Đường - Thanh Âm Thân Thương Nơi Giờ Ra Chơi Sân Trường',
    category: 'Chuyên Mục',
    date: '05/10/2026',
    author: 'Ban Nội Dung - Phát Thanh',
    coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000'
    ],
    summary: 'Chương trình phát thanh học đường VMC News là điểm hẹn quen thuộc mỗi sáng thứ Hai và giờ ra chơi với những giai điệu và thông tin bổ ích.',
    content: `Cứ mỗi 15 phút chuyển tiết hoặc giờ ra chơi, thanh âm quen thuộc từ hệ thống loa phát thanh học đường lại vang lên khắp các dãy hành lang lớp học trường THPT Vĩnh Bảo. Đó là thành quả của những buổi biên tập kịch bản tỉ mỉ từ Ban Nội Dung - Phát Thanh VMC.

Chương trình bao gồm các chuyên mục đa dạng:
1. Bản tin VMC News: Cập nhật hoạt động Đoàn trường, lịch thi cử, phong trào thi đua.
2. Góc Âm Nhạc & Quà Tặng Âm Nhạc: Gửi gắm những lời chúc, những giai điệu tuổi học trò ấm áp.
3. Chuyên đề Kỹ Năng & Góc Sống Xanh: Chia sẻ mẹo ôn thi, lối sống lành mạnh, kỹ năng ứng xử học đường.

Phát thanh học đường đã và đang trở thành một nét văn hóa đặc trưng, gắn kết tình bạn, tình thầy trò dưới mái trường Vĩnh Bảo thân yêu.`
  },
  {
    id: 'art-3',
    title: 'Bản Lĩnh Đằng Sau Ống Kính: Hậu Trường Những Mùa Sản Xuất Media Cực Chất',
    category: 'Hậu Trường',
    date: '28/09/2026',
    author: 'Ban Sản Xuất VMC',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000'
    ],
    summary: 'Để có được những thước phim highlight triệu view và những bộ ảnh sắc nét, các kỹ thuật viên VMC đã trải qua những buổi làm việc nghiêm túc.',
    content: `Để có những bức ảnh lung linh bắt trọn nụ cười rạng rỡ của thầy cô, hay những video highlight sắc nét chỉ vài giờ sau khi sự kiện kết thúc, đằng sau đó là sự cống hiến âm thầm của đội ngũ Ban Sản Xuất VMC.

Các thành viên thường có mặt tại sân trường từ 6 giờ sáng để setup chân máy, kiểm tra thẻ nhớ, cân chỉnh âm thanh ánh sáng. Khi sự kiện kết thúc, trong khi mọi người ra về thì đội ngũ kỹ thuật lại tiếp tục ngồi lại phòng truyền thống để import dữ liệu, lọc ảnh và dựng video xuyên trưa.

Chính niềm đam mê với nghệ thuật thị giác và tinh thần trách nhiệm đã biến những vất vả thành niềm tự hào khi sản phẩm được đón nhận nồng nhiệt trên Fanpage CLB.`
  }
];

export const DEFAULT_HOMEPAGE_MEDIA = [
  {
    id: 'med-1',
    title: 'Trailer Giới Thiệu CLB Truyền Thông THPT Vĩnh Bảo',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Hoặc link video drive/youtube
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800',
    date: '01/10/2026',
    category: 'Video Spotlight',
    description: 'Video giới thiệu tổng quan các hoạt động và các ban chuyên môn của CLB Truyền Thông VMC.'
  },
  {
    id: 'med-2',
    title: 'Lễ Khai Giảng Năm Học Mới - Rực Rỡ Sắc Cờ Hoa',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600',
    date: '05/09/2026',
    category: 'Ảnh Sự Kiện',
    description: 'Khoảnh khắc chào đón các tân học sinh K65 bước vào ngôi trường THPT Vĩnh Bảo giàu truyền thống.'
  },
  {
    id: 'med-3',
    title: 'Gala Chào Đón Thế Hệ Thành Viên Mới - Gen 7 VMC',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
    date: '20/09/2026',
    category: 'Kỷ Niệm Nội Bộ',
    description: 'Đêm gala kết nối đầy ấm cúng và bùng nổ nhiệt huyết của các thành viên gia đình VMC.'
  },
  {
    id: 'med-4',
    title: 'Phim Ngắn Học Đường: "Nắng Sân Trường Năm Ấy"',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    date: '15/05/2026',
    category: 'Sản Xuất Media',
    description: 'Phim ngắn tri ân tuổi học trò do chính ekip học sinh VMC viết kịch bản, quay phim và hậu kỳ.'
  },
  {
    id: 'med-5',
    title: 'Hội Diễn Văn Nghệ Chào Mừng Ngày Nhà Giáo Việt Nam 20/11',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=600',
    date: '20/11/2025',
    category: 'Ảnh Sự Kiện',
    description: 'Bộ ảnh bắt trọn từng khoảnh khắc biểu diễn thăng hoa của học sinh các khối lớp.'
  },
  {
    id: 'med-6',
    title: 'Hậu Trường Ekip Sản Xuất Tác Nghiệp Sự Kiện',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1533727937480-da3a97967e15?auto=format&fit=crop&q=80&w=600',
    date: '12/10/2026',
    category: 'Hậu Trường',
    description: 'Những góc máy chân thực, say mê của đội ngũ kỹ thuật viên VMC trong lúc làm việc.'
  }
];

export const DEFAULT_HOMEPAGE_ORG = [
  {
    group: 'Ban Cố Vấn',
    desc: 'Định hướng chiến lược, hỗ trợ chuyên môn và cố vấn phát triển toàn diện cho CLB.',
    members: [
      {
        name: 'Đoàn TNCS Hồ Chí Minh THPT Vĩnh Bảo',
        role: 'Đơn vị chỉ đạo trực tiếp',
        avatar: '/logo_dtn.jpg',
        badge: 'Chỉ Đạo',
        dept: 'Đoàn Trường'
      },
      {
        name: 'Ban Cố Vấn CLB',
        role: 'Cố vấn chuyên môn & cựu cán sự tiêu biểu',
        avatar: '/vmc-logo.jpg',
        badge: 'Cố Vấn',
        dept: 'Ban Cố Vấn'
      }
    ]
  },
  {
    group: 'Ban Chủ Nhiệm',
    desc: 'Bộ phận đầu não lãnh đạo, điều hành chung mọi hoạt động, kiểm duyệt sản phẩm và đại diện CLB.',
    members: [
      {
        name: 'Vũ Thị Thùy Linh',
        role: 'Chủ Nhiệm CLB',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        badge: 'Chủ Nhiệm',
        dept: 'Ban Chủ Nhiệm',
        class: '12A1',
        bio: 'Điều hành tổng thể, định hướng chiến lược nội dung và quan hệ đối ngoại.'
      },
      {
        name: 'Bùi Phương Thảo',
        role: 'Phó Chủ Nhiệm CLB',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        badge: 'Phó Chủ Nhiệm',
        dept: 'Ban Chủ Nhiệm',
        class: '12A3',
        bio: 'Phụ trách điều phối hoạt động phong trào và công tác phát thanh học đường.'
      },
      {
        name: 'Đặng Nguyệt Minh',
        role: 'Phó Chủ Nhiệm CLB (kiêm Trưởng Ban ĐN-NS)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        badge: 'Phó Chủ Nhiệm',
        dept: 'Ban Chủ Nhiệm',
        class: '12A2',
        bio: 'Phụ trách công tác quản trị nhân sự, hệ thống công nghệ thông tin và phong trào thi đua CLB.'
      }
    ]
  },
  {
    group: 'Ban Chuyên Môn Trực Thuộc',
    desc: '3 trụ cột chuyên môn nòng cốt thực hiện các nhiệm vụ chuyên biệt của CLB.',
    departments: [
      {
        name: 'Ban Đối Ngoại - Nhân Sự',
        officers: [
          { role: 'Trưởng Ban', name: 'Đặng Nguyệt Minh', isHead: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
          { role: 'Phó Ban', name: 'Đào Trung Kiên', isHead: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
          { role: 'Phó Ban', name: 'Hoàng Khánh Ly', isHead: false, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400' }
        ],
        lead: 'Đặng Nguyệt Minh (Trưởng Ban) • Đào Trung Kiên, Hoàng Khánh Ly (Phó Ban)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        color: 'from-blue-600/20 to-cyan-600/20',
        borderColor: 'border-blue-500/40',
        icon: 'Users',
        tasks: [
          'Quản lý hồ sơ, điểm danh và đánh giá thi đua thành viên',
          'Quản trị hệ thống phần mềm Portal VMC nội bộ',
          'Liên hệ tài trợ, đối ngoại các CLB bạn và hỗ trợ sự kiện'
        ]
      },
      {
        name: 'Ban Nội Dung - Phát Thanh',
        officers: [
          { role: 'Trưởng Ban', name: 'Phạm Thanh Thảo', isHead: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
          { role: 'Phó Ban', name: 'Hoàng Linh Chi', isHead: false, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400' },
          { role: 'Phó Ban', name: 'Vũ Hà My', isHead: false, avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400' }
        ],
        lead: 'Phạm Thanh Thảo (Trưởng Ban) • Hoàng Linh Chi, Vũ Hà My (Phó Ban)',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        color: 'from-purple-600/20 to-pink-600/20',
        borderColor: 'border-purple-500/40',
        icon: 'Mic',
        tasks: [
          'Biên tập bài viết truyền thông Fanpage và website',
          'Xây dựng kịch bản chương trình phát thanh giờ ra chơi',
          'Sáng tạo nội dung podcast, phóng sự và bản tin VMC News'
        ]
      },
      {
        name: 'Ban Sản Xuất',
        officers: [
          { role: 'Trưởng Ban', name: 'Nguyễn Bảo Châu', isHead: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
          { role: 'Phó Ban', name: 'Hà Minh Khang', isHead: false, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400' }
        ],
        lead: 'Nguyễn Bảo Châu (Trưởng Ban) • Hà Minh Khang (Phó Ban)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        color: 'from-amber-600/20 to-orange-600/20',
        borderColor: 'border-amber-500/40',
        icon: 'Film',
        tasks: [
          'Chụp ảnh phóng sự, chân dung sự kiện toàn trường',
          'Quay phim, dựng video highlight, recap và phim ngắn',
          'Thiết kế ấn phẩm đồ họa, poster, banner và infographic'
        ]
      }
    ]
  }
];

// Helper lưu dữ liệu vào MySQL System_Settings và cập nhật cache
export const saveHomepageDataAPI = async (key, data) => {
  try {
    const valStr = JSON.stringify(data);
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    
    // Lưu vào cache client tức thì
    setCachedData(`homepage_${shortKey}`, data, CACHE_TTL.HOMEPAGE);
    setCachedData(key, data, CACHE_TTL.HOMEPAGE);

    // Gửi lưu trực tiếp vào CSDL MySQL
    await fetch('/api/admin/system-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ key, value: valStr })
    });
    
    // Invalidate system_settings cache để lần tải sau cập nhật mới nhất
    invalidateCache('system_settings');
    return true;
  } catch (error) {
    console.warn(`⚠️ Save ${key} error:`, error.message);
    return false;
  }
};

// Helper nạp dữ liệu từ cache và đồng bộ CSDL MySQL
export const loadHomepageDataAPI = async (key, fallbackData) => {
  try {
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    
    // 1. Lấy từ Cache tức thì (0ms)
    const cached = getCachedData(`homepage_${shortKey}`) || getCachedData(key);
    let result = cached !== null ? cached : fallbackData;

    // 2. Fetch từ CSDL MySQL để cập nhật dữ liệu mới nhất
    const res = await fetch('/api/admin/system-settings', {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const json = await res.json();
    if (json.success && json.data && json.data[key]) {
      const serverData = JSON.parse(json.data[key]);
      setCachedData(`homepage_${shortKey}`, serverData, CACHE_TTL.HOMEPAGE);
      setCachedData(key, serverData, CACHE_TTL.HOMEPAGE);
      return serverData;
    }

    return result;
  } catch (e) {
    console.warn(`⚠️ Load ${key} failed, using cached/default:`, e.message);
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    const cached = getCachedData(`homepage_${shortKey}`) || getCachedData(key);
    return cached !== null ? cached : fallbackData;
  }
};

// Helper nạp đồng thời toàn bộ dữ liệu Trang chủ trong 1 request duy nhất
export const fetchAllHomepageData = async () => {
  try {
    // 1. Kiểm tra cache có sẵn chưa
    const cachedInfo = getCachedData('homepage_info');
    const cachedArticles = getCachedData('homepage_articles');
    const cachedMedia = getCachedData('homepage_media');
    const cachedOrg = getCachedData('homepage_org');

    if (cachedInfo && cachedArticles && cachedMedia) {
      // Background revalidate
      fetch('/api/admin/system-settings', { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data) {
            if (json.data.VMC_HOMEPAGE_INFO) setCachedData('homepage_info', JSON.parse(json.data.VMC_HOMEPAGE_INFO), CACHE_TTL.HOMEPAGE);
            if (json.data.VMC_HOMEPAGE_ARTICLES) setCachedData('homepage_articles', JSON.parse(json.data.VMC_HOMEPAGE_ARTICLES), CACHE_TTL.HOMEPAGE);
            if (json.data.VMC_HOMEPAGE_MEDIA) setCachedData('homepage_media', JSON.parse(json.data.VMC_HOMEPAGE_MEDIA), CACHE_TTL.HOMEPAGE);
            if (json.data.VMC_HOMEPAGE_ORG) setCachedData('homepage_org', JSON.parse(json.data.VMC_HOMEPAGE_ORG), CACHE_TTL.HOMEPAGE);
          }
        }).catch(() => {});

      return {
        info: cachedInfo,
        articles: cachedArticles,
        media: cachedMedia,
        org: cachedOrg || DEFAULT_HOMEPAGE_ORG
      };
    }

    // 2. Fetch từ CSDL MySQL
    const res = await fetch('/api/admin/system-settings', {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const json = await res.json();
    if (json.success && json.data) {
      const info = json.data.VMC_HOMEPAGE_INFO ? JSON.parse(json.data.VMC_HOMEPAGE_INFO) : DEFAULT_HOMEPAGE_INFO;
      const articles = json.data.VMC_HOMEPAGE_ARTICLES ? JSON.parse(json.data.VMC_HOMEPAGE_ARTICLES) : DEFAULT_HOMEPAGE_ARTICLES;
      const media = json.data.VMC_HOMEPAGE_MEDIA ? JSON.parse(json.data.VMC_HOMEPAGE_MEDIA) : DEFAULT_HOMEPAGE_MEDIA;
      const org = json.data.VMC_HOMEPAGE_ORG ? JSON.parse(json.data.VMC_HOMEPAGE_ORG) : DEFAULT_HOMEPAGE_ORG;

      setCachedData('homepage_info', info, CACHE_TTL.HOMEPAGE);
      setCachedData('homepage_articles', articles, CACHE_TTL.HOMEPAGE);
      setCachedData('homepage_media', media, CACHE_TTL.HOMEPAGE);
      setCachedData('homepage_org', org, CACHE_TTL.HOMEPAGE);

      return { info, articles, media, org };
    }
  } catch (err) {
    console.warn('⚠️ fetchAllHomepageData error:', err.message);
  }

  return {
    info: getCachedData('homepage_info') || DEFAULT_HOMEPAGE_INFO,
    articles: getCachedData('homepage_articles') || DEFAULT_HOMEPAGE_ARTICLES,
    media: getCachedData('homepage_media') || DEFAULT_HOMEPAGE_MEDIA,
    org: getCachedData('homepage_org') || DEFAULT_HOMEPAGE_ORG
  };
};
