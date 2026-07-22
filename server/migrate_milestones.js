import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function migrate() {
  try {
    console.log('🚀 Đang chuyển đổi dữ liệu milestones từ bảng Members sang Member_Milestones...');
    const members = await queryDatabase('SELECT id, member_code, department, milestones FROM Members');
    let insertedCount = 0;

    for (const m of members) {
      let msList = [];
      if (m.milestones) {
        try {
          msList = typeof m.milestones === 'string' ? JSON.parse(m.milestones) : m.milestones;
        } catch (e) {
          msList = [];
        }
      }

      if (!Array.isArray(msList) || msList.length === 0) {
        msList = [
          {
            id: 'm-init-1-' + m.id,
            date: '20/09/2024',
            title: `Bắt đầu làm thành viên VMC (${m.department || 'Ban Chuyên Môn'})`,
            badgeText: '[Gia nhập]',
            badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }
        ];
      }

      for (const ms of msList) {
        const msId = ms.id || ('m-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
        await queryDatabase(
          `INSERT INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE date = VALUES(date), title = VALUES(title), badge_text = VALUES(badge_text), badge_style = VALUES(badge_style)`,
          [
            msId,
            String(m.id),
            ms.date || new Date().toLocaleDateString('vi-VN'),
            ms.title || 'Cột mốc mới',
            ms.badgeText || ms.badge_text || '[Cột mốc]',
            ms.badgeStyle || ms.badge_style || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          ]
        );
        insertedCount++;
      }
    }

    console.log(`✅ Đã đẩy thành công ${insertedCount} cột mốc lịch sử vào bảng Member_Milestones trong MySQL!`);
    
    const finalTable = await queryDatabase('SELECT * FROM Member_Milestones');
    console.log('=== KẾT QUẢ BẢNG Member_Milestones SAU KHI ĐẨY ===');
    console.log(JSON.stringify(finalTable, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi migrate:', err.message);
    process.exit(1);
  }
}

migrate();
