const express = require("express");
const router = express.Router();
const groupMeetingsController = require("../controllers/groupMeetingsController");
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

//----groupMeetings routes----

// Owner creates a group meeting + list of available time options
router.post("/group", requireAuth, requireOwner, groupMeetingsController.createGroupMeeting);

// User selects one or more time options (can pick multiple)
router.post("/group/:id/vote", requireAuth, groupMeetingsController.submitAvailabilityVote);

// Return all time options with their vote count
router.get("/group/:id/votes", requireAuth, requireOwner, groupMeetingsController.viewVoteResults);

// Owner picks the winning time slot - Create slots + bookings for all users who voted
router.post("/group/finalize/:id", requireAuth, requireOwner, groupMeetingsController.finalizeGroupMeeting);

module.exports = router;
