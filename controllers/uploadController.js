const axios = require("axios");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadService = require("../services/uploadAttachment");
const { deleteDataFromServiceNow } = require("../services/serviceNowService");
const ENDPOINTS = require("../utils/endpoints");

/**
 * Configure multer storage to use memory storage instead of disk storage.
 */
const storage = multer.memoryStorage(); // Store files in memory

// Create multer upload instance with file size limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file as serviceNow supports in record attachments
}).array("attachments", 25); // Limit the number of files to 25

class UploadController {
  // Upload attachments to Servicenow Record

  async mergeAttachments(req, res) {
    console.log("[INFO] Upload process started...");

    try {
      const { record_sys_id, ikasp } = req.query;
      if (!record_sys_id || !ikasp) {
        console.warn("[WARN] Missing required parameters");
        return res.status(400).json({
          success: false,
          message: "Missing required parameters (record_sys_id)",
        });
      }

      // Call the service method to handle the merging
      const result = await uploadService.mergeAttachments(record_sys_id, ikasp);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("[ERROR] Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process attachments",
        error: error.message,
      });
    }
  }

  async uploadAttachments(req, res) {
    console.log("[INFO] Upload process started...");
    upload(req, res, async (err) => {
      try {
        if (err) {
          console.error("[ERROR] Upload failed:", err);
          return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: err.message,
          });
        }

        if (!req.files || req.files.length === 0) {
          console.warn("[WARN] No files uploaded");
          return res.status(400).json({
            success: false,
            message: "No files uploaded",
          });
        }

        const { user_email, record_sys_id } = req.query;

        if (!user_email || !record_sys_id) {
          console.warn("[WARN] Missing required parameters");
          return res.status(400).json({
            success: false,
            message: "Missing required parameters (user_email, record_sys_id)",
          });
        }

        const uploadResults = [];
        console.log("[INFO] Processing files...");
        // Process each file individually
        for (const file of req.files) {
          const fileBuffer = file.buffer;
          const fileName = Buffer.from(file.originalname, "latin1").toString(
            "utf8"
          ); // No encoding here, use as is
          const fileExt = fileName.split(".").pop().toLowerCase();

          console.log(`[INFO] Uploading file: ${fileName}`); // Check if the name is correct

          const result = await uploadService.uploadToServiceNow(
            fileBuffer,
            fileName,
            record_sys_id,
            user_email
          );
          uploadResults.push(result);
        }

        console.log("[INFO] Cleaning up memory...");
        req.files = null; // Remove file references

        console.log("[INFO] Upload completed.");
        res.status(200).json({
          success: true,
          message: `Uploaded ${uploadResults.length} file(s).`,
          files: uploadResults,
        });
      } catch (error) {
        console.error("[ERROR] Upload error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to process attachments",
          error: error.message,
        });
      }
    });
  }

  // delete attachment
  deleteAttachment = async (req, res) => {
    try {
      const { user_email, attachment_sys_id } = req.query;

      if (!user_email || !attachment_sys_id) {
        return res.status(400).json({
          error:
            "Missing required query parameters: user_email or attachment_sys_id",
        });
      }

      // Construct the path with the attachment_sys_id
      const path = `${ENDPOINTS.DELETE_ATTACHMENT}/${attachment_sys_id}`;

      // Call getDataFromServiceNow with the correct path and params
      const deleteAttachmentResponse = await deleteDataFromServiceNow(path, {
        user_email, // Pass user_email as a parameter
      });

      // Check if there was an error in the response
      if (deleteAttachmentResponse.error) {
        return res.status(deleteAttachmentResponse.status || 500).json({
          error: deleteAttachmentResponse.error,
        });
      }

      res.status(200).json(deleteAttachmentResponse);
    } catch (error) {
      console.error("Error deleting attachment:", error);

      if (error.response) {
        return res.status(error.response.status).json({
          error: error.response.data || "ServiceNow API error",
        });
      } else if (error.request) {
        return res
          .status(503)
          .json({ error: "No response received from ServiceNow API" });
      } else {
        return res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      }
    }
  };
}

module.exports = new UploadController();