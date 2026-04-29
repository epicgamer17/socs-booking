//Sophia Hussain
const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const requireAuth = require("../middleware/authMiddleware");

// export bookings as .ics file
router.get("/export", requireAuth, calendarController.exportCalendar);

module.exports = router;