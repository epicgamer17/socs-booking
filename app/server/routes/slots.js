const express = require("express");
const router =  express.Router();
const slotsController = require("../controllers/slotsController");
const requireAuth = require("../middleware/authMiddleware")
//const requireOwner = require("../middleware/ownerMiddleware");

//temporary testing routes while owner middleware not implemented
router.post("/create",requireAuth, slotsController.createSlot); 
router.get("/viewAll", requireAuth, slotsController.viewSlots);
router.get("/activate", requireAuth, slotsController.activateSlot);
router.get("/delete", requireAuth, slotsController.deleteSlot);

//Create a booking slot
router.post("/create",requireAuth, requireOwner, slotsController.createSlot); 

//Activate a booking slot
router.put("/activate", requireAuth, requireOwner, slotsController.activateSlot);

//View booking slots
router.get("/viewAll", requireAuth, requireOwner, slotsController.viewSlots);

//Delete a slot
// router.delete("/delete", requireAuth, requireOwner, slotsController.deleteSlot);

module.exports = router; 
