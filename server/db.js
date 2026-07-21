import mysql from 'mysql2/promise';

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
    // Tự động thử lại giữa localhost và 192.168.10.106
    const altHost = dbConfig.host === 'localhost' ? '192.168.10.106' : 'localhost';
    try {
      const altPool = mysql.createPool({ ...dbConfig, host: altHost });
      const [rows] = await altPool.execute(sql, params);
      return rows;
    } catch (altErr) {
      throw error;
    }
  }
};

export default pool;
