-- SQL Script Khởi Tạo Bảng Private Database Cho Bảng Members (MySQL / PostgreSQL)
CREATE TABLE IF NOT EXISTS Members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    role_title VARCHAR(150),
    class_name VARCHAR(50) NOT NULL,
    department VARCHAR(150) NOT NULL,
    term VARCHAR(50) DEFAULT '2025-2026',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(150),
    dob VARCHAR(20),
    address TEXT,
    facebook VARCHAR(255),
    points INT DEFAULT 100,
    is_first_login BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu thành viên mẫu mã hóa CSDL SQL Server (Private)
INSERT INTO Members (id, member_code, username, password_hash, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, points, is_first_login, status) VALUES
(1, 'ADMIN', 'admin', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Vũ Hoàng Long', 'admin', 'Chủ Nhiệm CLB (Super Admin)', '12A1', 'Ban Chủ Nhiệm', '2025-2026', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '0981 234 567', 'hoanglong.vmc@vinhbao.edu.vn', '15/08/2008', 'Khu 3, Thị trấn Vĩnh Bảo, Hải Phòng', 2000, FALSE, 'Active'),
(2, 'VMC-TECH-01', 'ky.tech', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Văn Kỹ', 'tech_admin', 'Tổ Trưởng Kỹ Thuật', '11A2', 'Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)', '2025-2026', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400', '0988 776 655', 'vanky.tech@vinhbao.edu.vn', '20/11/2009', 'Xã Tân Liên, Vĩnh Bảo, Hải Phòng', 1390, FALSE, 'Active'),
(3, 'VMC-1102', 'mai.nh', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Hoàng Mai', 'lead', 'Trưởng Ban Nội Dung - Phát Thanh', '11A3', 'Ban Nội Dung - Phát Thanh', '2025-2026', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', '0981 123 456', 'hoangmai.content@vinhbao.edu.vn', '12/08/2009', 'Thị trấn Vĩnh Bảo, Hải Phòng', 950, TRUE, 'Active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
