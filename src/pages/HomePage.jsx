import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import {
  Sparkles,
  Award,
  Users,
  Video,
  Image as ImageIcon,
  Play,
  FileText,
  Calendar,
  ArrowRight,
  ExternalLink,
  Target,
  Compass,
  Eye,
  Settings,
  Plus,
  Edit3,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  Camera,
  Mic,
  Film,
  Radio,
  Layers,
  Heart,
  Share2,
  Sun,
  Moon,
  Info,
  Upload
} from 'lucide-react';
import {
  DEFAULT_HOMEPAGE_INFO,
  DEFAULT_HOMEPAGE_ARTICLES,
  DEFAULT_HOMEPAGE_MEDIA,
  DEFAULT_HOMEPAGE_ORG,
  saveHomepageDataAPI,
  loadHomepageDataAPI,
  fetchAllHomepageData,
  uploadImageToServer
} from '../services/homepageService';
import { getCachedData } from '../services/cacheService';

// Helper phân tích và trích xuất link embed Video (Hỗ trợ YouTube, Facebook Video / Reels, và file trực tiếp)
const getVideoEmbedInfo = (url, autoplay = true) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. YouTube (watch, shorts, embed, youtu.be, live)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/i) ||
    trimmed.match(/[?&]v=([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const autoParam = autoplay ? 'autoplay=1&mute=0' : 'autoplay=0';
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?${autoParam}&rel=0&playsinline=1&enablejsapi=1`
    };
  }

  // 2. Facebook (watch, video, reel, fb.watch, share)
  const isFacebook = /(?:facebook\.com|fb\.watch|fb\.gg)/i.test(trimmed);
  if (isFacebook) {
    const autoParam = autoplay ? 'true' : 'false';
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false&autoplay=${autoParam}&mute=0`
    };
  }

  // 3. Direct HTML5 video / Khác
  return {
    platform: 'html5',
    embedUrl: trimmed
  };
};

const getYouTubeEmbedUrl = (url, autoplay = true) => {
  const info = getVideoEmbedInfo(url, autoplay);
  return info?.platform === 'youtube' ? info.embedUrl : null;
};

