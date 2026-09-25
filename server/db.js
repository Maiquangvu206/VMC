import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Đảm bảo .env được load đúng từ thư mục server/ dù PM2 chạy từ thư mục gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

// Cấu hình Connection Pool kết nối CSDL SQL với múi giờ Việt Nam (UTC+7)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'vmc_admin',
  password: process.env.DB_PASSWORD || 'VMC2026@VinhBao',
  database: process.env.DB_NAME || 'vmc_portal',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  dateStrings: true
};

let pool;
let isTimeZoneSet = false;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Đã kết nối thành công tới CSDL SQL (Múi giờ UTC+7):', dbConfig.host, '/', dbConfig.database);
} catch (error) {
  console.error('❌ Lỗi tạo pool CSDL SQL:', error.message);
}

export const getVietnamTimeString = (dateObj = new Date()) => {
  // Convert JS Date to Vietnam UTC+7 string ISO format
  const vnOffset = 7 * 60 * 60 * 1000;
  const vnTime = new Date(dateObj.getTime() + vnOffset);
  return vnTime.toISOString().replace('T', ' ').slice(0, 19);
};

export const queryDatabase = async (sql, params = []) => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    if (!isTimeZoneSet) {
      await pool.execute("SET time_zone = '+07:00'").catch(() => {});
      isTimeZoneSet = true;
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Lỗi truy vấn CSDL SQL:', error.message);
    throw error;
  }
};

export default pool;
