import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load .env từ thư mục server/ — đúng dù PM2 chạy từ thư mục gốc dự án
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import { queryDatabase } from './db.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import apiRouter from './api.js';

const hashPassword = (pwd) => {
  if (typeof pwd !== 'string' || pwd === '') return '';
  return bcrypt.hashSync(pwd, 12);
};

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
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(DIST_DIR));

// Anti Brute-Force Rate Limiter Map for Login
const failedLoginTracker = new Map();

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
        ).catch(() => { });
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
      ).catch(() => { });
    }
  }
}).catch(err => {
  console.log('ℹ️ CSDL status Generations table:', err.message);
});

// Tự động khởi tạo bảng User_Sessions (Phiên làm việc)
queryDatabase(`
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
    is_active TINYINT DEFAULT 1,
    logout_reason VARCHAR(50) DEFAULT NULL
  )
`).catch(err => {
  console.log('ℹ️ CSDL status User_Sessions table:', err.message);
});

queryDatabase('ALTER TABLE User_Sessions ADD COLUMN logout_reason VARCHAR(50) DEFAULT NULL').catch(() => { });

queryDatabase('ALTER TABLE Fanpage_Drafts ADD COLUMN likes_count INT DEFAULT 0').catch(() => { });
queryDatabase('ALTER TABLE Fanpage_Drafts ADD COLUMN shares_count INT DEFAULT 0').catch(() => { });
queryDatabase('ALTER TABLE Fanpage_Drafts ADD COLUMN comments_count INT DEFAULT 0').catch(() => { });
queryDatabase('ALTER TABLE Fanpage_Drafts ADD COLUMN content_score INT DEFAULT 0').catch(() => { });
queryDatabase('ALTER TABLE Fanpage_Drafts ADD COLUMN final_score INT DEFAULT 0').catch(() => { });

queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN submissions LONGTEXT').catch(() => { });
queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN excuse_reason TEXT').catch(() => { });
queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN excuse_status VARCHAR(50) DEFAULT "none"').catch(() => { });
queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN is_penalized TINYINT DEFAULT 0').catch(() => { });
queryDatabase('ALTER TABLE Birthday_Assignments ADD COLUMN wishes_template TEXT').catch(() => { });

