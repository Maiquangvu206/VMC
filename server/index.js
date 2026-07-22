import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

// Load .env từ thư mục server/ — đúng dù PM2 chạy từ thư mục gốc dự án
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import { queryDatabase } from './db.js';
import nodemailer from 'nodemailer';
import apiRouter from './api.js';

const app = express();
const PORT = process.env.PORT || 5000;
const DIST_DIR = path.join(__dirname, '..', 'dist');

console.log(`🔧 DB Config: host=${process.env.DB_HOST}, db=${process.env.DB_NAME}, user=${process.env.DB_USER}`);

app.use(cors());
app.use(express.json());

// ── Sub-router cho tasks, drafts, equipment, announcements ──
app.use('/api', apiRouter);

// ── Serve frontend build (production) ──
app.use(express.static(DIST_DIR));

// ── Cấu hình Nodemailer Transporter ──
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
      html: html || text
    });
    res.json({ success: true, message: 'Đã gửi email thành công!', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    res.status(500).json({ success: false, message: 'Không thể gửi email', error: error.message });
  }
});

// API Endpoint 1: POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { memberCode, password } = req.body;
  if (!memberCode || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã thành viên và mật khẩu!' });
  }

  try {
    const sql = `
      SELECT 
        id, member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status
      FROM Members
      WHERE (UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
        AND password = ?
      LIMIT 1
    `;
    const rows = await queryDatabase(sql, [memberCode, memberCode, password]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Mã Thành Viên hoặc Mật khẩu không chính xác!' });
    }

    const user = rows[0];
    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Tài khoản này đã bị tạm khóa bởi Bộ Phận Kỹ Thuật!' });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        memberCode: user.member_code,
        username: user.username,
        password: user.password,
        name: user.full_name,
        role: user.role,
        roleTitle: user.role_title,
        class: user.class_name,
        deptName: user.department,
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

// API Endpoint 2: GET /api/members
app.get('/api/members', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id, member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status
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
        password: m.password,
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
        address: m.address,
        facebook: m.facebook,
        status: m.status,
        points: m.points,
        isFirstLogin: Boolean(m.is_first_login)
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

// API Endpoint 3: PUT /api/members/:id
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, role, role_title, member_code, class_name, department, 
    phone, dob, email, points, address, facebook, avatar_url, avatar, 
    status, password, is_first_login, isFirstLogin 
  } = req.body;

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
        email = COALESCE(?, email),
        points = COALESCE(?, points),
        address = COALESCE(?, address),
        facebook = COALESCE(?, facebook),
        avatar_url = COALESCE(?, COALESCE(?, avatar_url)),
        status = COALESCE(?, status),
        password = COALESCE(?, password),
        is_first_login = COALESCE(?, COALESCE(?, is_first_login))
      WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
    `;
    
    await queryDatabase(sql, [
      full_name !== undefined ? full_name : null,
      role !== undefined ? role : null,
      role_title !== undefined ? role_title : null,
      member_code !== undefined ? member_code : null,
      class_name !== undefined ? class_name : null,
      department !== undefined ? department : null,
      phone !== undefined ? phone : null,
      dob !== undefined ? dob : null,
      email !== undefined ? email : null,
      points !== undefined ? points : null,
      address !== undefined ? address : null,
      facebook !== undefined ? facebook : null,
      avatar_url !== undefined ? avatar_url : null,
      avatar !== undefined ? avatar : null,
      status !== undefined ? status : null,
      password !== undefined ? password : null,
      is_first_login !== undefined ? is_first_login : null,
      isFirstLogin !== undefined ? (isFirstLogin ? 1 : 0) : null,
      id, id, id
    ]);

    console.log(`✅ Đã cập nhật CSDL MySQL thành công cho ID/Code: [${id}]`);
    res.json({
      success: true,
      message: 'Đã cập nhật thông tin thành viên vào CSDL SQL!'
    });
  } catch (error) {
    console.error('❌ Lỗi API /api/members/:id PUT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật CSDL!',
      error: error.message
    });
  }
});

// API Endpoint: DELETE /api/members/:id
app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `DELETE FROM Members WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))`;
    await queryDatabase(sql, [id, id, id]);
    console.log(`✅ Đã xóa vĩnh viễn thành viên khỏi CSDL MySQL: [${id}]`);
    res.json({ success: true, message: 'Đã xóa thành viên khỏi CSDL SQL!' });
  } catch (error) {
    console.error('❌ Lỗi API /api/members/:id DELETE:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi xóa thành viên khỏi CSDL!', error: error.message });
  }
});

// API Endpoint 4: POST /api/members/create
app.post('/api/members/create', async (req, res) => {
  const { member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook } = req.body;

  try {
    const sql = `
      INSERT INTO Members 
        (member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, is_first_login, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'Active')
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
      dob,
      address || null,
      facebook || null
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

// Catch-all: trả về index.html cho React Router SPA (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📁 Serving frontend từ: ${DIST_DIR}`);
});
