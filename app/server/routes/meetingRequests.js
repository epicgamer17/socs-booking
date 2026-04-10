const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/auth');

// TODO: implement controllers.
// Type 1 — Request a meeting
//
// POST   /              — user sends meeting request to an owner { owner_id, message }
// GET    /              — owner views their pending requests
// PATCH  /:id/accept    — owner accepts request (creates slot + booking)
// PATCH  /:id/decline   — owner declines request

module.exports = router;