// Helper chuyển đổi định dạng ngày DD/MM/YYYY sang YYYY-MM-DD cho input type="date"
const toDateInputValue = (dateStr) => {
  if (!dateStr) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Helper chuyển đổi từ YYYY-MM-DD sang DD/MM/YYYY để lưu vào CSDL
const fromDateInputValue = (isoStr) => {
  if (!isoStr) return new Date().toLocaleDateString('vi-VN');
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return isoStr;
};

// Helper đọc và tối ưu hóa file ảnh khi người dùng thả file (Drag & Drop) hoặc tải từ máy
const readAndCompressImage = (file, maxWidth = 1600, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

// Component hiển thị trình duyệt ảnh (Slider / Carousel) hỗ trợ lướt sang (Swipe / Arrow / Thumbnails)
const ImageSlider = ({
  images = [],
  initialIndex = 0,
  onImageClick,
  aspectRatio = 'aspect-video',
  showThumbnails = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!images || images.length === 0) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStart(null);
  };

  if (images.length === 1) {
    return (
      <div
        className={`relative group ${aspectRatio} w-full rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] ${className} ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={() => onImageClick && onImageClick(images[0], 0)}
      >
        <img
          src={images[0]}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {onImageClick && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-slate-700/60 text-slate-300 text-2xs flex items-center gap-1.5 backdrop-blur-md pointer-events-none group-hover:bg-cyan-500 group-hover:text-black font-medium transition-all">
            <Eye className="w-3.5 h-3.5" />
            <span>Phóng to</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Khung ảnh chính */}
      <div
        className={`relative group ${aspectRatio} w-full rounded-2xl overflow-hidden bg-slate-950 select-none shadow-md border border-[var(--border-default)]`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`Ảnh ${currentIndex + 1}`}
          onClick={() => onImageClick && onImageClick(images[currentIndex], currentIndex)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${onImageClick ? 'cursor-pointer' : ''}`}
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 border border-white/20 text-white text-2xs font-semibold backdrop-blur-md flex items-center gap-1.5 z-10">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentIndex + 1} / {images.length}</span>
        </div>

        {/* Nhãn hướng dẫn lướt */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 text-slate-300 text-3xs backdrop-blur-md border border-white/10 flex items-center gap-1 z-10">
          <span>👈 Lướt sang 👉</span>
        </div>

        {/* Nút lùi ảnh */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Ảnh trước"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-cyan-600 text-white shadow-xl backdrop-blur-md transition-all active:scale-90 z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Nút chuyển ảnh tiếp theo */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Ảnh tiếp theo"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-cyan-600 text-white shadow-xl backdrop-blur-md transition-all active:scale-90 z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Chấm tròn chỉ số (Dots) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
              title={`Xem ảnh ${i + 1}`}
            />
          ))}
        </div>

        {/* Nút phóng to */}
        {onImageClick && (
          <div
            onClick={() => onImageClick(images[currentIndex], currentIndex)}
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-slate-700/60 text-slate-300 text-2xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer hover:bg-cyan-500 hover:text-black font-medium transition-all z-10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phóng to</span>
          </div>
        )}
      </div>

      {/* Dải thumbnail xem nhanh */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`relative shrink-0 w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === currentIndex ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/85 text-white text-[9px] font-mono leading-none">
                #{i + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper chuẩn hóa danh sách nhân sự phụ trách thành từng hàng (kèm avatar từ CSDL)
const getDepartmentOfficers = (dept, allMembers = []) => {
  if (Array.isArray(dept?.officers) && dept.officers.length > 0) {
    return dept.officers.map(off => {
      // Luôn tra cứu trong allMembers từ CSDL để lấy avatar mới nhất của thành viên
      const found = allMembers.find(m => m.name && (
        m.name.trim().toLowerCase() === off.name.trim().toLowerCase() ||
        m.name.includes(off.name) ||
        off.name.includes(m.name)
      ));
      const dbAvatar = found?.avatar || found?.avatar_url;
      return {
        ...off,
        avatar: dbAvatar || off.avatar || '/vmc-logo.jpg'
      };
    });
  }
  if (dept?.lead && typeof dept.lead === 'string') {
    const rawParts = dept.lead.split(/[\n•]/).map(s => s.trim()).filter(Boolean);
    const parsed = [];
    rawParts.forEach(part => {
      const match = part.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        const names = match[1].split(',').map(n => n.trim()).filter(Boolean);
        const role = match[2].trim();
        names.forEach(name => {
          const found = allMembers.find(m => m.name && (
            m.name.trim().toLowerCase() === name.trim().toLowerCase() ||
            m.name.includes(name) ||
            name.includes(m.name)
          ));
          const dbAvatar = found?.avatar || found?.avatar_url;
          parsed.push({
            name,
            role,
            avatar: dbAvatar || '/vmc-logo.jpg',
            isHead: role.toLowerCase().includes('trưởng')
          });
        });
      } else {
        const found = allMembers.find(m => m.name && (
          m.name.trim().toLowerCase() === part.trim().toLowerCase() ||
          m.name.includes(part) ||
          part.includes(m.name)
        ));
        const dbAvatar = found?.avatar || found?.avatar_url;
        parsed.push({
          name: part,
          role: part.toLowerCase().includes('trưởng') ? 'Trưởng Ban' : 'Phó Ban',
          avatar: dbAvatar || '/vmc-logo.jpg',
          isHead: part.toLowerCase().includes('trưởng')
        });
      }
    });
    if (parsed.length > 0) return parsed;
  }
  return [];
};

// Helper xây dựng cơ cấu tổ chức tự động từ CSDL thành viên (không sửa thủ công)
const buildOrgDataFromDatabase = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return DEFAULT_HOMEPAGE_ORG;
  }

  // 1. Ban Cố Vấn & Đơn vị chỉ đạo
  const advisorsGroup = {
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
        name: 'Ban Cố Vấn CLB VMC',
        role: 'Cố vấn chuyên môn & cựu cán sự tiêu biểu',
        avatar: '/vmc-logo.jpg',
        badge: 'Cố Vấn',
        dept: 'Ban Cố Vấn'
      }
    ]
  };

  // 2. Ban Chủ Nhiệm (Đầu não điều hành)
  const bcnList = [];
  members.forEach(m => {
    const roleTitle = m.roleTitle || m.role_title || '';
    const dept = m.deptName || m.department || '';
    const isFormer = roleTitle.toLowerCase().includes('cựu');
    if (isFormer) return;

    // Bỏ qua tài khoản quản trị hệ thống
    const isSysAdmin = m.memberCode === 'ADMIN' || m.username?.toLowerCase() === 'admin' || m.name?.toLowerCase().includes('quản trị viên');
    if (isSysAdmin) return;

    const isChair = roleTitle.toLowerCase().includes('chủ nhiệm') && !roleTitle.toLowerCase().includes('phó');
    const isVice = roleTitle.toLowerCase().includes('phó chủ nhiệm') || roleTitle.toLowerCase().includes('pcn');
    const isMinh = m.name?.includes('Đặng Nguyệt Minh');

    if (isChair || isVice || isMinh || (dept.toLowerCase().includes('chủ nhiệm') && !isFormer)) {
      let displayRole = roleTitle;
      let badge = 'Phó Chủ Nhiệm';

      if (isChair || (roleTitle.toLowerCase().includes('chủ nhiệm') && !isVice)) {
        displayRole = 'Chủ Nhiệm CLB';
        badge = 'Chủ Nhiệm';
      } else if (isMinh) {
        displayRole = 'Phó Chủ Nhiệm CLB (kiêm Trưởng Ban ĐN-NS)';
        badge = 'Phó Chủ Nhiệm';
      } else if (isVice) {
        displayRole = 'Phó Chủ Nhiệm CLB';
        badge = 'Phó Chủ Nhiệm';
      }

      bcnList.push({
        id: m.id,
        name: m.name,
        role: displayRole,
        // Lấy chính xác avatar từ CSDL MySQL
        avatar: m.avatar || m.avatar_url || '/vmc-logo.jpg',
        badge,
        dept: 'Ban Chủ Nhiệm',
        class: m.class,
        bio: m.name?.includes('Thùy Linh')
          ? 'Điều hành tổng thể, định hướng chiến lược nội dung và quan hệ đối ngoại.'
          : m.name?.includes('Phương Thảo')
            ? 'Phụ trách điều phối hoạt động phong trào và công tác phát thanh học đường.'
            : m.name?.includes('Nguyệt Minh')
              ? 'Phụ trách công tác quản trị nhân sự, hệ thống công nghệ thông tin và phong trào thi đua CLB.'
              : (m.bio || 'Thành viên Ban Chủ Nhiệm CLB Truyền Thông THPT Vĩnh Bảo.')
      });
    }
  });

  // Sắp xếp: Chủ Nhiệm trước, Phó Chủ Nhiệm sau
  const sortedBcn = bcnList.sort((a, b) => {
    if (a.badge === 'Chủ Nhiệm' && b.badge !== 'Chủ Nhiệm') return -1;
    if (b.badge === 'Chủ Nhiệm' && a.badge !== 'Chủ Nhiệm') return 1;
    return a.name.localeCompare(b.name, 'vi');
  });

  const finalBcnMembers = sortedBcn.length > 0 ? sortedBcn : DEFAULT_HOMEPAGE_ORG[1].members;

  const bcnGroup = {
    group: 'Ban Chủ Nhiệm',
    desc: 'Bộ phận đầu não lãnh đạo, điều hành chung mọi hoạt động, kiểm duyệt sản phẩm và đại diện CLB.',
    members: finalBcnMembers
  };

  // 3. 3 Ban Chuyên Môn Trực Thuộc
  const getDeptOfficersFromDb = (keywords, defaultOfficers) => {
    const list = [];
    members.forEach(m => {
      const roleTitle = m.roleTitle || m.role_title || '';
      const dept = m.deptName || m.department || '';
      const isFormer = roleTitle.toLowerCase().includes('cựu');
      if (isFormer) return;

      const isSysAdmin = m.memberCode === 'ADMIN' || m.username?.toLowerCase() === 'admin' || m.name?.toLowerCase().includes('quản trị viên');
      if (isSysAdmin) return;

      const matchesDept = keywords.some(k => dept.toLowerCase().includes(k) || roleTitle.toLowerCase().includes(k));
      if (!matchesDept) return;

      const isHead = roleTitle.toLowerCase().includes('trưởng ban') || (keywords.includes('nhân sự') && m.name?.includes('Đặng Nguyệt Minh'));
      const isVice = roleTitle.toLowerCase().includes('phó ban');
      const isTech = roleTitle.toLowerCase().includes('kỹ thuật');

      // Lấy chính xác avatar từ CSDL của từng cá nhân
      const personAvatar = m.avatar || m.avatar_url || '/vmc-logo.jpg';

      if (isHead) {
        list.push({ role: 'Trưởng Ban', name: m.name, isHead: true, avatar: personAvatar, id: m.id });
      } else if (isVice) {
        list.push({ role: 'Phó Ban', name: m.name, isHead: false, avatar: personAvatar, id: m.id });
      } else if (isTech) {
        list.push({ role: 'Kỹ Thuật', name: m.name, isHead: false, avatar: personAvatar, id: m.id });
      }
    });

    const sorted = list.sort((a, b) => {
      if (a.isHead && !b.isHead) return -1;
      if (!a.isHead && b.isHead) return 1;
      return a.name.localeCompare(b.name, 'vi');
    });

    return sorted.length > 0 ? sorted : defaultOfficers;
  };

  const hrOfficers = getDeptOfficersFromDb(['đối ngoại', 'nhân sự', 'dn-ns'], DEFAULT_HOMEPAGE_ORG[2].departments[0].officers);
  const contentOfficers = getDeptOfficersFromDb(['nội dung', 'phát thanh'], DEFAULT_HOMEPAGE_ORG[2].departments[1].officers);
  const prodOfficers = getDeptOfficersFromDb(['sản xuất', 'media'], DEFAULT_HOMEPAGE_ORG[2].departments[2].officers);

  // Avatar đại diện Ban: Lấy từ avatar Trưởng Ban trong CSDL
  const hrHeadAvatar = hrOfficers.find(o => o.isHead)?.avatar || DEFAULT_HOMEPAGE_ORG[2].departments[0].avatar;
  const contentHeadAvatar = contentOfficers.find(o => o.isHead)?.avatar || DEFAULT_HOMEPAGE_ORG[2].departments[1].avatar;
  const prodHeadAvatar = prodOfficers.find(o => o.isHead)?.avatar || DEFAULT_HOMEPAGE_ORG[2].departments[2].avatar;

  const departmentsGroup = {
    group: 'Ban Chuyên Môn Trực Thuộc',
    desc: '3 trụ cột chuyên môn nòng cốt thực hiện các nhiệm vụ chuyên biệt của CLB.',
    departments: [
      {
        ...DEFAULT_HOMEPAGE_ORG[2].departments[0],
        avatar: hrHeadAvatar,
        officers: hrOfficers
      },
      {
        ...DEFAULT_HOMEPAGE_ORG[2].departments[1],
        avatar: contentHeadAvatar,
        officers: contentOfficers
      },
      {
        ...DEFAULT_HOMEPAGE_ORG[2].departments[2],
        avatar: prodHeadAvatar,
        officers: prodOfficers
      }
    ]
  };

  return [advisorsGroup, bcnGroup, departmentsGroup];
};

export const HomePage = ({ onOpenLogin }) => {
  const {
    currentUser,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    members = [],
    setActiveTab,
    isRecruitmentSeasonActive,
    addToast,
    theme,
    toggleTheme
  } = useClub();

  // Quyền quản lý nội dung: Chỉ Admin (Super Admin hoặc Admin)
  const canManage = Boolean(isSuperAdmin || isAdmin);

  // States dữ liệu - Nạp ngay từ Cache tức thì (0ms latency khi reload trang)
  const [info, setInfo] = useState(() => getCachedData('homepage_info') || DEFAULT_HOMEPAGE_INFO);
  const [articles, setArticles] = useState(() => getCachedData('homepage_articles') || DEFAULT_HOMEPAGE_ARTICLES);
  const [mediaList, setMediaList] = useState(() => getCachedData('homepage_media') || DEFAULT_HOMEPAGE_MEDIA);
  const [loading, setLoading] = useState(() => !getCachedData('homepage_info'));

  // Cơ cấu tổ chức: Tự động đổ dữ liệu từ CSDL thành viên (không sửa thủ công)
  const orgData = useMemo(() => {
    return buildOrgDataFromDatabase(members);
  }, [members]);

  // Filter media
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'video', 'image', 'event'

  // Modals view
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Modal quản lý / đăng bài (Chỉ cho Admin)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageTab, setManageTab] = useState('articles'); // 'articles', 'media', 'info'

  // Form edit states
  const [editingArticle, setEditingArticle] = useState(null);
  const [newArticleImageInput, setNewArticleImageInput] = useState('');
  const [editingMedia, setEditingMedia] = useState(null);

  // Nạp dữ liệu đồng bộ từ MySQL CSDL trong 1 request duy nhất (SWR background sync)
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const { info: loadedInfo, articles: loadedArticles, media: loadedMedia } = await fetchAllHomepageData();

        if (isMounted) {
          if (loadedInfo) setInfo(loadedInfo);
          const rawArticles = Array.isArray(loadedArticles) ? loadedArticles : DEFAULT_HOMEPAGE_ARTICLES;
          const mergedArticles = rawArticles.map(art => {
            const defaultArt = DEFAULT_HOMEPAGE_ARTICLES.find(d => d.id === art.id);
            return {
              ...art,
              videoUrl: art.videoUrl || defaultArt?.videoUrl || '',
              images: (Array.isArray(art.images) && art.images.length > 0)
                ? art.images
                : (defaultArt?.images || [])
            };
          });
          setArticles(mergedArticles);
          if (Array.isArray(loadedMedia)) {
            const mergedMedia = loadedMedia.map(m => {
              const defaultMed = DEFAULT_HOMEPAGE_MEDIA.find(d => d.id === m.id);
              const loadedImgs = Array.isArray(m.images) && m.images.length > 0
                ? m.images
                : (defaultMed?.images || (m.mediaUrl && m.type === 'image' ? [m.mediaUrl] : []));
              return {
                ...m,
                images: loadedImgs
              };
            });
            setMediaList(mergedMedia);
          }
        }
      } catch (err) {
        console.warn('⚠️ Lỗi nạp dữ liệu trang chủ:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc media theo tab
  const filteredMedia = mediaList.filter(item => {
    if (mediaFilter === 'all') return true;
    if (mediaFilter === 'video') return item.type === 'video';
    if (mediaFilter === 'image') return item.type === 'image';
    if (mediaFilter === 'event') return item.category?.toLowerCase().includes('sự kiện');
    return true;
  });

  // Handler cập nhật Article
  const handleSaveArticle = async (articleData) => {
    let imagesArr = [];
    if (Array.isArray(articleData.images)) {
      imagesArr = articleData.images.filter(Boolean);
    } else if (typeof articleData.images === 'string') {
      imagesArr = articleData.images.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    }

    const cleanArticle = {
      ...articleData,
      videoUrl: (articleData.videoUrl || '').trim(),
      images: imagesArr
    };

    let updated;
    if (cleanArticle.id) {
      updated = articles.map(a => a.id === cleanArticle.id ? cleanArticle : a);
    } else {
      const newArticle = {
        ...cleanArticle,
        id: 'art-' + Date.now(),
        date: cleanArticle.date || new Date().toLocaleDateString('vi-VN')
      };
      updated = [newArticle, ...articles];
    }
    setArticles(updated);
    setEditingArticle(null);
    setIsManageModalOpen(false);
    const ok = await saveHomepageDataAPI('VMC_HOMEPAGE_ARTICLES', updated);
    if (ok) {
      if (addToast) addToast('Đã lưu bài viết thành công lên CSDL máy chủ!', 'success');
    } else {
      if (addToast) addToast('⚠️ Lỗi: Không thể lưu bài viết lên máy chủ CSDL!', 'error');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    await saveHomepageDataAPI('VMC_HOMEPAGE_ARTICLES', updated);
    if (addToast) addToast('Đã xóa bài viết thành công!', 'info');
  };

  // Handler cập nhật Media (Hỗ trợ đẩy nhiều file ảnh vào 1 mục)
  const handleSaveMedia = async (mediaData) => {
    let imagesArr = [];
    if (Array.isArray(mediaData.images)) {
      imagesArr = mediaData.images.filter(Boolean);
    } else if (typeof mediaData.images === 'string') {
      imagesArr = mediaData.images.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    } else if (mediaData.type === 'image' && mediaData.mediaUrl) {
      imagesArr = [mediaData.mediaUrl];
    }

    const firstImage = imagesArr.length > 0 ? imagesArr[0] : '';
    const cleanMedia = {
      ...mediaData,
      images: imagesArr,
      mediaUrl: mediaData.type === 'image' ? (firstImage || mediaData.mediaUrl || '') : (mediaData.mediaUrl || ''),
      thumbnail: mediaData.thumbnail || firstImage || mediaData.mediaUrl || ''
    };

    let updated;
    if (cleanMedia.id) {
      updated = mediaList.map(m => m.id === cleanMedia.id ? cleanMedia : m);
    } else {
      const newMedia = {
        ...cleanMedia,
        id: 'med-' + Date.now(),
        date: cleanMedia.date || new Date().toLocaleDateString('vi-VN')
      };
      updated = [newMedia, ...mediaList];
    }
    setMediaList(updated);
    setEditingMedia(null);
    setIsManageModalOpen(false);
    const ok = await saveHomepageDataAPI('VMC_HOMEPAGE_MEDIA', updated);
    if (ok) {
      if (addToast) addToast('Đã lưu ảnh/video thành công lên CSDL máy chủ!', 'success');
    } else {
      if (addToast) addToast('⚠️ Lỗi: Không thể lưu ảnh/video lên máy chủ CSDL!', 'error');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh/video này khỏi thư viện?')) return;
    const updated = mediaList.filter(m => m.id !== id);
    setMediaList(updated);
    await saveHomepageDataAPI('VMC_HOMEPAGE_MEDIA', updated);
    if (addToast) addToast('Đã xóa media thành công!', 'info');
  };

  // Quản lý tải lên nhiều file ảnh cho 1 mục Media (Hỗ trợ kéo thả / chọn nhiều ảnh & upload tĩnh lên server)
  const handleMediaFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    const uploadPromises = fileArray.map(async (file) => {
      const serverUrl = await uploadImageToServer(file);
      if (serverUrl) return serverUrl;
      return await readAndCompressImage(file);
    });
    const newImages = (await Promise.all(uploadPromises)).filter(Boolean);
    if (newImages.length === 0) return;

    setEditingMedia(prev => {
      if (!prev) return prev;
      const existing = Array.isArray(prev.images) && prev.images.length > 0
        ? prev.images
        : (prev.mediaUrl ? [prev.mediaUrl] : []);
      const merged = [...existing, ...newImages];
      return {
        ...prev,
        images: merged,
        mediaUrl: merged[0] || '',
        thumbnail: prev.thumbnail || merged[0] || ''
      };
    });
  };

  const handleRemoveMediaImage = (indexToRemove) => {
    setEditingMedia(prev => {
      if (!prev) return prev;
      const existing = Array.isArray(prev.images) ? prev.images : [];
      const updated = existing.filter((_, i) => i !== indexToRemove);
      const isRemovedThumb = prev.thumbnail === existing[indexToRemove];
      return {
        ...prev,
        images: updated,
        mediaUrl: updated[0] || '',
        thumbnail: isRemovedThumb ? (updated[0] || '') : prev.thumbnail
      };
    });
  };

  const handleSetMediaThumbnail = (imgUrl) => {
    setEditingMedia(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        thumbnail: imgUrl
      };
    });
  };

  // Quản lý Lightbox và chuyển ảnh tiếp theo khi xem album / media
  const handleNextMedia = (e) => {
    if (e) e.stopPropagation();
    if (!selectedMedia?.gallery || selectedMedia.gallery.length <= 1) return;
    const nextIdx = ((selectedMedia.galleryIndex ?? 0) + 1) % selectedMedia.gallery.length;
    setSelectedMedia(prev => ({
      ...prev,
      galleryIndex: nextIdx,
      mediaUrl: prev.gallery[nextIdx]
    }));
  };

  const handlePrevMedia = (e) => {
    if (e) e.stopPropagation();
    if (!selectedMedia?.gallery || selectedMedia.gallery.length <= 1) return;
    const prevIdx = ((selectedMedia.galleryIndex ?? 0) - 1 + selectedMedia.gallery.length) % selectedMedia.gallery.length;
    setSelectedMedia(prev => ({
      ...prev,
      galleryIndex: prevIdx,
      mediaUrl: prev.gallery[prevIdx]
    }));
  };

  const [mediaTouchStart, setMediaTouchStart] = useState(null);

  const onMediaTouchStart = (e) => {
    setMediaTouchStart(e.targetTouches[0].clientX);
  };

  const onMediaTouchEnd = (e) => {
    if (mediaTouchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = mediaTouchStart - touchEnd;
    if (diff > 40) {
      handleNextMedia();
    } else if (diff < -40) {
      handlePrevMedia();
    }
    setMediaTouchStart(null);
  };

  // Điều khiển bàn phím cho Lightbox (Mũi tên trái / phải để lướt ảnh, Esc để đóng)
  useEffect(() => {
    if (!selectedMedia) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMedia(null);
      } else if (e.key === 'ArrowRight' && selectedMedia.gallery && selectedMedia.gallery.length > 1) {
        handleNextMedia();
      } else if (e.key === 'ArrowLeft' && selectedMedia.gallery && selectedMedia.gallery.length > 1) {
        handlePrevMedia();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia]);

  // Handler cập nhật Info / Stats
  const handleSaveInfo = async (newInfo) => {
    setInfo(newInfo);
    setIsManageModalOpen(false);
    await saveHomepageDataAPI('VMC_HOMEPAGE_INFO', newInfo);
    if (addToast) addToast('Đã lưu thông tin giới thiệu CLB!', 'success');
  };

  return (
    <div className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200">

      {/* 1. PUBLIC TOP BAR NẾU KHÁCH CHƯA ĐĂNG NHẬP */}
      {!isAuthenticated && (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-secondary)]/90 border-b border-[var(--border-default)] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-md shadow-cyan-500/20 overflow-hidden shrink-0">
                <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-base tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
                  VMC <span className="text-cyan-600 dark:text-cyan-400">MEDIA CLUB</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block font-mono">THPT VĨNH BẢO • HẢI PHÒNG</span>
              </div>
            </div>

            {/* Quick Links Desktop */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--text-secondary)]">
              <a href="#about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Giới Thiệu</a>
              <a href="#structure" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Cơ Cấu Tổ Chức</a>
              <a href="#media" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Ảnh & Video</a>
              <a href="#articles" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Bài Viết Tiêu Điểm</a>
              {isRecruitmentSeasonActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold animate-pulse">
                  Đang Tuyển Gen Mới
                </span>
              )}
            </nav>

            {/* Actions: Theme Toggle & Login Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-default)] transition-all cursor-pointer"
                title="Đổi giao diện Sáng / Tối"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
              </button>

              <button
                type="button"
                onClick={onOpenLogin || (() => setActiveTab('login'))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Đăng Nhập Cổng Nội Bộ</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-500/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 shadow-sm text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-6 animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            <span>CLB TRUYỀN THÔNG TRƯỜNG THPT VĨNH BẢO • EST - {info.establishedYear}</span>
            {canManage && (
              <span className="ml-2 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-2xs font-bold uppercase tracking-wider">
                Admin Mode
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight sm:leading-none max-w-4xl mx-auto mb-6">
            Nơi Khơi Nguồn <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">Sáng Tạo</span> & Lan Tỏa Bản Lĩnh Học Đường
          </h1>

          {/* Slogan */}
          <p className="text-base sm:text-xl font-medium text-cyan-700 dark:text-cyan-300/90 tracking-wide max-w-3xl mx-auto mb-6">
            "{info.slogan}"
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
            {info.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a
              href="#media"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Khám Phá Media & Thước Phim</span>
            </a>

            <a
              href="#structure"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] text-[var(--text-primary)] font-semibold text-sm backdrop-blur-md shadow-sm active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Cơ Cấu Tổ Chức</span>
            </a>

            {/* Nút Đăng Bài / Quản lý nếu có quyền */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsManageModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600/15 dark:bg-purple-600/30 hover:bg-purple-600/25 border border-purple-500/40 text-purple-700 dark:text-purple-200 font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                <Settings className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <span>⚙️ Quản Lý Nội Dung Trang Chủ</span>
              </button>
            )}

            {/* Nút đăng nhập nếu đang ở chế độ khách */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onOpenLogin || (() => setActiveTab('login'))}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Cổng Nội Bộ Thành Viên</span>
              </button>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="ds-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-default)] backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 font-heading">
                {info.stats?.membersCount || '150+'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">
                Thành Viên Qua Các Gen
              </div>
            </div>

            <div className="ds-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-default)] backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 font-heading">
                {info.stats?.productionsCount || '120+'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">
                Sản Phẩm & Phóng Sự
              </div>
            </div>

            <div className="ds-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-default)] backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 font-heading">
                {info.stats?.awardsCount || '16+'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">
                Giải Thưởng & Bằng Khen
              </div>
            </div>

            <div className="ds-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-default)] backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 font-heading">
                {info.stats?.yearsActive || '6+'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">
                Năm Phát Triển Vững Vàng
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTION: SỨ MỆNH & GIÁ TRỊ CỐT LÕI */}
      <section id="about" className="py-16 bg-[var(--bg-secondary)] border-y border-[var(--border-default)] transition-colors relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 block mb-2">
              Sứ Mệnh & Tầm Nhìn
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Giá Trị Cốt Lõi Tạo Nên Bản Sắc VMC
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-3">
              Không chỉ là câu lạc bộ đưa tin, VMC là cái nôi nuôi dưỡng tư duy sáng tạo, kỹ năng công nghệ và tinh thần cống hiến vì tập thể.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {info.coreValues?.map((val, idx) => {
              const styles = [
                {
                  borderHover: 'hover:border-cyan-500/60',
                  iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40',
                  topBar: 'from-cyan-500 via-sky-500 to-blue-500',
                  titleHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
                  num: ''
                },
                {
                  borderHover: 'hover:border-emerald-500/60',
                  iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40',
                  topBar: 'from-emerald-500 via-teal-500 to-cyan-500',
                  titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
                  num: ''
                },
                {
                  borderHover: 'hover:border-blue-500/60',
                  iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 group-hover:bg-blue-500/20 group-hover:border-blue-500/40',
                  topBar: 'from-blue-500 via-indigo-500 to-purple-500',
                  titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
                  num: ''
                },
                {
                  borderHover: 'hover:border-rose-500/60',
                  iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 group-hover:bg-rose-500/20 group-hover:border-rose-500/40',
                  topBar: 'from-rose-500 via-pink-500 to-purple-500',
                  titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
                  num: ''
                }
              ][idx % 4];

              return (
                <div
                  key={idx}
                  className={`group relative p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] ${styles.borderHover} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Top glowing accent line on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xs ${styles.iconBg}`}>
                        {idx === 0 && <Sparkles className="w-6 h-6" />}
                        {idx === 1 && <Compass className="w-6 h-6" />}
                        {idx === 2 && <Users className="w-6 h-6" />}
                        {idx === 3 && <Heart className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)] opacity-50 group-hover:opacity-100 transition-opacity">
                        {styles.num}
                      </span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2.5 transition-colors ${styles.titleHover}`}>
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sứ mệnh & Tầm nhìn box */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 dark:border-blue-800/40 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400 font-bold text-base">
                <Target className="w-5 h-5" />
                <span>Sứ Mệnh Tiên Phong</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {info.mission}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 dark:border-purple-800/40 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3 text-purple-600 dark:text-purple-400 font-bold text-base">
                <Eye className="w-5 h-5" />
                <span>Tầm Nhìn Chiến Lược</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {info.vision}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SECTION: CƠ CẤU TỔ CHỨC CLB */}
      <section id="structure" className="py-20 relative bg-[var(--bg-primary)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 block mb-2">
                Bộ Máy Vận Hành
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Cơ Cấu Tổ Chức Của VMC
              </h2>
            </div>
          </div>

          {/* Render Groups */}
          <div className="space-y-12">

            {/* Group 1: Ban Cố Vấn & Đơn Vị Chỉ Đạo */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-xs">
                  🧭
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Ban Cố Vấn & Đơn Vị Chỉ Đạo</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Định hướng chiến lược, hỗ trợ chuyên môn và cố vấn phát triển toàn diện.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orgData[0]?.members?.map((mem, idx) => (
                  <div
                    key={idx}
                    className="group relative p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-emerald-500/50 shadow-sm hover:shadow-lg flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] border-2 border-emerald-500/50 ring-4 ring-emerald-500/10 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img src={mem.avatar || '/vmc-logo.jpg'} alt={mem.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mb-1.5 shadow-2xs">
                        {mem.badge || 'Cố Vấn'}
                      </div>
                      <h4 className="text-base font-bold text-[var(--text-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {mem.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {mem.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Ban Chủ Nhiệm */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-base shadow-xs">
                  👑
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Ban Chủ Nhiệm</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Bộ phận lãnh đạo, kiểm duyệt sản phẩm và đại diện chính thức cho CLB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgData[1]?.members?.map((mem, idx) => {
                  const isChair = mem.badge === 'Chủ Nhiệm';
                  return (
                    <div
                      key={idx}
                      className={`group relative p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] ${isChair ? 'hover:border-pink-500/60' : 'hover:border-purple-500/60'
                        } shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col sm:flex-row items-center sm:items-start gap-5 overflow-hidden`}
                    >
                      {/* Top decorative gradient bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isChair
                          ? 'from-pink-500 via-rose-500 to-amber-500'
                          : 'from-purple-500 via-indigo-500 to-cyan-500'
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] border-2 ${isChair
                            ? 'border-pink-500/70 ring-4 ring-pink-500/10'
                            : 'border-purple-500/70 ring-4 ring-purple-500/10'
                            } shadow-md transition-transform duration-300 group-hover:scale-105`}
                        >
                          <img
                            src={mem.avatar || '/vmc-logo.jpg'}
                            alt={mem.name}
                            onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isChair && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-[var(--bg-card)]">
                            👑
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider border shadow-2xs ${isChair
                              ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30'
                              : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              }`}
                          >
                            {mem.badge}
                          </span>
                          {mem.class && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-default)]">
                              {mem.class}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {mem.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                          {mem.role}
                        </p>

                        <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed line-clamp-3">
                          {mem.bio}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 3: Ban Chuyên Môn Trực Thuộc (3 Ban Trụ Cột) */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base shadow-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">3 Ban Chuyên Môn Trực Thuộc</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Trực tiếp thực thi mọi hoạt động sáng tạo, tác nghiệp và quản trị nội bộ.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {orgData[2]?.departments?.map((dept, idx) => {
                  const deptThemes = [
                    {
                      borderHover: 'hover:border-blue-500/60',
                      topBar: 'from-blue-500 via-indigo-500 to-cyan-500',
                      iconBox: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                    },
                    {
                      borderHover: 'hover:border-purple-500/60',
                      topBar: 'from-purple-500 via-pink-500 to-rose-500',
                      iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                    },
                    {
                      borderHover: 'hover:border-amber-500/60',
                      topBar: 'from-amber-500 via-orange-500 to-red-500',
                      iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }
                  ][idx % 3];

                  return (
                    <div
                      key={idx}
                      className={`group relative p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] ${deptThemes.borderHover} flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden`}
                    >
                      {/* Top glowing accent line on hover */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${deptThemes.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                      <div>
                        {/* Header Ban */}
                        <div className="flex items-center gap-3.5 mb-5">
                          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-all shadow-xs ${deptThemes.iconBox}`}>
                            {idx === 0 && <Users className="w-6 h-6" />}
                            {idx === 1 && <Mic className="w-6 h-6" />}
                            {idx === 2 && <Film className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[var(--text-primary)] leading-snug">{dept.name}</h4>
                          </div>
                        </div>

                        {/* Nhân sự phụ trách thành từng hàng (Lấy avatar từ CSDL) */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] mb-4">
                          <span className="text-2xs font-bold text-[var(--text-muted)] block uppercase tracking-wider mb-2">
                            Phụ trách:
                          </span>
                          <div className="space-y-1.5">
                            {getDepartmentOfficers(dept, members).map((off, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs hover:border-[var(--border-hover)] transition-all gap-2 shadow-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-default)] shrink-0 shadow-sm">
                                    <img
                                      src={off.avatar || '/vmc-logo.jpg'}
                                      alt={off.name}
                                      onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="font-semibold text-[var(--text-primary)] truncate">{off.name}</span>
                                </div>
                                <span className={`text-2xs font-bold px-2 py-0.5 rounded-md shrink-0 ${off.isHead
                                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                  }`}>
                                  {off.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nhiệm vụ chính */}
                        <div className="space-y-2 mb-2">
                          <span className="text-2xs font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
                            Trách nhiệm:
                          </span>
                          {dept.tasks?.map((tsk, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                              <span>{tsk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION: KHO MEDIA & THƯỚC PHIM */}
      <section id="media" className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-default)] transition-colors relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 block mb-2">
                Kho Tư Liệu Truyền Thông
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Kho Ảnh & Video Sản Xuất
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Những khoảnh khắc rực rỡ và những thước phim học đường sống động qua lăng kính VMC.
              </p>
            </div>

            {/* Actions: Filter & Đăng Media */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs">
                <button
                  type="button"
                  onClick={() => setMediaFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mediaFilter === 'all' ? 'bg-cyan-500 text-black shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => setMediaFilter('video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${mediaFilter === 'video' ? 'bg-cyan-500 text-black shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaFilter('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${mediaFilter === 'image' ? 'bg-cyan-500 text-black shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ảnh</span>
                </button>
              </div>

              {/* Nút Đăng Media mới nếu có quyền */}
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMedia({
                      title: '',
                      type: 'image',
                      mediaUrl: '',
                      thumbnail: '',
                      images: [],
                      category: 'Ảnh Sự Kiện',
                      date: new Date().toLocaleDateString('vi-VN'),
                      description: ''
                    });
                    setManageTab('media');
                    setIsManageModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Ảnh / Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'video') {
                    setSelectedMedia(item);
                  } else {
                    const itemGallery = (Array.isArray(item.images) && item.images.length > 0)
                      ? item.images
                      : [item.mediaUrl || item.thumbnail].filter(Boolean);
                    setSelectedMedia({
                      ...item,
                      images: itemGallery,
                      gallery: itemGallery,
                      galleryIndex: 0,
                      mediaUrl: itemGallery[0] || item.mediaUrl || item.thumbnail
                    });
                  }
                }}
                className="group relative rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.thumbnail || item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Badge Type */}
                  <div className="absolute top-3 left-3">
                    {item.type === 'video' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/90 text-white text-2xs font-bold uppercase tracking-wider backdrop-blur-md shadow">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Video</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-2xs font-bold uppercase tracking-wider backdrop-blur-md shadow">
                        <ImageIcon className="w-3 h-3" />
                        <span>Hình Ảnh</span>
                      </span>
                    )}
                  </div>

                  {/* Category Pill & Multi-photo badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {item.type === 'image' && Array.isArray(item.images) && item.images.length > 1 && (
                      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-cyan-600/90 text-white backdrop-blur-md shadow flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>+{item.images.length} ảnh</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-900/80 text-cyan-300 border border-cyan-500/20 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Play Button Icon Center if Video */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-2xs text-[var(--text-muted)] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      {item.date}
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400/80 font-medium group-hover:text-cyan-500">
                      Xem chi tiết →
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)] text-xs">
              Chưa có nội dung media nào trong mục này.
            </div>
          )}

        </div>
      </section>

      {/* 6. SECTION: BÀI VIẾT GIỚI THIỆU & BẢN TIN TIÊU ĐIỂM */}
      <section id="articles" className="py-20 relative bg-[var(--bg-primary)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 block mb-2">
                Bài Viết & Báo Cáo
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Tiêu Điểm & Hoạt Động Nổi Bật
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Những trang viết giới thiệu về hành trình trưởng thành, các chuyên mục phát thanh và hậu trường tác nghiệp.
              </p>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setEditingArticle({
                    title: '',
                    category: 'Giới Thiệu',
                    author: currentUser?.name || 'Ban Biên Tập VMC',
                    date: new Date().toLocaleDateString('vi-VN'),
                    videoUrl: '',
                    coverImage: '',
                    images: [],
                    summary: '',
                    content: ''
                  });
                  setManageTab('articles');
                  setIsManageModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Đăng Bài Viết Mới</span>
              </button>
            )}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="group flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
              >
                {/* Cover Image / Video Card */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={art.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000'}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {art.videoUrl ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-bold uppercase tracking-wider bg-red-600/90 text-white shadow backdrop-blur-md">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Video</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-2xs font-bold uppercase tracking-wider bg-purple-600/90 text-white shadow backdrop-blur-md">
                        {art.category}
                      </span>
                    )}
                  </div>
                  {art.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                  {Array.isArray(art.images) && art.images.length > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-2xs font-bold bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span>+{art.images.length} ảnh</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Article Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-2xs text-[var(--text-muted)] mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        {art.date}
                      </span>
                      <span>•</span>
                      <span className="text-[var(--text-secondary)] font-medium">{art.author}</span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] mt-2.5 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-default)] flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    <span>Đọc toàn bộ bài viết</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 7. MODAL: XEM BÀI VIẾT CHI TIẾT */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Nút Đóng */}
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Bài Viết */}
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                {selectedArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mt-3 leading-snug">
                {selectedArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-default)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  {selectedArticle.date}
                </span>
                <span>•</span>
                <span>Tác giả: <strong className="text-[var(--text-primary)]">{selectedArticle.author}</strong></span>
                {selectedArticle.videoUrl && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Bài viết dạng Video (Tự phát)</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* PHẦN MEDIA ĐẦU BÀI VIẾT:
                1. NẾU LÀ VIDEO: TỰ ĐỘNG PHÁT NGAY KHI MỞ
                2. NẾU CÓ NHIỀU ẢNH: SLIDER CAROUSEL LƯỚT SANG HIỆN ẢNH TIẾP THEO
                3. NẾU 1 ẢNH: HIỂN THỊ ẢNH BÌA
            */}
            {selectedArticle.videoUrl ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black mb-6 shadow-xl border border-[var(--border-default)]">
                {(() => {
                  const videoInfo = getVideoEmbedInfo(selectedArticle.videoUrl, true);
                  if (videoInfo?.platform === 'youtube' || videoInfo?.platform === 'facebook') {
                    return (
                      <iframe
                        src={videoInfo.embedUrl}
                        title={selectedArticle.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        scrolling="no"
                      />
                    );
                  }
                  return (
                    <video
                      src={selectedArticle.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain mx-auto"
                    />
                  );
                })()}
              </div>
            ) : (() => {
              const allImages = Array.from(new Set([
                selectedArticle.coverImage,
                ...(Array.isArray(selectedArticle.images) ? selectedArticle.images : [])
              ].filter(Boolean)));

              if (allImages.length > 1) {
                return (
                  <div className="mb-6">
                    <ImageSlider
                      images={allImages}
                      onImageClick={(imgUrl, idx) => setSelectedMedia({
                        type: 'image',
                        mediaUrl: imgUrl,
                        gallery: allImages,
                        galleryIndex: idx,
                        title: selectedArticle.title,
                        category: selectedArticle.category,
                        description: selectedArticle.summary || selectedArticle.title
                      })}
                      showThumbnails={true}
                    />
                  </div>
                );
              }

              if (selectedArticle.coverImage) {
                return (
                  <div className="relative group aspect-video w-full rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] mb-6 cursor-pointer">
                    <img
                      src={selectedArticle.coverImage}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onClick={() => setSelectedMedia({
                        type: 'image',
                        mediaUrl: selectedArticle.coverImage,
                        gallery: [selectedArticle.coverImage],
                        galleryIndex: 0,
                        title: selectedArticle.title,
                        category: selectedArticle.category,
                        description: selectedArticle.summary || selectedArticle.title
                      })}
                    />
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-slate-700/60 text-slate-300 text-2xs flex items-center gap-1.5 backdrop-blur-md pointer-events-none group-hover:bg-cyan-500 group-hover:text-black font-medium transition-all">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Bấm vào ảnh để phóng to</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Tóm tắt */}
            {selectedArticle.summary && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-200 text-xs sm:text-sm font-medium italic leading-relaxed mb-6">
                "{selectedArticle.summary}"
              </div>
            )}

            {/* Nội dung bài viết */}
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line space-y-4 font-sans">
              {selectedArticle.content}
            </div>

            {/* Album / Bộ Sưu Tập Ảnh Trong Bài Viết */}
            {Array.isArray(selectedArticle.images) && selectedArticle.images.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span>Bộ Sưu Tập Hình Ảnh Đi Kèm</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 text-2xs font-semibold">
                          {selectedArticle.images.length} ảnh
                        </span>
                      </h4>
                      <p className="text-2xs text-[var(--text-secondary)]">
                        Lướt sang để xem các ảnh tiếp theo hoặc bấm vào để xem phóng to
                      </p>
                    </div>
                  </div>
                </div>

                {selectedArticle.videoUrl ? (
                  <ImageSlider
                    images={selectedArticle.images}
                    onImageClick={(imgUrl, idx) => setSelectedMedia({
                      type: 'image',
                      mediaUrl: imgUrl,
                      gallery: selectedArticle.images,
                      galleryIndex: idx,
                      title: `${selectedArticle.title} (Ảnh ${idx + 1}/${selectedArticle.images.length})`,
                      category: selectedArticle.category,
                      description: `Hình ảnh trong bài viết: ${selectedArticle.title}`
                    })}
                    showThumbnails={true}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedArticle.images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => {
                          const allImgs = Array.from(new Set([
                            selectedArticle.coverImage,
                            ...selectedArticle.images
                          ].filter(Boolean)));
                          const targetIdx = allImgs.indexOf(imgUrl);
                          setSelectedMedia({
                            type: 'image',
                            mediaUrl: imgUrl,
                            gallery: allImgs,
                            galleryIndex: targetIdx >= 0 ? targetIdx : imgIdx,
                            title: `${selectedArticle.title} (Ảnh ${imgIdx + 1}/${selectedArticle.images.length})`,
                            category: selectedArticle.category,
                            description: `Hình ảnh trong bài viết: ${selectedArticle.title}`
                          });
                        }}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-default)] hover:border-cyan-500/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
                      >
                        <img
                          src={imgUrl}
                          alt={`Ảnh ${imgIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span>Xem chi tiết</span>
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-slate-300 text-3xs font-mono">
                          #{imgIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer bài viết */}
            <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-2xs text-[var(--text-muted)]">
                CLB Truyền Thông THPT Vĩnh Bảo (VMC)
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-default)] transition-all"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: XEM MEDIA (ẢNH PHÓNG TO HOẶC VIDEO EMBED TỰ PHÁT) */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player tự phát hoặc Trình Chiếu Ảnh (ImageSlider chuyển tiếp như bài đăng) */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-4 select-none">
              {selectedMedia.type === 'video' ? (
                (() => {
                  const videoInfo = getVideoEmbedInfo(selectedMedia.mediaUrl, true);
                  if (videoInfo?.platform === 'youtube' || videoInfo?.platform === 'facebook') {
                    return (
                      <div className="aspect-video w-full">
                        <iframe
                          src={videoInfo.embedUrl}
                          title={selectedMedia.title}
                          className="w-full h-full rounded-2xl border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          scrolling="no"
                        />
                      </div>
                    );
                  }
                  return (
                    <video
                      src={selectedMedia.mediaUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full max-h-[70vh] rounded-2xl object-contain mx-auto"
                    />
                  );
                })()
              ) : (
                (() => {
                  const mediaImages = (Array.isArray(selectedMedia.images) && selectedMedia.images.length > 0)
                    ? selectedMedia.images
                    : (Array.isArray(selectedMedia.gallery) && selectedMedia.gallery.length > 0)
                      ? selectedMedia.gallery
                      : [selectedMedia.mediaUrl || selectedMedia.thumbnail].filter(Boolean);

                  if (mediaImages.length > 1) {
                    return (
                      <ImageSlider
                        images={mediaImages}
                        initialIndex={selectedMedia.galleryIndex || 0}
                        showThumbnails={true}
                        aspectRatio="aspect-video"
                      />
                    );
                  }

                  return (
                    <div className="relative flex items-center justify-center min-h-[300px] max-h-[70vh]">
                      <img
                        src={mediaImages[0] || selectedMedia.mediaUrl || selectedMedia.thumbnail}
                        alt={selectedMedia.title}
                        className="w-full max-h-[70vh] rounded-2xl object-contain mx-auto transition-opacity duration-300"
                      />
                    </div>
                  );
                })()
              )}
            </div>

            {/* Media Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[var(--border-default)]">
              <div>
                <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
                  {selectedMedia.category || 'VMC Media'} • {selectedMedia.date || 'Gần đây'}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                  {selectedMedia.title}
                </h3>
                {selectedMedia.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {selectedMedia.description}
                  </p>
                )}
              </div>

              {selectedMedia.mediaUrl && (
                <a
                  href={selectedMedia.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] self-start sm:self-auto shrink-0 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở liên kết gốc</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL QUẢN LÝ / ĐĂNG BÀI / MEDIA / CƠ CẤU (DÀNH CHO QUẢN TRỊ VIÊN) */}
      {isManageModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-[var(--text-primary)]">

            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Quản Trị Nội Dung Trang Chủ VMC</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsManageModalOpen(false);
                  setEditingArticle(null);
                  setEditingMedia(null);
                }}
                className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Management Tabs - Kích thước lớn, cao ráo, không bị nén */}
            <div className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] mb-6 shadow-xs">
              <button
                type="button"
                onClick={() => setManageTab('articles')}
                className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center min-h-[48px] ${manageTab === 'articles'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 ring-2 ring-cyan-500/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/90 border border-[var(--border-default)] shadow-xs'
                  }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">Quản Lý Bài Viết ({articles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setManageTab('media')}
                className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center min-h-[48px] ${manageTab === 'media'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 ring-2 ring-cyan-500/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/90 border border-[var(--border-default)] shadow-xs'
                  }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Ảnh & Video ({mediaList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setManageTab('info')}
                className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center min-h-[48px] ${manageTab === 'info'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 ring-2 ring-cyan-500/50'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/90 border border-[var(--border-default)] shadow-xs'
                  }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span className="truncate">Thông Tin & Số Liệu</span>
              </button>
            </div>

            {/* TAB CONTENT: BÀI VIẾT */}
            {manageTab === 'articles' && (
              <div className="space-y-6">
                {/* Form thêm/sửa bài viết */}
                {editingArticle ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveArticle(editingArticle);
                    }}
                    className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                        {editingArticle.id ? '✏️ Chỉnh Sửa Bài Viết' : '➕ Đăng Bài Viết Mới'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingArticle(null)}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Hủy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Tiêu Đề Bài Viết *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingArticle.title || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                          placeholder="Ví dụ: Hành trình 6 năm phát triển..."
                          className="ds-input w-full"
                        />
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Chuyên Mục *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingArticle.category || 'Giới Thiệu'}
                          onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                          placeholder="Giới Thiệu, Chuyên Mục, Hậu Trường..."
                          className="ds-input w-full"
                        />
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Tác Giả / Đơn Vị Đăng
                        </label>
                        <input
                          type="text"
                          value={editingArticle.author || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                          placeholder="Ban Chủ Nhiệm / Ban Nội Dung..."
                          className="ds-input w-full"
                        />
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>Ngày Đăng *</span>
                        </label>
                        <input
                          type="date"
                          value={toDateInputValue(editingArticle.date)}
                          onChange={(e) => setEditingArticle({ ...editingArticle, date: fromDateInputValue(e.target.value) })}
                          className="ds-input w-full"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Link Video
                        </label>
                        <input
                          type="text"
                          value={editingArticle.videoUrl || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, videoUrl: e.target.value })}
                          placeholder="Dán link YouTube hoặc Facebook (vd: https://facebook.com/... hoặc youtube.com/...)"
                          className="ds-input w-full text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Ảnh Bìa Bài Viết
                        </label>
                        {editingArticle.coverImage ? (
                          <div className="relative group rounded-xl overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-2.5 flex items-center gap-3">
                            <img src={editingArticle.coverImage} alt="Cover Preview" className="w-24 h-16 object-cover rounded-lg border border-[var(--border-default)] shrink-0 bg-slate-900" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">Ảnh bìa đã chọn</p>
                              <p className="text-3xs text-[var(--text-secondary)]">Kéo thả ảnh mới vào đây hoặc bấm Đổi Ảnh</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <label className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Đổi Ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const b64 = await readAndCompressImage(e.target.files[0]);
                                      if (b64) setEditingArticle({ ...editingArticle, coverImage: b64 });
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setEditingArticle({ ...editingArticle, coverImage: '' })}
                                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                                title="Xóa ảnh bìa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                const b64 = await readAndCompressImage(e.dataTransfer.files[0]);
                                if (b64) setEditingArticle({ ...editingArticle, coverImage: b64 });
                              }
                            }}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border-default)] hover:border-cyan-500 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-cyan-500/5 cursor-pointer transition-all text-center group"
                          >
                            <Upload className="w-6 h-6 text-cyan-500 group-hover:scale-110 transition-transform mb-1.5" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">Kéo thả file ảnh bìa vào đây hoặc bấm để chọn</span>
                            <span className="text-3xs text-[var(--text-muted)] mt-0.5">Hỗ trợ JPG, PNG, WebP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const b64 = await readAndCompressImage(e.target.files[0]);
                                  if (b64) setEditingArticle({ ...editingArticle, coverImage: b64 });
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Album / Bộ Sưu Tập Ảnh Đi Kèm (Nhiều ảnh) */}
                    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-2xs font-bold text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Album Ảnh Đi Kèm ({Array.isArray(editingArticle.images) ? editingArticle.images.length : 0} ảnh)</span>
                        </label>
                      </div>

                      {/* Dropzone thả nhiều file ảnh */}
                      <label
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const files = Array.from(e.dataTransfer.files);
                            const b64List = (await Promise.all(files.map(f => readAndCompressImage(f)))).filter(Boolean);
                            if (b64List.length > 0) {
                              const currentImgs = Array.isArray(editingArticle.images) ? [...editingArticle.images] : [];
                              setEditingArticle({ ...editingArticle, images: [...currentImgs, ...b64List] });
                            }
                          }
                        }}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 rounded-xl bg-[var(--bg-card)] hover:bg-cyan-500/5 cursor-pointer transition-all text-center group"
                      >
                        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform mb-1">
                          <Upload className="w-5 h-5" />
                          <span className="text-xs font-bold">Thả nhiều file ảnh vào đây hoặc bấm để chọn từ máy</span>
                        </div>
                        <span className="text-3xs text-[var(--text-muted)]">Chọn 1 hoặc nhiều ảnh cùng lúc (Hỗ trợ JPG, PNG, WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              const b64List = (await Promise.all(files.map(f => readAndCompressImage(f)))).filter(Boolean);
                              if (b64List.length > 0) {
                                const currentImgs = Array.isArray(editingArticle.images) ? [...editingArticle.images] : [];
                                setEditingArticle({ ...editingArticle, images: [...currentImgs, ...b64List] });
                              }
                            }
                          }}
                        />
                      </label>

                      {/* Danh sách ảnh đã thêm trong album */}
                      {Array.isArray(editingArticle.images) && editingArticle.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] max-h-56 overflow-y-auto">
                          {editingArticle.images.map((imgUrl, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-default)] aspect-video">
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 backdrop-blur-[1px]">
                                <button
                                  type="button"
                                  onClick={() => setEditingArticle({ ...editingArticle, coverImage: imgUrl })}
                                  title="Đặt làm ảnh bìa"
                                  className="px-2 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-3xs font-bold shadow"
                                >
                                  Làm Bìa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImgs = editingArticle.images.filter((_, i) => i !== idx);
                                    setEditingArticle({ ...editingArticle, images: nextImgs });
                                  }}
                                  title="Xóa ảnh này khỏi bài viết"
                                  className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-slate-300 text-3xs font-mono">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                        Tóm Tắt Ngắn
                      </label>
                      <textarea
                        rows={2}
                        value={editingArticle.summary || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                        placeholder="Mô tả tóm tắt xuất hiện ở thẻ xem trước..."
                        className="ds-input w-full"
                      />
                    </div>

                    <div>
                      <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                        Nội Dung Chi Tiết *
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={editingArticle.content || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                        placeholder="Nội dung đầy đủ của bài viết..."
                        className="ds-input w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingArticle(null)}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Lưu Bài Viết
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingArticle({
                      title: '',
                      category: 'Giới Thiệu',
                      author: currentUser?.name || 'Ban Chủ Nhiệm VMC',
                      date: new Date().toLocaleDateString('vi-VN'),
                      coverImage: '',
                      images: [],
                      summary: '',
                      content: ''
                    })}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 hover:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 bg-[var(--bg-card)] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Bài Viết Giới Thiệu Mới</span>
                  </button>
                )}

                {/* Danh sách bài viết hiện có */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Danh Sách Bài Viết Đang Hiển Thị ({articles.length})
                  </h4>
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {art.coverImage ? (
                          <img src={art.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-[var(--bg-tertiary)] shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-2xs font-bold text-purple-600 dark:text-purple-400 uppercase">{art.category}</span>
                          <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{art.title}</h5>
                          <span className="text-2xs text-[var(--text-secondary)]">
                            {art.date} • {art.author}
                            {Array.isArray(art.images) && art.images.length > 0 && (
                              <span className="text-cyan-600 dark:text-cyan-400 font-medium"> • 📷 {art.images.length} ảnh</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingArticle({
                            ...art,
                            date: art.date || new Date().toLocaleDateString('vi-VN'),
                            images: Array.isArray(art.images) ? art.images : []
                          })}
                          className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
                          title="Sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: MEDIA (ẢNH & VIDEO) */}
            {manageTab === 'media' && (
              <div className="space-y-6">
                {/* Form thêm/sửa media */}
                {editingMedia ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveMedia(editingMedia);
                    }}
                    className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                        {editingMedia.id ? '✏️ Chỉnh Sửa Media' : '➕ Đăng Ảnh / Video Mới'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingMedia(null)}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Hủy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Tiêu Đề *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingMedia.title || ''}
                          onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                          placeholder="Ví dụ: Lễ Khai Giảng 2026..."
                          className="ds-input w-full"
                        />
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Hình Thức *
                        </label>
                        <select
                          value={editingMedia.type || 'image'}
                          onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value })}
                          className="ds-input w-full"
                        >
                          <option value="image">Hình Ảnh</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      {editingMedia.type === 'video' ? (
                        <>
                          <div>
                            <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                              Link Video *
                            </label>
                            <input
                              type="text"
                              required
                              value={editingMedia.mediaUrl || ''}
                              onChange={(e) => setEditingMedia({ ...editingMedia, mediaUrl: e.target.value })}
                              placeholder="Dán link YouTube hoặc Facebook (vd: https://facebook.com/... hoặc youtube.com/...)"
                              className="ds-input w-full"
                            />
                          </div>

                          <div>
                            <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                              Ảnh Bìa Video
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingMedia.thumbnail || ''}
                                onChange={(e) => setEditingMedia({ ...editingMedia, thumbnail: e.target.value })}
                                placeholder="Dán link ảnh thumbnail hoặc bấm Thả File..."
                                className="ds-input flex-1 text-xs"
                              />
                              <label className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] border border-[var(--border-default)] text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 shadow-xs">
                                <Upload className="w-3.5 h-3.5 text-cyan-500" />
                                <span>Thả file</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const b64 = await readAndCompressImage(e.target.files[0]);
                                      if (b64) setEditingMedia({ ...editingMedia, thumbnail: b64 });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              <span>Bộ Sưu Tập File Ảnh Của Mục Này * {Array.isArray(editingMedia.images) && editingMedia.images.length > 0 && `(${editingMedia.images.length} ảnh)`}</span>
                            </label>
                          </div>

                          {/* Dropzone thả / chọn nhiều ảnh */}
                          <label
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                await handleMediaFilesSelected(e.dataTransfer.files);
                              }
                            }}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border-default)] hover:border-cyan-500 rounded-2xl bg-[var(--bg-tertiary)]/50 hover:bg-cyan-500/5 cursor-pointer transition-all text-center group"
                          >
                            <Upload className="w-6 h-6 text-cyan-500 mb-1.5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              Kéo thả một hoặc nhiều file ảnh vào đây hoặc bấm để chọn
                            </span>
                            <span className="text-3xs text-[var(--text-muted)] mt-0.5">
                              Hỗ trợ chọn cùng lúc nhiều ảnh (JPG, PNG, WebP) - Tự động hiển thị slider lướt chuyển tiếp
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  await handleMediaFilesSelected(e.target.files);
                                }
                              }}
                            />
                          </label>

                          {/* Preview Grid ảnh đã nạp */}
                          {Array.isArray(editingMedia.images) && editingMedia.images.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-3xs font-semibold text-[var(--text-muted)] uppercase">
                                  Danh sách ảnh đã tải lên ({editingMedia.images.length}):
                                </span>
                                <span className="text-3xs text-cyan-600 dark:text-cyan-400">
                                  ★ Bấm "Làm đại diện" để đổi ảnh bìa
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1.5 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-default)]">
                                {editingMedia.images.map((img, idx) => {
                                  const isThumb = editingMedia.thumbnail === img || (!editingMedia.thumbnail && idx === 0);
                                  return (
                                    <div
                                      key={idx}
                                      className={`group relative rounded-xl overflow-hidden border-2 aspect-video bg-black/40 transition-all ${isThumb ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-[var(--border-default)] hover:border-cyan-500/50'
                                        }`}
                                    >
                                      <img src={img} alt="" className="w-full h-full object-cover" />

                                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono leading-none backdrop-blur-xs">
                                        #{idx + 1}
                                      </span>

                                      {isThumb && (
                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-bold shadow flex items-center gap-0.5">
                                          ★ Đại diện
                                        </span>
                                      )}

                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                        {!isThumb && (
                                          <button
                                            type="button"
                                            onClick={() => handleSetMediaThumbnail(img)}
                                            className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow transition-colors"
                                            title="Đặt làm ảnh đại diện"
                                          >
                                            ★ Đại diện
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMediaImage(idx)}
                                          className="p-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs shadow transition-colors"
                                          title="Xóa ảnh này"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                          Chuyên Mục
                        </label>
                        <input
                          type="text"
                          value={editingMedia.category || 'Ảnh Sự Kiện'}
                          onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value })}
                          placeholder="Ảnh Sự Kiện, Video Spotlight, Kỷ Niệm..."
                          className="ds-input w-full"
                        />
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>Ngày Đăng *</span>
                        </label>
                        <input
                          type="date"
                          value={toDateInputValue(editingMedia.date)}
                          onChange={(e) => setEditingMedia({ ...editingMedia, date: fromDateInputValue(e.target.value) })}
                          className="ds-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                        Mô Tả Ngắn
                      </label>
                      <input
                        type="text"
                        value={editingMedia.description || ''}
                        onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                        placeholder="Mô tả ngắn gọn về sản phẩm..."
                        className="ds-input w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingMedia(null)}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Lưu Phương Tiện
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingMedia({
                      title: '',
                      type: 'image',
                      mediaUrl: '',
                      thumbnail: '',
                      images: [],
                      category: 'Ảnh Sự Kiện',
                      date: new Date().toLocaleDateString('vi-VN'),
                      description: ''
                    })}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 hover:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 bg-[var(--bg-card)] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng Thêm Ảnh Hoặc Video Mới</span>
                  </button>
                )}

                {/* Danh sách media */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Thư Viện Media Đang Có ({mediaList.length})
                  </h4>
                  {mediaList.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={med.thumbnail || med.mediaUrl}
                          alt=""
                          className="w-14 h-10 rounded-lg object-cover bg-[var(--bg-tertiary)] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className={`text-2xs font-bold uppercase ${med.type === 'video' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {med.type === 'video' ? '🎬 Video' : '📸 Hình Ảnh'} • {med.category}
                          </span>
                          <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{med.title}</h5>
                          <span className="text-2xs text-[var(--text-secondary)]">
                            {med.date}
                            {med.type === 'image' && Array.isArray(med.images) && med.images.length > 1 && (
                              <span className="text-cyan-600 dark:text-cyan-400 font-medium"> • 📷 {med.images.length} ảnh</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingMedia({
                            ...med,
                            images: Array.isArray(med.images) && med.images.length > 0 ? med.images : (med.mediaUrl ? [med.mediaUrl] : []),
                            date: med.date || new Date().toLocaleDateString('vi-VN')
                          })}
                          className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
                          title="Sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(med.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: THÔNG TIN & SỐ LIỆU */}
            {manageTab === 'info' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveInfo(info);
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Tên Đầy Đủ Của CLB
                    </label>
                    <input
                      type="text"
                      value={info.name || ''}
                      onChange={(e) => setInfo({ ...info, name: e.target.value })}
                      className="ds-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Tên Viết Tắt
                    </label>
                    <input
                      type="text"
                      value={info.shortName || ''}
                      onChange={(e) => setInfo({ ...info, shortName: e.target.value })}
                      className="ds-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Khẩu Hiệu / Slogan *
                  </label>
                  <input
                    type="text"
                    required
                    value={info.slogan || ''}
                    onChange={(e) => setInfo({ ...info, slogan: e.target.value })}
                    className="ds-input w-full"
                  />
                </div>

                <div>
                  <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Đoạn Giới Thiệu Ngắn (Hero Section) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={info.description || ''}
                    onChange={(e) => setInfo({ ...info, description: e.target.value })}
                    className="ds-input w-full"
                  />
                </div>

                {/* 4 Thống kê ấn tượng */}
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
                    Thống Kê Số Liệu Nổi Bật
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-2xs text-[var(--text-secondary)] font-medium block mb-1">Số Thành Viên</label>
                      <input
                        type="text"
                        value={info.stats?.membersCount || ''}
                        onChange={(e) => setInfo({
                          ...info,
                          stats: { ...info.stats, membersCount: e.target.value }
                        })}
                        className="ds-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-2xs text-[var(--text-secondary)] font-medium block mb-1">Số Sản Phẩm</label>
                      <input
                        type="text"
                        value={info.stats?.productionsCount || ''}
                        onChange={(e) => setInfo({
                          ...info,
                          stats: { ...info.stats, productionsCount: e.target.value }
                        })}
                        className="ds-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-2xs text-[var(--text-secondary)] font-medium block mb-1">Số Giải Thưởng</label>
                      <input
                        type="text"
                        value={info.stats?.awardsCount || ''}
                        onChange={(e) => setInfo({
                          ...info,
                          stats: { ...info.stats, awardsCount: e.target.value }
                        })}
                        className="ds-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-2xs text-[var(--text-secondary)] font-medium block mb-1">Số Năm Hoạt Động</label>
                      <input
                        type="text"
                        value={info.stats?.yearsActive || ''}
                        onChange={(e) => setInfo({
                          ...info,
                          stats: { ...info.stats, yearsActive: e.target.value }
                        })}
                        className="ds-input w-full text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                  >
                    Lưu Thông Tin Giới Thiệu
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
