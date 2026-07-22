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

// ── Security Hardening Middleware ──
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Tự động mở rộng cột avatar_url trong CSDL MySQL sang LONGTEXT để lưu ảnh base64
queryDatabase('ALTER TABLE Members MODIFY COLUMN avatar_url LONGTEXT').catch(err => {
  console.log('ℹ️ CSDL status avatar_url:', err.message);
});
queryDatabase('ALTER TABLE Members ADD COLUMN milestones LONGTEXT').catch(err => {
  console.log('ℹ️ CSDL status milestones:', err.message);
});

queryDatabase(`
  CREATE TABLE IF NOT EXISTS Member_Milestones (
    id VARCHAR(100) PRIMARY KEY,
    member_id VARCHAR(100) NOT NULL,
    date VARCHAR(50),
    title TEXT,
    badge_text VARCHAR(100),
    badge_style VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(async () => {
  const countRes = await queryDatabase('SELECT COUNT(*) as cnt FROM Member_Milestones').catch(() => []);
  if (countRes && countRes[0] && countRes[0].cnt === 0) {
    const members = await queryDatabase('SELECT id, department, milestones FROM Members').catch(() => []);
    for (const m of members) {
      let msList = [];
      if (m.milestones) {
        try {
          msList = typeof m.milestones === 'string' ? JSON.parse(m.milestones) : m.milestones;
        } catch (e) { msList = []; }
      }
      if (!Array.isArray(msList) || msList.length === 0) {
        msList = [{
          id: 'm-init-1-' + m.id,
          date: '20/09/2024',
          title: `Bắt đầu làm thành viên VMC (${m.department || 'Ban Chuyên Môn'})`,
          badgeText: '[Gia nhập]',
          badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }];
      }
      for (const ms of msList) {
        await queryDatabase(
          `INSERT IGNORE INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) VALUES (?, ?, ?, ?, ?, ?)`,
          [ms.id || ('m-' + Date.now()), String(m.id), ms.date || '20/09/2024', ms.title || 'Cột mốc mới', ms.badgeText || '[Cột mốc]', ms.badgeStyle || 'bg-blue-500/10 text-blue-400 border-blue-500/30']
        ).catch(() => {});
      }
    }
  }
}).catch(err => {
  console.log('ℹ️ CSDL status Member_Milestones table:', err.message);
});

// Tự động khởi tạo bảng Generations (Thế hệ Gen) riêng trong MySQL
queryDatabase(`
  CREATE TABLE IF NOT EXISTS Generations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    years VARCHAR(100),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(async () => {
  const countRes = await queryDatabase('SELECT COUNT(*) as cnt FROM Generations').catch(() => []);
  if (countRes && countRes[0] && countRes[0].cnt === 0) {
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
  }
}).catch(err => {
  console.log('ℹ️ CSDL status Generations table:', err.message);
});

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
        id, member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status, milestones
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

    let parsedMilestones = [];
    if (user.milestones) {
      try {
        parsedMilestones = typeof user.milestones === 'string' ? JSON.parse(user.milestones) : user.milestones;
      } catch (e) {
        parsedMilestones = [];
      }
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
        status: user.status,
        milestones: parsedMilestones
      }
    });
  } catch (error) {
    console.error('❌ Lỗi API /api/auth/login:', error.message);
    res.status(500).json({ success: false, message: 'Không thể đăng nhập!', error: error.message });
  }
});

