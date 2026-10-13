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

// Tuyệt đối không tự ý gen dữ liệu bài viết hoặc media mẫu - Dữ liệu hoàn toàn do người dùng quản lý
export const DEFAULT_HOMEPAGE_ARTICLES = [];
export const DEFAULT_HOMEPAGE_MEDIA = [];

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

// Helper tải ảnh lên máy chủ lưu thành file tĩnh tại /storage/homepage_media
export const uploadImageToServer = async (fileOrBase64) => {
  try {
    if (!fileOrBase64) return null;
    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('http') || fileOrBase64.startsWith('/')) {
        return fileOrBase64;
      }

      // Nếu là data URI, chuyển sang binary Blob và upload qua multipart FormData để tối ưu
      let formData = null;
      if (fileOrBase64.startsWith('data:image')) {
        try {
          const parts = fileOrBase64.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          formData = new FormData();
          formData.append('file', blob, `upload-${Date.now()}.${mime.split('/')[1] || 'jpg'}`);
        } catch {
          formData = null;
        }
      }

      const res = formData
        ? await fetch('/api/homepage/upload-image', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: formData
          })
        : await fetch('/api/homepage/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ base64: fileOrBase64 })
          });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) return json.url;
      }
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      const res = await fetch('/api/homepage/upload-image', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) return json.url;
      }
    }
  } catch (err) {
    console.warn('⚠️ Upload image to server failed, keeping original:', err);
  }
  return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
};

// Helper lưu 1 bài viết trực tiếp vào bảng Homepage_Articles
export const saveArticleAPI = async (article) => {
  try {
    const res = await fetch('/api/homepage/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(article)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('⚠️ saveArticleAPI failed:', res.status, errText);
      return false;
    }
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('⚠️ saveArticleAPI error:', err);
    return false;
  }
};

