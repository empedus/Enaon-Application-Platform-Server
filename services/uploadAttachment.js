const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const mime = require('mime-types');
const ENDPOINTS = require("../utils/endpoints");
// Add required dependencies for mergeAttachments
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

/**
 * Service for handling file uploads and storage
 */
class UploadService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');

    // Ensure uploads directory exists (optional, you can skip this step)
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        console.log("Uploads directory does not exist. Creating...");
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } else {
        console.log("Uploads directory already exists.");
      }
    } catch (error) {
      console.error("Error creating uploads directory:", error);
    }
  }

  /**
   * Process uploaded files and send them to ServiceNow
   * @param {Array} files - Array of uploaded files from multer
   * @param {Object} metadata - Additional metadata for the files
   * @param {String} user_email - Email of the user uploading the files
   * @param {String} record_sys_id - Sys ID of the record in ServiceNow
   * @returns {Array} - Array of file metadata responses from ServiceNow
   */
  async processUploadedFiles(files, metadata, user_email, record_sys_id) {
    const processedFiles = [];

    for (const file of files) {
      try {
        // Prepare the file metadata
        const fileMetadata = {
          originalName: file.originalname,
          savedName: file.filename, // Temporary filename
          size: file.size,
          mimeType: file.mimetype,
          uploadDate: new Date().toISOString(),
          ...metadata
        };

        // Convert file to buffer for uploading to ServiceNow
        const fileBuffer = fs.readFileSync(file.path);

        // Send the file buffer to ServiceNow
        const attachmentResponse = await this.uploadToServiceNow(fileBuffer, file.originalname, record_sys_id, user_email);

        // Store the response from ServiceNow
        fileMetadata.servicenowAttachmentId = attachmentResponse.result.sys_id;
        fileMetadata.servicenowFileName = attachmentResponse.result.file_name;

        console.log(`File uploaded to ServiceNow: ${file.originalname}`);

        processedFiles.push(fileMetadata);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue processing other files even if one fails
      }
    }

    return processedFiles;
  }

  /**
   * Upload the file to ServiceNow attachment API
   * @param {Buffer} fileBuffer - Buffer of the file to upload
   * @param {String} fileName - Name of the file
   * @param {String} recordSysId - Sys ID of the record to attach the file to
   * @param {String} userEmail - Email of the user uploading the file
   * @returns {Object} - Response from ServiceNow
   */
  async uploadToServiceNow(fileBuffer, fileName, recordSysId, userEmail) {
    const servicenowUser = process.env.SERVICENOW_USER;
    const servicenowPass = process.env.SERVICENOW_PASS;

    try {
      // Create a new form-data instance
      //   const form = new FormData();

      //   // Get the MIME type based on the file extension
      //   const mimeType = mime.lookup(fileName) || 'application/octet-stream';

      //   // Append the file buffer, with the filename and MIME type
      //   form.append('file', fileBuffer, {
      //     filename: fileName,
      //     contentType: mimeType,
      //   });

      const mimeType = mime.lookup(fileName);
      // Set up the API request parameters
      const requestParams = {
        table_name: "x_eedat_meters_app_job_assignments",  // The target table name
        table_sys_id: recordSysId,  // Record Sys ID
        file_name: fileName,  // File name
      };

      // Send the POST request with form data
      const response = await axios.post(
        `${ENDPOINTS.servicenowBaseURL}/api/now/attachment/file`, fileBuffer,
        //form,
        {
          params: requestParams,
          // ...form.getHeaders(),
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          auth: {
            username: servicenowUser,
            password: servicenowPass,
          },
          timeout: 60000,  // 30 seconds timeout for the API request
        }
      );

      // Return the response from ServiceNow
      return response.data;
    } catch (error) {
      console.error("Error uploading to ServiceNow:", error);
      throw new Error("Failed to upload file to ServiceNow");
    }
  }

  /**
   * Merge multiple attachments into a single PDF and upload to ServiceNow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with merged PDF information
   */
  async mergeAttachments(record_sys_id, ikasp) {
    console.log("[INFO] Merge attachments process started...");

    try {
      if (!record_sys_id || !ikasp) {
        console.warn("[WARN] Missing required parameter");
        throw new Error("Missing required parameter");
      }

      // Fetch attachments from ServiceNow
      const getAttachmentsResponse = await axios.get(
        `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS}`,
        {
          auth: {
            username: process.env.SERVICENOW_USER,
            password: process.env.SERVICENOW_PASS,
          },
          headers: { "Content-Type": "application/json" },
          params: { sysparm_query: `table_sys_id=${record_sys_id}` },
        }
      );

      const attachments = getAttachmentsResponse.data.result;

      if (attachments.length === 0) {
        console.warn("[WARN] No attachments found for the provided record.");
        throw new Error("No attachments found for the provided record.");
      }

      let mergedPdfDoc = await PDFDocument.create();
      const pageWidth = 595.276;
      const pageHeight = 841.89;
      console.log("[INFO] Processing files...");

      // Process each attachment
      for (const attachment of attachments) {
        const attachmentUrl = `${attachment.download_link}`;
        const fileName = attachment.file_name;
        const fileExt = fileName.split(".").pop().toLowerCase();

        const attachmentResponse = await axios.get(attachmentUrl, {
          responseType: "arraybuffer",
          auth: {
            username: process.env.SERVICENOW_USER,
            password: process.env.SERVICENOW_PASS,
          },
        });

        const fileBuffer = Buffer.from(attachmentResponse.data);
        console.log(`[INFO] Processing file: ${fileName}`);

        // Check if the file type is supported and process it
        if (["pdf", "jpg", "jpeg", "png"].includes(fileExt)) {
          if (fileExt === "pdf") {
            const pdfToMerge = await PDFDocument.load(fileBuffer);
            const copiedPages = await mergedPdfDoc.copyPages(
              pdfToMerge,
              pdfToMerge.getPageIndices()
            );
            copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
          } else {
            const imageBuffer = await sharp(fileBuffer).toBuffer();
            let pdfImage;

            if (fileExt === "jpg" || fileExt === "jpeg") {
              pdfImage = await mergedPdfDoc.embedJpg(imageBuffer);
            } else if (fileExt === "png") {
              pdfImage = await mergedPdfDoc.embedPng(imageBuffer);
            }

            const { width, height } = pdfImage.scale(1);
            const scale = Math.min(pageWidth / width, pageHeight / height);
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;

            const imagePage = mergedPdfDoc.addPage([pageWidth, pageHeight]);
            imagePage.drawImage(pdfImage, {
              x: (pageWidth - scaledWidth) / 2,
              y: (pageHeight - scaledHeight) / 2,
              width: scaledWidth,
              height: scaledHeight,
            });
          }

          // Now delete the attachment after it has been successfully merged
          try {
            const deleteAttachmentResponse = await axios.delete(
              `${ENDPOINTS.servicenowBaseURL}/api/now/attachment/${attachment.sys_id}`,
              {
                auth: {
                  username: process.env.SERVICENOW_USER,
                  password: process.env.SERVICENOW_PASS,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            console.log(
              `[INFO] Deleted attachment with sys_id: ${attachment.sys_id}`
            );
          } catch (deleteError) {
            console.error(
              `[ERROR] Failed to delete attachment with sys_id: ${attachment.sys_id}`,
              deleteError.message
            );
          }
        }
      }

      const mergedPDFBuffer = await mergedPdfDoc.save();
      if (mergedPDFBuffer.length > 0) {
        console.log("[INFO] Uploading merged PDF...");
        const pdfResult = await this.uploadToServiceNow(
          mergedPDFBuffer,
          `${ikasp}.pdf`,
          record_sys_id
        );
        console.log("[INFO] Merged PDF uploaded.");
        return {
          success: true,
          message: "Uploaded merged PDF and deleted merged attachments.",
          file: pdfResult,
        };
      }

      throw new Error("Failed to merge and upload PDF.");
    } catch (error) {
      console.error("[ERROR] Merge attachments error:", error);
      throw error;
    }
  }
}

module.exports = new UploadService();