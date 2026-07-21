import mysql from 'mysql2/promise';

// Cấu hình Connection Pool kết nối CSDL SQL
const dbConfig = {
  host: process.env.DB_HOST || '192.168.10.106',
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
  console.log('✅ Đã kết nối thành công tới CSDL SQL:', dbConfig.database);
} catch (error) {
  console.error('❌ Lỗi kết nối CSDL SQL:', error.message);
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
    // Tự động thử lại với localhost nếu chạy trực tiếp trên Ubuntu Server
    if (dbConfig.host !== 'localhost') {
      try {
        const localPool = mysql.createPool({ ...dbConfig, host: 'localhost' });
        const [rows] = await localPool.execute(sql, params);
        return rows;
      } catch (localErr) {
        throw error;
      }
    }
    throw error;
  }
};

export default pool;
