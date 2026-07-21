import mysql from 'mysql2/promise';

// Cấu hình Connection Pool kết nối CSDL SQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
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
  if (!pool) {
    throw new Error('Chưa kết nối được CSDL SQL!');
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export default pool;
