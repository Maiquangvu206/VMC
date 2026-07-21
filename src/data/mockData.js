export const CLUB_INFO = {
  name: "VMC Intranet",
  fullName: "Hệ Thống Quản Trị Nội Bộ - CLB Truyền Thông THPT Vĩnh Bảo",
  englishName: "VINH BAO HIGH SCHOOL MEDIA CLUB - INTERNAL PORTAL",
  slogan: "Quản Lý Công Việc • Phát Thanh Học Đường • Sản Xuất & Đối Ngoại",
  affiliation: "Trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo",
  accountManager: "Bộ Phận Kỹ Thuật - Ban Đối Ngoại & Nhân Sự",
  departments: [
    { 
      id: "bcn", 
      name: "Ban Chủ Nhiệm", 
      icon: "Crown",
      count: 5, 
      lead: "Vũ Hoàng Long (12A1)",
      desc: "Điều hành chung toàn bộ hoạt động CLB, duyệt bài đăng Fanpage, duyệt ngân sách & chỉ đạo sự kiện."
    },
    { 
      id: "content_radio", 
      name: "Ban Nội Dung - Phát Thanh", 
      icon: "Mic",
      count: 36, 
      lead: "Nguyễn Hoàng Mai (11A3)",
      desc: "Phụ trách biên tập bài đăng Fanpage, viết kịch bản phát thanh giờ ra chơi, bản tin VMC News & biên tập báo chí."
    },
    { 
      id: "production", 
      name: "Ban Sản Xuất", 
      icon: "Film",
      count: 28, 
      lead: "Trần Minh Quân (12A4)",
      desc: "Phụ trách quay phim, chụp ảnh sự kiện trường, dựng video highlight, hậu kỳ âm thanh & thiết kế đồ họa."
    },
    { 
      id: "hr_external", 
      name: "Ban Đối Ngoại - Nhân Sự", 
      icon: "Users",
      count: 22, 
      lead: "Nguyễn Văn Kỹ (11A2)",
      desc: "Quản lý nhân sự, điểm danh sinh hoạt, quản trị hệ thống kỹ thuật portal VMC và xin tài trợ sự kiện."
    }
  ]
};

export const TASKS_LIST = [
  {
    id: "task-101",
    title: "Quay phim & Biên tập Video Lễ Khai Giảng Năm Học 2026 - 2027",
    department: "production",
    assignee: "Trần Minh Quân (Trưởng Ban Sản Xuất)",
    deadline: "2026-09-06",
    priority: "HIGH",
    status: "doing",
    desc: "Cần 3 góc quay sân trường, 1 gậy chống rung gimbal, thu âm trực tiếp qua mic bàn mixer."
  },
  {
    id: "task-102",
    title: "Viết kịch bản Phát thanh Giờ Ra Chơi Số 09: Chào Tân Học Sinh Khóa 60",
    department: "content_radio",
    assignee: "Nguyễn Hoàng Mai (Trưởng Ban Nội Dung)",
    deadline: "2026-07-28",
    priority: "MEDIUM",
    status: "todo",
    desc: "Thời lượng 15 phút, chọn 3 bài hát V-Pop tươi trẻ gửi tặng học sinh khối 10 mới nhập học."
  },
  {
    id: "task-103",
    title: "Rà soát điểm rèn luyện & Phân công kỹ thuật chuẩn bị Gen 6 Contest",
    department: "hr_external",
    assignee: "Vũ Hoàng Long (Chủ Nhiệm - Admin)",
    deadline: "2026-07-26",
    priority: "High",
    status: "doing",
    desc: "Họp BCN rà soát bảng dự trù kinh phí gian hàng, quà tặng sticker."
  }
];

export const EQUIPMENT_LIST = [
  {
    id: "eq-01",
    name: "Máy Ảnh Canon EOS 80D + Lens 18-135mm USM",
    category: "Camera",
    code: "CAM-VMC-01",
    status: "borrowed",
    borrower: "Ban Sản Xuất - Phạm Minh Triết",
    returnDate: "2026-07-28",
    condition: "Tốt (Kèm 2 pin + Thẻ 64GB)"
  },
  {
    id: "eq-02",
    name: "Bộ Micro Thu Âm Radio Phát Thanh Boya BY-WM4 Pro",
    category: "Audio",
    code: "MIC-RAD-01",
    status: "borrowed",
    borrower: "Ban Nội Dung - Phát Thanh",
    returnDate: "2026-07-29",
    condition: "Phục vụ thu âm chương trình phát thanh giờ ra chơi"
  },
  {
    id: "eq-03",
    name: "Máy Ảnh Sony Alpha A6400 + Lens 35mm f/1.8",
    category: "Camera",
    code: "CAM-VMC-02",
    status: "available",
    borrower: null,
    returnDate: null,
    condition: "Mới 95% (Kèm Túi chống sốc)"
  }
];

