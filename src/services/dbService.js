import { 
  CLUB_INFO, 
  TASKS_LIST, 
  EQUIPMENT_LIST, 
  FANPAGE_DRAFTS, 
  INTERNAL_ANNOUNCEMENTS, 
  MEMBER_ACCOUNTS
} from '../data/mockData';

const DB_STORAGE_KEY = 'VMC_PORTAL_DYNAMIC_DATABASE_V2';

// Initial Database Seed Structure
export const getInitialDatabase = () => ({
  clubInfo: CLUB_INFO,
  members: MEMBER_ACCOUNTS,
  tasks: TASKS_LIST,
  equipment: EQUIPMENT_LIST,
  drafts: FANPAGE_DRAFTS,
  announcements: INTERNAL_ANNOUNCEMENTS,
  lastUpdated: new Date().toISOString()
});

// Load Database from Persistence
export const loadDatabaseFromStorage = () => {
  try {
    const rawData = localStorage.getItem(DB_STORAGE_KEY);
    if (!rawData) {
      const initialDb = getInitialDatabase();
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Lỗi khi đọc Cơ sở dữ liệu động:', error);
    return getInitialDatabase();
  }
};

// Save Database to Persistence
export const saveDatabaseToStorage = (db) => {
  try {
    const dbToSave = {
      ...db,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbToSave));
  } catch (error) {
    console.error('Lỗi khi lưu Cơ sở dữ liệu động:', error);
  }
};

// Reset Database to Factory Seed
export const resetDatabaseToDefault = () => {
  const initialDb = getInitialDatabase();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDb));
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
