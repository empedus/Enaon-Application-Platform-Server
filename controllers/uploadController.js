const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadService = require("../services/uploadAttachment");

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
      console.log("Upload process started...");
  
      // Proceed with multer to handle the file upload
      upload(req, res, async (err) => {
        try {
          if (err) {
            console.error("Error during upload:", err);
            return res.status(500).json({
              success: false,
              message: "File upload failed",
              error: err.message,
            });
          }
  
          // Ensure files were uploaded
          if (!req.files || req.files.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No files were uploaded",
            });
          }
  
          // Extract user_email and record_sys_id from query parameters
          const { user_email, record_sys_id } = req.query;
  
          // Validate necessary parameters
          if (!user_email || !record_sys_id) {
            return res.status(400).json({
              success: false,
              message: "Missing required parameters (user_email, record_sys_id)",
            });
          }
  
          // Initialize an array to store the results of the upload process
          const uploadResults = [];
  
          // Loop through each uploaded file and call uploadToServiceNow
          for (const file of req.files) {
            // File is already in memory, so use file.buffer directly
            const fileBuffer = file.buffer;
            const fileName = file.originalname;
  
            // Call the uploadToServiceNow function for each file
            const result = await uploadService.uploadToServiceNow(
              fileBuffer,      // File buffer
              fileName,        // File name
              record_sys_id,   // ServiceNow record sys_id
              user_email       // User email
            );
  
            // Store the result in the uploadResults array
            uploadResults.push(result);
          }
  
          // Return success response with details
          res.status(200).json({
            success: true,
            message: `Successfully uploaded ${uploadResults.length} file(s) to ServiceNow.`,
            files: uploadResults,
          });
        } catch (error) {
          console.error("Error in uploadAttachments controller:", error);
          res.status(500).json({
            success: false,
            message: "Failed to process attachments",
            error: error.message,
          });
        }
      });
    }


//   /**
//    * Get attachments for a record
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   getAttachments(req, res) {
//     try {
//       const { recordId } = req.params

//       if (!recordId) {
//         return res.status(400).json({
//           success: false,
//           message: "Record ID is required",
//         })
//       }

//       // Get attachments using the service
//       const files = uploadService.getAttachmentsForRecord(recordId)

//       res.status(200).json({
//         success: true,
//         count: files.length,
//         files,
//       })
//     } catch (error) {
//       console.error("Error in getAttachments controller:", error)
//       res.status(500).json({
//         success: false,
//         message: "Failed to retrieve attachments",
//         error: error.message,
//       })
//     }
//   }
}

module.exports = new UploadController()

