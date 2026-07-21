import express from 'express';
import cors from 'cors';
import { queryDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoint 1: GET /api/members - Lấy danh sách toàn bộ thành viên từ Bảng Members trong CSDL SQL
app.get('/api/members', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id, 
        avatar_url, 
        full_name, 
        role, 
        member_code, 
        class_name, 
        department, 
        phone, 
        dob, 
        email, 
        status 
      FROM Members 
      ORDER BY id ASC
    `;
    const members = await queryDatabase(sql);
    
    // Trả về JSON chứa danh sách thành viên với đúng tên cột CSDL
    res.json({
      success: true,
      total: members.length,
      data: members
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

// API Endpoint 2: PUT /api/members/:id - Cập nhật thông tin thành viên
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role, member_code, class_name, department, phone, dob, email } = req.body;

  try {
    const sql = `
      UPDATE Members 
      SET 
        full_name = ?, 
        role = ?, 
        member_code = ?, 
        class_name = ?, 
        department = ?, 
        phone = ?, 
        dob = ?, 
        email = ? 
      WHERE id = ?
    `;
    await queryDatabase(sql, [full_name, role, member_code, class_name, department, phone, dob, email, id]);
    
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

app.listen(PORT, () => {
  console.log(`🚀 API Server CSDL đang chạy tại: http://localhost:${PORT}/api/members`);
});
