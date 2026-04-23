/*
  Separating seemed simpler to me to separate into dashboard/owner and dashboard/student, but lmk if I should I should revert to the previously recommended approach - Thomas.
*/

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

//----Dashboard Routes----

// get data for dashboard for owner
router.get("/owner", requireAuth, requireOwner, dashboardController.dashboardDataForOwner);

// get data for dashboard for student
router.get("/student", requireAuth, dashboardController.dashboardDataForStudent);

module.exports = router;
