const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// TODO: implement controllers and wire them up here.
// Suggested endpoints:
//
// GET    /         — list current user's bookings
// POST   /         — book a slot { slot_id }
// DELETE /:id      — cancel a booking (notify slot owner)

module.exports = router;
