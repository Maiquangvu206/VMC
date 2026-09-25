-- ============================================================
-- VMC PORTAL - DATABASE SCHEMA FOR PHPMYADMIN / MYSQL
-- Generated at: 2026-09-25T16:34:34.577Z
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

CREATE TABLE IF NOT EXISTS Recruitment_Evaluations (
  id VARCHAR(100) PRIMARY KEY,
  season_id VARCHAR(100) NOT NULL,
  candidate_id VARCHAR(100) NOT NULL,
  interview_code VARCHAR(100),
  interviewer_id VARCHAR(100) NOT NULL,
  round_type VARCHAR(50) NOT NULL,
  total_score DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  scores_json LONGTEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY candidate_interviewer_round (candidate_id, interviewer_id, round_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
