const express = require("express");
const router = express.Router();
const slotsController = require("../controllers/slotsController");
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware");

//----Slots Routes----

//get all owners that have public slots. 
router.get("owners", requireAuth, slotsController.getOwners);

//create a booking slot
router.post("/create", requireAuth, requireOwner, slotsController.createSlot);

//activate a booking slot
router.put("/activate/:id", requireAuth, requireOwner, slotsController.activateSlot);

//view all my slots as the owner 
router.get("/viewMy", requireAuth, requireOwner, slotsController.viewSlots);

//view all public booking slots of a owner 
router.get("/public/:ownerID", requireAuth, slotsController.viewOwnersSlots); 

//delete a slot
router.delete("/delete/:id", requireAuth, requireOwner, slotsController.deleteSlot);

module.exports = router;
