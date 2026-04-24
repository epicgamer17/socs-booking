const db = require("../db/db");

// POST /group - Owner creates a group meeting + list of available time options - Insert into group_meetings table - Insert each time option into group_slots table - requireAuth + requireOwner
exports.createGroupMeeting = async (req, res) => {
  const ownerID = req.user.id;

  try {
    ;
  } catch (err) {
    ;
  }
}

// POST /group/:id/vote - User selects one or more time options (can pick multiple) - Insert into group_votes, prevent duplicate votes (unique on slot+user) - requireAuth
exports.submitAvailabilityVote = async (req, res) => {
  ;
}

// GET /group/:id/votes - Return all time options with their vote count - SELECT group_slot_id, COUNT(*) FROM group_votes GROUP BY group_slot_id - requireAuth + requireOwner
exports.viewVoteResults = async (req, res) => {
  ;
}

// POST /group/:id/finalize ← HEAVIEST TASK, start this one early - Owner picks the winning time slot - Create slots + bookings for all users who voted - If is_recurring = true: create N slots (one per week for recurrence_weeks) - Build mailto: URLs for all involved users, return in response - requireAuth + requireOwner
exports.finalizeGroupMeeting = async (req, res) => {
  ;
}
