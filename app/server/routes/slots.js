const express = require("express");
const router = express.Router();
const slotsController = require("../controllers/slotsController");
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

//----Slots Routes----

//create a booking slot
router.post("/create", requireAuth, requireOwner, slotsController.createSlot);

//activate a booking slot
router.put("/activate/:id", requireAuth, requireOwner, slotsController.activateSlot);

//view all booking slots
router.get("/viewAll", requireAuth, requireOwner, slotsController.viewSlots);

//delete a slot
router.delete("/delete/:id", requireAuth, requireOwner, slotsController.deleteSlot);

module.exports = router;
