const express = require("express");

const authController = require("../controllers/auth");

const validator = require('../middleware/validator')
const router = express.Router();

// Signup a new user
router.get("/signup", authController.getSignup);
router.post("/signup", validator.signupValidator, authController.postSignup);

// User Login
router.get('/login',authController.getLogin)
router.post("/login",validator.loginValidator, authController.postLogin);

// User Logout
router.get('/logout',authController.getLogout);
module.exports = router;
