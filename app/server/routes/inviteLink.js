//Sophia Hussain
const express = require('express');
const router = express.Router();
const inviteLinkController = require('../controllers/inviteLinkController');
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware")

//generate invite link to share
router.post("/generate", requireAuth, requireOwner, inviteLinkController.generateLink);

//user opens invite link
router.get("/resolve/:token", requireAuth, inviteLinkController.resolveLink);

//delete an invite link
router.delete("/delete/:token", requireAuth, requireOwner, inviteLinkController.deleteLink);

module.exports = router;