const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

async function listSlots(req, res) {
  const { owner_id } = req.query;
  let sql = 'SELECT s.*, u.display_name AS owner_name FROM slots s JOIN users u ON s.owner_id = u.id WHERE s.is_active = TRUE';
  const params = [];

  if (owner_id) {
    sql += ' AND s.owner_id = ?';
    params.push(owner_id);
  }

  sql += ' ORDER BY s.start_time ASC';
  const [rows] = await db.execute(sql, params);
  res.json(rows);
}

async function getSlot(req, res) {
  const [rows] = await db.execute(
    `SELECT s.*, u.display_name AS owner_name,
            b.user_id AS booked_by
     FROM slots s
     JOIN users u ON s.owner_id = u.id
     LEFT JOIN bookings b ON b.slot_id = s.id
     WHERE s.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Slot not found' });
  res.json(rows[0]);
}

async function createSlot(req, res) {
  const { title, start_time, end_time, recurrence_weeks } = req.body;
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'start_time and end_time are required' });
  }

  const weeks = recurrence_weeks || 0;

  // If recurring, generate one row per week
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const ids = [];
    for (let w = 0; w <= weeks; w++) {
      const offset = w * 7;
      const [result] = await conn.execute(
        `INSERT INTO slots (owner_id, title, start_time, end_time, is_active, recurrence_weeks)
         VALUES (?, ?, DATE_ADD(?, INTERVAL ? DAY), DATE_ADD(?, INTERVAL ? DAY), FALSE, ?)`,
        [req.user.id, title || '', start_time, offset, end_time, offset, weeks]
      );
      ids.push(result.insertId);
    }
    await conn.commit();
    res.status(201).json({ created: ids.length, slot_ids: ids });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function activateSlot(req, res) {
  const [result] = await db.execute(
    'UPDATE slots SET is_active = TRUE WHERE id = ? AND owner_id = ?',
    [req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Slot not found or not yours' });
  res.json({ message: 'Slot activated' });
}

async function deleteSlot(req, res) {
  // Check if someone booked it — return their email for mailto: notification
  const [bookings] = await db.execute(
    `SELECT u.email, u.display_name FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.slot_id = ? AND EXISTS (SELECT 1 FROM slots WHERE id = ? AND owner_id = ?)`,
    [req.params.id, req.params.id, req.user.id]
  );

  const [result] = await db.execute(
    'DELETE FROM slots WHERE id = ? AND owner_id = ?',
    [req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Slot not found or not yours' });

  res.json({
    message: 'Slot deleted',
    notify: bookings.map((b) => ({
      email: b.email,
      display_name: b.display_name,
      mailto: `mailto:${b.email}?subject=Booking%20Cancelled&body=Your%20booking%20has%20been%20cancelled.`,
    })),
  });
}

async function getOwnerSlots(req, res) {
  const [rows] = await db.execute(
    `SELECT s.*, b.user_id AS booked_by, u.display_name AS booked_by_name, u.email AS booked_by_email
     FROM slots s
     LEFT JOIN bookings b ON b.slot_id = s.id
     LEFT JOIN users u ON b.user_id = u.id
     WHERE s.owner_id = ?
     ORDER BY s.start_time ASC`,
    [req.user.id]
  );
  res.json(rows);
}

async function listOwners(req, res) {
  const [rows] = await db.execute(
    `SELECT u.id, u.display_name, u.email, COUNT(s.id) AS active_slots
     FROM users u
     LEFT JOIN slots s ON s.owner_id = u.id AND s.is_active = TRUE
     WHERE u.is_owner = TRUE
     GROUP BY u.id
     ORDER BY u.display_name`
  );
  res.json(rows);
}

module.exports = { listSlots, getSlot, createSlot, activateSlot, deleteSlot, getOwnerSlots, listOwners };