queryDatabase(`
  CREATE TABLE IF NOT EXISTS Resources (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    link TEXT,
    uploader_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.log('ℹ️ CSDL status Resources table:', err.message));

// Tự động khởi tạo bảng Finances (Quản lý thu chi)
queryDatabase(`
  CREATE TABLE IF NOT EXISTS Finances (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    amount INT NOT NULL,
    description TEXT,
    date VARCHAR(50),
    logged_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'approved',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.log('ℹ️ CSDL status Finances table:', err.message));

// Tự động khởi tạo bảng Department_Drives (Drive Ban Chuyên Môn)
queryDatabase(`
  CREATE TABLE IF NOT EXISTS Department_Drives (
    id VARCHAR(100) PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    drive_link TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(async () => {
  const defaultDrives = [
    { id: 'drive-bcn', dept_name: 'Ban Chủ Nhiệm', drive_link: 'https://drive.google.com' },
    { id: 'drive-cv', dept_name: 'Ban Cố Vấn', drive_link: 'https://drive.google.com' },
    { id: 'drive-dnns', dept_name: 'Ban Đối Ngoại - Nhân Sự', drive_link: 'https://drive.google.com' },
    { id: 'drive-sx', dept_name: 'Ban Sản Xuất Media', drive_link: 'https://drive.google.com' },
    { id: 'drive-ndpt', dept_name: 'Ban Nội Dung - Phát Thanh', drive_link: 'https://drive.google.com' }
  ];
  for (const d of defaultDrives) {
    await queryDatabase(
      'INSERT IGNORE INTO Department_Drives (id, dept_name, drive_link) VALUES (?, ?, ?)',
      [d.id, d.dept_name, d.drive_link]
    ).catch(() => { });
  }
}).catch(err => console.log('ℹ️ CSDL status Department_Drives table:', err.message));

// Tự động khởi tạo bảng Attendance_Records (Điểm danh sinh hoạt định kỳ)
queryDatabase(`
  CREATE TABLE IF NOT EXISTS Attendance_Records (
    id VARCHAR(100) PRIMARY KEY,
    session_name VARCHAR(255),
    record_date VARCHAR(50),
    present_members LONGTEXT,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.log('ℹ️ CSDL status Attendance_Records table:', err.message));

// Recruitment module — thêm cột interviewer_ids, department và scoring_type vào Recruitment_Seasons nếu chưa có
queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN interviewer_ids TEXT').catch(() => {});
queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN department VARCHAR(100)').catch(() => {});
queryDatabase('ALTER TABLE Recruitment_Seasons ADD COLUMN scoring_type TEXT').catch(() => {});
queryDatabase('ALTER TABLE Recruitment_Candidates ADD COLUMN interviewer_ids TEXT').catch(() => {});
queryDatabase('ALTER TABLE Recruitment_Candidates ADD COLUMN teamwork_scorer_ids TEXT').catch(() => {});
queryDatabase('ALTER TABLE Recruitment_Scores ADD COLUMN comments TEXT').catch(() => {});

// Tự động khởi tạo bảng System_Settings
queryDatabase(`
  CREATE TABLE IF NOT EXISTS System_Settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(async () => {
  await queryDatabase(
    `INSERT IGNORE INTO System_Settings (setting_key, setting_value) VALUES ('recruitment_season_active', '0')`,
    []
  ).catch(() => {});
}).catch(err => console.log('ℹ️ CSDL status System_Settings table:', err.message));

// ── Sub-router cho tasks, drafts, equipment, announcements ──
app.use('/api', apiRouter);

// ── Serve frontend build (production) ──
app.use(express.static(DIST_DIR));

// ── Cấu hình Nodemailer Transporter ──
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '')
  }
});

// API Gửi Email Tự Động
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html, greeting, messageBody, attachments } = req.body;

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Server chưa được cấu hình tài khoản Email (SMTP_EMAIL & SMTP_PASSWORD)' });
  }

  const hasBody = Boolean(text || html || greeting || messageBody);
  if (!to || !subject || !hasBody) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin người nhận, tiêu đề hoặc nội dung!' });
  }

  const textBody = text || [greeting, messageBody].filter(Boolean).join('\n\n');
  const htmlBody = html || [
    greeting ? `<p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">${greeting}</p>` : '',
    messageBody ? `<div style="font-size: 14px; line-height: 1.7; color: #1f2937;">${String(messageBody).replace(/\n/g, '<br/>')}</div>` : ''
  ].filter(Boolean).join('');

  const normalizedAttachments = Array.isArray(attachments)
    ? attachments.map((att) => {
        if (!att || typeof att !== 'object') return null;
        const attachment = {};
        if (att.filename) attachment.filename = att.filename;
        if (att.name && !attachment.filename) attachment.filename = att.name;
        if (att.path) attachment.path = att.path;
        if (att.href) attachment.href = att.href;
        if (att.cid) attachment.cid = att.cid;
        if (att.contentType) attachment.contentType = att.contentType;

        const normalizeContent = (value) => {
          if (typeof value !== 'string' || value.trim() === '') return null;
          const dataUriMatch = value.match(/^data:(.+);base64,(.+)$/i);
          if (dataUriMatch) {
            attachment.content = Buffer.from(dataUriMatch[2], 'base64');
            attachment.contentType = attachment.contentType || dataUriMatch[1];
            return;
          }

          const base64String = value.replace(/\s+/g, '');
          if (/^[A-Za-z0-9+/]+={0,2}$/.test(base64String) && base64String.length % 4 === 0) {
            attachment.content = Buffer.from(base64String, 'base64');
            return;
          }

          attachment.content = value;
        };

        if (att.content) {
          normalizeContent(att.content);
        } else if (att.base64) {
          normalizeContent(att.base64);
        } else if (att.dataUrl) {
          normalizeContent(att.dataUrl);
        }

        if (!attachment.filename) {
          attachment.filename = 'attachment';
        }

        if (!attachment.path && !attachment.href && attachment.content === undefined) {
          return null;
        }

        return attachment;
      }).filter(Boolean)
    : undefined;

  try {
    const info = await transporter.sendMail({
      from: `"CLB TRUYỀN THÔNG TRƯỜNG THPT VĨNH BẢO (VMC)" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text: textBody,
      html: htmlBody || textBody,
      attachments: normalizedAttachments
    });
    res.json({ success: true, message: 'Đã gửi email thành công!', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    res.status(500).json({ success: false, message: 'Không thể gửi email', error: error.message });
  }
});

// API Cấp lại mật khẩu mặc định & gửi email thông báo
app.post('/api/members/reset-password', async (req, res) => {
  try {
    const { memberId, email, name, defaultPassword } = req.body;
    const pwd = defaultPassword || 'VMC2026@VinhBao';
    const hashedPwd = hashPassword(pwd);

    // 1. Cập nhật CSDL: Mật khẩu mặc định và đánh dấu is_first_login = 1
    await queryDatabase(
      'UPDATE Members SET password = ?, is_first_login = 1 WHERE id = ? OR member_code = ? OR username = ?',
      [hashedPwd, String(memberId || ''), String(memberId || ''), String(memberId || '')]
    );

    // 2. Gửi email thông báo tự động nếu thành viên có email
    let emailSent = false;
    if (email && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        await transporter.sendMail({
          from: `"[BỘ PHẬN KỸ THUẬT] BAN ĐỐI NGOẠI - NHÂN SỰ" <${process.env.SMTP_EMAIL}>`,
          to: email,
          subject: '🔑 [VMC Portal] Thông báo Cấp lại Mật Khẩu Mặc Định Tài Khoản VMC',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-w-xl; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0;">🔑 CẤP LẠI MẬT KHẨU TÀI KHOẢN VMC</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Cổng thông tin nội bộ CLB Truyền Thông THPT Vĩnh Bảo</p>
              </div>
              <p>Kính gửi <strong>${name || 'Thành Viên VMC'}</strong>,</p>
              <p>Mật khẩu đăng nhập tài khoản hệ thống VMC Portal của bạn vừa được Quản trị viên đặt lại về mật khẩu mặc định khởi tạo thành công.</p>
              
              <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #0369a1;">🔑 <strong>Mật khẩu mặc định mới:</strong> <code style="font-size: 18px; color: #1e40af; font-weight: bold; font-family: monospace;">${pwd}</code></p>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 12px 16px; margin: 20px 0; border-radius: 8px; font-size: 13px; color: #92400e;">
                <p style="margin: 0; font-weight: bold;">⚠️ QUY ĐỊNH BẮT BUỘC ĐỔI MẬT KHẨU:</p>
                <p style="margin: 4px 0 0 0;">Ngay sau khi đăng nhập lại bằng mật khẩu mặc định trên, hệ thống sẽ <strong>bắt buộc bạn phải thay đổi sang mật khẩu mới cá nhân</strong> để đảm bảo an toàn tuyệt đối cho tài khoản.</p>
              </div>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">Trân trọng,<br/><strong>Bộ Phận Kỹ Thuật - CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
              <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
                🤖 (Đây là email tự động, vui lòng không phản hồi trực tiếp email này).
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.warn('⚠️ Lỗi gửi email thông báo reset mật khẩu:', err.message);
      }
    }

    res.json({
      success: true,
      message: emailSent
        ? `🔑 Đã đặt lại mật khẩu mặc định (${pwd}) & gửi email thông báo thành công cho ${name || email}!`
        : `🔑 Đã đặt lại mật khẩu mặc định (${pwd}) cho thành viên ${name || ''}!`
    });
  } catch (error) {
    console.error('❌ Lỗi /api/members/reset-password:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Endpoint 1: POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { memberCode, password } = req.body;
  if (!memberCode || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã thành viên và mật khẩu!' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const attemptInfo = failedLoginTracker.get(ip) || { count: 0, lockUntil: 0 };

  if (attemptInfo.lockUntil > now) {
    const remainingMins = Math.ceil((attemptInfo.lockUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `🚫 Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMins} phút để bảo vệ hệ thống!`
    });
  }

  try {
    const sql = `
      SELECT 
        id, member_code, username, password, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status, milestones
      FROM Members
      WHERE (UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
      LIMIT 1
    `;
    const rows = await queryDatabase(sql, [memberCode, memberCode]);
    if (!rows || rows.length === 0) {
      attemptInfo.count += 1;
      if (attemptInfo.count >= 5) {
        attemptInfo.lockUntil = now + 15 * 60 * 1000; // Khóa 15 phút
      }
      failedLoginTracker.set(ip, attemptInfo);
      return res.status(401).json({ success: false, message: 'Mã Thành Viên hoặc Mật khẩu không chính xác!' });
    }

    const user = rows[0];

    const storedPassword = String(user.password || '');
    let isValidPassword = false;

    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      isValidPassword = await bcrypt.compare(password, storedPassword);
    } else if (storedPassword.length > 0) {
      isValidPassword = password === storedPassword;
      if (isValidPassword) {
        // Migrate legacy plain-text passwords to bcrypt on first successful login.
        const hashed = hashPassword(password);
        await queryDatabase('UPDATE Members SET password = ? WHERE id = ? OR member_code = ? OR username = ?', [hashed, String(user.id), String(user.member_code), String(user.username)]).catch(() => {});
      }
    }

    if (!isValidPassword) {
      attemptInfo.count += 1;
      if (attemptInfo.count >= 5) {
        attemptInfo.lockUntil = now + 15 * 60 * 1000; // Khóa 15 phút
      }
      failedLoginTracker.set(ip, attemptInfo);
      return res.status(401).json({ success: false, message: 'Mã Thành Viên hoặc Mật khẩu không chính xác!' });
    }

    // Reset tracker on successful login
    failedLoginTracker.delete(ip);

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
        id, member_code, username, full_name, role, role_title, class_name, department, term, avatar_url, phone, email, dob, address, facebook, points, is_first_login, status, milestones
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
    const membersList = await queryDatabase('SELECT id, member_code FROM Members WHERE id = ? OR member_code = ? OR username = ?', [id, id, id]);
    const targetMember = membersList && membersList.length > 0 ? membersList[0] : null;

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

    // Chỉ hash password khi được cung cấp dưới dạng string không rỗng
    const hashedPasswordVal = (typeof password === 'string' && password.length > 0) ? hashPassword(password) : null;

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
      hashedPasswordVal,
      isFirstLoginVal,
      milestonesVal,
      id, id, id
    ]);

    // Đồng bộ vào bảng Member_Milestones
    if (milestones !== undefined && targetMember) {
      await queryDatabase(
        'DELETE FROM Member_Milestones WHERE member_id = ? OR member_id = ?',
        [String(targetMember.id), String(targetMember.member_code)]
      ).catch(e => { });

      if (Array.isArray(milestones) && milestones.length > 0) {
        for (const ms of milestones) {
          if (ms.title) {
            const msId = ms.id || ('m-' + Date.now() + Math.random().toString(36).substring(2, 5));
            await queryDatabase(
              `INSERT INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                msId,
                String(targetMember.id),
                ms.date || new Date().toLocaleDateString('vi-VN'),
                ms.title,
                ms.badgeText || ms.badge_text || '[Cột mốc]',
                ms.badgeStyle || ms.badge_style || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              ]
            ).catch(e => { });
          }
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
    const members = await queryDatabase(
      'SELECT id, member_code, username FROM Members WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))',
      [id, id, id]
    );

    if (!members || members.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên trong CSDL!' });
    }

    const m = members[0];
    const mId = String(m.id);
    const mCode = String(m.member_code || '');

    // Xóa dữ liệu con liên quan ở các bảng (Milestones, Birthday_Assignments, etc.) để tránh lỗi Foreign Key
    await queryDatabase('DELETE FROM Member_Milestones WHERE member_id = ? OR member_id = ?', [mId, mCode]).catch(() => { });
    await queryDatabase('DELETE FROM Birthday_Assignments WHERE member_id = ? OR member_id = ?', [mId, mCode]).catch(() => { });

    // Xóa chính thành viên khỏi bảng Members
    await queryDatabase('DELETE FROM Members WHERE id = ?', [m.id]);

    console.log(`✅ Đã xóa vĩnh viễn thành viên khỏi CSDL MySQL: [${mCode || mId}]`);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn thành viên khỏi CSDL MySQL!' });
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
      hashPassword(password || member_code),
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

// ── AUTOMATIC DAILY BIRTHDAY EMAIL SENDER ──
const checkAndSendDailyBirthdayEmails = async () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) return [];
  const results = [];
  try {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // 1-12

    console.log(`🎂 [Auto Birthday Mailer] Running daily check for date ${todayDay}/${todayMonth}...`);

    // Lấy mẫu lời chúc sinh nhật do Người phụ trách sinh nhật tháng này biên soạn
    const bdayAssignments = await queryDatabase(
      'SELECT wishes_template FROM Birthday_Assignments WHERE assign_month = ? ORDER BY assign_year DESC, created_at DESC LIMIT 1',
      [todayMonth]
    );

    const customTemplate = (bdayAssignments && bdayAssignments.length > 0 && bdayAssignments[0].wishes_template)
      ? bdayAssignments[0].wishes_template.trim()
      : '';

    const members = await queryDatabase(
      'SELECT id, member_code, full_name, email, dob, class_name, department, status FROM Members WHERE email IS NOT NULL AND email != "" AND (status IS NULL OR status = "Active")'
    );

    for (const m of members) {
      if (!m.dob) continue;
      const parts = String(m.dob).split(/[\/\-]/);
      if (parts.length < 2) continue;

      let dDay = 0;
      let dMonth = 0;

      if (parts[0].length === 4) { // YYYY-MM-DD
        dMonth = parseInt(parts[1], 10);
        dDay = parseInt(parts[2], 10);
      } else { // DD/MM/YYYY
        dDay = parseInt(parts[0], 10);
        dMonth = parseInt(parts[1], 10);
      }

      if (dDay === todayDay && dMonth === todayMonth) {
        console.log(`🎉 [Happy Birthday] Today is ${m.full_name}'s birthday (${m.dob})! Sending email to ${m.email}...`);

        let wishContentHtml = '';

        if (customTemplate) {
          let formattedWish = customTemplate
            .replace(/\{name\}/gi, m.full_name)
            .replace(/\{full_name\}/gi, m.full_name)
            .replace(/\{class\}/gi, m.class_name || 'VMC')
            .replace(/\{department\}/gi, m.department || 'Thành Viên VMC')
            .replace(/\n/g, '<br/>');

          wishContentHtml = `
            <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f472b6; line-height: 1.6;">
              <p style="font-size: 16px; margin-top: 0;">Thân gửi <strong>${m.full_name}</strong> (${m.department || 'Thành Viên VMC'} - Lớp ${m.class_name || 'VMC'}),</p>
              <div style="font-size: 15px; color: #334155; margin: 15px 0;">
                ${formattedWish}
              </div>
            </div>
          `;
        } else {
          wishContentHtml = `
            <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f472b6; line-height: 1.6;">
              <p style="font-size: 16px; margin-top: 0;">Thân gửi <strong>${m.full_name}</strong> (${m.department || 'Thành Viên VMC'} - Lớp ${m.class_name || 'VMC'}),</p>

              <p>Hôm nay là một ngày vô cùng đặc biệt! Thay mặt cho toàn thể Đại gia đình <strong>CLB Truyền Thông Trường THPT Vĩnh Bảo (VMC)</strong>, Ban Đối Ngoại - Nhân Sự xin gửi tới bạn những lời chúc mừng sinh nhật ấm áp và rực rỡ nhất! 🥳🎈</p>

              <p>Chúc bạn tuổi mới luôn ngập tràn niềm vui, sức khỏe, học tập xuất sắc và luôn giữ vững ngọn lửa nhiệt huyết để tiếp tục cùng VMC tạo nên những thước phim, bài viết và kỷ niệm thanh xuân tuyệt vời nhất! 💖✨</p>

              <div style="background-color: #fdf2f8; padding: 15px 20px; border-radius: 12px; border-left: 4px solid #ec4899; margin: 20px 0; font-style: italic; color: #831843;">
                "Tuổi mới tỏa sáng rực rỡ, luôn tự tin và gặt hái được thật nhiều thành công mới cùng gia đình VMC!" 🌟
              </div>
            </div>
          `;
        }

        try {
          await transporter.sendMail({
            from: `"CLB TRUYỀN THÔNG TRƯỜNG THPT VĨNH BẢO (VMC)" <${process.env.SMTP_EMAIL}>`,
            to: m.email,
            subject: `🎂🎉 Chúc Mừng Sinh Nhật ${m.full_name}! - CLB Truyền Thông Trường THPT Vĩnh Bảo`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%); border-radius: 20px; border: 1px solid #fbcfe8; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(236,72,153,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                  <span style="font-size: 50px;">🎂🎉✨</span>
                  <h1 style="color: #db2777; margin: 10px 0 5px 0; font-size: 24px;">HAPPY BIRTHDAY!</h1>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">CLB Truyền Thông THPT Vĩnh Bảo (VMC)</p>
                </div>

                ${wishContentHtml}

                <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b;">
                  <p style="margin: 0;">Trân trọng & Thân yêu,<br/><strong style="color: #db2777;">BAN CHỦ NHIỆM & BAN ĐỐI NGOẠI - NHÂN SỰ VMC</strong></p>
                </div>
                <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
                  🤖 (Đây là email tự động, vui lòng không phản hồi trực tiếp email này).
                </div>
              </div>
            `
          });
          results.push({ name: m.full_name, email: m.email, status: 'sent' });
          console.log(`✅ [Auto Birthday Mailer] Successfully delivered birthday email to ${m.email}!`);
        } catch (mailErr) {
          console.error(`❌ [Auto Birthday Mailer] Error sending to ${m.email}:`, mailErr.message);
          results.push({ name: m.full_name, email: m.email, status: 'failed', error: mailErr.message });
        }
      }
    }
  } catch (err) {
    console.error('❌ [Auto Birthday Mailer] Error checking birthdays:', err.message);
  }
  return results;
};

// API Endpoint kích hoạt kiểm tra & gửi mail sinh nhật thủ công
app.post('/api/birthdays/trigger-daily-emails', async (req, res) => {
  const results = await checkAndSendDailyBirthdayEmails();
  res.json({ success: true, count: results.length, data: results });
});

// Catch-all: trả về index.html cho React Router SPA (Express 5 compatible)
app.use((req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><title>VMC Portal Server</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
        <h1>🚀 VMC Backend API Server Running</h1>
        <p>Frontend dist bundle chưa được build hoặc chưa có file <code>dist/index.html</code>.</p>
        <p>Vui lòng chạy <code>npm run build</code> tại máy local hoặc server để sinh tệp frontend!</p>
      </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📁 Serving frontend từ: ${DIST_DIR}`);

  // Chạy tự động kiểm tra mail sinh nhật daily (10 giây sau khi server khởi động + lặp lại mỗi 12 tiếng)
  setTimeout(() => {
    checkAndSendDailyBirthdayEmails();
  }, 10000);

  setInterval(() => {
    checkAndSendDailyBirthdayEmails();
  }, 12 * 60 * 60 * 1000);
});
