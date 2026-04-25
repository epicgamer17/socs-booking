//Thomas Nguyen
/*
  Dashboard data depending on user role. Separating seemed simpler to me, but lmk if I should I should revert to the previously recommended approach - Thomas.
*/

const db = require("../db/db");

// return their slots + who booked each + pending meeting requests
// heavily reusing code from slotsController.js
exports.dashboardDataForOwner = async (req, res) => {
  const ownerID = req.user.id;

  try {
    // get the slots and associated bookings
    const [rows1] = await db.query(
      `SELECT
        slots.id AS slotID,
        slots.date,
        slots.timeFrom,
        slots.timeTo,
        slots.isActive,
        users.email AS bookedByEmail
       FROM slots
       LEFT JOIN bookings ON slots.id = bookings.slotID
       LEFT JOIN users ON users.id = bookings.userID
       WHERE slots.ownerID = ?`,
      [ownerID]
    );

    // get pending meeting requests
    const [rows2] = await db.query(
      `SELECT
        meetingRequests.id,
        meetingRequests.userID,
        meetingRequests.date,
        meetingRequests.timeFrom,
        meetingRequests.timeTo,
        meetingRequests.message,
        users.email AS bookedByEmail
       FROM meetingRequests
       LEFT JOIN users ON users.id = meetingRequests.userID
       WHERE meetingRequests.status = ? AND meetingRequests.ownerID = ?`,
      ["pending", ownerID]
    );

    return res.status(200).json({ slots: rows1, meetingRequests: rows2 });
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve owner dashboard data.", error: err.message });
  }
}

// return all bookings they made
exports.dashboardDataForStudent = async (req, res) => {
  // near exact duplicate of bookingsController.viewBookings (as of PR #43)
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
        WHERE bookings.userID = ?`,
      [userID]
    );

    // return the info about the bookings to the booker
    return res.status(200).json(bookings);    
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve student dashboard data", error: err.message });
  }
}
