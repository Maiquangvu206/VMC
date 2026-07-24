import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function init() {
  try {
    console.log('⚡ Đang khởi chạy cập nhật CSDL MySQL (phpMyAdmin)...');

    // 1. Members
    console.log('1️⃣ Cập nhật bảng Members...');
    await queryDatabase('ALTER TABLE Members MODIFY COLUMN avatar_url LONGTEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Members ADD COLUMN milestones LONGTEXT').catch(() => {});

    // 2. Member_Milestones
    console.log('2️⃣ Khởi tạo bảng Member_Milestones...');
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

    // 3. Generations
    console.log('3️⃣ Khởi tạo bảng Generations...');
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
        `INSERT IGNORE INTO Generations (id, name, years, description) VALUES (?, ?, ?, ?)`,
        [g.id, g.name, g.years, g.description]
      ).catch(() => {});
    }

    // 4. User_Sessions
    console.log('4️⃣ Khởi tạo bảng User_Sessions...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS User_Sessions (
        id VARCHAR(100) PRIMARY KEY,
        member_id VARCHAR(100) NOT NULL,
        username VARCHAR(100),
        name VARCHAR(255),
        role_title VARCHAR(100),
        ip_address VARCHAR(100),
        user_agent TEXT,
        device_type VARCHAR(50),
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active TINYINT DEFAULT 1,
        logout_reason VARCHAR(50) DEFAULT NULL
      )
    `);
    await queryDatabase('ALTER TABLE User_Sessions ADD COLUMN logout_reason VARCHAR(50) DEFAULT NULL').catch(() => {});

    // 5. Birthday_Assignments (Cập nhật các cột mới)
    console.log('5️⃣ Khởi tạo các cột mới cho Birthday_Assignments...');
    await queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN submissions LONGTEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN excuse_reason TEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN excuse_status VARCHAR(50) DEFAULT "none"').catch(() => {});
    await queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN is_penalized TINYINT DEFAULT 0').catch(() => {});
    await queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN wishes_template TEXT').catch(() => {});

    // 5.1. Monthly_Birthday_Config
    console.log('5️⃣.1️⃣ Khởi tạo bảng Monthly_Birthday_Config...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Monthly_Birthday_Config (
        id VARCHAR(50) PRIMARY KEY,
        config_month INT NOT NULL,
        config_year INT NOT NULL,
        wish_template TEXT,
        card_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_month_year (config_month, config_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `).catch(() => {});

    // 6. Resources
    console.log('6️⃣ Khởi tạo bảng Resources...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Resources (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        link TEXT,
        uploader_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Department_Drives
    console.log('7️⃣ Khởi tạo bảng Department_Drives...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Department_Drives (
        id VARCHAR(100) PRIMARY KEY,
        dept_name VARCHAR(100) NOT NULL UNIQUE,
        drive_link TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    const defaultDrives = [
      { id: 'drive-bcn', dept_name: 'Ban Chủ Nhiệm', drive_link: 'https://drive.google.com' },
      { id: 'drive-cv', dept_name: 'Ban Cố Vấn', drive_link: 'https://drive.google.com' },
      { id: 'drive-dnns', dept_name: 'Ban Đối Ngoại - Nhân Sự', drive_link: 'https://drive.google.com' },
      { id: 'drive-sx', dept_name: 'Ban Sản Xuất Media', drive_link: 'https://drive.google.com' },
      { id: 'drive-ndpt', dept_name: 'Ban Nội Dung - Phát Thanh', drive_link: 'https://drive.google.com' }
    ];
    for (const d of defaultDrives) {
      await queryDatabase(
        'INSERT IGNORE INTO Department_Drives (id, dept_name, drive_link) VALUES (?, ?, ?)',
        [d.id, d.dept_name, d.drive_link]
      ).catch(() => {});
    }

    // 8. Attendance_Records
    console.log('8️⃣ Khởi tạo bảng Attendance_Records...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Attendance_Records (
        id VARCHAR(100) PRIMARY KEY,
        session_name VARCHAR(255),
        record_date VARCHAR(50),
        present_members LONGTEXT,
        status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8.1. Meetings
    console.log('8️⃣.1️⃣ Khởi tạo bảng Meetings...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Meetings (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        meeting_date VARCHAR(50),
        meeting_time VARCHAR(50),
        attendance_taker_id VARCHAR(100),
        minute_taker_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        minutes_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8.2. Meeting_Attendance
    console.log('8️⃣.2️⃣ Khởi tạo bảng Meeting_Attendance...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Meeting_Attendance (
        meeting_id VARCHAR(100) NOT NULL,
        member_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (meeting_id, member_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Finances
    console.log('9️⃣ Khởi tạo các cột mới cho Finances...');
    await queryDatabase('ALTER TABLE Finances ADD COLUMN status VARCHAR(50) DEFAULT "approved"').catch(() => {});

    // 10. Recruitment Module Tables
    console.log('🔟 Khởi tạo bảng Recruitment_Seasons...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Recruitment_Seasons (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quota INT DEFAULT 0,
        department VARCHAR(100),
        scoring_type TEXT,
        interviewer_ids TEXT,
        is_active TINYINT DEFAULT 0,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('🔟.1️⃣ Khởi tạo bảng Recruitment_Criteria...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Recruitment_Criteria (
        id VARCHAR(100) PRIMARY KEY,
        season_id VARCHAR(100) NOT NULL,
        criteria_name VARCHAR(255) NOT NULL,
        max_score INT DEFAULT 10,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('🔟.2️⃣ Khởi tạo bảng Recruitment_Candidates...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Recruitment_Candidates (
        id VARCHAR(100) PRIMARY KEY,
        season_id VARCHAR(100) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        class_name VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        desired_dept VARCHAR(100),
        interviewer_id VARCHAR(100),
        interviewer_ids TEXT,
        teamwork_scorer_ids TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('🔟.3️⃣ Khởi tạo bảng Recruitment_Scores...');
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS Recruitment_Scores (
        id VARCHAR(100) PRIMARY KEY,
        season_id VARCHAR(100) NOT NULL,
        candidate_id VARCHAR(100) NOT NULL,
        interviewer_id VARCHAR(100) NOT NULL,
        criteria_id VARCHAR(100) NOT NULL,
        score DECIMAL(5,2) DEFAULT 0,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add columns if they don't exist (for existing tables)
    await queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN interviewer_ids TEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN department VARCHAR(100)').catch(() => {});
    await queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN scoring_type TEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Recruitment_Candidates ADD COLUMN interviewer_ids TEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Recruitment_Candidates ADD COLUMN teamwork_scorer_ids TEXT').catch(() => {});
    await queryDatabase('ALTER TABLE Recruitment_Scores ADD COLUMN comments TEXT').catch(() => {});

    // Tạo file SQL Dump trọn bộ để Import trực tiếp vào phpMyAdmin nếu muốn
    const sqlDumpContent = `-- ============================================================
-- VMC PORTAL - DATABASE SCHEMA FOR PHPMYADMIN / MYSQL
-- Generated at: ${new Date().toISOString()}
-- ============================================================

CREATE TABLE IF NOT EXISTS Members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_code VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  role_title VARCHAR(100) DEFAULT 'Thành Viên VMC',
  class_name VARCHAR(50),
  department VARCHAR(100),
  term VARCHAR(50),
  avatar_url LONGTEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  dob VARCHAR(50),
  address TEXT,
  facebook TEXT,
  points INT DEFAULT 0,
  is_first_login BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'Active',
  milestones LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Member_Milestones (
  id VARCHAR(100) PRIMARY KEY,
  member_id VARCHAR(100) NOT NULL,
  date VARCHAR(50),
  title TEXT,
  badge_text VARCHAR(100),
  badge_style VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Generations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  years VARCHAR(100),
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO Generations (id, name, years, description) VALUES
('gen-6', 'Gen 6', '2025-2026', '✨ Gen 6 (2025 - 2026)'),
('gen-5', 'Gen 5', '2024-2025', '🎓 Gen 5 (2024 - 2025)'),
('gen-4', 'Gen 4', '2023-2024', '🏆 Gen 4 (2023 - 2024)'),
('gen-3', 'Gen 3', '2022-2023', '👑 Gen 3 (2022 - 2023)'),
('gen-2', 'Gen 2', '2021-2022', '🚀 Gen 2 (2021 - 2022)'),
('gen-1', 'Gen 1', '2020-2021', '🌟 Gen 1 (2020 - 2021)');

CREATE TABLE IF NOT EXISTS User_Sessions (
  id VARCHAR(100) PRIMARY KEY,
  member_id VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  name VARCHAR(255),
  role_title VARCHAR(100),
  ip_address VARCHAR(100),
  user_agent TEXT,
  device_type VARCHAR(50),
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Birthday_Assignments (
  id VARCHAR(100) PRIMARY KEY,
  assign_month INT NOT NULL,
  assign_year INT NOT NULL,
  member_id VARCHAR(100) NOT NULL,
  link_image TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  submissions LONGTEXT,
  excuse_reason TEXT,
  excuse_status VARCHAR(50) DEFAULT 'none',
  is_penalized TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Resources (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  link TEXT,
  uploader_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Department_Drives (
  id VARCHAR(100) PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL UNIQUE,
  drive_link TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO Department_Drives (id, dept_name, drive_link) VALUES
('drive-bcn', 'Ban Chủ Nhiệm', 'https://drive.google.com'),
('drive-cv', 'Ban Cố Vấn', 'https://drive.google.com'),
('drive-dnns', 'Ban Đối Ngoại - Nhân Sự', 'https://drive.google.com'),
('drive-sx', 'Ban Sản Xuất Media', 'https://drive.google.com'),
('drive-ndpt', 'Ban Nội Dung - Phát Thanh', 'https://drive.google.com');

CREATE TABLE IF NOT EXISTS Attendance_Records (
  id VARCHAR(100) PRIMARY KEY,
  session_name VARCHAR(255),
  record_date VARCHAR(50),
  present_members LONGTEXT,
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Meetings (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  meeting_date VARCHAR(50),
  meeting_time VARCHAR(50),
  attendance_taker_id VARCHAR(100),
  minute_taker_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  minutes_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Meeting_Attendance (
  meeting_id VARCHAR(100) NOT NULL,
  member_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (meeting_id, member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Recruitment_Seasons (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quota INT DEFAULT 0,
  department VARCHAR(100),
  scoring_type TEXT,
  interviewer_ids TEXT,
  is_active TINYINT DEFAULT 0,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Recruitment_Criteria (
  id VARCHAR(100) PRIMARY KEY,
  season_id VARCHAR(100) NOT NULL,
  criteria_name VARCHAR(255) NOT NULL,
  max_score INT DEFAULT 10,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Recruitment_Candidates (
  id VARCHAR(100) PRIMARY KEY,
  season_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  desired_dept VARCHAR(100),
  interviewer_id VARCHAR(100),
  interviewer_ids TEXT,
  teamwork_scorer_ids TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Recruitment_Scores (
  id VARCHAR(100) PRIMARY KEY,
  season_id VARCHAR(100) NOT NULL,
  candidate_id VARCHAR(100) NOT NULL,
  interviewer_id VARCHAR(100) NOT NULL,
  criteria_id VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) DEFAULT 0,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const sqlFilePath = path.join(__dirname, 'vmc_portal_schema.sql');
    fs.writeFileSync(sqlFilePath, sqlDumpContent, 'utf-8');
    console.log(`📄 Đã tạo tệp SQL Dump thành công tại: ${sqlFilePath}`);

    console.log('🎉 TẤT CẢ BẢNG CSDL PHPMYADMIN ĐÃ ĐƯỢC CẬP NHẬT VÀ ĐỒNG BỘ THÀNH CÔNG!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo CSDL:', err.message);
    process.exit(1);
  }
}

init();
