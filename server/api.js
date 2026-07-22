import express from 'express';
import { queryDatabase } from './db.js';

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

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
    const assId = parseInt(assignee_id || assigneeId, 10) || null;
    const creatorId = parseInt(created_by, 10) || null;

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
    const assId = (assignee_id !== undefined || assigneeId !== undefined) ? (parseInt(assignee_id || assigneeId, 10) || null) : undefined;
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
    const autId = parseInt(author_id || authorId, 10) || null;
    const grId = parseInt(graderId, 10) || null;

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
    const grId = graderId !== undefined ? (parseInt(graderId, 10) || null) : undefined;
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
    const bId = parseInt(borrower_id, 10) || null;

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
    const bId = borrower_id !== undefined ? (parseInt(borrower_id, 10) || null) : undefined;
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
    const autId = parseInt(author_id || authorId, 10) || null;
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
    const recBy = parseInt(recorded_by || logged_by, 10) || null;
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
    const { id, title, date, time, attendance_taker_id, minute_taker_id, status, minutes_link } = req.body;
    const mtgId = id || generateId();
    const attTaker = parseInt(attendance_taker_id, 10) || null;
    const minTaker = parseInt(minute_taker_id, 10) || null;

    await queryDatabase(
      'INSERT INTO Meetings (id, title, meeting_date, meeting_time, attendance_taker_id, minute_taker_id, status, minutes_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [mtgId, title, date || new Date().toISOString().slice(0, 10), time || '08:00', attTaker, minTaker, status || 'pending', minutes_link || null]
    );
    res.json({ success: true, data: { id: mtgId, title, date, time, status } });
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
        const memId = parseInt(att.memberId || att.member_id, 10);
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
    const data = rows.map(b => ({
      id: b.id,
      month: b.assign_month,
      year: b.assign_year,
      memberId: b.member_id,
      link: b.link_image,
      status: b.status || 'pending',
      createdAt: b.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/birthday-assignments', async (req, res) => {
  try {
    const { id, month, assign_month, year, assign_year, memberId, member_id, link, link_image, status } = req.body;
    const bdayId = id || generateId();
    const mMonth = parseInt(month || assign_month, 10);
    const mYear = parseInt(year || assign_year, 10);
    const memId = parseInt(memberId || member_id, 10);

    await queryDatabase(
      'INSERT INTO Birthday_Assignments (id, assign_month, assign_year, member_id, link_image, status) VALUES (?, ?, ?, ?, ?, ?)',
      [bdayId, mMonth, mYear, memId, link || link_image || null, status || 'pending']
    );
    res.json({ success: true, data: { id: bdayId, month: mMonth, year: mYear, memberId: memId, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/birthday-assignments/:id', async (req, res) => {
  try {
    const { link, link_image, status } = req.body;
    const imageLink = link !== undefined ? link : link_image;
    await queryDatabase(
      'UPDATE Birthday_Assignments SET link_image = COALESCE(?, link_image), status = COALESCE(?, status) WHERE id = ?',
      [
        imageLink !== undefined ? imageLink : null,
        status !== undefined ? status : null,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
