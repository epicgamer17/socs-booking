const db = require('../db/db');

async function listMyBookings(req, res) {
  const [rows] = await db.execute(
    `SELECT b.id, b.created_at AS booked_at,
            s.id AS slot_id, s.title, s.start_time, s.end_time,
            u.display_name AS owner_name, u.email AS owner_email
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     JOIN users u ON s.owner_id = u.id
     WHERE b.user_id = ?
     ORDER BY s.start_time ASC`,
    [req.user.id]
  );
  res.json(rows);
}

async function bookSlot(req, res) {
  const { slot_id } = req.body;
  if (!slot_id) return res.status(400).json({ error: 'slot_id is required' });

  // Verify slot is active and not already booked
  const [slots] = await db.execute(
    `SELECT s.id, s.owner_id FROM slots s
     LEFT JOIN bookings b ON b.slot_id = s.id
     WHERE s.id = ? AND s.is_active = TRUE AND b.id IS NULL`,
    [slot_id]
  );
  if (slots.length === 0) {
    return res.status(409).json({ error: 'Slot unavailable or already booked' });
  }
  if (slots[0].owner_id === req.user.id) {
    return res.status(400).json({ error: 'Cannot book your own slot' });
  }

  const [result] = await db.execute(
    'INSERT INTO bookings (slot_id, user_id) VALUES (?, ?)',
    [slot_id, req.user.id]
  );
  res.status(201).json({ booking_id: result.insertId });
}

async function cancelBooking(req, res) {
  // Get owner info before deleting so frontend can show mailto: link
  const [info] = await db.execute(
    `SELECT u.email AS owner_email, u.display_name AS owner_name
     FROM bookings b
     JOIN slots s ON b.slot_id = s.id
     JOIN users u ON s.owner_id = u.id
     WHERE b.id = ? AND b.user_id = ?`,
    [req.params.id, req.user.id]
  );

  const [result] = await db.execute(
    'DELETE FROM bookings WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });

  const owner = info[0] || {};
  res.json({
    message: 'Booking cancelled',
    notify: {
      owner_email: owner.owner_email,
      mailto: `mailto:${owner.owner_email}?subject=Booking%20Cancelled&body=A%20user%20has%20cancelled%20their%20booking.`,
    },
  });
}

module.exports = { listMyBookings, bookSlot, cancelBooking };
