import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import express from 'express';
import { queryDatabase } from './server/db.js';

// Express API Router tích hợp thẳng vào Vite Dev Server
const apiPlugin = () => ({
  name: 'embedded-api-server',
  configureServer(server) {
    const app = express();
    app.use(express.json());

    // API 1: GET /api/members
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
          data: members
        });
      } catch (error) {
        console.warn('⚠️ API /api/members warning:', error.message);
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // API 2: PUT /api/members/:id
    app.put('/api/members/:id', async (req, res) => {
      const { id } = req.params;
      const { full_name, role, member_code, class_name, department, phone, dob, email } = req.body;
      try {
        const sql = `
          UPDATE Members 
          SET 
            full_name = COALESCE(?, full_name), 
            role = COALESCE(?, role), 
            member_code = COALESCE(?, member_code), 
            class_name = COALESCE(?, class_name), 
            department = COALESCE(?, department), 
            phone = COALESCE(?, phone), 
            dob = COALESCE(?, dob), 
            email = COALESCE(?, email) 
          WHERE (id = ? OR UPPER(member_code) = UPPER(?) OR LOWER(username) = LOWER(?))
        `;
        await queryDatabase(sql, [full_name, role, member_code, class_name, department, phone, dob, email, id, id, id]);
        res.json({ success: true, message: 'Đã cập nhật CSDL MySQL!' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // API 3: POST /api/members/create
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
          term || 'Gen 6', 
          avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400', 
          phone, 
          email, 
          dob
        ]);
        res.json({ success: true, message: 'Tạo tài khoản CSDL mới thành công!' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    server.middlewares.use(app);
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    apiPlugin()
  ],
  server: {
    host: true,
    allowedHosts: true
  }
});