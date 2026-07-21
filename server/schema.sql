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
(1, 'ADMIN', 'admin', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Vũ Hoàng Long', 'admin', 'Chủ Nhiệm CLB (Super Admin)', '12A1', 'Ban Chủ Nhiệm', 'Gen 6', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '0981 234 567', 'hoanglong.vmc@vinhbao.edu.vn', '15/08/2008', 'Khu 3, Thị trấn Vĩnh Bảo, Hải Phòng', 2000, FALSE, 'Active'),
(2, 'VMC-TECH-01', 'ky.tech', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Văn Kỹ', 'tech_admin', 'Tổ Trưởng Kỹ Thuật', '11A2', 'Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)', 'Gen 6', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400', '0988 776 655', 'vanky.tech@vinhbao.edu.vn', '20/11/2009', 'Xã Tân Liên, Vĩnh Bảo, Hải Phòng', 1390, FALSE, 'Active'),
(3, 'VMC-1102', 'mai.nh', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Hoàng Mai', 'lead', 'Trưởng Ban Nội Dung - Phát Thanh', '11A3', 'Ban Nội Dung - Phát Thanh', 'Gen 6', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', '0981 123 456', 'hoangmai.content@vinhbao.edu.vn', '12/08/2009', 'Thị trấn Vĩnh Bảo, Hải Phòng', 950, TRUE, 'Active'),
(4, 'VMC-1204', 'quan.tm', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Trần Minh Quân', 'lead', 'Trưởng Ban Sản Xuất Media', '12A4', 'Ban Sản Xuất Media', 'Gen 6', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', '0977 888 999', 'minhquan.media@vinhbao.edu.vn', '05/03/2008', 'Huyện Vĩnh Bảo, Hải Phòng', 1100, TRUE, 'Active'),
(5, 'VMC-1001', 'chi.pl', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Phạm Linh Chi', 'member', 'Thành Viên Ban Nội Dung', '10A1', 'Ban Nội Dung - Phát Thanh', 'Gen 6', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', '0936 111 222', 'linhchi.pr@vinhbao.edu.vn', '18/09/2010', 'Huyện Vĩnh Bảo, Hải Phòng', 620, TRUE, 'Active'),
(6, 'VMC-K24-01', 'tu.nv', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Anh Tú', 'alumni', 'Cựu Chủ Nhiệm CLB (Gen 5)', 'Cựu 12A1', 'Ban Chủ Nhiệm', 'Gen 5', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', '0915 333 444', 'anhtu.k24@gmail.com', '10/02/2007', 'Hải Phòng', 3500, FALSE, 'Active'),
(7, 'VMC-K24-02', 'huyen.tt', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Trần Thu Huyền', 'alumni', 'Cựu Trưởng Ban Sản Xuất (Gen 5)', 'Cựu 12A3', 'Ban Sản Xuất Media', 'Gen 5', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', '0982 555 666', 'thuhuyen.vmc24@gmail.com', '25/06/2007', 'Hải Phòng', 2800, FALSE, 'Active'),
(8, 'VMC-K23-01', 'duy.lh', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Lê Hoàng Duy', 'alumni', 'Cựu Chủ Nhiệm CLB (Gen 4)', 'Cựu 12A1', 'Ban Chủ Nhiệm', 'Gen 4', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', '0904 777 888', 'hoangduy.le@gmail.com', '08/11/2006', 'Hải Phòng', 4200, FALSE, 'Active'),
(9, 'VMC-FOUNDER-01', 'son.nt', '$2b$10$r.aK7fWJk8XyO.u9K2g.Ne3J8P9Wk2K8XyO.u9K2g.Ne3J8P9Wk2K', 'Nguyễn Thái Sơn', 'alumni', 'Trưởng Ban Sáng Lập CLB VMC (Gen 1)', 'Cựu 12A1', 'Ban Chủ Nhiệm', 'Gen 1', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', '0912 999 000', 'thaison.founder@gmail.com', '01/01/2004', 'Hải Phòng', 5000, FALSE, 'Active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role_title=VALUES(role_title), class_name=VALUES(class_name), department=VALUES(department), term=VALUES(term);
