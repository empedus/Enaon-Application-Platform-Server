const express = require("express")
const router = express.Router()
const uploadController = require('../controllers/uploadController'); // Add this line
/**
 * Route for uploading attachments
 * POST /api/meter_app/upload_attachment
 */
router.post("/upload_attachment", uploadController.uploadAttachments);
module.exports = router

