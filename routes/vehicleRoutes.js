const express = require("express")
const router = express.Router()
const vehicleController = require("../controllers/vehicleController")
const { authorizeMeterAppOrMaintenanceApp } = require("../middleware/auth")

// 6. Get Available Vehicles
router.get("/vehicles", authorizeMeterAppOrMaintenanceApp, vehicleController.getVehicles)

module.exports = router

