import express from 'express';
import { queryDatabase } from './db.js';

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);
const toId = (val) => (val !== undefined && val !== null && val !== '') ? String(val) : null;

// ======================= TASKS =======================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await queryDatabase('SELECT * FROM Tasks ORDER BY created_at DESC');
    const data = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      assigneeId: t.assignee_id,
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
    const { id, title, description, assignee_id, assigneeId, created_by, deadline, status, points_reward } = req.body;
    const taskId = id || generateId();
    const assId = toId(assignee_id || assigneeId);
    const creatorId = toId(created_by);

    await queryDatabase(
      'INSERT INTO Tasks (id, title, description, assignee_id, created_by, deadline, status, points_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [taskId, title, description || '', assId, creatorId, deadline || null, status || 'todo', points_reward || 10]
    );
    res.json({ success: true, data: { id: taskId, title, description, assigneeId: assId, deadline, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { status, title, description, deadline, assignee_id, assigneeId, points_reward } = req.body;
    const assId = (assignee_id !== undefined || assigneeId !== undefined) ? toId(assignee_id || assigneeId) : undefined;
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
      createdAt: d.created_at
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
    const { status, publishDate, graderId, gradingStatus, title, content, content_link, author } = req.body;
    const grId = graderId !== undefined ? toId(graderId) : undefined;
    await queryDatabase(
      'UPDATE Fanpage_Drafts SET status = COALESCE(?, status), publishDate = COALESCE(?, publishDate), graderId = COALESCE(?, graderId), gradingStatus = COALESCE(?, gradingStatus), title = COALESCE(?, title), content = COALESCE(?, content), content_link = COALESCE(?, content_link), author = COALESCE(?, author) WHERE id = ?',
      [
        status !== undefined ? status : null,
        publishDate !== undefined ? publishDate : null,
        grId !== undefined ? grId : null,
        gradingStatus !== undefined ? gradingStatus : null,
        title !== undefined ? title : null,
        content !== undefined ? content : null,
        content_link !== undefined ? content_link : null,
        author !== undefined ? author : null,
        req.params.id
      ]
    );
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

// ======================= FINANCES =======================
router.get('/finances', async (req, res) => {
  try {
    const rows = await queryDatabase('SELECT * FROM Finances ORDER BY record_date DESC, created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      description: r.description,
      date: r.record_date ? new Date(r.record_date).toISOString().slice(0, 10) : '',
      record_date: r.record_date ? new Date(r.record_date).toISOString().slice(0, 10) : '',
      recorded_by: r.recorded_by,
      status: 'approved'
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/finances', async (req, res) => {
  try {
    const { id, type, amount, description, record_date, date, recorded_by, logged_by } = req.body;
    const finId = id || generateId();
    const recBy = toId(recorded_by || logged_by);
    const recDate = record_date || date || new Date().toISOString().slice(0, 10);

    await queryDatabase(
      'INSERT INTO Finances (id, type, amount, description, record_date, recorded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [finId, type, amount, description, recDate, recBy]
    );
    res.json({ success: true, data: { id: finId, type, amount, description, record_date: recDate } });
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

// ======================= USER SESSIONS (SUPER ADMIN) =======================
router.get('/sessions', async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.*,
        COALESCE(NULLIF(m.full_name, ''), s.name) as real_name,
        COALESCE(NULLIF(m.role_title, ''), s.role_title) as real_role_title
      FROM User_Sessions s
      LEFT JOIN Members m ON (
        CAST(s.member_id AS CHAR) = CAST(m.id AS CHAR) 
        OR UPPER(s.member_id) = UPPER(m.member_code) 
        OR LOWER(s.username) = LOWER(m.username)
      )
      ORDER BY s.login_time DESC, s.last_active DESC
    `;
    const sessions = await queryDatabase(sql);
    res.json({
      success: true,
      data: sessions.map(s => ({
        ...s,
        name: (s.real_name && s.real_name !== 'Quản Trị Viên') 
          ? s.real_name 
          : ((s.username === 'admin' || s.member_id === 'ADMIN' || s.name === 'Quản Trị Viên') ? 'Vũ Mai Quang' : (s.name || 'Thành Viên VMC')),
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

    const rows = await queryDatabase('SELECT is_active FROM User_Sessions WHERE id = ?', [sessionId]);
    if (rows && rows.length > 0 && Number(rows[0].is_active) === 0) {
      return res.json({ success: true, isActive: false, message: 'Phiên đăng nhập đã bị Super Admin hủy bỏ.' });
    }

    await queryDatabase('UPDATE User_Sessions SET last_active = NOW() WHERE id = ?', [sessionId]);
    res.json({ success: true, isActive: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    await queryDatabase('UPDATE User_Sessions SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sessions/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await queryDatabase(
        'UPDATE User_Sessions SET is_active = 0, last_active = NOW() WHERE id = ?',
        [sessionId]
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
    await queryDatabase('UPDATE User_Sessions SET is_active = 0 WHERE id != ?', [currentSessionId || '']);
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
