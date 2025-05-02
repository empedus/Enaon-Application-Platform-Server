const express = require("express")
const router = express.Router()
const navisionController = require('../controllers/navisionController')
const { authorizeMeterApp } = require("../middleware/auth")

/**
 * Route for scanning barcodes
 * POST /api/navision/BarcodeScan
 */
router.post("/BarcodeScan",authorizeMeterApp, navisionController.barcodeScan)

/**
 * Route for getting connection pressure
 * POST /api/navision/GetConnectionPressure
 */
router.post("/GetConnectionPressure",authorizeMeterApp, navisionController.getConnectionPressure)

/**
 * Route for getting location information
 * POST /api/navision/GetLocation
 */
router.post("/GetLocation",authorizeMeterApp, navisionController.getLocation)

/**
 * Route for getting meter worksheet comments
 * POST /api/navision/GetMeterWorkSheetComments
 */
router.post("/GetMeterWorkSheetComments",authorizeMeterApp, navisionController.getMeterWorkSheetComments)

/**
 * Route for getting physical location information
 * POST /api/navision/GetPhysicalLocation
 */
router.post("/GetPhysicalLocation",authorizeMeterApp, navisionController.getPhysicalLocation)

/**
 * Route for getting work type results
 * GET /api/navision/GetWorkTypeResult
 */
router.post("/GetWorkTypeResult",authorizeMeterApp, navisionController.getWorkTypeResult)

/**
 * Route for getting manufacturers
 * POST /api/navision/Manufacturers
 */
router.post("/Manufacturers",authorizeMeterApp, navisionController.getManufacturers)

/**
 * Route for getting consumption purpose
 * POST /api/navision/GetConsumptionPurpose
 */
router.post("/GetConsumptionPurpose",authorizeMeterApp, navisionController.getConsumptionPurpose)

/**
 * Route for getting disconnection methods
 * POST /api/navision/GetDisconectionMethods
 */
router.post("/GetDisconectionMethods",authorizeMeterApp, navisionController.getDisconnectionMethods)


/**
 * Route for getting disconnection photos
 * POST /api/navision/GetDisconectionPhotos
 */
router.get("/GetDisconectionPhotos",authorizeMeterApp, navisionController.getDisconnectionPhotos)

/**
 * Route for getting Meter Types
 * POST /api/navision/GetMeterTypes
 */
router.post("/GetMeterTypes",authorizeMeterApp, navisionController.getMeterTypes)


/**
 * Route for Uploading Word Documents
 * POST /api/navision/UploadDocument
 */
//router.post("/UploadDocument",authorizeMeterApp, navisionController.uploadDocument)


/**
 * Route for DeactivateMeter 
 * POST /api/navision/DeactivateMeter
 */
router.post("/DeactivateMeter",authorizeMeterApp, navisionController.deactivateMeter)


/**
 * Route for ActivateMeter
 * POST /api/navision/ActivateMeter
 */
router.post("/ActivateMeter",authorizeMeterApp, navisionController.activateMeter)


/**
 * Route for ActivateMeter
 * POST /api/navision/ActivateMeter
 */
router.post("/ReactivateMeter",authorizeMeterApp, navisionController.reactivateMeter)


/**
 * Route for ReplaceMeter
 * POST /api/navision/ReplaceMeter
 */
router.post("/ReplaceMeter",authorizeMeterApp, navisionController.replaceMeter)


/**
 * Route for GetWorkperson
 * POST /api/navision/GetWorkperson
 */
router.post("/GetWorkperson",authorizeMeterApp, navisionController.getWorkperson)


/**
 * Route for CreateWorksheet
 * POST /api/navision/CreateWorksheet
 */
router.post("/CreateWorksheet",authorizeMeterApp, navisionController.createWorksheet)



module.exports = router