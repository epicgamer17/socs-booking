const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/auth');

// TODO: implement controllers.
// Type 2 — Group meetings (calendar method)
//
// POST   /                    — owner creates group meeting { title, start_date, end_date, time_slots[], invitee_emails[] }
// GET    /:id                 — get group meeting details + response counts
// POST   /:id/respond         — invitee submits availability selections { slot_starts[] }
// PATCH  /:id/finalize        — owner picks a time, creates booking slots { chosen_start, recurrence_weeks }
//
// Type 3 — Recurring office hours reuses the slots routes (create multiple slots with recurrence_weeks > 0)

module.exports = router;
