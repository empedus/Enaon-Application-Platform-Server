const axios = require("axios")
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadService = require("../services/uploadAttachment");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const ENDPOINTS = require("../utils/endpoints")

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
  // async mergeAttachments(req, res) {

  //   console.log("[INFO] Upload process started...");

  //   upload(req, res, async (err) => {
  //     try {
  //       if (err) {
  //         console.error("[ERROR] Upload failed:", err);
  //         return res.status(500).json({
  //           success: false,
  //           message: "File upload failed",
  //           error: err.message,
  //         });
  //       }

  //       if (!req.files || req.files.length === 0) {
  //         console.warn("[WARN] No files uploaded");
  //         return res.status(400).json({
  //           success: false,
  //           message: "No files uploaded",
  //         });
  //       }

  //       const { user_email, record_sys_id } = req.query;

  //       if (!user_email || !record_sys_id) {
  //         console.warn("[WARN] Missing required parameters");
  //         return res.status(400).json({
  //           success: false,
  //           message: "Missing required parameters (user_email, record_sys_id)",
  //         });
  //       }

  //       const uploadResults = [];
  //       let mergedPdfDoc = await PDFDocument.create(); // New PDF document

  //       const pageWidth = 595.276; // A4 width
  //       const pageHeight = 841.89; // A4 height
  //       console.log("[INFO] Processing files...");

  //       for (const file of req.files) {
  //         const fileBuffer = file.buffer;
  //         const fileName = file.originalname;
  //         const fileExt = fileName.split(".").pop().toLowerCase();

  //         if (["pdf", "jpg", "jpeg", "png"].includes(fileExt)) {
  //           console.log(`[INFO] Merging file: ${fileName}`);
  //           if (fileExt === "pdf") {
  //             const pdfToMerge = await PDFDocument.load(fileBuffer);
  //             const copiedPages = await mergedPdfDoc.copyPages(
  //               pdfToMerge,
  //               pdfToMerge.getPageIndices()
  //             );
  //             copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
  //           } else {
  //             const imageBuffer = await sharp(fileBuffer).toBuffer();
  //             let pdfImage;

  //             if (fileExt === "jpg" || fileExt === "jpeg") {
  //               pdfImage = await mergedPdfDoc.embedJpg(imageBuffer);
  //             } else if (fileExt === "png") {
  //               pdfImage = await mergedPdfDoc.embedPng(imageBuffer);
  //             }

  //             const { width, height } = pdfImage.scale(1);
  //             const scale = Math.min(pageWidth / width, pageHeight / height);
  //             const scaledWidth = width * scale;
  //             const scaledHeight = height * scale;

  //             const imagePage = mergedPdfDoc.addPage([pageWidth, pageHeight]);
  //             imagePage.drawImage(pdfImage, {
  //               x: (pageWidth - scaledWidth) / 2,
  //               y: (pageHeight - scaledHeight) / 2,
  //               width: scaledWidth,
  //               height: scaledHeight,
  //             });
  //           }
  //         } else {
  //           console.log(`[INFO] Uploading non-mergeable file: ${fileName}`);
  //           const result = await uploadService.uploadToServiceNow(
  //             fileBuffer,
  //             fileName,
  //             record_sys_id,
  //             user_email
  //           );
  //           uploadResults.push(result);
  //         }
  //       }

  //       const mergedPDFBuffer = await mergedPdfDoc.save();
  //       if (mergedPDFBuffer.length > 0) {
  //         console.log("[INFO] Uploading merged PDF...");
  //         const pdfResult = await uploadService.uploadToServiceNow(
  //           mergedPDFBuffer,
  //           "merged_attachments.pdf",
  //           record_sys_id,
  //           user_email
  //         );
  //         uploadResults.push(pdfResult);
  //         console.log("[INFO] Merged PDF uploaded.");
  //       }

  //       console.log("[INFO] Cleaning up memory...");
  //       req.files = null; // Remove file references
  //       mergedPdfDoc = null; // Allow garbage collection

  //       console.log("[INFO] Upload completed.");
  //       res.status(200).json({
  //         success: true,
  //         message: `Uploaded ${uploadResults.length} file(s).`,
  //         files: uploadResults,
  //       });
  //     } catch (error) {
  //       console.error("[ERROR] Upload error:", error);
  //       res.status(500).json({
  //         success: false,
  //         message: "Failed to process attachments",
  //         error: error.message,
  //       });
  //     }
  //   });
  // }




  // Upload attachments top Servicenow Record
    
  async mergeAttachments(req, res) {
    console.log("[INFO] Upload process started...");
  
    try {
      const { record_sys_id } = req.query;
      if (!record_sys_id) {
        console.warn("[WARN] Missing required parameters");
        return res.status(400).json({
          success: false,
          message: "Missing required parameters (record_sys_id)",
        });
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
        return res.status(404).json({
          success: false,
          message: "No attachments found for the provided record.",
        });
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
            console.log(`[INFO] Deleted attachment with sys_id: ${attachment.sys_id}`);
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
        const pdfResult = await uploadService.uploadToServiceNow(
          mergedPDFBuffer,
          "merged_attachments.pdf",
          record_sys_id
        );
        console.log("[INFO] Merged PDF uploaded.");
        return res.status(200).json({
          success: true,
          message: "Uploaded merged PDF and deleted merged attachments.",
          file: pdfResult,
        });
      }
  
      return res.status(500).json({
        success: false,
        message: "Failed to merge and upload PDF.",
      });
  
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
            const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');// No encoding here, use as is
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
  }
  



module.exports = new UploadController();