export const FANPAGE_DRAFTS = [
  {
    id: "draft-201",
    title: "[BẢN TIN PHÁT THANH SCHOOLDAY] SỐ 08: CHÀO ĐÓN TÂN HỌC SINH KHÓA 60",
    author: "Nguyễn Hoàng Mai (Trưởng Ban Nội Dung - Phát Thanh)",
    department: "content_radio",
    createdAt: "2026-07-21 14:30",
    status: "pending",
    content: "🎙️ [PHÁT THANH VMC RADIO] Kính chào thầy cô và các bạn học sinh THPT Vĩnh Bảo! Đây là bản tin phát thanh giờ ra chơi số 08 được thực hiện bởi Ban Nội Dung - Phát Thanh VMC..."
  }
];

export const INTERNAL_ANNOUNCEMENTS = [
  {
    id: "ann-01",
    title: "Quy định Bảo mật: Đổi mật khẩu ngay lần đầu đăng nhập hệ thống VMC Portal",
    date: "2026-07-21",
    sender: "Bộ Phận Kỹ Thuật - Ban Đối Ngoại Nhân Sự",
    priority: "IMPORTANT",
    content: "Tất cả thành viên khi dùng Mã Thành Viên được Kỹ thuật cấp đăng nhập lần đầu BẮT BUỘC đổi mật khẩu mới. Nếu quên mật khẩu xin liên hệ Tổ Kỹ thuật cấp lại."
  }
];

