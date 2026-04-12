const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController")

//register new user
router.post("register", authController.register);


//Login Routes


//Logout Routes??


module.exports = router;