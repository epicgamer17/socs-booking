// Thomas Nguyen, Sophia Hussain, Jonathan Lamontagne-Kratz
const db = require("../db/db");

exports.getBookingsForUser = async (userID) => {
  const [rows] = await db.query(
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
  return rows;
};

exports.getSlotsForOwner = async (ownerID) => {
  const [rows] = await db.query(
    `SELECT slots.id AS slotID,
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
  return rows;
};

// To replace the query at meetingRequestsController.seeMeetingRequests and dashboardController.dashboardDataForOwner
exports.getPendingRequestsForOwner = async (ownerID) => {
  const [rows] = await db.query(
    `SELECT meetingRequests.id,
            meetingRequests.userID,
            meetingRequests.date,
            meetingRequests.timeFrom,
            meetingRequests.timeTo,
            meetingRequests.message,
            users.email AS bookedByEmail
       FROM meetingRequests
  LEFT JOIN users ON users.id = meetingRequests.userID
      WHERE meetingRequests.status = 'pending' AND meetingRequests.ownerID = ?`,
    [ownerID]
  );
  return rows;
};

exports.getPollsForOwner = async (ownerID) => {
  const [rows] = await db.query(
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
  for (const row of rows) {
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

  return Array.from(byMeeting.values());
};

exports.getPollsForInvitedUser = async (userID) => {
  const [rows] = await db.query(
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
  for (const row of rows) {
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

  return Array.from(byMeeting.values());
};
