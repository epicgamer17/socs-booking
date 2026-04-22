const express = require("express");
const router = express.Router();
const meetingRequestsController = require('../controllers/meetingRequestsController')
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

router.post("/meeting", requireAuth, meetingRequestsController.requestMeeting);

// router.get("/see", requireAuth, requireOwner, meetingRequestsController.seeMeetingRequests);

router.post("/accept/:id", requireAuth, requireOwner, meetingRequestsController.acceptMeeting);
router.post("/decline/:id", requireAuth, requireOwner, meetingRequestsController.declineMeeting);




module.exports = router; 
