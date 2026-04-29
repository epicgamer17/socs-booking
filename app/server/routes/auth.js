//Sophia Hussain, Thomas Nguyen
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");
const { rateLimit } = require('express-rate-limit');

// BEGIN: code pasted from https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});
// END: code pasted from https://www.npmjs.com/package/express-rate-limit

//register new user
router.post("/register", limiter, authController.register);

// verify email
router.get("/verify/:token", authController.verifyEmail);

//login user
router.post("/login", limiter, authController.login);

//logout user
router.post("/logout", authController.logout);

module.exports = router;
