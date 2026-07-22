import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function initTable() {
  try {
    console.log('🚀 Đang khởi tạo bảng Generations trong CSDL MySQL...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Generations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        years VARCHAR(100),
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const defaultGens = [
      { id: 'gen-6', name: 'Gen 6', years: '2025-2026', description: '✨ Gen 6 (2025 - 2026)' },
      { id: 'gen-5', name: 'Gen 5', years: '2024-2025', description: '🎓 Gen 5 (2024 - 2025)' },
      { id: 'gen-4', name: 'Gen 4', years: '2023-2024', description: '🏆 Gen 4 (2023 - 2024)' },
      { id: 'gen-3', name: 'Gen 3', years: '2022-2023', description: '👑 Gen 3 (2022 - 2023)' },
      { id: 'gen-2', name: 'Gen 2', years: '2021-2022', description: '🚀 Gen 2 (2021 - 2022)' },
      { id: 'gen-1', name: 'Gen 1', years: '2020-2021', description: '🌟 Gen 1 (2020 - 2021)' }
    ];

    for (const g of defaultGens) {
      await queryDatabase(
        `INSERT INTO Generations (id, name, years, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), years = VALUES(years), description = VALUES(description)`,
        [g.id, g.name, g.years, g.description]
      );
    }

    console.log('✅ Đã khởi tạo và nạp thành công bảng Generations vào CSDL MySQL!');

    const tableData = await queryDatabase('SELECT * FROM Generations ORDER BY id DESC');
    console.log('=== KẾT QUẢ BẢNG GENERATIONS TRONG MYSQL ===');
    console.log(JSON.stringify(tableData, null, 2));

    process.exit(0);
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
    process.exit(1);
  }
}

initTable();
