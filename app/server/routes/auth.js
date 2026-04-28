//Sophia Hussain, Thomas Nguyen
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

//register new user 
router.post("/register", authController.register);

// verify email
router.get("/verify/:token", authController.verifyEmail);

//login user 
router.post("/login", authController.login);

//logout user
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