// Helper xóa 1 bài viết khỏi bảng Homepage_Articles
export const deleteArticleAPI = async (id) => {
  try {
    const res = await fetch(`/api/homepage/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return res.ok;
  } catch (err) {
    console.warn('⚠️ deleteArticleAPI error:', err);
    return false;
  }
};

// Helper lưu 1 mục media vào bảng Homepage_Media
export const saveMediaAPI = async (mediaItem) => {
  try {
    const res = await fetch('/api/homepage/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(mediaItem)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('⚠️ saveMediaAPI failed:', res.status, errText);
      return false;
    }
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('⚠️ saveMediaAPI error:', err);
    return false;
  }
};

// Helper xóa 1 mục media khỏi bảng Homepage_Media
export const deleteMediaAPI = async (id) => {
  try {
    const res = await fetch(`/api/homepage/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return res.ok;
  } catch (err) {
    console.warn('⚠️ deleteMediaAPI error:', err);
    return false;
  }
};

// Helper lưu dữ liệu vào CSDL (Bảng chuyên biệt + System_Settings tương thích ngược)
export const saveHomepageDataAPI = async (key, data) => {
  try {
    const valStr = JSON.stringify(data);
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    
    // Lưu vào cache client tức thì (0ms)
    setCachedData(`homepage_${shortKey}`, data, CACHE_TTL.HOMEPAGE);
    setCachedData(key, data, CACHE_TTL.HOMEPAGE);

    // Gửi lưu trực tiếp vào CSDL MySQL System_Settings
    const res = await fetch('/api/admin/system-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ key, value: valStr })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`⚠️ Save ${key} failed (Status ${res.status}):`, errText);
      return false;
    }

    const json = await res.json();
    if (!json.success) {
      console.error(`⚠️ Save ${key} returned error:`, json.error);
      return false;
    }
    
    // Invalidate system_settings cache để lần tải sau cập nhật mới nhất
    invalidateCache('system_settings');
    return true;
  } catch (error) {
    console.error(`⚠️ Save ${key} error:`, error.message);
    return false;
  }
};

// Helper nạp dữ liệu từ cache và đồng bộ CSDL MySQL
export const loadHomepageDataAPI = async (key, fallbackData) => {
  try {
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    
    // 1. Lấy từ Cache tức thì (0ms)
    const cached = getCachedData(`homepage_${shortKey}`) || getCachedData(key);
    let result = (Array.isArray(cached) ? cached.length > 0 : cached !== null) ? cached : fallbackData;

    // 2. Ưu tiên endpoint chuyên biệt
    if (key === 'VMC_HOMEPAGE_ARTICLES') {
      try {
        const resArt = await fetch('/api/homepage/articles', { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (resArt.ok) {
          const jsonArt = await resArt.json();
          if (jsonArt.success && Array.isArray(jsonArt.data)) {
            const clean = jsonArt.data.filter(a => a && !['art-1', 'art-2', 'art-3'].includes(a.id) && !a.title?.includes('Hành Trình 6 Năm'));
            setCachedData('homepage_articles', clean, CACHE_TTL.HOMEPAGE);
            setCachedData(key, clean, CACHE_TTL.HOMEPAGE);
            return clean;
          }
        }
      } catch {}
      return [];
    } else if (key === 'VMC_HOMEPAGE_MEDIA') {
      try {
        const resMed = await fetch('/api/homepage/media', { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (resMed.ok) {
          const jsonMed = await resMed.json();
          if (jsonMed.success && Array.isArray(jsonMed.data)) {
            const clean = jsonMed.data.filter(m => m && !['med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'].includes(m.id));
            setCachedData('homepage_media', clean, CACHE_TTL.HOMEPAGE);
            setCachedData(key, clean, CACHE_TTL.HOMEPAGE);
            return clean;
          }
        }
      } catch {}
      return [];
    }

    // 3. Fallback: Fetch từ System_Settings (chỉ dùng cho config, không dùng cho bài viết và kho ảnh)
    const res = await fetch('/api/admin/system-settings', {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const json = await res.json();
    if (json.success && json.data && json.data[key]) {
      const serverData = JSON.parse(json.data[key]);
      if (Array.isArray(serverData) || serverData !== null) {
        setCachedData(`homepage_${shortKey}`, serverData, CACHE_TTL.HOMEPAGE);
        setCachedData(key, serverData, CACHE_TTL.HOMEPAGE);
        return serverData;
      }
    }

    return result;
  } catch (e) {
    console.warn(`⚠️ Load ${key} failed, using cached/default:`, e.message);
    const shortKey = key.replace('VMC_HOMEPAGE_', '').toLowerCase();
    const cached = getCachedData(`homepage_${shortKey}`) || getCachedData(key);
    return (Array.isArray(cached) ? cached.length > 0 : cached !== null) ? cached : fallbackData;
  }
};

// Helper nạp đồng thời toàn bộ dữ liệu Trang chủ từ bảng chuyên biệt và cấu hình
export const fetchAllHomepageData = async () => {
  try {
    // Luôn fetch trực tiếp từ CSDL Backend để đảm bảo dữ liệu mới nhất 100%
    const [articlesRes, mediaRes, settingsRes] = await Promise.allSettled([
      fetch('/api/homepage/articles', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(r => r.json()),
      fetch('/api/homepage/media', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(r => r.json()),
      fetch('/api/admin/system-settings', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(r => r.json())
    ]);

    const settingsData = (settingsRes.status === 'fulfilled' && settingsRes.value?.success) ? settingsRes.value.data : {};

    // Xử lý Articles: CHỈ lấy từ bảng CSDL quan hệ /api/homepage/articles (hoặc rỗng nếu chưa có bài nào)
    let articles = [];
    if (articlesRes.status === 'fulfilled' && articlesRes.value?.success && Array.isArray(articlesRes.value.data)) {
      articles = articlesRes.value.data;
    }
    // Thanh trừng triệt để dữ liệu mẫu (mock data) cũ
    articles = articles.filter(a => a && !['art-1', 'art-2', 'art-3'].includes(a.id) && !a.title?.includes('Hành Trình 6 Năm'));

    // Xử lý Media: CHỈ lấy từ bảng CSDL quan hệ /api/homepage/media (hoặc rỗng nếu chưa có mục nào)
    let media = [];
    if (mediaRes.status === 'fulfilled' && mediaRes.value?.success && Array.isArray(mediaRes.value.data)) {
      media = mediaRes.value.data;
    }
    // Thanh trừng triệt để dữ liệu mẫu (mock data) cũ
    media = media.filter(m => m && !['med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'].includes(m.id));

    // Xử lý Info & Org
    let info = null;
    if (settingsData?.VMC_HOMEPAGE_INFO) {
      try { info = JSON.parse(settingsData.VMC_HOMEPAGE_INFO); } catch {}
    }
    if (info === null) {
      info = getCachedData('homepage_info') || DEFAULT_HOMEPAGE_INFO;
    }

    let org = null;
    if (settingsData?.VMC_HOMEPAGE_ORG) {
      try { org = JSON.parse(settingsData.VMC_HOMEPAGE_ORG); } catch {}
    }
    if (org === null) {
      org = getCachedData('homepage_org') || DEFAULT_HOMEPAGE_ORG;
    }

    // Cập nhật Cache client tức thì
    setCachedData('homepage_info', info, CACHE_TTL.HOMEPAGE);
    setCachedData('homepage_articles', articles, CACHE_TTL.HOMEPAGE);
    setCachedData('homepage_media', media, CACHE_TTL.HOMEPAGE);
    setCachedData('homepage_org', org, CACHE_TTL.HOMEPAGE);

    return { info, articles, media, org };
  } catch (err) {
    console.warn('⚠️ fetchAllHomepageData error:', err.message);
  }

  const fallbackArticles = getCachedData('homepage_articles');
  const fallbackMedia = getCachedData('homepage_media');

  return {
    info: getCachedData('homepage_info') || DEFAULT_HOMEPAGE_INFO,
    articles: Array.isArray(fallbackArticles) ? fallbackArticles : [],
    media: Array.isArray(fallbackMedia) ? fallbackMedia : [],
    org: getCachedData('homepage_org') || DEFAULT_HOMEPAGE_ORG
  };
};