// Accounts with sanitized public demo structure (No cleartext passwords in frontend source code):
export const MEMBER_ACCOUNTS = [
  // Gen 6 (Nhiệm kỳ 2025 - 2026 - Đương Nhiệm)
  {
    id: "vmc-admin-01",
    memberCode: "ADMIN",
    username: "admin",
    isFirstLogin: false,
    name: "Vũ Hoàng Long",
    class: "12A1",
    role: "admin",
    roleTitle: "Chủ Nhiệm CLB (Super Admin)",
    department: "bcn",
    deptName: "Ban Chủ Nhiệm",
    term: "Gen 6",
    termName: "Gen 6",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    phone: "0981 *** ****",
    email: "hoanglong.vmc@vinhbao.edu.vn",
    dob: "15/08/2008",
    address: "Huyện Vĩnh Bảo, Hải Phòng",
    facebook: "https://facebook.com/hoanglong.vmc",
    points: 2000,
    status: "Active"
  },
  {
    id: "vmc-tech-01",
    memberCode: "VMC-TECH-01",
    username: "ky.tech",
    isFirstLogin: false,
    name: "Nguyễn Văn Kỹ",
    class: "11A2",
    role: "tech_admin",
    roleTitle: "Tổ Trưởng Kỹ Thuật",
    department: "hr_external",
    deptName: "Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)",
    term: "Gen 6",
    termName: "Gen 6",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
    phone: "0988 *** ****",
    email: "vanky.tech@vinhbao.edu.vn",
    dob: "20/11/2009",
    address: "Huyện Vĩnh Bảo, Hải Phòng",
    facebook: "https://facebook.com/vanky.tech",
    points: 1390,
    status: "Active"
  },
  {
    id: "vmc-002",
    memberCode: "VMC-1102",
    username: "mai.nh",
    isFirstLogin: true,
    name: "Nguyễn Hoàng Mai",
    class: "11A3",
    role: "lead",
    roleTitle: "Trưởng Ban Nội Dung - Phát Thanh",
    department: "content_radio",
    deptName: "Ban Nội Dung - Phát Thanh",
    term: "Gen 6",
    termName: "Gen 6",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    phone: "0981 *** ****",
    email: "hoangmai.content@vinhbao.edu.vn",
    dob: "12/08/2009",
    address: "Huyện Vĩnh Bảo, Hải Phòng",
    facebook: "https://facebook.com/hoangmai.vmc",
    points: 950,
    status: "Active"
  },
  {
    id: "vmc-003",
    memberCode: "VMC-1204",
    username: "quan.tm",
    isFirstLogin: true,
    name: "Trần Minh Quân",
    class: "12A4",
    role: "lead",
    roleTitle: "Trưởng Ban Sản Xuất Media",
    department: "production",
    deptName: "Ban Sản Xuất",
    term: "Gen 6",
    termName: "Gen 6",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    phone: "0977 *** ****",
    email: "minhquan.media@vinhbao.edu.vn",
    dob: "05/03/2008",
    address: "Huyện Vĩnh Bảo, Hải Phòng",
    facebook: "https://facebook.com/minhquan.vmc",
    points: 1100,
    status: "Active"
  },
  {
    id: "vmc-004",
    memberCode: "VMC-1001",
    username: "chi.pl",
    isFirstLogin: true,
    name: "Phạm Linh Chi",
    class: "10A1",
    role: "member",
    roleTitle: "Thành Viên Ban Nội Dung",
    department: "content_radio",
    deptName: "Ban Nội Dung - Phát Thanh",
    term: "Gen 6",
    termName: "Gen 6",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    phone: "0936 *** ****",
    email: "linhchi.pr@vinhbao.edu.vn",
    dob: "18/09/2010",
    address: "Huyện Vĩnh Bảo, Hải Phòng",
    facebook: "https://facebook.com/linhchi.vmc",
    points: 620,
    status: "Active"
  },

  // Gen 5
  {
    id: "vmc-old-2401",
    memberCode: "VMC-K24-01",
    username: "tu.nv",
    isFirstLogin: false,
    name: "Nguyễn Anh Tú",
    class: "Cựu 12A1",
    role: "alumni",
    roleTitle: "Cựu Chủ Nhiệm CLB (Gen 5)",
    department: "bcn",
    deptName: "Ban Chủ Nhiệm",
    term: "Gen 5",
    termName: "Gen 5",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    phone: "0915 *** ****",
    email: "anhtu.k24@gmail.com",
    dob: "10/02/2007",
    address: "Hải Phòng",
    facebook: "https://facebook.com/anhtu.alumni",
    points: 3500,
    status: "Active"
  },
  {
    id: "vmc-old-2402",
    memberCode: "VMC-K24-02",
    username: "huyen.tt",
    isFirstLogin: false,
    name: "Trần Thu Huyền",
    class: "Cựu 12A3",
    role: "alumni",
    roleTitle: "Cựu Trưởng Ban Sản Xuất (Gen 5)",
    department: "production",
    deptName: "Ban Sản Xuất",
    term: "Gen 5",
    termName: "Gen 5",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    phone: "0982 *** ****",
    email: "thuhuyen.vmc24@gmail.com",
    dob: "25/06/2007",
    address: "Hải Phòng",
    facebook: "https://facebook.com/thuhuyen.vbc",
    points: 2800,
    status: "Active"
  },

  // Gen 4
  {
    id: "vmc-old-2301",
    memberCode: "VMC-K23-01",
    username: "duy.lh",
    isFirstLogin: false,
    name: "Lê Hoàng Duy",
    class: "Cựu 12A1",
    role: "alumni",
    roleTitle: "Cựu Chủ Nhiệm CLB (Gen 4)",
    department: "bcn",
    deptName: "Ban Chủ Nhiệm",
    term: "Gen 4",
    termName: "Gen 4",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    phone: "0904 *** ****",
    email: "hoangduy.le@gmail.com",
    dob: "08/11/2006",
    address: "Hải Phòng",
    facebook: "https://facebook.com/hoangduy.vmc",
    points: 4200,
    status: "Active"
  },

  // Gen 1 (Khóa Sáng Lập)
  {
    id: "vmc-old-2201",
    memberCode: "VMC-FOUNDER-01",
    username: "son.nt",
    isFirstLogin: false,
    name: "Nguyễn Thái Sơn",
    class: "Cựu 12A1",
    role: "alumni",
    roleTitle: "Trưởng Ban Sáng Lập CLB VMC (Gen 1)",
    department: "bcn",
    deptName: "Ban Chủ Nhiệm",
    term: "Gen 1",
    termName: "Gen 1",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    phone: "0912 *** ****",
    email: "thaison.founder@gmail.com",
    dob: "01/04/2005",
    address: "Hà Nội",
    facebook: "https://facebook.com/thaison.vmcfounder",
    points: 5000,
    status: "Active"
  }
];

