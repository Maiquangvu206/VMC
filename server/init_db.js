import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function init() {
  try {
    console.log('⚡ Running MySQL Schema Updates...');
    await queryDatabase('ALTER TABLE Members MODIFY COLUMN avatar_url LONGTEXT');
    try {
      await queryDatabase('ALTER TABLE Members ADD COLUMN milestones LONGTEXT');
    } catch (e) {
      console.log('ℹ️ Cột milestones đã tồn tại trong Members.');
    }
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Member_Milestones (
        id VARCHAR(100) PRIMARY KEY,
        member_id VARCHAR(100) NOT NULL,
        date VARCHAR(50),
        title TEXT,
        badge_text VARCHAR(100),
        badge_style VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Bảng Member_Milestones đã được tạo thành công trong phpMyAdmin!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo CSDL:', err.message);
    process.exit(1);
  }
}

init();
