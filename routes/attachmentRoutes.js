const express = require("express")
const router = express.Router()
const uploadController = require('../controllers/uploadController'); 
const { authorizeMeterApp } = require("../middleware/auth")

/**
 * Route for uploading attachments
 * POST /api/meter_app/upload_attachment
 */
router.post("/upload_attachment", authorizeMeterApp, uploadController.uploadAttachments);
router.post("/merge_attachments", authorizeMeterApp, uploadController.mergeAttachments);

module.exports = router