//Thomas Nguyen
const db = require("../db/db");

/*
  POST /group - Owner creates a group meeting + list of available time options + list of invited users - Insert into groupMeetings table - Insert each time option into timeWindows table - Insert each invitee into userInvitations table - requireAuth + requireOwner.

  Expected fields in req.body:

    timeWindows: [
      { date: 'YYYY-MM-DD', timeFrom: 'HH:MM:SS',  timeTo: 'HH:MM:SS' },
      ...
    ]
    title:             string
    invitedUserIDs:    [int, ...]      (optional)
    invitedUserEmails: [string, ...]   (optional — resolved to user IDs server-side)

    At least one of invitedUserIDs / invitedUserEmails must be non-empty.
*/
exports.createGroupMeeting = async (req, res) => {
  const ownerID = req.user.id;
  const timeWindows = req.body.timeWindows;
  const title = req.body.title;
  const invitedUserIDsInput = req.body.invitedUserIDs ?? [];
  const invitedUserEmails = req.body.invitedUserEmails ?? [];

  if (!Array.isArray(timeWindows) || timeWindows.length === 0) {
    return res.status(400).json({ message: "At least one timeWindow is required" });
  }
  if (invitedUserIDsInput.length === 0 && invitedUserEmails.length === 0) {
    return res.status(400).json({ message: "At least one invitee is required" });
  }

  const conn = await db.getConnection();
  try {
    // resolve emails to user IDs (students only)
    let resolvedIDs = [];
    if (invitedUserEmails.length > 0) {
      const [rows] = await conn.query(
        `SELECT id, email FROM users WHERE email IN (?) AND role = 'student'`,
        [invitedUserEmails]
      );
      const foundEmails = new Set(rows.map(r => r.email.toLowerCase()));
      const missing = invitedUserEmails.filter(e => !foundEmails.has(e.toLowerCase()));
      if (missing.length > 0) {
        return res.status(400).json({ message: `Unknown student email(s): ${missing.join(', ')}` });
      }
      resolvedIDs = rows.map(r => r.id);
    }

    const invitedUserIDs = Array.from(new Set([...invitedUserIDsInput, ...resolvedIDs]));

    await conn.beginTransaction();

    // insert group meeting into db
    const [result] = await conn.query(
      `INSERT INTO groupMeetings (ownerID, title) VALUES(?, ?)`,
      [ownerID, title]
    );
    const gmid = result.insertId;

    // insert time windows into db
    for (let i = 0; i < timeWindows.length; i++) {
      await conn.query(
	`INSERT INTO timeWindows (groupMeetingID, date, timeFrom, timeTo) VALUES(?, ?, ?, ?)`,
	[gmid, timeWindows[i].date, timeWindows[i].timeFrom, timeWindows[i].timeTo]
      );
    }

    // insert invitations into db
    for (const invitedUserID of invitedUserIDs) {
      await conn.query(
	`INSERT INTO userInvitations (userID, groupMeetingID) VALUES(?, ?)`,
	[invitedUserID, gmid]
      );
    }

    await conn.commit();
    return res.status(201).json({ message: "Group meeting initialization successful", groupMeetingID: gmid });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Group meeting initialization failed", error: err.message });
  } finally {
    conn.release();
  }
}

