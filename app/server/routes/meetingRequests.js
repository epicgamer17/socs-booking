const express = require("express");
const router = express.Router();
const meetingRequestsController = require('../controllers/meetingRequestsController')
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

router.post("/meeting", requireAuth, requestMeeting);

router.get("/see", requireAuth, requireOwner, seeMeetingRequest);

router.post("/accept/:id", requireAuth, requireOwner, acceptMeeting);
router.post("/decline/:id", requireAuth, requireOwner, declineMeeting);




module.exports = router; 
