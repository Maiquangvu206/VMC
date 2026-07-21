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
      count: 0, 
      lead: "Chủ Nhiệm CLB",
      desc: "Điều hành chung toàn bộ hoạt động CLB, duyệt bài đăng Fanpage, duyệt ngân sách & chỉ đạo sự kiện."
    },
    { 
      id: "content_radio", 
      name: "Ban Nội Dung - Phát Thanh", 
      icon: "Mic",
      count: 0, 
      lead: "Trưởng Ban Nội Dung",
      desc: "Phụ trách biên tập bài đăng Fanpage, viết kịch bản phát thanh giờ ra chơi, bản tin VMC News & biên tập báo chí."
    },
    { 
      id: "production", 
      name: "Ban Sản Xuất", 
      icon: "Film",
      count: 0, 
      lead: "Trưởng Ban Sản Xuất",
      desc: "Phụ trách quay phim, chụp ảnh sự kiện trường, dựng video highlight, hậu kỳ âm thanh & thiết kế đồ họa."
    },
    { 
      id: "hr_external", 
      name: "Ban Đối Ngoại - Nhân Sự", 
      icon: "Users",
      count: 0, 
      lead: "Trưởng Ban Đối Ngoại - Nhân Sự",
      desc: "Quản lý nhân sự, điểm danh sinh hoạt, quản trị hệ thống kỹ thuật portal VMC và xin tài trợ sự kiện."
    }
  ]
};

// Pure Dynamic Data Tables (Loaded exclusively from MySQL Database)
export const TASKS_LIST = [];
export const EQUIPMENT_LIST = [];
export const FANPAGE_DRAFTS = [];
export const INTERNAL_ANNOUNCEMENTS = [];
export const MEMBER_ACCOUNTS = [];
export const MEMBER_RESOURCES = [];
export const DEFAULT_DEPARTMENT_DRIVES = [];
