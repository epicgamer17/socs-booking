//Thomas Nguyen
/*
  Dashboard data depending on user role. Separating seemed simpler to me, but lmk if I should I should revert to the previously recommended approach - Thomas.
*/

const db = require("../db/db");

// return their slots + who booked each + pending meeting requests + their live group meeting polls
// heavily reusing code from slotsController.js, meetingRequestsController.js, and groupMeetingsController.js
exports.dashboardDataForOwner = async (req, res) => {
  const ownerID = req.user.id;

  try {
    // get the slots and associated bookings
    const [slotsBookingsRows] = await db.query(
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
    const [meetingRequestRows] = await db.query(
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

    // fetch group meeting non-finalized poll data
    const [groupMeetingRows] = await db.query(
      `SELECT groupMeetings.id     AS groupMeetingID,
              groupMeetings.title  AS title,
              timeWindows.id       AS timeWindowID,
              timeWindows.date     AS date,
              timeWindows.timeFrom AS timeFrom,
              timeWindows.timeTo   AS timeTo,
              COUNT(userVotes.id)  AS total
         FROM groupMeetings
         JOIN timeWindows ON timeWindows.groupMeetingID = groupMeetings.id
    LEFT JOIN userVotes  ON userVotes.timeWindowID = timeWindows.id
        WHERE groupMeetings.ownerID = ?
          AND groupMeetings.status != 'selection-over'
     GROUP BY groupMeetings.id, timeWindows.id
     ORDER BY groupMeetings.id, timeWindows.id`,
      [ownerID]
    );

    const byMeeting = new Map();
    for (const row of groupMeetingRows) {
      let poll = byMeeting.get(row.groupMeetingID);
      if (!poll) {
        poll = {
          id: row.groupMeetingID,
          title: row.title,
          candidates: [],
          voterCount: 0,
        };
        byMeeting.set(row.groupMeetingID, poll);
      }
      poll.candidates.push({
        candidateID: row.timeWindowID,
        date: row.date,
        timeFrom: row.timeFrom,
        timeTo: row.timeTo,
        votes: row.total,
      });
      poll.voterCount += row.total;
    }

    return res.status(200).json({ slots: slotsBookingsRows, meetingRequests: meetingRequestRows, polls: Array.from(byMeeting.values()) });
  } catch (err) {
    console.error("[dashboardController.dashboardDataForOwner]", err);
    return res.status(500).json({ message: "Failed to retrieve owner dashboard data." });
  }
}

// return all bookings they made + all the group meeting polls they're invited to
// heavily reusing code from slotsController.js and groupMeetingsController.js
exports.dashboardDataForStudent = async (req, res) => {
  // near exact duplicate of bookingsController.viewBookings (as of PR #43)
  const userID = req.user.id;

  try {
    // fetch the bookings
    const [bookingRows] = await db.query(
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

    // fetch the group meeting poll data
    const [groupMeetingRows] = await db.query(
      `SELECT groupMeetings.id     AS groupMeetingID,
              groupMeetings.title  AS title,
              timeWindows.id       AS timeWindowID,
              timeWindows.date     AS date,
              timeWindows.timeFrom AS timeFrom,
              timeWindows.timeTo   AS timeTo,
              COUNT(userVotes.id)  AS total
         FROM userInvitations
         JOIN groupMeetings ON groupMeetings.id = userInvitations.groupMeetingID
         JOIN timeWindows   ON timeWindows.groupMeetingID = groupMeetings.id
    LEFT JOIN userVotes ON userVotes.timeWindowID = timeWindows.id
        WHERE userInvitations.userID = ?
          AND groupMeetings.status != 'selection-over'
     GROUP BY groupMeetings.id, timeWindows.id
     ORDER BY groupMeetings.id, timeWindows.id`,
      [userID]
    );

    const byMeeting = new Map();
    for (const row of groupMeetingRows) {
      let poll = byMeeting.get(row.groupMeetingID);
      if (!poll) {
        poll = {
          id: row.groupMeetingID,
          title: row.title,
          candidates: [],
          voterCount: 0,
        };
        byMeeting.set(row.groupMeetingID, poll);
      }
      poll.candidates.push({
        candidateID: row.timeWindowID,
        date: row.date,
        timeFrom: row.timeFrom,
        timeTo: row.timeTo,
        votes: row.total,
      });
      poll.voterCount += row.total;
    }

    // return the info about the bookings to the booker
    return res.status(200).json({ bookingRows: bookingRows, groupMeetingRows: Array.from(byMeeting.values())});
  } catch (err) {
    console.error("[dashboardController.dashboardDataForStudent]", err);
    return res.status(500).json({ message: "Failed to retrieve student dashboard data" });
  }
}
