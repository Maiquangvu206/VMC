-- SQL Script Khởi Tạo Bảng Database Thật Cho Bảng Members (MySQL / PostgreSQL)
CREATE TABLE IF NOT EXISTS Members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avatar_url VARCHAR(500) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    member_code VARCHAR(50) NOT NULL UNIQUE,
    class_name VARCHAR(50) NOT NULL,
    department VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    dob VARCHAR(20),
    email VARCHAR(150),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chèn Dữ Liệu Thần Thành Viên CLB VMC THPT Vĩnh Bảo
INSERT INTO Members (id, avatar_url, full_name, role, member_code, class_name, department, phone, dob, email, status) VALUES
(1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'Vũ Hoàng Long', 'Chủ Nhiệm CLB', 'VMC-BCN-01', '12A1', 'Ban Chủ Nhiệm', '0988 776 655', '15/05/2008', 'hoanglong.vmc@vinhbao.edu.vn', 'Active'),
(2, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', 'Nguyễn Văn Kỹ', 'Tổ Trưởng Kỹ Thuật', 'VMC-TECH-01', '11A2', 'Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)', '0912 345 678', '20/11/2009', 'vanky.tech@vinhbao.edu.vn', 'Active'),
(3, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', 'Nguyễn Hoàng Mai', 'Trưởng Ban Nội Dung', 'VMC-ND-01', '11A3', 'Ban Nội Dung - Phát Thanh', '0981 123 456', '12/08/2009', 'hoangmai.content@vinhbao.edu.vn', 'Active'),
(4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 'Trần Minh Quân', 'Trưởng Ban Sản Xuất', 'VMC-SX-01', '12A4', 'Ban Sản Xuất Media', '0977 888 999', '05/03/2008', 'minhquan.media@vinhbao.edu.vn', 'Active'),
(5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', 'Phạm Linh Chi', 'Phó Ban Truyền Thông', 'VMC-TT-02', '10A1', 'Ban Truyền Thông', '0936 555 444', '18/09/2010', 'linhchi.pr@vinhbao.edu.vn', 'Active'),
(6, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 'Đặng Quốc Huy', 'Thành Viên Kỹ Thuật', 'VMC-TECH-02', '10A2', 'Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)', '0904 112 233', '30/01/2010', 'quochuy.tech@vinhbao.edu.vn', 'Active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
