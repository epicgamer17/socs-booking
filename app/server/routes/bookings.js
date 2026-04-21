const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const requireAuth = require("../middleware/authMiddleware");

//----Bookings Routes----

// book a slot
router.post("/:slotID", requireAuth, bookingsController.bookSlot);

// view bookings
router.get("/view", requireAuth, bookingsController.viewBookings);

// cancel booking
router.delete("/:bookingID", requireAuth, bookingsController.cancelBooking);

module.exports = router;
