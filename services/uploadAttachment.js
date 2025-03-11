// const fs = require('fs');
// const path = require('path');

// /**
//  * Service for handling file uploads and storage
//  */
// class UploadService {
//   constructor() {
//     this.uploadsDir = path.join(__dirname, '../uploads');
    
//     // Ensure uploads directory exists
//     try {
//       if (!fs.existsSync(this.uploadsDir)) {
//         console.log("Uploads directory does not exist. Creating...");
//         fs.mkdirSync(this.uploadsDir, { recursive: true });
//       } else {
//         console.log("Uploads directory already exists.");
//       }
//     } catch (error) {
//       console.error("Error creating uploads directory:", error);
//     }
//   }
  
//   /**
//    * Process uploaded files and save metadata
//    * @param {Array} files - Array of uploaded files from multer
//    * @param {Object} metadata - Additional metadata for the files
//    * @returns {Array} - Array of processed file metadata
//    */
//   async processUploadedFiles(files, metadata) {
//     const processedFiles = [];
    
//     for (const file of files) {
//       try {
//         // Create metadata for the file
//         const fileMetadata = {
//           originalName: file.originalname,
//           savedName: file.filename,
//           path: file.path.replace(path.join(__dirname, '..'), ''),
//           size: file.size,
//           mimeType: file.mimetype,
//           uploadDate: new Date().toISOString(),
//           ...metadata
//         };

//         // Save metadata to a JSON file alongside the uploaded file
//         const metadataPath = `${file.path}.json`;
//         try {
//           fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2));
//           console.log(`Metadata saved for file: ${file.path}`);
//         } catch (writeError) {
//           console.error(`Error saving metadata for ${file.originalname}:`, writeError);
//           throw new Error("Failed to write metadata");
//         }

//         // Add to processed files array
//         processedFiles.push(fileMetadata);
        
//         console.log(`File saved: ${file.path}`);
//       } catch (error) {
//         console.error(`Error processing file ${file.originalname}:`, error);
//         // Continue processing other files even if one fails
//       }
//     }
    
//     return processedFiles;
//   }
  
//   /**
//    * Get all attachments for a specific record
//    * @param {string} recordId - ID of the record to get attachments for
//    * @returns {Array} - Array of attachment metadata
//    */
//   getAttachmentsForRecord(recordId) {
//     const attachments = [];
    
//     // Walk through the uploads directory
//     try {
//       this.walkDirectory(this.uploadsDir, (filePath) => {
//         if (filePath.endsWith('.json')) {
//           try {
//             // Read metadata file
//             const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
//             // Check if it matches the requested record ID
//             if (metadata.record_id === recordId) {
//               attachments.push(metadata);
//             }
//           } catch (error) {
//             console.error(`Error reading metadata file ${filePath}:`, error);
//           }
//         }
//       });
//     } catch (error) {
//       console.error("Error walking through the uploads directory:", error);
//     }

//     return attachments;
//   }
  
//   /**
//    * Walk through a directory recursively
//    * @param {string} dir - Directory to walk
//    * @param {Function} callback - Callback for each file
//    */
//   walkDirectory(dir, callback) {
//     if (!fs.existsSync(dir)) {
//       console.error(`Directory does not exist: ${dir}`);
//       return;
//     }
    
//     try {
//       const files = fs.readdirSync(dir);
    
//       files.forEach(file => {
//         const filePath = path.join(dir, file);
//         const stat = fs.statSync(filePath);
        
//         if (stat.isDirectory()) {
//           this.walkDirectory(filePath, callback);
//         } else {
//           callback(filePath);
//         }
//       });
//     } catch (error) {
//       console.error(`Error reading directory ${dir}:`, error);
//     }
//   }
  
//   /**
//    * Delete an attachment
//    * @param {string} filePath - Path to the file to delete
//    * @returns {boolean} - Success status
//    */
//   deleteAttachment(filePath) {
//     try {
//       // Get the full path
//       const fullPath = path.join(__dirname, '..', filePath);
      
//       // Check if file exists
//       if (!fs.existsSync(fullPath)) {
//         console.warn(`File not found: ${filePath}`);
//         return false;
//       }
      
//       // Delete the file
//       fs.unlinkSync(fullPath);
      
//       // Delete the metadata file if it exists
//       const metadataPath = `${fullPath}.json`;
//       if (fs.existsSync(metadataPath)) {
//         fs.unlinkSync(metadataPath);
//       }
      
//       console.log(`File and metadata deleted: ${filePath}`);
//       return true;
//     } catch (error) {
//       console.error(`Error deleting file ${filePath}:`, error);
//       return false;
//     }
//   }
// }

// module.exports = new UploadService();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const mime = require('mime-types');
const ENDPOINTS = require("../utils/endpoints");

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
        `${ENDPOINTS.servicenowBaseURL}/api/now/attachment/file`,fileBuffer,
        //form,
        {
          params: requestParams,
           // ...form.getHeaders(),
           headers: {
            "Content-Type": mimeType,
            Accept: "application/json",
          },
          auth: {
            username: servicenowUser,
            password: servicenowPass,
          },
          timeout: 30000,  // 30 seconds timeout for the API request
        }
      );

      // Return the response from ServiceNow
      return response.data;
    } catch (error) {
      console.error("Error uploading to ServiceNow:", error);
      throw new Error("Failed to upload file to ServiceNow");
    }
  }
}

module.exports = new UploadService();