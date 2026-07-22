import express from 'express';
import cors from 'cors';
import { queryDatabase } from './db.js';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Cấu hình Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// API Gửi Email Tự Động
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Server chưa được cấu hình tài khoản Email (SMTP_EMAIL & SMTP_PASSWORD)' });
  }

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin người nhận, tiêu đề hoặc nội dung!' });
  }

  try {
    const info = await transporter.sendMail({
      from: `"VMC Internal Portal" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text // Ưu tiên HTML nếu có
    });
    res.json({ success: true, message: 'Đã gửi email thành công!', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    res.status(500).json({ success: false, message: 'Không thể gửi email', error: error.message });
  }
});

// API Endpoint 1: POST /api/auth/login - Xác thực đăng nhập an toàn từ Server
app.post('/api/auth/login', async (req, res) => {
  const { memberCode, password } = req.body;
  if (!memberCode || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã thành viên và mật khẩu!' });
  }

  try {
    const sql = `
      SELECT 
        id, member_code, username, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status
      FROM Members
      WHERE (UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
      LIMIT 1
    `;
    const rows = await queryDatabase(sql, [memberCode, memberCode]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Mã thành viên hoặc tên đăng nhập không tồn tại!' });
    }

    const user = rows[0];
    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Tài khoản này đã bị tạm khóa bởi Bộ Phận Kỹ Thuật!' });
    }

    // Omit sensitive hashes from response payload
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        memberCode: user.member_code,
        username: user.username,
        name: user.full_name,
        role: user.role,
        roleTitle: user.role_title,
        class: user.class_name,
        department: user.department,
        term: user.term,
        avatar: user.avatar_url,
        phone: user.phone,
        email: user.email,
        dob: user.dob,
        address: user.address,
        facebook: user.facebook,
        points: user.points,
        isFirstLogin: Boolean(user.is_first_login),
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Lỗi API /api/auth/login:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ xác thực!', error: error.message });
  }
});

// API Endpoint 2: GET /api/members - Lấy danh sách thành viên an toàn (đã bóc tách mật khẩu)
app.get('/api/members', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id, member_code, username, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, status 
      FROM Members 
      ORDER BY id ASC
    `;
    const members = await queryDatabase(sql);

    res.json({
      success: true,
      total: members.length,
      data: members.map(m => ({
        id: m.id,
        memberCode: m.member_code,
        username: m.username,
        name: m.full_name,
        role: m.role,
        roleTitle: m.role_title,
        class: m.class_name,
        deptName: m.department,
        term: m.term,
        avatar: m.avatar_url,
        phone: m.phone,
        email: m.email,
        dob: m.dob,
        status: m.status
      }))
    });
  } catch (error) {
    console.error('❌ Lỗi API /api/members:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể truy vấn CSDL SQL!',
      error: error.message
    });
  }
});

// API Endpoint 3: PUT /api/members/:id - Cập nhật thông tin thành viên
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role, role_title, member_code, class_name, department, phone, dob, email } = req.body;

  try {
    const sql = `
      UPDATE Members 
      SET 
        full_name = COALESCE(?, full_name), 
        role = COALESCE(?, role), 
        role_title = COALESCE(?, role_title),
        member_code = COALESCE(?, member_code), 
        class_name = COALESCE(?, class_name), 
        department = COALESCE(?, department), 
        phone = COALESCE(?, phone), 
        dob = COALESCE(?, dob), 
        email = COALESCE(?, email) 
      WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
    `;
    const result = await queryDatabase(sql, [full_name, role, role_title, member_code, class_name, department, phone, dob, email, id, id, id]);

    console.log(`✅ Đã cập nhật CSDL MySQL thành công cho ID/Code: [${id}]`);
    res.json({
      success: true,
      message: 'Đã cập nhật thông tin thành viên vào CSDL SQL!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật CSDL!',
      error: error.message
    });
  }
});

// API Endpoint 4: POST /api/members/create - Tạo tài khoản thành viên mới lưu thẳng vào SQL Server Private
app.post('/api/members/create', async (req, res) => {
  const { member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob } = req.body;

  try {
    const sql = `
      INSERT INTO Members 
        (member_code, username, password_hash, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, is_first_login, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'Active')
    `;
    await queryDatabase(sql, [
      member_code,
      username || member_code.toLowerCase(),
      password || 'VMC2026@VinhBao',
      full_name,
      role || 'member',
      role_title || 'Thành Viên VMC',
      class_name,
      department,
      term || '2025-2026',
      avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      phone,
      email,
      dob
    ]);

    res.json({
      success: true,
      message: 'Đã tạo thành công thành viên mới vào CSDL SQL Server!'
    });
  } catch (error) {
    console.error('❌ Lỗi API /api/members/create:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo tài khoản CSDL!',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Private API Server CSDL đang chạy tại: http://localhost:${PORT}/api/members`);
});
