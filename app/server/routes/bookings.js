const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const requireAuth = require("../middleware/authMiddleware");

//----Bookings Routes----

// book a slot
router.post("/book/:id", requireAuth, bookingsController.bookSlot);

module.exports = router;