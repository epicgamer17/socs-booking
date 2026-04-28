//Thomas Nguyen
/*
  ---Message from Sophia---
  For the bookings table, can you make sure it has:

  id (primary key)
  slotID (foreign key → slots.id)
  userID (who booked the slot)
  optional: dateBooked

  I’m using:
  bookings.slotID to join with slots.id
  bookings.userID to join with users.id (to get the email)
  So slotID and userID need to match exactly.


*/

const db = require("../db/db");

/*
  POST /bookings/:slotID - user books a slot
  Note: finalizing a group meeting has nothing to do with this endpoint.
 */
exports.bookSlot = async (req, res) => {
  const userID = req.user.id;
  const slotID = req.params.slotID;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // verify slot exists
    const [rows] = await conn.query(
      `SELECT slots.id,
              slots.date     AS date,
              slots.timeFrom AS timeFrom,
              slots.timeTo   AS timeTo,
              owners.email   AS ownerEmail
         FROM slots
         JOIN users AS owners ON owners.id = slots.ownerID
        WHERE slots.id = ? AND slots.isActive = TRUE
          FOR UPDATE`,
      [slotID]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Slot does not exist or is not active" });
    }

    // enforces one-booking-per-slot for bookings created through this endpoint
    // (only way to create many bookings for one slot is through finalizing a group meeting: POST /group/:id/finalize)
    const [verif] = await conn.query(
      `SELECT *
       FROM bookings
       WHERE bookings.slotID = ?`,
      [slotID]
    );
    if (verif.length !== 0) {
      await conn.rollback();
      return res.status(409).json({ message: "Slot already booked" });
    }

    // book the slot
    // created at date already set automatically by the DB
    await conn.query(
      "INSERT INTO bookings (slotID, userID) VALUES(?,?)",
      [slotID, userID]
    );

    await conn.commit();

    const subject = "Slot booked";
    const body = `Slot on ${rows[0].date.toLocaleDateString('en-CA')} from ${rows[0].timeFrom} to ${rows[0].timeTo} booked.`;
    const mailtoUrl = `mailto:${rows[0].ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // return info on booked slot and notify owner by email
    return res.status(201).json({
      message: `Booking on slot at ${rows[0].date.toLocaleDateString('en-CA')} from ${rows[0].timeFrom} to ${rows[0].timeTo} has been created`,
      emailToNotify: rows[0].ownerEmail,
      mailtoUrl: mailtoUrl,
    });
  } catch (err) {
    await conn.rollback();
    console.error("[bookingsController.bookSlot]", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Slot already booked" });
    }
    return res.status(500).json({ message: "Slot booking failed" });
  } finally {
    conn.release();
  }
}

// GET /bookings/view - view all the bookings, with slot information, for a user with specified ID
exports.viewBookings = async (req, res) => {
  const userID = req.user.id;

  try {
    const [bookings] = await db.query(
      `SELECT bookings.id        AS bookingID,
              bookings.slotID    AS slotID,
              bookings.userID    AS userID,
              bookings.createdAt AS dateBooked,
              slots.date,
              slots.timeFrom,
              slots.timeTo,
              slots.isActive,
              owners.email       AS ownerEmail
         FROM bookings
         JOIN slots ON slots.id = bookings.slotID
         JOIN users AS owners ON owners.id = slots.ownerID
        WHERE bookings.userID = ?
     ORDER BY slots.date, slots.timeFrom`,
      [userID]
    );

    // return the info about the bookings to the booker
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("[bookingsController.viewBookings]", err);
    return res.status(500).json({ message: "Failed to retrieve bookings" });
  }
}

// DELETE /bookings/:bookingID - cancel specified booking by deleting it
exports.cancelBooking = async (req, res) => {
  const userID = req.user.id;
  const bookingID = req.params.bookingID;

  try {
    const [rows] = await db.query(
      `SELECT bookings.id,
              slots.date     AS date,
              slots.timeFrom AS timeFrom,
              slots.timeTo   AS timeTo,
              owners.email    AS ownerEmail
         FROM bookings
         JOIN slots ON slots.id = bookings.slotID
         JOIN users AS owners ON owners.id = slots.ownerID
        WHERE bookings.userID = ? AND bookings.id = ?`,
      [userID, bookingID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Unauthorized or booking doesn't exist" });
    }

    // delete booking
    await db.query(
      "DELETE FROM bookings WHERE id = ? AND userID = ?",
      [bookingID, userID]
    );

    const subject = "Booking Cancelled";
    const body = `Booking on ${rows[0].date.toLocaleDateString('en-CA')} from ${rows[0].timeFrom} to ${rows[0].timeTo} cancelled.`;
    const mailtoUrl = `mailto:${rows[0].ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // return info on deleted booking and notify owner by email
    return res.status(200).json({
      message: `Booking on ${rows[0].date.toLocaleDateString('en-CA')} from ${rows[0].timeFrom} to ${rows[0].timeTo} has been cancelled`,
      emailToNotify: rows[0].ownerEmail,
      mailtoUrl: mailtoUrl,
    });
  } catch (err) {
    console.error("[bookingsController.cancelBooking]", err);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
}
