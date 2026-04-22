const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

//----Auth Routes----

//register new user (public route so no auth needed)
router.post("/register", authController.register);

//login user (public route so no auth needed)
router.post("/login", authController.login);

//logout user
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
