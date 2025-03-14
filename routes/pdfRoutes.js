const express = require("express")
const router = express.Router()
const pdfController = require("../controllers/pdfController")
const { authorizeMeterApp } = require("../middleware/auth")

// 7. Generate PDF and Attach it in the Record
router.get("/generate_pdf", authorizeMeterApp, pdfController.generatePdf)

// 8. Generate PDF with signs and Attach it in the Record
router.post("/sign_pdf", authorizeMeterApp, pdfController.signPdf)

router.get("/get_attached_pdf", authorizeMeterApp, pdfController.getattachedpdf)

router.get("/get_record_attachments", pdfController.getRecordAttachments)
module.exports = router