// API Endpoint 2: GET /api/members
app.get('/api/members', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id, member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status, milestones
      FROM Members 
      ORDER BY id ASC
    `;
    const members = await queryDatabase(sql);
    const tableMilestones = await queryDatabase('SELECT * FROM Member_Milestones ORDER BY created_at ASC').catch(() => []);

    res.json({
      success: true,
      total: members.length,
      data: members.map(m => {
        let parsed = [];
        if (m.milestones) {
          try {
            parsed = typeof m.milestones === 'string' ? JSON.parse(m.milestones) : m.milestones;
          } catch (e) {
            parsed = [];
          }
        }
        if (!Array.isArray(parsed)) parsed = [];

        // Lấy danh sách từ bảng Member_Milestones theo ID hoặc MemberCode
        const msFromTable = tableMilestones.filter(ms => 
          String(ms.member_id) === String(m.id) || 
          String(ms.member_id).toUpperCase() === String(m.member_code).toUpperCase()
        ).map(ms => ({
          id: ms.id,
          date: ms.date,
          title: ms.title,
          badgeText: ms.badge_text,
          badgeStyle: ms.badge_style
        }));

        const combined = [...msFromTable, ...parsed];
        const unique = combined.filter((v, idx, self) => self.findIndex(t => t.id === v.id || (t.title === v.title && t.date === v.date)) === idx);

        return {
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
          isFirstLogin: Boolean(m.is_first_login),
          milestones: unique
        };
      })
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
    full_name, role, role_title, member_code, class_name, department, term,
    phone, dob, email, points, address, facebook, avatar_url, avatar, 
    status, password, is_first_login, isFirstLogin, milestones 
  } = req.body;

  try {
    const isFirstLoginVal = is_first_login !== undefined 
      ? (is_first_login ? 1 : 0) 
      : (isFirstLogin !== undefined ? (isFirstLogin ? 1 : 0) : null);

    const milestonesVal = milestones !== undefined 
      ? (typeof milestones === 'object' ? JSON.stringify(milestones) : milestones) 
      : null;

    const sql = `
      UPDATE Members 
      SET 
        full_name = COALESCE(?, full_name), 
        role = COALESCE(?, role), 
        role_title = COALESCE(?, role_title),
        member_code = COALESCE(?, member_code), 
        class_name = COALESCE(?, class_name), 
        department = COALESCE(?, department), 
        term = COALESCE(?, term),
        phone = COALESCE(?, phone), 
        dob = COALESCE(?, dob), 
        email = COALESCE(?, email),
        points = COALESCE(?, points),
        address = COALESCE(?, address),
        facebook = COALESCE(?, facebook),
        avatar_url = COALESCE(?, COALESCE(?, avatar_url)),
        status = COALESCE(?, status),
        password = COALESCE(?, password),
        is_first_login = COALESCE(?, is_first_login),
        milestones = COALESCE(?, milestones)
      WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
    `;
    
    await queryDatabase(sql, [
      full_name !== undefined ? full_name : null,
      role !== undefined ? role : null,
      role_title !== undefined ? role_title : null,
      member_code !== undefined ? member_code : null,
      class_name !== undefined ? class_name : null,
      department !== undefined ? department : null,
      term !== undefined ? term : null,
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
      isFirstLoginVal,
      milestonesVal,
      id, id, id
    ]);

    // Đồng bộ vào bảng Member_Milestones
    if (Array.isArray(milestones) && milestones.length > 0) {
      for (const ms of milestones) {
        if (ms.title) {
          const msId = ms.id || ('m-' + Date.now() + Math.random().toString(36).substring(2, 5));
          await queryDatabase(
            `INSERT INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) 
             VALUES (?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE date = VALUES(date), title = VALUES(title), badge_text = VALUES(badge_text), badge_style = VALUES(badge_style)`,
            [
              msId,
              String(id),
              ms.date || new Date().toLocaleDateString('vi-VN'),
              ms.title,
              ms.badgeText || ms.badge_text || '[Cột mốc]',
              ms.badgeStyle || ms.badge_style || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            ]
          ).catch(e => {});
        }
      }
    }

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
    const result = await queryDatabase(sql, [
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

    // Tự động tạo bản ghi lịch sử đầu tiên: "Bắt đầu làm thành viên VMC" vào bảng Member_Milestones
    const createdId = result.insertId ? String(result.insertId) : member_code;
    const firstMilestoneId = 'm-' + Date.now();
    const currentDateStr = new Date().toLocaleDateString('vi-VN');
    const milestoneTitle = `Bắt đầu làm thành viên VMC (${department || 'Ban Chuyên Môn'})`;

    await queryDatabase(
      `INSERT INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        firstMilestoneId,
        createdId,
        currentDateStr,
        milestoneTitle,
        '[Gia nhập]',
        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      ]
    ).catch(err => console.log('ℹ️ Status initial milestone create:', err.message));

    res.json({
      success: true,
      message: 'Đã tạo thành công thành viên mới vào CSDL SQL!'
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
