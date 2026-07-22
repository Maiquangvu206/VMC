import express from 'express';
import { queryDatabase } from './db.js';

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

// ======================= TASKS =======================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await queryDatabase('SELECT * FROM Tasks ORDER BY created_at DESC');
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, department, assignee, deadline, priority, status, description } = req.body;
    const id = generateId();
    // Temporary hack for assignee since assignee_id is INT in DB but frontend uses string (name)
    await queryDatabase(
      'INSERT INTO Tasks (id, title, department, deadline, priority, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, department, deadline || null, priority || 'Medium', status || 'pending', description || assignee || '']
    );
    res.json({ success: true, data: { id, title, department, deadline, priority, status, description, assignee } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await queryDatabase('UPDATE Tasks SET status = ? WHERE id = ?', [status, req.params.id]);
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
    res.json({ success: true, data: drafts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/drafts', async (req, res) => {
  try {
    const { title, content, author, author_id, status } = req.body;
    const id = generateId();
    await queryDatabase(
      'INSERT INTO Fanpage_Drafts (id, title, content, author, author_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, content || '', author || '', author_id || null, status || 'pending']
    );
    res.json({ success: true, data: { id, title, content, author, author_id, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/drafts/:id', async (req, res) => {
  try {
    const { status, publishDate, graderId, gradingStatus } = req.body;
    await queryDatabase(
      'UPDATE Fanpage_Drafts SET status = COALESCE(?, status), publishDate = COALESCE(?, publishDate), graderId = COALESCE(?, graderId), gradingStatus = COALESCE(?, gradingStatus) WHERE id = ?',
      [status, publishDate, graderId, gradingStatus, req.params.id]
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
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/equipment', async (req, res) => {
  try {
    const { code, name, category, condition_status, status } = req.body;
    const id = generateId();
    await queryDatabase(
      'INSERT INTO Equipment (id, code, name, category, condition_status, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, code, name, category, condition_status || 'Tốt', status || 'available']
    );
    res.json({ success: true, data: { id, code, name, category, condition_status, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/equipment/:id', async (req, res) => {
  try {
    const { status, borrower_id, return_date } = req.body;
    await queryDatabase(
      'UPDATE Equipment SET status = COALESCE(?, status), borrower_id = ?, return_date = ? WHERE id = ?',
      [status, borrower_id || null, return_date || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================= ANNOUNCEMENTS =======================
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await queryDatabase('SELECT * FROM Internal_Announcements ORDER BY created_at DESC');
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { title, content, author_id, is_pinned } = req.body;
    const id = generateId();
    await queryDatabase(
      'INSERT INTO Internal_Announcements (id, title, content, author_id, is_pinned) VALUES (?, ?, ?, ?, ?)',
      [id, title, content, author_id || null, is_pinned ? 1 : 0]
    );
    res.json({ success: true, data: { id, title, content, author_id, is_pinned } });
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

export default router;