export const MEMBER_RESOURCES = [
  {
    id: "res-01",
    name: "Bộ Lightroom Presets Tone Màu Cinematic VMC School 2026",
    category: "Preset",
    department: "production",
    deptName: "Ban Sản Xuất",
    type: ".XMP / .DNG",
    size: "45 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Ban Sản Xuất Media"
  },
  {
    id: "res-02",
    name: "Template Poster PSD Khai Giảng & Sự Kiện Trường (Chuẩn Khung 4:5)",
    category: "Template PSD",
    department: "production",
    deptName: "Ban Sản Xuất",
    type: ".PSD",
    size: "185 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Ban Sản Xuất Media"
  },
  {
    id: "res-03",
    name: "Kho Sound Effects (SFX) & Nhạc Nền Dựng Video Highlight",
    category: "Audio",
    department: "content_radio",
    deptName: "Ban Nội Dung - Phát Thanh",
    type: ".WAV / .MP3",
    size: "320 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Ban Nội Dung - Phát Thanh"
  },
  {
    id: "res-04",
    name: "Mẫu Kịch Bản Phát Thanh Giờ Ra Chơi & Bản Tin VMC News",
    category: "Kịch Bản",
    department: "content_radio",
    deptName: "Ban Nội Dung - Phát Thanh",
    type: ".DOCX",
    size: "1.5 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Ban Nội Dung - Phát Thanh"
  },
  {
    id: "res-05",
    name: "Bộ Vector Logo & Icon Khai Thác Truyền Thông CLB VMC (SVG / PNG)",
    category: "Design System",
    department: "bcn",
    deptName: "Ban Chủ Nhiệm",
    type: ".ZIP",
    size: "25 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Tổ Kỹ Thuật VMC"
  },
  {
    id: "res-06",
    name: "Mẫu Hồ Sơ Xin Tài Trợ & Thư Mời Tài Trợ Sự Kiện VMC Gen 6",
    category: "Đối Ngoại",
    department: "hr_external",
    deptName: "Ban Đối Ngoại - Nhân Sự",
    type: ".PDF / .DOCX",
    size: "3.2 MB",
    driveUrl: "https://drive.google.com/",
    uploader: "Ban Đối Ngoại - Nhân Sự"
  }
];

export const DEFAULT_DEPARTMENT_DRIVES = [
  {
    id: "bcn",
    name: "Ban Chủ Nhiệm",
    icon: "Crown",
    color: "amber",
    lead: "Vũ Hoàng Long (12A1)",
    desc: "Kho kế hoạch chiến lược, ngân sách CLB, biên bản họp & công văn Đoàn trường",
    driveUrl: "https://drive.google.com/drive/folders/vmc-bcn-official"
  },
  {
    id: "content_radio",
    name: "Ban Nội Dung - Phát Thanh",
    icon: "Mic",
    color: "emerald",
    lead: "Nguyễn Hoàng Mai (11A3)",
    desc: "Kho kịch bản phát thanh giờ ra chơi, bài viết Fanpage & bản tin VMC News",
    driveUrl: "https://drive.google.com/drive/folders/vmc-content-radio"
  },
  {
    id: "production",
    name: "Ban Sản Xuất",
    icon: "Film",
    color: "purple",
    lead: "Trần Minh Quân (12A4)",
    desc: "Kho ảnh raw sự kiện, video highlight, Lightroom Presets & Template PSD",
    driveUrl: "https://drive.google.com/drive/folders/vmc-media-production"
  },
  {
    id: "hr_external",
    name: "Ban Đối Ngoại - Nhân Sự",
    icon: "Users",
    color: "cyan",
    lead: "Nguyễn Văn Kỹ (11A2)",
    desc: "Kho hồ sơ tài trợ, danh sách nhân sự VMC, điểm danh & dữ liệu kỹ thuật portal",
    driveUrl: "https://drive.google.com/drive/folders/vmc-hr-external"
  }
];
