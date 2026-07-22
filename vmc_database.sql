-- ==========================================
-- CƠ SỞ DỮ LIỆU CHÍNH THỨC CHO VMC PORTAL
-- Hệ thống toàn diện: Nhân sự, Công việc, Điểm danh, Kho bãi, Tài chính
-- ==========================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- 1. Bảng `Members` (Quản lý Thành viên)
-- --------------------------------------------------------
CREATE TABLE `Members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_code` varchar(50) NOT NULL UNIQUE,
  `username` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL, 
  `full_name` varchar(150) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'member', -- admin, hr, member
  `role_title` varchar(100) DEFAULT 'Thành Viên',
  `class_name` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `term` varchar(50) DEFAULT '2024-2025',
  `avatar_url` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `dob` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Members` (`member_code`, `username`, `password`, `full_name`, `role`, `role_title`, `department`, `points`, `is_first_login`, `status`) VALUES
('ADMIN', 'admin', 'admin123', 'Quản Trị Viên (Root)', 'admin', 'Super Admin', 'Ban Chủ Nhiệm', 9999, 0, 'Active');

-- --------------------------------------------------------
-- 2. Bảng `Tasks` (Quản lý Công việc)
-- --------------------------------------------------------
CREATE TABLE `Tasks` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assignee_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'todo', -- todo, doing, done
  `points_reward` int(11) DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignee_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Bảng `Equipment` (Kho thiết bị)
-- --------------------------------------------------------
CREATE TABLE `Equipment` (
  `id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `condition_status` varchar(100) DEFAULT 'Tốt',
  `status` varchar(50) NOT NULL DEFAULT 'available', -- available, borrowed
  `borrower_id` int(11) DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`borrower_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Equipment` (`id`, `code`, `name`, `category`, `condition_status`, `status`) VALUES
('eq-1', 'VMC-CAM-01', 'Máy ảnh Sony A7III', 'Camera', 'Tốt', 'available'),
('eq-2', 'VMC-CAM-02', 'Máy ảnh Canon 5D Mark IV', 'Camera', 'Tốt', 'available'),
('eq-3', 'VMC-LENS-01', 'Lens Sony 24-70 f2.8 GM', 'Ống Kính', 'Tốt', 'available'),
('eq-4', 'VMC-GIM-01', 'Gimbal DJI RS3', 'Gimbal', 'Bình thường', 'available'),
('eq-5', 'VMC-MIC-01', 'Micro Rode Wireless GO II', 'Âm Thanh', 'Tốt', 'available');

-- --------------------------------------------------------
-- 4. Bảng `Fanpage_Drafts` (Kịch bản & Bài đăng)
-- --------------------------------------------------------
CREATE TABLE `Fanpage_Drafts` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content_link` varchar(255) NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending', -- pending, approved, published
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Bảng `Meetings` & `Meeting_Attendance` (Cuộc họp & Điểm danh)
-- --------------------------------------------------------
CREATE TABLE `Meetings` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `meeting_date` date NOT NULL,
  `meeting_time` time NOT NULL,
  `attendance_taker_id` int(11) DEFAULT NULL,
  `minute_taker_id` int(11) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending', -- pending, pending_minutes, completed
  `minutes_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`attendance_taker_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`minute_taker_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Meeting_Attendance` (
  `meeting_id` varchar(50) NOT NULL,
  `member_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL, -- present, late, absent
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`meeting_id`, `member_id`),
  FOREIGN KEY (`meeting_id`) REFERENCES `Meetings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`member_id`) REFERENCES `Members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Bảng `Birthday_Assignments` (Phân công trực sinh nhật)
-- --------------------------------------------------------
CREATE TABLE `Birthday_Assignments` (
  `id` varchar(50) NOT NULL,
  `assign_month` int(2) NOT NULL,
  `assign_year` int(4) NOT NULL,
  `member_id` int(11) NOT NULL,
  `link_image` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending', -- pending, completed
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`member_id`) REFERENCES `Members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Bảng `Finances` (Quản lý Thu Chi Quỹ CLB)
-- --------------------------------------------------------
CREATE TABLE `Finances` (
  `id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL, -- income, expense
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `record_date` date NOT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recorded_by`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Bảng `Internal_Announcements` (Thông báo nội bộ)
-- --------------------------------------------------------
CREATE TABLE `Internal_Announcements` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `Members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
