const express = require("express")
const router = express.Router()
const navisionController = require('../controllers/navisionController')
const { authorizeMeterApp } = require("../middleware/auth")

/**
 * Route for scanning barcodes
 * POST /api/navision/BarcodeScan
 */
router.post("/BarcodeScan", navisionController.barcodeScan)

/**
 * Route for getting connection pressure
 * POST /api/navision/GetConnectionPressure
 */
router.post("/GetConnectionPressure", navisionController.getConnectionPressure)

/**
 * Route for getting location information
 * POST /api/navision/GetLocation
 */
router.post("/GetLocation", navisionController.getLocation)

/**
 * Route for getting meter worksheet comments
 * POST /api/navision/GetMeterWorkSheetComments
 */
router.post("/GetMeterWorkSheetComments", navisionController.getMeterWorkSheetComments)

/**
 * Route for getting physical location information
 * POST /api/navision/GetPhysicalLocation
 */
router.post("/GetPhysicalLocation", navisionController.getPhysicalLocation)

/**
 * Route for getting work type results
 * GET /api/navision/GetWorkTypeResult
 */
router.post("/GetWorkTypeResult", navisionController.getWorkTypeResult)

/**
 * Route for getting manufacturers
 * POST /api/navision/Manufacturers
 */
router.post("/Manufacturers", navisionController.getManufacturers)

/**
 * Route for getting consumption purpose
 * POST /api/navision/GetConsumptionPurpose
 */
router.post("/GetConsumptionPurpose", navisionController.getConsumptionPurpose)

/**
 * Route for getting disconnection methods
 * POST /api/navision/GetDisconectionMethods
 */
router.post("/GetDisconectionMethods", navisionController.getDisconnectionMethods)


/**
 * Route for getting disconnection photos
 * POST /api/navision/GetDisconectionPhotos
 */
router.get("/GetDisconectionPhotos", navisionController.getDisconnectionPhotos)


/**
 * Route for Uploading Word Documents
 * POST /api/navision/UploadDocument
 */
router.post("/UploadDocument", navisionController.uploadDocument)


/**
 * Route for DeactivateMeter 
 * POST /api/navision/DeactivateMeter
 */
router.post("/DeactivateMeter", navisionController.deactivateMeter)


/**
 * Route for ActivateMeter
 * POST /api/navision/ActivateMeter
 */
router.post("/ActivateMeter", navisionController.activateMeter)
module.exports = router