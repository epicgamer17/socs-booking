const db = require('../db/db');

async function createGroupMeeting(req, res) {
  const { title, start_date, end_date, method, time_slots, invitee_emails } = req.body;
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO group_meetings (owner_id, title, method, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title || '', method || 'calendar', start_date, end_date]
    );
    const groupId = result.insertId;

    // Add invitees by email
    if (invitee_emails && invitee_emails.length > 0) {
      const placeholders = invitee_emails.map(() => '?').join(',');
      const [users] = await conn.execute(
        `SELECT id, email FROM users WHERE email IN (${placeholders})`,
        invitee_emails.map((e) => e.toLowerCase())
      );
      for (const user of users) {
        await conn.execute(
          'INSERT IGNORE INTO group_meeting_invitees (group_meeting_id, user_id) VALUES (?, ?)',
          [groupId, user.id]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ group_meeting_id: groupId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getGroupMeeting(req, res) {
  const [meetings] = await db.execute(
    'SELECT * FROM group_meetings WHERE id = ?',
    [req.params.id]
  );
  if (meetings.length === 0) return res.status(404).json({ error: 'Not found' });

  const meeting = meetings[0];

  // Get invitees
  const [invitees] = await db.execute(
    `SELECT u.id, u.display_name, u.email
     FROM group_meeting_invitees gi
     JOIN users u ON gi.user_id = u.id
     WHERE gi.group_meeting_id = ?`,
    [meeting.id]
  );

  // Get response counts per time slot
  const [responses] = await db.execute(
    `SELECT slot_start, slot_end, COUNT(*) AS vote_count
     FROM group_meeting_responses
     WHERE group_meeting_id = ?
     GROUP BY slot_start, slot_end
     ORDER BY vote_count DESC, slot_start ASC`,
    [meeting.id]
  );

  res.json({ ...meeting, invitees, responses });
}

async function submitResponse(req, res) {
  const { selections } = req.body;
  // selections = [{ slot_start, slot_end }, ...]
  if (!selections || !Array.isArray(selections) || selections.length === 0) {
    return res.status(400).json({ error: 'selections array is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Clear previous responses from this user for this meeting
    await conn.execute(
      'DELETE FROM group_meeting_responses WHERE group_meeting_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    for (const s of selections) {
      await conn.execute(
        'INSERT INTO group_meeting_responses (group_meeting_id, user_id, slot_start, slot_end) VALUES (?, ?, ?, ?)',
        [req.params.id, req.user.id, s.slot_start, s.slot_end]
      );
    }

    await conn.commit();
    res.json({ message: 'Response recorded', count: selections.length });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function finalize(req, res) {
  const { chosen_start, chosen_end, recurrence_weeks } = req.body;
  if (!chosen_start || !chosen_end) {
    return res.status(400).json({ error: 'chosen_start and chosen_end are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [meetings] = await conn.execute(
      'SELECT * FROM group_meetings WHERE id = ? AND owner_id = ? AND is_finalized = FALSE',
      [req.params.id, req.user.id]
    );
    if (meetings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Meeting not found or already finalized' });
    }

    await conn.execute('UPDATE group_meetings SET is_finalized = TRUE WHERE id = ?', [req.params.id]);

    // Create slots (one per recurrence week) and book all invitees
    const weeks = recurrence_weeks || 0;
    const [invitees] = await conn.execute(
      'SELECT user_id FROM group_meeting_invitees WHERE group_meeting_id = ?',
      [req.params.id]
    );

    for (let w = 0; w <= weeks; w++) {
      const offset = w * 7;
      const [slotResult] = await conn.execute(
        `INSERT INTO slots (owner_id, title, start_time, end_time, is_active, recurrence_weeks)
         VALUES (?, ?, DATE_ADD(?, INTERVAL ? DAY), DATE_ADD(?, INTERVAL ? DAY), TRUE, ?)`,
        [req.user.id, meetings[0].title, chosen_start, offset, chosen_end, offset, weeks]
      );
      for (const inv of invitees) {
        await conn.execute(
          'INSERT INTO bookings (slot_id, user_id) VALUES (?, ?)',
          [slotResult.insertId, inv.user_id]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Meeting finalized, slots created and booked for all invitees' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createGroupMeeting, getGroupMeeting, submitResponse, finalize };
