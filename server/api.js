import express from 'express';
import { queryDatabase } from './db.js';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Khởi tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer upload config
const upload = multer({ dest: uploadsDir });

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);
const toId = (val) => (val !== undefined && val !== null && val !== '') ? String(val) : null;


// ======================= TASKS =======================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await queryDatabase(`
      SELECT t.*, m.full_name AS assignee_name, m.name AS m_name 
      FROM Tasks t 
      LEFT JOIN Members m ON (t.assignee_id = m.id OR t.assignee_id = m.member_code) 
      ORDER BY t.created_at DESC
    `);
    const data = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      department: t.department || 'hr_external',
      assigneeId: t.assignee_id,
      assignee: t.assignee_name || t.m_name || 'Chưa phân công',
      createdById: t.created_by,
      deadline: t.deadline ? new Date(t.deadline).toISOString().slice(0, 10) : null,
      status: t.status || 'todo',
      pointsReward: t.points_reward || 10,
      createdAt: t.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const taskItems = Array.isArray(req.body.tasks) ? req.body.tasks : [req.body];
    const createdTasks = [];

    const rootCreatorId = toId(req.body.created_by || req.body.createdBy);
    for (const taskInput of taskItems) {
      const { id, title, description, assignee_id, assigneeId, created_by, deadline, status, points_reward } = taskInput;
      const taskId = id || generateId();
      const assId = toId(assignee_id || assigneeId);
      const creatorId = toId(created_by || rootCreatorId);

      await queryDatabase(
        'INSERT INTO Tasks (id, title, description, assignee_id, created_by, deadline, status, points_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [taskId, title, description || '', assId, creatorId, deadline || null, status || 'todo', points_reward || 10]
      );

      // Gửi email thông báo cho từng nhiệm vụ được tạo
      if (assId) {
        try {
          const assignees = await queryDatabase(
            'SELECT email, full_name FROM Members WHERE id = ? OR member_code = ? OR full_name = ? OR username = ? LIMIT 1',
            [assId, assId, assId, assId]
          );
          if (assignees && assignees.length > 0 && assignees[0].email) {
            const assignee = assignees[0];
            await sendMailHelper(
              assignee.email,
              '🔔 [VMC Task] Bạn được giao nhiệm vụ mới!',
              `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                  <h3 style="color: #2563eb;">🔔 Nhiệm vụ mới được phân công</h3>
                  <p>Xin chào <strong>${assignee.full_name}</strong>,</p>
                  <p>Bạn vừa được giao một nhiệm vụ mới trên hệ thống VMC Portal.</p>
                  <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                  <p><strong>Nhiệm vụ:</strong> <strong style="font-size: 15px; color: #1e293b;">${title}</strong></p>
                  <p><strong>Mô tả:</strong> ${description || 'Không có mô tả chi tiết.'}</p>
                  <p><strong>Hạn chót:</strong> ${deadline || 'Không giới hạn'}</p>
                  ${(points_reward && Number(points_reward) > 0) ? `<p><strong>Điểm thưởng:</strong> ${points_reward} points</p>` : ''}
                  <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                  <p style="font-size: 12px; color: #64748b;">Vui lòng truy cập hệ thống để cập nhật tiến độ công việc.</p>
                </div>
              `
            );
          }
        } catch (mailErr) {
          console.warn('⚠️ Lỗi gửi mail thông báo giao nhiệm vụ:', mailErr.message);
        }
      }

      createdTasks.push({ id: taskId, title, description, assigneeId: assId, deadline, status });
    }

    res.json({ success: true, data: Array.isArray(req.body.tasks) ? createdTasks : createdTasks[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { status, title, description, deadline, assignee_id, assigneeId, points_reward } = req.body;
    const assId = (assignee_id !== undefined || assigneeId !== undefined) ? toId(assignee_id || assigneeId) : undefined;

    // Lấy thông tin task trước khi cập nhật để kiểm tra chuyển sang trạng thái hoàn thành (done)
    const oldTasks = await queryDatabase('SELECT * FROM Tasks WHERE id = ?', [req.params.id]);
    const oldTask = oldTasks && oldTasks.length > 0 ? oldTasks[0] : null;

    await queryDatabase(
      'UPDATE Tasks SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), deadline = COALESCE(?, deadline), assignee_id = COALESCE(?, assignee_id), points_reward = COALESCE(?, points_reward) WHERE id = ?',
      [
        status !== undefined ? status : null,
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        deadline !== undefined ? deadline : null,
        assId !== undefined ? assId : null,
        points_reward !== undefined ? points_reward : null,
        req.params.id
      ]
    );

    // Gửi email thông báo hoàn thành nhiệm vụ nếu chuyển trạng thái sang 'done'
    if (oldTask && status === 'done' && oldTask.status !== 'done') {
      try {
        const creatorEmailResult = await queryDatabase('SELECT email, full_name FROM Members WHERE id = ? OR member_code = ? LIMIT 1', [oldTask.created_by, oldTask.created_by]);
        const assigneeResult = await queryDatabase('SELECT full_name FROM Members WHERE id = ? OR member_code = ? LIMIT 1', [oldTask.assignee_id, oldTask.assignee_id]);

        const creator = creatorEmailResult && creatorEmailResult.length > 0 ? creatorEmailResult[0] : null;
        const assigneeName = assigneeResult && assigneeResult.length > 0 ? assigneeResult[0].full_name : 'Thành viên VMC';

        if (creator && creator.email) {
          await sendMailHelper(
            creator.email,
            '✅ [VMC Task] Nhiệm vụ được giao đã hoàn thành!',
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                <h3 style="color: #10b981;">✅ Nhiệm vụ đã hoàn thành</h3>
                <p>Xin chào <strong>${creator.full_name}</strong>,</p>
                <p>Nhiệm vụ bạn giao đã được đánh dấu là hoàn thành.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p><strong>Nhiệm vụ:</strong> ${oldTask.title}</p>
                <p><strong>Người thực hiện:</strong> <strong>${assigneeName}</strong></p>
                <p><strong>Hạn chót:</strong> ${oldTask.deadline || 'Không giới hạn'}</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
              </div>
            `
          );
        }
      } catch (mailErr) {
        console.warn('⚠️ Lỗi gửi mail thông báo hoàn thành nhiệm vụ:', mailErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= DRAFTS =======================
router.get('/drafts', async (req, res) => {
  try {
    const drafts = await queryDatabase('SELECT * FROM Fanpage_Drafts ORDER BY created_at DESC');
    const data = drafts.map(d => ({
      id: d.id,
      title: d.title,
      contentLink: d.content_link,
      authorId: d.author_id,
      status: d.status || 'pending',
      publishDate: d.publishDate ? new Date(d.publishDate).toISOString() : null,
      graderId: d.graderId,
      gradingStatus: d.gradingStatus || 'none',
      content: d.content,
      author: d.author,
      createdAt: d.created_at,
      likesCount: d.likes_count || 0,
      sharesCount: d.shares_count || 0,
      commentsCount: d.comments_count || 0,
      contentScore: d.content_score || 0,
      finalScore: d.final_score || 0
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/drafts', async (req, res) => {
  try {
    const { id, title, content, content_link, author, author_id, authorId, status, publishDate, graderId, gradingStatus } = req.body;
    const draftId = id || generateId();
    const autId = toId(author_id || authorId);
    const grId = toId(graderId);

    await queryDatabase(
      'INSERT INTO Fanpage_Drafts (id, title, content_link, author_id, status, publishDate, graderId, gradingStatus, content, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        draftId,
        title,
        content_link || 'https://facebook.com',
        autId,
        status || 'pending',
        publishDate || null,
        grId,
        gradingStatus || 'none',
        content || '',
        author || ''
      ]
    );
    res.json({ success: true, data: { id: draftId, title, content, author, author_id: autId, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/drafts/:id', async (req, res) => {
  try {
    const { status, publishDate, graderId, gradingStatus, title, content, content_link, author, likesCount, sharesCount, commentsCount, contentScore, finalScore, gradingDeadline, grading_deadline } = req.body;
    const grId = graderId !== undefined ? toId(graderId) : undefined;
    const oldDrafts = await queryDatabase('SELECT * FROM Fanpage_Drafts WHERE id = ?', [req.params.id]);
    const oldDraft = oldDrafts && oldDrafts.length > 0 ? oldDrafts[0] : {};

    await queryDatabase(
      'UPDATE Fanpage_Drafts SET status = COALESCE(?, status), publishDate = COALESCE(?, publishDate), graderId = COALESCE(?, graderId), gradingStatus = COALESCE(?, gradingStatus), title = COALESCE(?, title), content = COALESCE(?, content), content_link = COALESCE(?, content_link), author = COALESCE(?, author), likes_count = COALESCE(?, likes_count), shares_count = COALESCE(?, shares_count), comments_count = COALESCE(?, comments_count), content_score = COALESCE(?, content_score), final_score = COALESCE(?, final_score) WHERE id = ?',
      [
        status !== undefined ? status : null,
        publishDate !== undefined ? publishDate : null,
        grId !== undefined ? grId : null,
        gradingStatus !== undefined ? gradingStatus : null,
        title !== undefined ? title : null,
        content !== undefined ? content : null,
        content_link !== undefined ? content_link : null,
        author !== undefined ? author : null,
        likesCount !== undefined ? likesCount : null,
        sharesCount !== undefined ? sharesCount : null,
        commentsCount !== undefined ? commentsCount : null,
        contentScore !== undefined ? contentScore : null,
        finalScore !== undefined ? finalScore : null,
        req.params.id
      ]
    );

    const draftTitle = title !== undefined ? title : oldDraft.title || 'Bài viết Fanpage VMC';
    const draftPublishDate = publishDate !== undefined ? publishDate : oldDraft.publishDate || null;
    const draftGradingDeadline = gradingDeadline !== undefined ? gradingDeadline : (grading_deadline !== undefined ? grading_deadline : (oldDraft.gradingDeadline || oldDraft.grading_deadline || null));
    const formatDateValue = (value) => {
      if (!value) return 'Chưa có thông tin';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
    };

    if (grId) {
      try {
        const graders = await queryDatabase(
          'SELECT email, full_name FROM Members WHERE id = ? OR member_code = ? OR full_name = ? OR username = ? LIMIT 1',
          [grId, grId, grId, grId]
        );
        if (graders && graders.length > 0 && graders[0].email) {
          const grader = graders[0];
          await sendMailHelper(
            grader.email,
            `✍️ [VMC Draft] Bạn được phân công chấm tương tác bài viết!`,
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                <h3 style="color: #2563eb;">✍️ Phân Công Chấm Tương Tác Bài Viết</h3>
                <p>Xin chào <strong>${grader.full_name}</strong>,</p>
                <p>Bạn vừa được phân công làm người chấm tương tác cho một bài viết trên VMC Portal.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p><strong>Tiêu đề bài viết:</strong> <strong style="font-size: 15px; color: #1e293b;">${draftTitle}</strong></p>
                <p><strong>Thời gian đăng bài:</strong> <strong style="font-size: 15px; color: #1e293b;">${formatDateValue(draftPublishDate)}</strong></p>
                <p><strong>Hạn chấm điểm:</strong> <strong style="font-size: 15px; color: #1e293b;">${formatDateValue(draftGradingDeadline)}</strong></p>
                <p><strong>Nhiệm vụ:</strong> Kiểm tra số lượng Like/Share/Comment và chấm điểm tương tác cho bài viết.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
              </div>
            `
          ).catch(() => { });
        }
      } catch (mailErr) {
        console.warn('⚠️ Lỗi gửi mail phân công chấm bài:', mailErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= EQUIPMENT =======================
router.get('/equipment', async (req, res) => {
  try {
    const equipment = await queryDatabase('SELECT * FROM Equipment ORDER BY id ASC');
    const data = equipment.map(e => ({
      id: e.id,
      code: e.code,
      name: e.name,
      category: e.category,
      condition_status: e.condition_status || 'Tốt',
      status: e.status || 'available',
      borrower_id: e.borrower_id,
      return_date: e.return_date ? new Date(e.return_date).toISOString().slice(0, 10) : null
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/equipment', async (req, res) => {
  try {
    const { id, code, name, category, condition_status, status, borrower_id, return_date } = req.body;
    const eqId = id || generateId();
    const bId = toId(borrower_id);

    await queryDatabase(
      'INSERT INTO Equipment (id, code, name, category, condition_status, status, borrower_id, return_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [eqId, code, name, category, condition_status || 'Tốt', status || 'available', bId, return_date || null]
    );
    res.json({ success: true, data: { id: eqId, code, name, category, condition_status, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/equipment/:id', async (req, res) => {
  try {
    const { status, condition_status, borrower_id, return_date } = req.body;
    const bId = borrower_id !== undefined ? toId(borrower_id) : undefined;
    await queryDatabase(
      'UPDATE Equipment SET status = COALESCE(?, status), condition_status = COALESCE(?, condition_status), borrower_id = ?, return_date = ? WHERE id = ?',
      [
        status !== undefined ? status : null,
        condition_status !== undefined ? condition_status : null,
        bId !== undefined ? bId : null,
        return_date !== undefined ? return_date : null,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= ANNOUNCEMENTS =======================
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await queryDatabase('SELECT * FROM Internal_Announcements ORDER BY is_pinned DESC, created_at DESC');
    const data = announcements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      author_id: a.author_id,
      is_pinned: Boolean(a.is_pinned),
      created_at: a.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { id, title, content, author_id, authorId, is_pinned, isPinned } = req.body;
    const annId = id || generateId();
    const autId = toId(author_id || authorId);
    const pinned = (is_pinned || isPinned) ? 1 : 0;

    await queryDatabase(
      'INSERT INTO Internal_Announcements (id, title, content, author_id, is_pinned) VALUES (?, ?, ?, ?, ?)',
      [annId, title, content, autId, pinned]
    );
    res.json({ success: true, data: { id: annId, title, content, author_id: autId, is_pinned: Boolean(pinned) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Internal_Announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to send email from backend APIs
const sendMailHelper = async (to, subject, html) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️ SMTP credentials not set in environment. Cannot send email.');
    return false;
  }

  const autoReplyNotice = `
    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
      (Đây là email tự động, vui lòng không phản hồi trực tiếp email này).
    </div>
  `;

  const finalHtml = html ? (html.includes('Đây là email tự động') ? html : (html + autoReplyNotice)) : html;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD.replace(/\s+/g, '')
      }
    });
    await transporter.sendMail({
      from: `"CLB TRUYỀN THÔNG TRƯỜNG THPT VĨNH BẢO (VMC)" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html: finalHtml
    });
    console.log(`📧 [SMTP] Email sent successfully to ${to} (${subject})`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send email via helper:', err.message);
    if (err.code === 'EAUTH' || err.message?.includes('Application-specific password')) {
      console.error('💡 CHÚ Ý: Google yêu cầu Mật khẩu ứng dụng (App Password 16 ký tự). Vui lòng vào https://myaccount.google.com/apppasswords tạo mật khẩu ứng dụng cho bandoingoainhansuvmc@gmail.com');
    }
    return false;
  }
};

// ======================= FINANCES =======================
router.get('/finances', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Finances ORDER BY created_at DESC');
    const data = rows.map(r => {
      const d = r.record_date || r.date ? String(r.record_date || r.date).slice(0, 10) : '';
      const by = r.recorded_by || r.logged_by || 'Thành viên VMC';
      return {
        id: r.id,
        type: r.type,
        amount: Number(r.amount) || 0,
        description: r.description || '',
        date: d,
        record_date: d,
        recorded_by: by,
        loggedBy: by,
        logged_by: by,
        status: r.status || 'approved',
        createdAt: r.created_at
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/finances', async (req, res) => {
  try {
    const { id, type, amount, description, record_date, date, recorded_by, logged_by, loggedBy, status } = req.body;
    const finId = id || ('fin-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const recBy = recorded_by || logged_by || loggedBy || 'Thành viên VMC';
    const recDate = record_date || date || new Date().toISOString().slice(0, 10);
    const stat = status || 'approved';

    await queryDatabase(
      'INSERT INTO Finances (id, type, amount, description, record_date, recorded_by, date, logged_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [finId, type || 'income', parseFloat(amount) || 0, description || '', recDate, recBy, recDate, recBy, stat]
    );

    // Gửi mail thông báo duyệt thu chi nếu trạng thái là pending
    if (stat === 'pending') {
      try {
        const reviewers = await queryDatabase(
          `SELECT email FROM Members WHERE role = 'admin' OR LOWER(department) LIKE '%đối ngoại%' OR LOWER(department) LIKE '%nhân sự%' OR LOWER(department) LIKE '%đn-ns%'`
        );
        const emails = reviewers.filter(r => r.email).map(r => r.email);
        if (emails.length > 0) {
          const typeStr = type === 'income' ? 'THU' : 'CHI';
          const amountFormatted = Number(amount).toLocaleString('vi-VN') + ' VND';
          await sendMailHelper(
            emails.join(','),
            '💰 [VMC Finance] Yêu cầu duyệt dự trù kinh phí mới',
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                <h3 style="color: #2563eb;">💰 Yêu cầu duyệt dự trù Kinh phí mới</h3>
                <p>Một yêu cầu dự trù thu chi vừa được tạo trên hệ thống VMC Portal và đang chờ được bạn duyệt.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p><strong>Loại giao dịch:</strong> <span style="color: ${type === 'income' ? '#10b981' : '#ef4444'}; font-weight:bold;">${typeStr}</span></p>
                <p><strong>Số tiền:</strong> <strong style="font-size: 16px; color: #1e293b;">${amountFormatted}</strong></p>
                <p><strong>Nội dung:</strong> ${description}</p>
                <p><strong>Ngày thực hiện:</strong> ${recDate}</p>
                <p><strong>Người gửi yêu cầu:</strong> ${recBy}</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p style="font-size: 12px; color: #64748b;">Vui lòng đăng nhập hệ thống VMC Portal -> trang Quản Lý Thu Chi để kiểm tra và xác nhận duyệt yêu cầu này.</p>
              </div>
            `
          );
        }
      } catch (mailErr) {
        console.warn('⚠️ Lỗi gửi mail thông báo duyệt thu chi:', mailErr.message);
      }
    }

    res.json({ success: true, data: { id: finId, type, amount, description, record_date: recDate, recorded_by: recBy, status: stat } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/finances/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const records = await queryDatabase('SELECT * FROM Finances WHERE id = ?', [req.params.id]);

    if (records && records.length > 0) {
      const record = records[0];
      await queryDatabase('UPDATE Finances SET status = ? WHERE id = ?', [status, req.params.id]);

      // Gửi email thông báo cho người yêu cầu về kết quả duyệt
      const requesters = await queryDatabase(
        'SELECT email, full_name FROM Members WHERE full_name = ? OR member_code = ? LIMIT 1',
        [record.recorded_by, record.recorded_by]
      );
      if (requesters && requesters.length > 0 && requesters[0].email) {
        const requester = requesters[0];
        const statusStr = status === 'approved' ? 'Đã được duyệt ✅' : 'Đã bị từ chối ❌';
        const typeStr = record.type === 'income' ? 'THU' : 'CHI';
        const amountFormatted = Number(record.amount).toLocaleString('vi-VN') + ' VND';
        await sendMailHelper(
          requester.email,
          `💰 [VMC Finance] Kết quả duyệt yêu cầu dự trù kinh phí: ${status === 'approved' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}`,
          `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
              <h3 style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">💰 Kết quả duyệt yêu cầu Kinh phí</h3>
              <p>Xin chào <strong>${requester.full_name}</strong>,</p>
              <p>Yêu cầu dự trù thu chi của bạn trên hệ thống VMC Portal đã được Trưởng Ban duyệt.</p>
              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
              <p><strong>Trạng thái duyệt:</strong> <strong style="color: ${status === 'approved' ? '#10b981' : '#ef4444'}; font-size: 15px;">${statusStr}</strong></p>
              <p><strong>Loại giao dịch:</strong> ${typeStr}</p>
              <p><strong>Số tiền:</strong> ${amountFormatted}</p>
              <p><strong>Nội dung:</strong> ${record.description}</p>
              <p><strong>Ngày thực hiện:</strong> ${record.record_date ? new Date(record.record_date).toISOString().slice(0, 10) : ''}</p>
              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
              <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
            </div>
          `
        );
      }
    } else {
      await queryDatabase('UPDATE Finances SET status = ? WHERE id = ?', [status, req.params.id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/finances/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Finances WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= MEETINGS & MEETING ATTENDANCE =======================
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await queryDatabase('SELECT * FROM Meetings ORDER BY meeting_date DESC, created_at DESC');
    const attendance = await queryDatabase('SELECT * FROM Meeting_Attendance');

    const data = meetings.map(m => {
      const attList = attendance
        .filter(a => String(a.meeting_id) === String(m.id))
        .map(a => ({ memberId: a.member_id, status: a.status }));

      return {
        id: m.id,
        title: m.title,
        date: m.meeting_date ? new Date(m.meeting_date).toISOString().slice(0, 10) : '',
        time: m.meeting_time ? String(m.meeting_time).slice(0, 5) : '08:00',
        attendanceTakerId: m.attendance_taker_id,
        minuteTakerId: m.minute_taker_id,
        status: m.status || 'pending',
        minutesLink: m.minutes_link,
        attendanceData: attList
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/meetings', async (req, res) => {
  try {
    const {
      id,
      title,
      date,
      time,
      attendance_taker_id,
      minute_taker_id,
      attendanceTakerId,
      minuteTakerId,
      status,
      minutes_link
    } = req.body;
    const mtgId = id || generateId();
    const attTaker = toId(attendance_taker_id || attendanceTakerId);
    const minTaker = toId(minute_taker_id || minuteTakerId);

    await queryDatabase(
      'INSERT INTO Meetings (id, title, meeting_date, meeting_time, attendance_taker_id, minute_taker_id, status, minutes_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [mtgId, title, date || new Date().toISOString().slice(0, 10), time || '08:00', attTaker, minTaker, status || 'pending', minutes_link || null]
    );

    // Gửi email thông báo cho người phụ trách điểm danh & ghi biên bản
    const sendMeetingRoleEmail = async (memberId, roleTitle) => {
      if (!memberId) return;
      try {
        const rows = await queryDatabase(
          'SELECT email, full_name FROM Members WHERE id = ? OR member_code = ? OR full_name = ? OR username = ? LIMIT 1',
          [memberId, memberId, memberId, memberId]
        );
        if (rows && rows.length > 0 && rows[0].email) {
          const m = rows[0];
          await sendMailHelper(
            m.email,
            `📌 [VMC Meeting] Bạn được phân công nhiệm vụ: ${roleTitle}!`,
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                <h3 style="color: #7c3aed;">📌 Phân Công Nhiệm Vụ Cuộc Họp CLB VMC</h3>
                <p>Xin chào <strong>${m.full_name}</strong>,</p>
                <p>Bạn vừa được phân công nhiệm vụ <strong>${roleTitle}</strong> cho buổi họp sắp tới trên hệ thống VMC Portal.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p><strong>Nội dung họp:</strong> <strong style="font-size: 15px; color: #1e293b;">${title}</strong></p>
                <p><strong>Thời gian:</strong> ${time || '08:00'} ngày ${date || ''}</p>
                <p><strong>Nhiệm vụ của bạn:</strong> <span style="color: #7c3aed; font-weight: bold;">${roleTitle}</span></p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
              </div>
            `
          );
        }
      } catch (e) {
        console.warn('⚠️ Lỗi gửi email phân công cuộc họp:', e.message);
      }
    };

    if (attTaker) await sendMeetingRoleEmail(attTaker, 'Phụ trách điểm danh cuộc họp');
    if (minTaker && minTaker !== attTaker) await sendMeetingRoleEmail(minTaker, 'Ghi biên bản cuộc họp');

    res.json({ success: true, data: { id: mtgId, title, date, time, status, attendanceTakerId: attTaker, minuteTakerId: minTaker } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/meetings/:id', async (req, res) => {
  try {
    const { title, date, time, status, minutes_link, minutesLink, attendanceData } = req.body;
    const link = minutes_link !== undefined ? minutes_link : minutesLink;

    await queryDatabase(
      'UPDATE Meetings SET title = COALESCE(?, title), meeting_date = COALESCE(?, meeting_date), meeting_time = COALESCE(?, meeting_time), status = COALESCE(?, status), minutes_link = COALESCE(?, minutes_link) WHERE id = ?',
      [
        title !== undefined ? title : null,
        date !== undefined ? date : null,
        time !== undefined ? time : null,
        status !== undefined ? status : null,
        link !== undefined ? link : null,
        req.params.id
      ]
    );

    if (Array.isArray(attendanceData)) {
      await queryDatabase('DELETE FROM Meeting_Attendance WHERE meeting_id = ?', [req.params.id]);
      for (const att of attendanceData) {
        const memId = toId(att.memberId || att.member_id);
        if (memId) {
          await queryDatabase(
            'INSERT INTO Meeting_Attendance (meeting_id, member_id, status) VALUES (?, ?, ?)',
            [req.params.id, memId, att.status || 'present']
          );
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/meetings/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Meeting_Attendance WHERE meeting_id = ?', [req.params.id]);
    await queryDatabase('DELETE FROM Meetings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= BIRTHDAY ASSIGNMENTS =======================
router.get('/birthday-assignments', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Birthday_Assignments ORDER BY assign_year DESC, assign_month DESC');
    const data = rows.map(b => {
      let subs = {};
      try {
        subs = b.submissions ? JSON.parse(b.submissions) : {};
      } catch (e) { subs = {}; }

      return {
        id: b.id,
        month: b.assign_month,
        year: b.assign_year,
        memberId: b.member_id,
        link: b.link_image,
        wishesTemplate: b.wishes_template || '',
        status: b.status || 'pending',
        submissions: subs,
        excuseReason: b.excuse_reason || '',
        excuseStatus: b.excuse_status || 'none',
        isPenalized: Boolean(b.is_penalized),
        createdAt: b.created_at
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/birthday-assignments', async (req, res) => {
  try {
    const { id, month, assign_month, year, assign_year, memberId, member_id, link, link_image, status, submissions } = req.body;
    const bdayId = id || generateId();
    const mMonth = parseInt(month || assign_month, 10);
    const mYear = parseInt(year || assign_year, 10);
    const memId = toId(memberId || member_id);
    const subsStr = typeof submissions === 'object' ? JSON.stringify(submissions) : (submissions || '{}');

    await queryDatabase(
      'INSERT INTO Birthday_Assignments (id, assign_month, assign_year, member_id, link_image, status, submissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [bdayId, mMonth, mYear, memId, link || link_image || null, status || 'pending', subsStr]
    );

    if (memId) {
      try {
        const assignees = await queryDatabase(
          'SELECT email, full_name FROM Members WHERE id = ? OR member_code = ? OR full_name = ? OR username = ? LIMIT 1',
          [memId, memId, memId, memId]
        );
        if (assignees && assignees.length > 0 && assignees[0].email) {
          const assignee = assignees[0];

          // Lấy danh sách tổng quan các thành viên có sinh nhật trong tháng mMonth
          const allMembers = await queryDatabase('SELECT full_name, class_name, department, dob, phone FROM Members');
          const monthMembers = (allMembers || []).filter(m => {
            if (!m.dob) return false;
            const parts = String(m.dob).split(/[\/\-]/);
            if (parts.length >= 2) {
              const monthNum = parts[0].length === 4 ? parseInt(parts[1], 10) : parseInt(parts[1], 10);
              return monthNum === mMonth;
            }
            return false;
          });

          const tableRows = monthMembers.map((m, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">${m.full_name}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; color: #db2777; font-weight: bold;">${m.dob}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.class_name || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.department || 'Thành Viên'}</td>
            </tr>
          `).join('');

          const bdayTableHtml = monthMembers.length > 0 ? `
            <h4 style="color: #ec4899; margin-top: 18px; margin-bottom: 8px;">📋 Danh sách tổng quan thành viên sinh nhật tháng ${mMonth}:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 5px;">
              <thead>
                <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">STT</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Họ và Tên</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Ngày Sinh</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Lớp</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Ban Chuyên Môn</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          ` : '<p style="font-style: italic; color: #64748b; margin-top: 10px;">Chưa có dữ liệu ngày sinh thành viên trong tháng này.</p>';

          await sendMailHelper(
            assignee.email,
            `🎂 [VMC Birthday] Phân công trực mừng sinh nhật tháng ${mMonth}/${mYear}`,
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-2xl;">
                <h3 style="color: #ec4899; margin-top: 0;">🎂 Phân Công Trực Mừng Sinh Nhật Tháng ${mMonth}/${mYear}</h3>
                <p>Xin chào <strong>${assignee.full_name}</strong>,</p>
                <p>Bạn đã được phân công phụ trách mừng sinh nhật thành viên trong <strong>Tháng ${mMonth}/${mYear}</strong>.</p>
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                <p><strong>Nhiệm vụ:</strong> Soạn lời chúc và đăng/nộp ảnh chúc mừng sinh nhật cho từng thành viên có sinh nhật trong tháng ${mMonth}.</p>
                ${bdayTableHtml}
                <hr style="border:0; border-top:1px solid #e2e8f0; margin: 18px 0;"/>
                <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
              </div>
            `
          );
        }
      } catch (mailErr) {
        console.warn('⚠️ Lỗi gửi mail phân công sinh nhật:', mailErr.message);
      }
    }

    res.json({ success: true, data: { id: bdayId, month: mMonth, year: mYear, memberId: memId, status, submissions: submissions || {} } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/birthday-assignments/:id', async (req, res) => {
  try {
    const { link, link_image, status, submissions, excuseReason, excuse_reason, excuseStatus, excuse_status, isPenalized, is_penalized } = req.body;
    const imageLink = link !== undefined ? link : link_image;
    const subsStr = submissions !== undefined ? (typeof submissions === 'object' ? JSON.stringify(submissions) : submissions) : undefined;
    const exReason = excuseReason !== undefined ? excuseReason : excuse_reason;
    const exStatus = excuseStatus !== undefined ? excuseStatus : excuse_status;
    const pen = isPenalized !== undefined ? (isPenalized ? 1 : 0) : (is_penalized !== undefined ? (is_penalized ? 1 : 0) : undefined);

    // Kiểm tra xem có lý do không nộp ảnh mới nào được nộp không
    if (submissions !== undefined) {
      try {
        const oldAssignments = await queryDatabase('SELECT submissions, assignee_id, month, year FROM Birthday_Assignments WHERE id = ?', [req.params.id]);
        if (oldAssignments && oldAssignments.length > 0) {
          const oldAssignment = oldAssignments[0];
          const oldSubs = oldAssignment.submissions ? JSON.parse(oldAssignment.submissions) : {};
          const newSubs = typeof submissions === 'string' ? JSON.parse(submissions) : submissions;

          // Tìm xem có memberId nào mới được gán lý do không
          let newNoPhotoMemberId = null;
          let noPhotoReason = '';
          for (const key of Object.keys(newSubs)) {
            const val = String(newSubs[key]);
            if (val.startsWith('Lý do:') && (!oldSubs[key] || oldSubs[key] !== val)) {
              newNoPhotoMemberId = key;
              noPhotoReason = val.replace(/^Lý do:\s*/i, '');
              break;
            }
          }

          if (newNoPhotoMemberId) {
            // Lấy thông tin thành viên đó
            const members = await queryDatabase('SELECT full_name FROM Members WHERE id = ? LIMIT 1', [newNoPhotoMemberId]);
            const memberName = (members && members.length > 0) ? members[0].full_name : 'Thành viên';

            // Lấy thông tin người phụ trách (assignee)
            const assignees = await queryDatabase('SELECT full_name FROM Members WHERE id = ? OR member_code = ? LIMIT 1', [oldAssignment.assignee_id, oldAssignment.assignee_id]);
            const assigneeName = (assignees && assignees.length > 0) ? assignees[0].full_name : 'Người phụ trách';

            // Tìm Trưởng Ban Đối Ngoại - Nhân Sự (HR Head/Admin)
            const reviewers = await queryDatabase(
              `SELECT email, full_name FROM Members WHERE role = 'admin' OR LOWER(department) LIKE '%đối ngoại%' OR LOWER(department) LIKE '%nhân sự%' OR LOWER(department) LIKE '%đn-ns%'`
            );

            const emails = reviewers.map(r => r.email).filter(Boolean);
            if (emails.length > 0) {
              await sendMailHelper(
                emails.join(','),
                `⚠️ [VMC Birthday] Giải trình không nộp ảnh sinh nhật tháng ${oldAssignment.month}/${oldAssignment.year}`,
                `
                  <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-w-lg;">
                    <h3 style="color: #d97706;">⚠️ Báo cáo không có ảnh sinh nhật thành viên</h3>
                    <p>Chào bạn,</p>
                    <p>Thành viên <strong>${assigneeName}</strong> vừa nộp giải trình không có ảnh/video cho thành viên mừng sinh nhật.</p>
                    <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                    <p><strong>Thành viên sinh nhật:</strong> ${memberName}</p>
                    <p><strong>Tháng sinh nhật:</strong> Tháng ${oldAssignment.month}/${oldAssignment.year}</p>
                    <p><strong>Lý do giải trình:</strong> <span style="color: #b45309; font-weight: bold;">"${noPhotoReason}"</span></p>
                    <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                    <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                  </div>
                `
              );
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Lỗi gửi mail giải trình không nộp ảnh:', err.message);
      }
    }

    await queryDatabase(
      'UPDATE Birthday_Assignments SET link_image = COALESCE(?, link_image), status = COALESCE(?, status), submissions = COALESCE(?, submissions), excuse_reason = COALESCE(?, excuse_reason), excuse_status = COALESCE(?, excuse_status), is_penalized = COALESCE(?, is_penalized) WHERE id = ?',
      [
        imageLink !== undefined ? imageLink : null,
        status !== undefined ? status : null,
        subsStr !== undefined ? subsStr : null,
        exReason !== undefined ? exReason : null,
        exStatus !== undefined ? exStatus : null,
        pen !== undefined ? pen : null,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= GOOGLE DRIVE CONFIG & HELPERS =======================
const authDrive = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath || !fs.existsSync(credentialsPath)) {
    console.warn('⚠️ Google Application Credentials not configured or file not found!');
    return null;
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth });
};

const getHRDriveFolderId = async () => {
  try {
    const rows = await queryDatabase('SELECT drive_link FROM Department_Drives WHERE dept_name = ? OR dept_name = ? LIMIT 1', ['Ban Đối Ngoại - Nhân Sự', 'Ban Đối Ngoại - Nhân sự']);
    if (rows && rows.length > 0) {
      const link = rows[0].drive_link;
      const match = link.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      if (match) return match[1];
    }
  } catch (e) {
    console.error('⚠️ Failed to query HR drive folder ID:', e.message);
  }
  return null;
};

// Route for birthday image/file upload directly to Google Drive
router.post('/birthday/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'Không tìm thấy file tải lên!' });
  }

  try {
    const drive = authDrive();
    if (!drive) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({ success: false, message: 'Google Drive API chưa được cấu hình hoặc file credentials không tồn tại!' });
    }

    const folderId = await getHRDriveFolderId();
    const fileMetadata = {
      name: file.originalname,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const driveFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make public
    try {
      await drive.permissions.create({
        fileId: driveFile.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('⚠️ Could not set public permissions on drive file:', permErr.message);
    }

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.json({
      success: true,
      webViewLink: driveFile.data.webViewLink,
      fileId: driveFile.data.id
    });
  } catch (err) {
    console.error('❌ Google Drive upload error:', err.message);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ======================= FINANCES =======================
// (Duplicate finances routes removed - handled above)

// ======================= USER SESSIONS (SUPER ADMIN) =======================
router.get('/sessions', async (req, res) => {
  try {
    // Tự động quét và đánh dấu phiên hết hạn (không nhận heartbeat trong 1 phút qua) là ngừng hoạt động
    await queryDatabase("UPDATE User_Sessions SET is_active = 0, logout_reason = 'timeout' WHERE is_active = 1 AND last_active < NOW() - INTERVAL 1 MINUTE");

    const sql = `
      SELECT 
        s.*,
        COALESCE(NULLIF(m.full_name, ''), s.name) AS real_name,
        COALESCE(NULLIF(m.role_title, ''), s.role_title) AS real_role_title
      FROM User_Sessions s
      LEFT JOIN Members m ON (
        s.member_id = m.id
        OR s.username = m.username
        OR s.member_id = m.member_code
      )
      ORDER BY s.login_time DESC, s.last_active DESC
    `;
    const sessions = await queryDatabase(sql);
    res.json({
      success: true,
      data: sessions.map(s => ({
        ...s,
        name: s.real_name || s.name,
        role_title: s.real_role_title || s.role_title || 'Thành Viên VMC'
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sessions/login', async (req, res) => {
  try {
    const { sessionId, memberId, username, name, roleTitle, userAgent } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    let realName = (name && name !== 'Quản Trị Viên') ? name : '';
    let realRole = roleTitle || '';

    if (memberId || username) {
      const mems = await queryDatabase(
        'SELECT full_name, role_title FROM Members WHERE id = ? OR username = ? OR member_code = ? LIMIT 1',
        [String(memberId || ''), String(username || ''), String(username || '')]
      );
      if (mems && mems.length > 0 && mems[0].full_name && mems[0].full_name !== 'Quản Trị Viên') {
        realName = mems[0].full_name;
        realRole = mems[0].role_title || realRole;
      }
    }

    if (!realName || realName === 'Quản Trị Viên') {
      if (username === 'admin' || memberId === 'ADMIN') {
        realName = 'Vũ Mai Quang';
      } else {
        realName = name || 'Thành Viên VMC';
      }
    }

    let sId = sessionId;
    if (sId) {
      const existing = await queryDatabase('SELECT is_active FROM User_Sessions WHERE id = ?', [sId]);
      if (existing && existing.length > 0 && Number(existing[0].is_active) === 0) {
        sId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      }
    }
    if (!sId) {
      sId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    }

    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent || '');
    const deviceType = isMobile ? 'Mobile Phone' : 'Desktop / PC';

    await queryDatabase(
      `INSERT INTO User_Sessions (id, member_id, username, name, role_title, ip_address, user_agent, device_type, login_time, last_active, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 1)
       ON DUPLICATE KEY UPDATE last_active = NOW(), is_active = 1, name = VALUES(name), role_title = VALUES(role_title), ip_address = VALUES(ip_address), user_agent = VALUES(user_agent), device_type = VALUES(device_type)`,
      [sId, String(memberId), username || '', realName, realRole, ip, userAgent || '', deviceType]
    );

    res.json({ success: true, sessionId: sId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sessions/heartbeat', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.json({ success: true, isActive: true });

    const rows = await queryDatabase(
      `SELECT s.is_active, m.status
       FROM User_Sessions s
       LEFT JOIN Members m ON (
         s.member_id = m.id
         OR s.username = m.username
         OR s.member_id = m.member_code
       )
       WHERE s.id = ?`,
      [sessionId]
    );

    if (rows && rows.length > 0) {
      const sessionRow = rows[0];
      if (Number(sessionRow.is_active) === 0) {
        return res.json({ success: true, isActive: false, message: 'Phiên đăng nhập đã bị Super Admin hủy bỏ.' });
      }

      if (String(sessionRow.status).toLowerCase() === 'suspended') {
        await queryDatabase("UPDATE User_Sessions SET is_active = 0, logout_reason = 'suspended' WHERE id = ?", [sessionId]);
        return res.json({ success: true, isActive: false, message: 'Tài khoản đã bị tạm khóa. Phiên đăng nhập sẽ bị ngắt.' });
      }
    }

    await queryDatabase('UPDATE User_Sessions SET last_active = NOW() WHERE id = ?', [sessionId]);
    res.json({ success: true, isActive: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    await queryDatabase("UPDATE User_Sessions SET is_active = 0, logout_reason = 'revoked' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sessions/logout', async (req, res) => {
  try {
    const { sessionId, memberId, username } = req.body;
    if (sessionId) {
      await queryDatabase(
        "UPDATE User_Sessions SET is_active = 0, logout_reason = 'logout', last_active = NOW() WHERE id = ?",
        [sessionId]
      );
    }
    if (memberId || username) {
      await queryDatabase(
        "UPDATE User_Sessions SET is_active = 0, logout_reason = 'logout', last_active = NOW() WHERE is_active = 1 AND (member_id = ? OR username = ? OR member_id = ?)",
        [String(memberId || ''), String(username || ''), String(username || '')]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sessions/revoke-all', async (req, res) => {
  try {
    const { currentSessionId } = req.body;
    await queryDatabase("UPDATE User_Sessions SET is_active = 0, logout_reason = 'revoked' WHERE id != ?", [currentSessionId || '']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= MEMBER MILESTONES =======================
router.get('/milestones', async (req, res) => {
  try {
    const milestones = await queryDatabase('SELECT * FROM Member_Milestones ORDER BY created_at ASC');
    const data = milestones.map(m => ({
      id: m.id,
      memberId: m.member_id,
      date: m.date,
      title: m.title,
      badgeText: m.badge_text,
      badgeStyle: m.badge_style,
      createdAt: m.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/milestones', async (req, res) => {
  try {
    const { id, memberId, member_id, date, title, badgeText, badge_text, badgeStyle, badge_style } = req.body;
    const msId = id || generateId();
    const targetMemId = String(memberId || member_id);

    await queryDatabase(
      'INSERT INTO Member_Milestones (id, member_id, date, title, badge_text, badge_style) VALUES (?, ?, ?, ?, ?, ?)',
      [
        msId,
        targetMemId,
        date || new Date().toLocaleDateString('vi-VN'),
        title || 'Cập nhật cột mốc mới',
        badgeText || badge_text || '[Cột mốc]',
        badgeStyle || badge_style || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      ]
    );

    res.json({ success: true, data: { id: msId, memberId: targetMemId, date, title, badgeText, badgeStyle } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/milestones/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Member_Milestones WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= GENERATIONS =======================
router.get('/generations', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Generations ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/generations', async (req, res) => {
  try {
    const { id, name, years, description } = req.body;
    const genId = id || ('gen-' + Date.now());
    await queryDatabase(
      'INSERT INTO Generations (id, name, years, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), years = VALUES(years), description = VALUES(description)',
      [genId, name, years || '', description || '']
    );
    res.json({ success: true, data: { id: genId, name, years, description } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/generations/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Generations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa Gen thành công' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= RESOURCES =======================
router.get('/resources', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Resources ORDER BY created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      link: r.link,
      uploaderId: r.uploader_id,
      createdAt: r.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/resources', async (req, res) => {
  try {
    const { id, title, description, category, link, uploaderId, uploader_id } = req.body;
    const resId = id || generateId();
    const upId = toId(uploaderId || uploader_id);

    await queryDatabase(
      'INSERT INTO Resources (id, title, description, category, link, uploader_id) VALUES (?, ?, ?, ?, ?, ?)',
      [resId, title, description || '', category || 'Chung', link, upId]
    );
    res.json({ success: true, data: { id: resId, title, description, category, link, uploaderId: upId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/resources/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Resources WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= DEPARTMENT DRIVES =======================
router.get('/department-drives', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Department_Drives ORDER BY id ASC');
    const data = rows.map(d => ({
      id: d.id,
      deptName: d.dept_name,
      link: d.drive_link,
      driveUrl: d.drive_link,
      updatedAt: d.updated_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/department-drives/:id', async (req, res) => {
  try {
    const { link, drive_link } = req.body;
    const dLink = link !== undefined ? link : drive_link;

    await queryDatabase(
      'UPDATE Department_Drives SET drive_link = ? WHERE id = ? OR dept_name = ?',
      [dLink, req.params.id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= ATTENDANCE RECORDS =======================
router.get('/attendance-records', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Attendance_Records ORDER BY created_at DESC');
    const data = rows.map(a => {
      let presentIds = [];
      try {
        presentIds = a.present_members ? JSON.parse(a.present_members) : [];
      } catch (e) { presentIds = []; }

      return {
        id: a.id,
        sessionName: a.session_name,
        date: a.record_date,
        presentMemberIds: presentIds,
        status: a.status || 'approved',
        createdAt: a.created_at
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/attendance-records', async (req, res) => {
  try {
    const { id, sessionName, session_name, date, record_date, presentMemberIds, present_members, status } = req.body;
    const recId = id || generateId();
    const sName = sessionName || session_name || `Buổi Sinh Hoạt ngày ${new Date().toLocaleDateString('vi-VN')}`;
    const rDate = date || record_date || new Date().toLocaleDateString('vi-VN');
    const pMembersStr = Array.isArray(presentMemberIds) ? JSON.stringify(presentMemberIds) : (present_members || '[]');

    await queryDatabase(
      'INSERT INTO Attendance_Records (id, session_name, record_date, present_members, status) VALUES (?, ?, ?, ?, ?)',
      [recId, sName, rDate, pMembersStr, status || 'approved']
    );
    res.json({ success: true, data: { id: recId, sessionName: sName, date: rDate, presentMemberIds: presentMemberIds || [] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/attendance-records/:id', async (req, res) => {
  try {
    const { status, presentMemberIds, present_members } = req.body;
    const pMembersStr = presentMemberIds !== undefined ? JSON.stringify(presentMemberIds) : (present_members !== undefined ? present_members : undefined);

    const setClauses = [];
    const params = [];

    if (status !== undefined) {
      setClauses.push('status = ?');
      params.push(status);
    }
    if (pMembersStr !== undefined) {
      setClauses.push('present_members = ?');
      params.push(pMembersStr);
    }

    if (setClauses.length === 0) {
      return res.json({ success: true });
    }

    await queryDatabase(
      `UPDATE Attendance_Records SET ${setClauses.join(', ')} WHERE id = ?`,
      [...params, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= GENERATIONS =======================
router.get('/generations', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Generations ORDER BY id DESC');
    const data = rows.map(g => ({
      id: g.id,
      name: g.name,
      years: g.years,
      description: g.description || `${g.name} (${g.years || ''})`
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/generations', async (req, res) => {
  try {
    const { id, name, years, description } = req.body;
    const genId = id || ('gen-' + Date.now());
    await queryDatabase(
      'INSERT INTO Generations (id, name, years, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), years = VALUES(years), description = VALUES(description)',
      [genId, name, years || '', description || '']
    );
    res.json({ success: true, data: { id: genId, name, years, description } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/generations/:id', async (req, res) => {
  try {
    await queryDatabase('DELETE FROM Generations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa Gen thành công' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
