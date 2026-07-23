-- ============================================================
-- VMC PORTAL - DATABASE SCHEMA FOR PHPMYADMIN / MYSQL
-- Generated at: 2026-07-23T06:26:31.337Z
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
