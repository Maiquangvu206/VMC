import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Đảm bảo .env được load đúng từ thư mục server/ dù PM2 chạy từ thư mục gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

// Cấu hình Connection Pool kết nối CSDL SQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'vmc_admin',
  password: process.env.DB_PASSWORD || 'VMC2026@VinhBao',
  database: process.env.DB_NAME || 'vmc_portal',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Đã kết nối thành công tới CSDL SQL:', dbConfig.host, '/', dbConfig.database);
} catch (error) {
  console.error('❌ Lỗi tạo pool CSDL SQL:', error.message);
}

export const queryDatabase = async (sql, params = []) => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Lỗi truy vấn CSDL SQL:', error.message);
    throw error;
  }
};

export default pool;
