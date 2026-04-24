const express = require('express');
const router = express.Router();
const inviteLinkController = require('../controllers/inviteLinkController');
const requireAuth = require("../middleware/authMiddleware");
const requireOwner = require("../middleware/ownerMiddleware")

router.post("/generate", requireAuth, requireOwner, inviteLinkController.generateLink); 
router.get("/resolve/:token", requireAuth, inviteLinkController.resolveLink);
router.delete("/delete/:token", requireAuth, requireOwner, inviteLinkController.deleteLink);



module.exports = router;