/*
  GET /group/owner - Owner lists all of their non-finalized group meetings, with each
  candidate time window and its vote count. Shape is intentionally close to what
  OwnerDashboard renders so no transformation is needed client-side.
*/
exports.getOwnerGroupMeetings = async (req, res) => {
  const ownerID = req.user.id;
  try {
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

    return res.status(200).json({ polls: Array.from(byMeeting.values()) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch owner group meetings", error: err.message });
  }
};

/*
  GET /group/viewInvitations - User receives available time options for every group meeting they're invited to vote in
*/
exports.viewInvitations = async (req, res) => {
  const userID = req.user.id;
  try {
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

    return res.status(200).json(Array.from(byMeeting.values()));
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch group meetings for user", error: err.message });
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

    // check whether any of the time windows don't belong here (wrong groupMeetingID)
    const [ownedWindows] = await conn.query(
      `SELECT *
         FROM timeWindows
        WHERE timeWindows.id IN (?) AND groupMeetingID = ?`,
      [timeWindowIDs, groupMeetingID]
    );
    if (ownedWindows.length !== timeWindowIDs.length) {
      return res.status(400).json({
	message: "One or more timeWindowIDs do not belong to this group meeting"
      });
    }

    await conn.beginTransaction();
    
    // insert vote submission into db
    for (const timeWindowID of timeWindowIDs) {
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
  const ownerID = req.user.id;

  try {
    const [[{ ok }]] = await db.query(
      `SELECT EXISTS(SELECT 1 FROM groupMeetings WHERE ownerID = ? AND id = ?) AS ok`,
      [ownerID, groupMeetingID]
    );
    if (!ok) {
      return res.status(403).json({ message: "Group meeting does not belong to owner" });
    }
    
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

/*
  POST /group/:id/finalize ← Owner picks the winning time slot - Create slots + bookings for all users who voted - If is_recurring = true: create N slots (one per week for recurrence_weeks) - Build mailto: URLs for all involved users, return in response - requireAuth + requireOwner

  Expected fields in req.body:
  - recurrenceWeeks (int) <- optional
  - winningTimeWindowID (int) <- owner's pick
  
 */
exports.finalizeGroupMeeting = async (req, res) => {
  const ownerID = req.user.id;
  const ownerEmail = req.user.email;
  const groupMeetingID = req.params.id;
  const recurrenceWeeks = req.body.recurrenceWeeks ?? 1;
  const winningTimeWindowID = req.body.winningTimeWindowID;

  const conn = await db.getConnection();
  try {
    // check whether the current owner has the right to access that group meeting or the group meeting even exists
    const [groupMeetingRow] = await conn.query(
      `SELECT groupMeetings.status AS status
         FROM groupMeetings
        WHERE groupMeetings.ownerID = ? AND groupMeetings.id = ?`,
      [ownerID, groupMeetingID]
    );
    // TODO: differentiate between "meeting not found" and "meeting does not belong to owner"
    if (groupMeetingRow.length === 0) {
      return res.status(404).json({ error: "Group meeting not found for owner" });
    }

    // and check whether the group meeting wasn't already finalized
    const groupMeeting = groupMeetingRow[0];
    if (groupMeeting.status === "selection-over") {
      return res.status(403).json({ error: "Group meeting already finalized" });
    }

    // fetch winning time window, for the creation of bookings
    const [winningTimeWindowRow] = await conn.query(
      `SELECT timeWindows.id AS id,
              timeWindows.date AS date,
              timeWindows.timeFrom AS timeFrom,
              timeWindows.timeTo AS timeTo
         FROM timeWindows
        WHERE timeWindows.id = ? AND timeWindows.groupMeetingID = ?`,
      [winningTimeWindowID, groupMeetingID]
    );
    if (winningTimeWindowRow.length === 0) {
      return res.status(400).json({ error: "Winning time window not found." });
    }
    const winningTimeWindow = winningTimeWindowRow[0];

    // fetch user IDs for the time window
    const [userRows] = await conn.query(
      `SELECT userVotes.userID AS userID
         FROM userVotes
        WHERE userVotes.timeWindowID = ?
     ORDER BY userVotes.userID`,
      [winningTimeWindowID]
    );

    // edge case: no votes
    if (userRows.length === 0) {
      await conn.query(
	`UPDATE groupMeetings SET status = 'selection-over'
         WHERE groupMeetings.id = ?`,
	[groupMeetingID]
      );

      const body = `Group meeting finalized without any votes.`;
      const subject = "Group Meeting Finalized";
      const url = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      return res.status(200).json({ message: "No votes submitted, but group meeting finalized.", mailtoUrl: url });
    }
    
    const userIDs = userRows.map(r => r.userID);

    await conn.beginTransaction();

    // create shared slot(s) for every week defined by recurrenceWeeks
    const slotIDs = [];
    const date0 = new Date(winningTimeWindow.date);
    for (let i = 0; i < recurrenceWeeks; i++) {
      const date = new Date(date0);
      date.setDate(date.getDate() + 7 * i);
      
      const [slot] = await conn.query(
	`INSERT INTO slots (ownerID, date, timeFrom, timeTo, isActive) VALUES(?, ?, ?, ?, ?)`,
	[ownerID, date, winningTimeWindow.timeFrom, winningTimeWindow.timeTo, true]
      );
      slotIDs.push(slot.insertId);
    }

    // create bookings for every such week, for every voter
    for (let i = 0; i < recurrenceWeeks; i++) {
      for (let j = 0; j < userIDs.length; j++) {
	await conn.query(
	  `INSERT INTO bookings (slotID, userID, groupMeetingID) VALUES(?, ?, ?)`,
	  [slotIDs[i], userIDs[j], groupMeetingID]
	);
      }
    }

    // update groupMeeting
    await conn.query(
      `UPDATE groupMeetings SET status = 'selection-over'
         WHERE groupMeetings.id = ?`,
      [groupMeetingID]
    );

    await conn.commit();

    // fetch the emails
    const [emailRows] = await conn.query(
      `SELECT users.email AS email
         FROM users
        WHERE users.id IN (?)
        ORDER BY users.id`,
      [userIDs]
    );
    const emails = emailRows.map(r => r.email);

    // build mailto URLs
    const body = `Chosen slot: ${winningTimeWindow.date.toLocaleDateString('en-CA')}, ${winningTimeWindow.timeFrom}, ${winningTimeWindow.timeTo}. Meeting will repeat for ${recurrenceWeeks} weeks.`;
    const subject = "Group Meeting Finalized";
    const url = `mailto:${emails.join(',')},${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    return res.status(200).json({ message: "Group meeting finalization successful", mailtoUrl: url });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ message: "Group meeting finalization failed", error: err.message });
  } finally {
    conn.release();
  }
}
