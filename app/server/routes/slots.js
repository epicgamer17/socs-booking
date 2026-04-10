const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/auth');

// TODO: implement controllers and wire them up here.
// Suggested endpoints:
//
// GET    /              — list active slots (optionally filter by owner_id query param)
// GET    /:id           — get single slot
// POST   /              — create slot (owner only)
// PATCH  /:id/activate  — activate a slot (owner only)
// DELETE /:id           — delete slot (owner only, notify booked user)
// GET    /invite/:id    — public invitation link for an owner's active slots

module.exports = router;
