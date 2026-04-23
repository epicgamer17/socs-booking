const express = require("express");
const router = express.Router();
const meetingRequestsController = require('../controllers/meetingRequestsController')
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");


//User sends a meeting request to an owner
router.post("/meeting", requireAuth, meetingRequestsController.requestMeeting);

//Get all pending meeting requests for the logged-in owner
router.get("/see", requireAuth, requireOwner, meetingRequestsController.seeMeetingRequests);

//Owner accepts a meeting request by ID
router.post("/accept/:id", requireAuth, requireOwner, meetingRequestsController.acceptMeeting);

//Owner declines a meeting request by ID
router.post("/decline/:id", requireAuth, requireOwner, meetingRequestsController.declineMeeting);

module.exports = router; 
