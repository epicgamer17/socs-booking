const db = require("../db/db");

/*
  POST /group - Owner creates a group meeting + list of available time options - Insert into groupMeetings table - Insert each time option into timeWindows table - requireAuth + requireOwner.

  Expected form for req.body.timeWindows:
    timeWindows: [
      { date: 'YYYY-MM-DD', timeFrom: 'HH:MM:SS',  timeTo: 'HH:MM:SS'},
      ...
    ]
*/
exports.createGroupMeeting = async (req, res) => {
  const ownerID = req.user.id;
  const timeWindows = req.body.timeOptions;
  
  try {
    // insert group meeting into db
    await db.query(
      `INSERT INTO groupMeetings (ownerID) VALUES(?)`,
      [ownerID]
    );

    // get groupMeetingID generated for newly created groupMeetings entry
    const [rows] = await db.query(
      `SELECT groupMeetings.id AS groupMeetingsID
       FROM groupMeetings
       WHERE groupMeetings.ownerID = ?
       ORDER BY groupMeetings.createdAt DESC
       LIMIT 1`,
      [ownerID]
    );
    gmid = rows[0].groupMeetingsID;

    // insert time windows into db
    for (let i = 0; i < timeWindows.length; i++) {
      await db.query(
	`INSERT INTO timeWindows (groupMeetingsID, date, timeFrom, timeTo) VALUES(?, ?, ?)`,
	[gmid, timeWindows[i].date, timeWindows[i].timeFrom, timeWindows[i].timeTo]
      );
    }
  } catch (err) {
    return res.status(500).json({ message: "Group meeting initialization failed", error: err.message });
  }
}

/*
  POST /group/:id/vote - User selects one or more time options (can pick multiple) - Insert into userVotes, prevent duplicate votes (unique on slot+user) - requireAuth
*/
exports.submitAvailabilityVote = async (req, res) => {
  const userID = req.user.id;
  const timeWindowID = req.params.id;

  try {
    // insert vote submission into db
    await db.query(
      `INSERT INTO userVotes (userID, timeWindowID) VALUES(?, ?)`,
      [userID, timeWindowID]
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Vote already submitted by user for this group meeting" });
    }
    return res.status(500).json({ message: "Group meeting vote submission failed", error: err.message });
  }
}

// GET /group/:id/votes - Return all time options with their vote count - SELECT timeWindows.id, COUNT(*) FROM userVotes GROUP BY timeWindows.id - requireAuth + requireOwner
exports.viewVoteResults = async (req, res) => {
  ;
}

// POST /group/:id/finalize ← HEAVIEST TASK, start this one early - Owner picks the winning time slot - Create slots + bookings for all users who voted - If is_recurring = true: create N slots (one per week for recurrence_weeks) - Build mailto: URLs for all involved users, return in response - requireAuth + requireOwner
exports.finalizeGroupMeeting = async (req, res) => {
  ;
}
