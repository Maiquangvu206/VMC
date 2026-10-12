# 🚀 VMC PORTAL - LARAVEL MVC & REACT SPA

Cổng thông tin quản lý nội bộ CLB Truyền Thông THPT Vĩnh Bảo (VMC).
Dự án đã được chuyển đổi hoàn toàn sang kiến trúc **Laravel 12 MVC** (Backend Controllers, Eloquent Models, Database Migrations, Console Commands, SMTP Mailer) kết hợp cùng giao diện **React 19 + Tailwind CSS + Vite** (Single Page Application).

---

## 🏗️ Kiến Trúc Hệ Thống (Laravel MVC)

### 1. Eloquent Models (`app/Models/`)
- [Member.php](file:///e:/xampp/htdocs/VMC/app/Models/Member.php) - Quản lý hồ sơ thành viên, điểm tích lũy, chức vụ, ban chuyên môn
- [MemberMilestone.php](file:///e:/xampp/htdocs/VMC/app/Models/MemberMilestone.php) - Cột mốc và huy hiệu thành viên
- [Generation.php](file:///e:/xampp/htdocs/VMC/app/Models/Generation.php) - Các thế hệ Gen (Gen 1 - Gen 6)
- [UserSession.php](file:///e:/xampp/htdocs/VMC/app/Models/UserSession.php) - Giám sát phiên đăng nhập realtime, thiết bị, IP, heartbeat
- [Task.php](file:///e:/xampp/htdocs/VMC/app/Models/Task.php) - Giao việc, hạn chót và thông báo tiến độ
- [FanpageDraft.php](file:///e:/xampp/htdocs/VMC/app/Models/FanpageDraft.php) - Bản thảo bài viết, chấm điểm tương tác Like/Share/Comment
- [Equipment.php](file:///e:/xampp/htdocs/VMC/app/Models/Equipment.php) - Quản lý thiết bị truyền thông, mượn trả
- [InternalAnnouncement.php](file:///e:/xampp/htdocs/VMC/app/Models/InternalAnnouncement.php) - Thông báo nội bộ
- [Finance.php](file:///e:/xampp/htdocs/VMC/app/Models/Finance.php) - Quản lý thu chi và quy trình duyệt kinh phí
- [Meeting.php](file:///e:/xampp/htdocs/VMC/app/Models/Meeting.php) & [MeetingAttendance.php](file:///e:/xampp/htdocs/VMC/app/Models/MeetingAttendance.php) - Họp CLB, phân công biên bản & điểm danh
- [BirthdayAssignment.php](file:///e:/xampp/htdocs/VMC/app/Models/BirthdayAssignment.php) & [MonthlyBirthdayConfig.php](file:///e:/xampp/htdocs/VMC/app/Models/MonthlyBirthdayConfig.php) - Trực mừng sinh nhật, thiệp chúc mừng, giải trình
- [BirthdayMailLog.php](file:///e:/xampp/htdocs/VMC/app/Models/BirthdayMailLog.php) & [TaskDeadlineMailLog.php](file:///e:/xampp/htdocs/VMC/app/Models/TaskDeadlineMailLog.php) - Nhật ký gửi email tự động
- [Resource.php](file:///e:/xampp/htdocs/VMC/app/Models/Resource.php) - Kho tài liệu CLB
- [DepartmentDrive.php](file:///e:/xampp/htdocs/VMC/app/Models/DepartmentDrive.php) - Google Drive các ban chuyên môn
- [AttendanceRecord.php](file:///e:/xampp/htdocs/VMC/app/Models/AttendanceRecord.php) - Điểm danh sinh hoạt định kỳ
- **Recruitment Module**:
  - [RecruitmentSeason.php](file:///e:/xampp/htdocs/VMC/app/Models/RecruitmentSeason.php) - Mùa tuyển sinh
  - [RecruitmentCriteria.php](file:///e:/xampp/htdocs/VMC/app/Models/RecruitmentCriteria.php) - Tiêu chí chấm điểm các vòng (Đơn, Phỏng vấn, Thử thách, Teamwork)
  - [RecruitmentCandidate.php](file:///e:/xampp/htdocs/VMC/app/Models/RecruitmentCandidate.php) - Hồ sơ ứng viên
  - [RecruitmentScore.php](file:///e:/xampp/htdocs/VMC/app/Models/RecruitmentScore.php) - Điểm chi tiết từ ban giám khảo
  - [RecruitmentEvaluation.php](file:///e:/xampp/htdocs/VMC/app/Models/RecruitmentEvaluation.php) - Tổng hợp điểm realtime
- [SystemSetting.php](file:///e:/xampp/htdocs/VMC/app/Models/SystemSetting.php) - Cài đặt hệ thống toàn cục

### 2. Controllers (`app/Http/Controllers/Api/`)
- [AuthController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/AuthController.php)
- [MemberController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/MemberController.php)
- [TaskController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/TaskController.php)
- [DraftController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/DraftController.php)
- [EquipmentController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/EquipmentController.php)
- [AnnouncementController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/AnnouncementController.php)
- [FinanceController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/FinanceController.php)
- [MeetingController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/MeetingController.php)
- [BirthdayController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/BirthdayController.php)
- [UserSessionController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/UserSessionController.php)
- [MilestoneController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/MilestoneController.php)
- [GenerationController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/GenerationController.php)
- [ResourceController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/ResourceController.php)
- [DepartmentDriveController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/DepartmentDriveController.php)
- [AttendanceRecordController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/AttendanceRecordController.php)
- [RecruitmentController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/RecruitmentController.php)
- [SystemSettingController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/SystemSettingController.php)
- [EmailController.php](file:///e:/xampp/htdocs/VMC/app/Http/Controllers/Api/EmailController.php)

### 3. Tác Vụ Lập Lịch Tự Động (Console Commands)
- `php artisan vmc:send-birthdays`: Tự động quét sinh nhật thành viên hàng ngày và gửi thư chúc mừng cá nhân hóa kèm thiệp.
- `php artisan vmc:send-task-reminders`: Tự động quét hạn chót nhiệm vụ đến hạn hôm nay/ngày mai và gửi email nhắc nhở.

---

## ⚡ Hướng Dẫn Khởi Chạy

### 1. Khởi động MySQL trong XAMPP
Mở **XAMPP Control Panel** và nhấn **Start** tại mục **MySQL**.

### 2. Chạy ứng dụng trong môi trường phát triển (Development)
```bash
# Khởi chạy đồng thời cả Laravel Backend (port 8000) và Vite Frontend (port 5173):
npm run dev:all

# Hoặc chạy riêng rẽ từng terminal:
# Terminal 1 - Backend:
php artisan serve --port=8000

# Terminal 2 - Frontend:
npm run dev
```

### 3. Build & Phục vụ trực tiếp qua Laravel (Production)
```bash
npm run build
```
Sau khi build, toàn bộ assets được chuyển vào thư mục `public/`. Bạn chỉ cần chạy `php artisan serve --port=8000` hoặc cấu hình VirtualHost trong Apache của XAMPP trỏ vào thư mục `public/`.
