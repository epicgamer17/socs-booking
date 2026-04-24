const db = require("../db/db");

/*
  POST /group - Owner creates a group meeting + list of available time options - Insert into groupMeetings table - Insert each time option into timeWindows table - requireAuth + requireOwner.

  Expected form for req.body.timeWindows:
    timeWindows: [
      { date: 'YYYY-MM-DD', timeFrom: 'HH:MM:SS',  timeTo: 'HH:MM:SS' },
      ...
    ]
*/
exports.createGroupMeeting = async (req, res) => {
  const ownerID = req.user.id;
  const timeWindows = req.body.timeWindows;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // insert group meeting into db
    const [result] = await conn.query(
      `INSERT INTO groupMeetings (ownerID) VALUES(?)`,
      [ownerID]
    );
    const gmid = result.insertId;

    // insert time windows into db
    for (let i = 0; i < timeWindows.length; i++) {
      await conn.query(
	`INSERT INTO timeWindows (groupMeetingID, date, timeFrom, timeTo) VALUES(?, ?, ?, ?)`,
	[gmid, timeWindows[i].date, timeWindows[i].timeFrom, timeWindows[i].timeTo]
      );
    }

    await conn.commit();
    return res.status(201).json({ message: "Group meeting initialization successful" });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Group meeting initialization failed", error: err.message });
  } finally {
    conn.release();
  }
}

/*
  POST /group/:id/vote - User selects one or more time options (can pick multiple) - Insert into userVotes, prevent duplicate votes (unique on slot+user) - requireAuth

  Expects timeWindowIDs array in req.body.
*/
exports.submitAvailabilityVote = async (req, res) => {
  const userID = req.user.id;
  const timeWindowIDs = req.body.timeWindowIDs;
  const groupMeetingID = req.params.id;

  const conn = await db.getConnection();
  try {    
    // check whether user is actually invited to vote
    const [verif1] = await conn.query(
      `SELECT *
         FROM userInvitations
        WHERE userInvitations.userID = ? AND userInvitations.groupMeetingID = ?`,
      [userID, groupMeetingID]
    );
    if (verif1.length === 0) {
      return res.status(403).json({ message: "User not invited to vote for this group meeting" });
    }
    
    // check whether it's still voting period for the group meeting in question
    const [verif2] = await conn.query(
      `SELECT groupMeetings.status AS status
         FROM groupMeetings
        WHERE groupMeetings.id = ?`,
      [groupMeetingID]
    );
    if (verif2.length === 0) {
      return res.status(404).json({ error: "Group meeting with requested ID not found" });
    } else if (verif2[0].status === "selection-over") {
      return res.status(403).json({ message: "Voting period over for this group meeting" });
    }

    await conn.beginTransaction();
    
    // insert vote submission into db
    for (const timeWindowID of timeWindowIDs) {
      // TODO: add a check for whether the timeWindow is associated with the group meeting
      await conn.query(
	`INSERT INTO userVotes (userID, timeWindowID) VALUES(?, ?)`,
	[userID, timeWindowID]
      );
    }

    await conn.commit();
    return res.status(201).json({ message: "Vote submission successful" });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Vote already submitted by user for this group meeting" });
    }
    return res.status(500).json({ message: "Group meeting vote submission failed", error: err.message });
  } finally {
    conn.release();
  }
}

/*
  GET /group/:id/votes - Return all time windows with their vote count
*/
exports.viewVoteResults = async (req, res) => {
  const groupMeetingID = req.params.id;

  try {
    const [voteResults] = await db.query(
      `SELECT timeWindows.id AS timeWindowID,
              timeWindows.date AS date,
              timeWindows.timeFrom AS timeFrom,
              timeWindows.timeTo AS timeTo,
              COUNT(userVotes.id) AS total
         FROM timeWindows
    LEFT JOIN userVotes ON userVotes.timeWindowID = timeWindows.id
        WHERE timeWindows.groupMeetingID = ?
        GROUP BY timeWindows.id`,
      [groupMeetingID]
    );
    
    return res.status(200).json({ voteResults: voteResults });
  } catch (err) {
    return res.status(500).json({ message: "Group meeting vote results querying failed", error: err.message });
  }
}

// POST /group/:id/finalize ← HEAVIEST TASK, start this one early - Owner picks the winning time slot - Create slots + bookings for all users who voted - If is_recurring = true: create N slots (one per week for recurrence_weeks) - Build mailto: URLs for all involved users, return in response - requireAuth + requireOwner
exports.finalizeGroupMeeting = async (req, res) => {
  // TODO
}
