const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { authorizeMeterApp } = require("../middleware/auth")
// 1. Authenticate user and generate JWT token
//router.get("/user_auth", authController.authenticateUser)

// Microsoft SSO authentication route
router.post("/auth/microsoft", authController.authenticateUser);
router.post("/auth/update_username_pass",authorizeMeterApp, authController.updateUsernamePass)
module.exports = router

