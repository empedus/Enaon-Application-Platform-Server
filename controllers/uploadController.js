const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadService = require("../services/uploadAttachment");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");
const { PassThrough } = require("stream");

/**
 * Configure multer storage to use memory storage instead of disk storage.
 * Files will be kept in memory and will not be written to disk.
 */
const storage = multer.memoryStorage(); // Store files in memory instead of on disk

// Create multer upload instance with file size limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
}).array("attachments", 25); // Limit the number of files to 25

/**
 * Controller for handling file uploads
 */
class UploadController {
    /**
     * Upload attachments
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadAttachments(req, res) {
      console.log("[INFO] Upload process started...");
  
      // Proceed with multer to handle the file upload
      upload(req, res, async (err) => {
        try {
          if (err) {
            console.error("[ERROR] Error during upload:", err);
            return res.status(500).json({
              success: false,
              message: "File upload failed",
              error: err.message,
            });
          }
  
          console.log("[INFO] Files received and processing started...");
          // Ensure files were uploaded
          if (!req.files || req.files.length === 0) {
            console.warn("[WARN] No files were uploaded");
            return res.status(400).json({
              success: false,
              message: "No files were uploaded",
            });
          }
  
          // Extract user_email and record_sys_id from query parameters
          const { user_email, record_sys_id } = req.query;
  
          // Validate necessary parameters
          if (!user_email || !record_sys_id) {
            console.warn("[WARN] Missing required parameters (user_email, record_sys_id)");
            return res.status(400).json({
              success: false,
              message: "Missing required parameters (user_email, record_sys_id)",
            });
          }
  
          // Initialize an array to store the results of the upload process
          const uploadResults = [];
          const pdfDoc = new PDFDocument();
          const pdfStream = new PassThrough();
          pdfDoc.pipe(pdfStream);
  
          console.log("[INFO] Processing uploaded files...");
          
          // Loop through each uploaded file and handle merging for PDFs and images
          for (const file of req.files) {
            const fileBuffer = file.buffer;
            const fileName = file.originalname;
            const fileExt = fileName.split(".").pop().toLowerCase();
  
            if (["pdf", "jpg", "jpeg", "png"].includes(fileExt)) {
              console.log(`[INFO] Merging file: ${fileName}`);
              if (fileExt === "pdf") {
                pdfDoc.addPage().text("[PDF Attachment: " + fileName + "]");
              } else {
                const image = await sharp(fileBuffer).resize(600).toBuffer();
                pdfDoc.addPage().image(image, { fit: [500, 500] });
              }
            } else {
              console.log(`[INFO] Uploading non-mergeable file separately: ${fileName}`);
              const result = await uploadService.uploadToServiceNow(
                fileBuffer, fileName, record_sys_id, user_email
              );
              uploadResults.push(result);
            }
          }
  
          pdfDoc.end();
          const mergedPDFBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            pdfStream.on("data", chunk => chunks.push(chunk));
            pdfStream.on("end", () => resolve(Buffer.concat(chunks)));
            pdfStream.on("error", reject);
          });
  
          if (mergedPDFBuffer.length > 0) {
            console.log("[INFO] Uploading merged PDF to ServiceNow...");
            const pdfResult = await uploadService.uploadToServiceNow(
              mergedPDFBuffer, "merged_attachments.pdf", record_sys_id, user_email
            );
            uploadResults.push(pdfResult);
            console.log("[INFO] Merged PDF successfully uploaded.");
          }
  
          console.log("[INFO] Upload process completed successfully.");
          
          // Return success response with details
          res.status(200).json({
            success: true,
            message: `Successfully uploaded ${uploadResults.length} file(s) to ServiceNow.`,
            files: uploadResults,
          });
        } catch (error) {
          console.error("[ERROR] Error in uploadAttachments controller:", error);
          res.status(500).json({
            success: false,
            message: "Failed to process attachments",
            error: error.message,
          });
        }
      });
    }
}

module.exports = new UploadController();
