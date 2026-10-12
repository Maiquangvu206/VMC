

import { getCachedData, setCachedData, CACHE_TTL } from './cacheService';

export const DEFAULT_CLUB_INFO = {
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
    },
    { 
      id: "advisory", 
      name: "Ban Cố Vấn", 
      icon: "Award",
      count: 0, 
      lead: "Cố Vấn CLB",
      desc: "Cố vấn định hướng chiến lược, hỗ trợ chuyên môn, tư vấn phát triển và giám sát hoạt động cho CLB VMC."
    }
  ]
};

const DB_STORAGE_KEY = 'VMC_PORTAL_DYNAMIC_DATABASE_V3';

try {
  localStorage.removeItem('VMC_PORTAL_DYNAMIC_DATABASE_V2');
  localStorage.removeItem('VMC_PORTAL_DYNAMIC_DATABASE_V1');
} catch (e) {}

// Initial Database Seed Structure (Được nạp tức thì 0ms từ Cache nếu đã truy cập trước đó)
export const getInitialDatabase = () => ({
  clubInfo: getCachedData('club_info') || DEFAULT_CLUB_INFO,
  members: getCachedData('members') || [],
  tasks: [],
  equipment: [],
  drafts: [],
  announcements: [],
  resources: getCachedData('resources') || [],
  departmentDrives: getCachedData('department-drives') || [],
  generations: getCachedData('generations') || [],
  attendanceRecords: [],
  meetings: [],
  birthdayAssignments: [],
  lastUpdated: new Date().toISOString()
});

// Load Database from Persistence
export const loadDatabaseFromStorage = () => {
  return getInitialDatabase();
};

// Save Database to Persistence Cache
export const saveDatabaseToStorage = (db) => {
  if (!db) return;
  if (Array.isArray(db.members) && db.members.length > 0) {
    setCachedData('members', db.members, CACHE_TTL.MEMBERS);
  }
  if (Array.isArray(db.generations) && db.generations.length > 0) {
    setCachedData('generations', db.generations, CACHE_TTL.GENERATIONS);
  }
  if (Array.isArray(db.departmentDrives) && db.departmentDrives.length > 0) {
    setCachedData('department-drives', db.departmentDrives, CACHE_TTL.DEPARTMENT_DRIVES);
  }
  if (Array.isArray(db.resources) && db.resources.length > 0) {
    setCachedData('resources', db.resources, CACHE_TTL.RESOURCES);
  }
  if (db.clubInfo) {
    setCachedData('club_info', db.clubInfo, CACHE_TTL.SYSTEM_SETTINGS);
  }
};

// Reset Database to Factory Seed
export const resetDatabaseToDefault = () => {
  const initialDb = getInitialDatabase();
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDb));
  } catch (e) {}
  return initialDb;
};

// Export Database as JSON Backup File
export const exportDatabaseJSON = () => {
  const db = loadDatabaseFromStorage();
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `VMC_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Import Database from JSON Backup File
export const importDatabaseJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedDb = JSON.parse(e.target.result);
        if (!parsedDb.members || !parsedDb.tasks || !parsedDb.equipment) {
          throw new Error('Cấu trúc file CSDL không đúng định dạng VMC!');
        }
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsedDb));
        resolve(parsedDb);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};
