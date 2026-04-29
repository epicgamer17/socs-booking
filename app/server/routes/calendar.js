//Sophia Hussain
const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const requireAuth = require("../middleware/authMiddleware");

// export bookings as .ics file
router.get("/export", requireAuth, calendarController.exportCalendar);

// export a single booking as .ics file (Author: Claude, per Thomas Nguyen request)
router.get("/export/:slotID", requireAuth, calendarController.exportSingleEvent);

module.exports = router;