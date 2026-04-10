const db = require('../db/db');

async function createRequest(req, res) {
  const { owner_id, message } = req.body;
  if (!owner_id) return res.status(400).json({ error: 'owner_id is required' });

  // Verify target is actually an owner
  const [owners] = await db.execute('SELECT id, email FROM users WHERE id = ? AND is_owner = TRUE', [owner_id]);
  if (owners.length === 0) return res.status(404).json({ error: 'Owner not found' });

  const [result] = await db.execute(
    'INSERT INTO meeting_requests (requester_id, owner_id, message) VALUES (?, ?, ?)',
    [req.user.id, owner_id, message || null]
  );

  res.status(201).json({
    request_id: result.insertId,
    notify: {
      owner_email: owners[0].email,
      mailto: `mailto:${owners[0].email}?subject=New%20Meeting%20Request&body=${encodeURIComponent(message || 'A user has requested a meeting.')}`,
    },
  });
}

async function listRequests(req, res) {
  // Owner sees their incoming requests
  const [rows] = await db.execute(
    `SELECT mr.*, u.display_name AS requester_name, u.email AS requester_email
     FROM meeting_requests mr
     JOIN users u ON mr.requester_id = u.id
     WHERE mr.owner_id = ?
     ORDER BY mr.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

async function acceptRequest(req, res) {
  const { start_time, end_time } = req.body;
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'start_time and end_time required to create the slot' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify request belongs to this owner and is pending
    const [reqs] = await conn.execute(
      'SELECT * FROM meeting_requests WHERE id = ? AND owner_id = ? AND status = ?',
      [req.params.id, req.user.id, 'pending']
    );
    if (reqs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Request not found or already handled' });
    }

    const mr = reqs[0];

    // Update status
    await conn.execute('UPDATE meeting_requests SET status = ? WHERE id = ?', ['accepted', mr.id]);

    // Create a slot and immediately book it for the requester
    const [slotResult] = await conn.execute(
      'INSERT INTO slots (owner_id, title, start_time, end_time, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [req.user.id, `Meeting with requester`, start_time, end_time]
    );
    await conn.execute(
      'INSERT INTO bookings (slot_id, user_id) VALUES (?, ?)',
      [slotResult.insertId, mr.requester_id]
    );

    await conn.commit();

    // Get requester email for notification
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [mr.requester_id]);
    const email = users[0]?.email || '';

    res.json({
      message: 'Request accepted, slot created and booked',
      slot_id: slotResult.insertId,
      notify: {
        requester_email: email,
        mailto: `mailto:${email}?subject=Meeting%20Request%20Accepted&body=Your%20meeting%20request%20has%20been%20accepted.`,
      },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function declineRequest(req, res) {
  const [result] = await db.execute(
    'UPDATE meeting_requests SET status = ? WHERE id = ? AND owner_id = ? AND status = ?',
    ['declined', req.params.id, req.user.id, 'pending']
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found or already handled' });
  res.json({ message: 'Request declined' });
}

module.exports = { createRequest, listRequests, acceptRequest, declineRequest };
