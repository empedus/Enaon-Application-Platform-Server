// const axios = require("axios");
// const ENDPOINTS = require("../utils/endpoints");

// /**
//  * Fetches data from Navision through ServiceNow
//  * @param {string} path - The API endpoint path
//  * @param {object} [requestBodyOrParams={}] - The request body (for POST) or query parameters (for GET)
//  * @param {string} [method='post'] - HTTP method (default: 'post')
//  * @param {boolean} [isQueryParam=false] - Whether to send data as query parameters even for POST requests
//  * @returns {Promise<object>} - The response data or error object
//  */
// const fetchDataFromNavisionThrowServiceNow = async (
//   path,
//   requestBodyOrParams = {},
//   method = "post",
//   isQueryParam = false
// ) => {
//   try {
//     // Validate inputs
//     if (!path) {
//       console.error("Error: Missing path parameter");
//       return { error: "Missing path parameter", status: 400 };
//     }

//     // Access servicenowBaseURL directly from ENDPOINTS
//     const servicenowBaseURL = ENDPOINTS.servicenowBaseURL;
//     if (!servicenowBaseURL) {
//       console.error("Error: Missing base URL in ENDPOINTS");
//       return { error: "Server misconfiguration: Missing base URL", status: 500 };
//     }

//     // Normalize method to lowercase
//     const normalizedMethod = (method || "post").toLowerCase();
    
//     // Ensure requestBodyOrParams is an object
//     const normalizedData = requestBodyOrParams || {};

//     // Construct URL
//     const apiUrl = `${servicenowBaseURL}${path}`;
    
//     // Set up common request config with auth
//     const config = {
//       auth: {
//         username: process.env.SERVICENOW_USER,
//         password: process.env.SERVICENOW_PASS,
//       },
//       headers: { 
//         "Content-Type": "application/json",
//         "Accept": "application/json"
//       },
//     };

//     // Log request details with simplified output
//     console.log(`Request to ${path} (${normalizedMethod.toUpperCase()})`);
    
//     // Make the request based on the method and isQueryParam flag
//     let response;
    
//     if (normalizedMethod === "get" || isQueryParam) {
//       // For GET requests or when isQueryParam is true, send data as query parameters
//       response = await axios({
//         method: normalizedMethod,
//         url: apiUrl,
//         params: normalizedData,
//         ...config
//       });
//     } else {
//       // For POST requests, send data in the request body
//       response = await axios.post(apiUrl, normalizedData, config);
//     }

//     // Check for empty response
//     if (!response.data) {
//       console.warn(`Empty response from ${path}`);
//       return { data: null, status: response.status };
//     }

//     // Return the response data
//     return response.data;
//   } catch (error) {
//     // Simplified error logging
//     console.error(`Error fetching data from ${path}: ${error.message}`);
    
//     if (error.response) {
//       console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
//     }

//     // Return a structured error object
//     return {
//       error: error.response?.data?.error || error.response?.data || error.message || "Failed to fetch data from Navision",
//       status: error.response?.status || 500,
//       isError: true
//     };
//   }
// };

// module.exports = {
//   fetchDataFromNavisionThrowServiceNow,
// };



const axios = require("axios");
const ENDPOINTS = require("../utils/endpoints");

/**
 * Fetches data from Navision through ServiceNow
 * @param {string} path - The API endpoint path
 * @param {object} [requestBodyOrParams={}] - The request body (for POST) or query parameters (for GET)
 * @param {string} [method='post'] - HTTP method (default: 'post')
 * @param {boolean} [isQueryParam=false] - Whether to send data as query parameters even for POST requests
 * @param {object} [additionalQueryParams=null] - Additional query parameters to include (for POST with query params)
 * @returns {Promise<object>} - The response data or error object
 */
const fetchDataFromNavisionThrowServiceNow = async (
  path,
  requestBodyOrParams = {},
  method = "post",
  isQueryParam = false,
  additionalQueryParams = null
) => {
  try {
    // Validate inputs
    if (!path) {
      console.error("Error: Missing path parameter");
      return { error: "Missing path parameter", status: 400 };
    }

    // Access servicenowBaseURL directly from ENDPOINTS
    const servicenowBaseURL = ENDPOINTS.servicenowBaseURL;
    if (!servicenowBaseURL) {
      console.error("Error: Missing base URL in ENDPOINTS");
      return { error: "Server misconfiguration: Missing base URL", status: 500 };
    }

    // Normalize method to lowercase
    const normalizedMethod = (method || "post").toLowerCase();
    
    // Ensure requestBodyOrParams is an object
    const normalizedData = requestBodyOrParams || {};

    // Construct URL
    const apiUrl = `${servicenowBaseURL}${path}`;
    
    // Set up common request config with auth
    const config = {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };

    // Log request details with simplified output
    console.log(`Request to ${path} (${normalizedMethod.toUpperCase()})`);
    
    // Make the request based on the method and isQueryParam flag
    let response;
    
    if (normalizedMethod === "get" || isQueryParam) {
      // For GET requests or when isQueryParam is true, send data as query parameters
      response = await axios({
        method: normalizedMethod,
        url: apiUrl,
        params: normalizedData,
        ...config
      });
    } else if (additionalQueryParams) {
      // For POST requests with additional query parameters
      response = await axios({
        method: normalizedMethod,
        url: apiUrl,
        params: additionalQueryParams,
        data: normalizedData,
        ...config
      });
    } else {
      // For POST requests, send data in the request body
      response = await axios.post(apiUrl, normalizedData, config);
    }

    // Check for empty response
    if (!response.data) {
      console.warn(`Empty response from ${path}`);
      return { data: null, status: response.status };
    }

    // Return the response data
    return response.data;
  } catch (error) {
    // Simplified error logging
    console.error(`Error fetching data from ${path}: ${error.message}`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }

    // Return a structured error object
    return {
      error: error.response?.data?.error || error.response?.data || error.message || "Failed to fetch data from Navision",
      status: error.response?.status || 500,
      isError: true
    };
  }
};


/**
 * Call ServiceNow API directly (for attachment operations)
 * @param {string} path - API endpoint path
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data
 */
const callServiceNowAPI = async (path, options = {}) => {
  try {
    const servicenowBaseURL = ENDPOINTS.servicenowBaseURL;
    if (!servicenowBaseURL) {
      return { success: false, error: "Server misconfiguration: Missing base URL", status: 500 };
    }

    const url = `${servicenowBaseURL}${path}`;
    
    const config = {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { 
        "Accept": "application/json"
      },
      ...options
    };

    console.log(`Calling ServiceNow API: ${path}`);
    const response = await axios.get(url, config);
    
    // Print the response summary
    console.log(`ServiceNow API Response (${path}):`);
    console.log(`Status: ${response.status}`);
    console.log(`Data type: ${typeof response.data}`);
    
    if (typeof response.data === 'object') {
      console.log(`Top-level keys: ${Object.keys(response.data).join(', ')}`);
      
      // If there's a result property, print more details
      if (response.data.result) {
        console.log(`Result type: ${typeof response.data.result}`);
        if (Array.isArray(response.data.result)) {
          console.log(`Result is an array with ${response.data.result.length} items`);
        } else if (typeof response.data.result === 'object') {
          console.log(`Result keys: ${Object.keys(response.data.result).join(', ')}`);
        }
      }
    }
    
    return { 
      success: true, 
      data: response.data, 
      status: response.status 
    };
  } catch (error) {
    console.error(`Error calling ServiceNow API ${path}:`, error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data)}`);
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Download an attachment from ServiceNow and return as Base64
 * @param {string} downloadLink - The download link for the attachment
 * @returns {Promise<string>} - Base64 encoded attachment
 */
const downloadAttachmentAsBase64 = async (downloadLink) => {
  try {
    const response = await axios.get(downloadLink, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      }
    });
    
    // Convert the binary data to base64
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error('Error downloading attachment:', error.message);
    throw error;
  }
};

// /**
//  * Convert PDF Base64 to Word Base64 using officegen
//  * @param {string} pdfBase64 - Base64 encoded PDF
//  * @returns {Promise<string>} - Base64 encoded Word document
//  */
// const convertPdfToWord = async (pdfBase64) => {
//   try {
//     // Import required libraries
//     const officegen = require('officegen');
//     const pdf = require('pdf-parse');
    
//     // Create buffer from base64
//     const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
//     // Parse PDF to extract text
//     const pdfData = await pdf(pdfBuffer);
    
//     // Create a Word document
//     const docx = officegen('docx');
    
//     // Set document properties
//     docx.setDocSubject('Converted from PDF');
//     docx.setDocKeywords('PDF, Word, Conversion');
//     docx.setDescription('Document converted from PDF to Word');
    
//     // Split text into paragraphs
//     const paragraphs = pdfData.text
//       .split('\n')
//       .filter(line => line.trim() !== '');
    
//     // Add paragraphs to the document
//     for (const text of paragraphs) {
//       const p = docx.createP();
//       p.addText(text);
//     }
    
//     // Create a buffer to store the Word document
//     const chunks = [];
    
//     // Generate the document and collect chunks
//     return new Promise((resolve, reject) => {
//       // Create a writable stream that collects chunks
//       const outputStream = new require('stream').Writable({
//         write(chunk, encoding, callback) {
//           chunks.push(chunk);
//           callback();
//         }
//       });
      
//       // Handle document generation events
//       docx.on('finalize', function() {
//         console.log('Word document finalized');
//       });
      
//       docx.on('error', function(err) {
//         console.error('Error creating Word document:', err);
//         reject(err);
//       });
      
//       // Pipe the document to our stream
//       docx.generate(outputStream);
      
//       // When the stream ends, combine chunks and convert to base64
//       outputStream.on('finish', function() {
//         const wordBuffer = Buffer.concat(chunks);
//         const wordBase64 = wordBuffer.toString('base64');
//         console.log(`Word document created (${wordBuffer.length} bytes)`);
//         resolve(wordBase64);
//       });
      
//       outputStream.on('error', function(err) {
//         console.error('Error in output stream:', err);
//         reject(err);
//       });
//     });
//   } catch (error) {
//     console.error('Error converting PDF to Word:', error.message);
//     throw error;
//   }
// };

/////////////////////////lazaros////////////////////////////////////
// /**
//  * Convert PDF Base64 to Word Base64 using CloudConvert API
//  * @param {string} pdfBase64 - Base64 encoded PDF
//  * @returns {Promise<string>} - Base64 encoded Word document
//  */
// const convertPdfToWord = async (pdfBase64) => {
//   try {
//     // Import required libraries
//     const axios = require('axios');
//     const FormData = require('form-data');
//     const { Readable } = require('stream');

//     // API key for CloudConvert
//     const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDliMDdlY2JmYjRmYTU2MDg5NjU5NTdjYjJjYzA0NjRlZjBiZDAwYTlkMmI5Yjg3MTlmZWViM2ZhMGQ4ODlkNzg4Y2I4YTg0ZTIxNjcyZjIiLCJpYXQiOjE3NDQyOTMyOTAuNDcwNDY5LCJuYmYiOjE3NDQyOTMyOTAuNDcwNDcsImV4cCI6NDg5OTk2Njg5MC40NjYxMzQsInN1YiI6IjcxNTk5NDkwIiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.A8842oE7OQpf0X9wmg1--FoDt2jkFjz2TkMUsdo6fLCO69bLsu6hSOAZZC3kyMS-O-HVXnHH_GKYzIT16raLyuUHWrIUkjEXdJi2L9QObB4Bd22DThZqCGii13ohGgEGiZCl2GKUR_ww8n--z2YGxxE1KEPQaHAZFfsDjkcKj2007flyiQnM8tYMnu69C5WF4EEjaC-C8y4wNXHLkzRW8_ILz3aXM1davmHDEfvVqaORnWmhid1KFSXkIlIkLhtmoL3wWYUQQfHuN303rsmorWC04xIlgx09B0gNOKf-k38KfHksuSAG2Qkm7Wcf7sid9iMUc2GLCD_FSoOF31AKO84cE9yRKUHa8ZwGaR3Rh7ZH7fdlneIKyjguYZ_5KechqiUvtbrjyzH_AEO2ccf5edYl_BDRU1Qx7Bjop_LXYMa32eo8s_EkmTNZgPd3BvXdUf2m3q_4OAZt7iaF0bk06qT4-g8_7noLGdsRyL8nflthnhwej-f-54XA6O_-Qo398Ar6KGTvb_5pNoC0r9sjwiT7W1IwkLyHXwP8HvzOhkQD3UqI31umCu78FxS-JuPuw3tG58qKfscHGPoGeuUUi9ppLhp4Ill4XjtElqsbK4mAOh9_rX9M3HyrQ3ORTfXYbViic9cTop8d_0H42yXlQ4UVfF0Akzs1pvTa9TCpfXs';

//     // Create buffer from base64
//     const pdfBuffer = Buffer.from(pdfBase64, 'base64');

//     // Create the job definition
//     const jobConfig = {
//       tasks: {
//         import_pdf: {
//           operation: 'import/upload'
//         },
//         convert: {
//           operation: 'convert',
//           input: 'import_pdf',
//           input_format: 'pdf',
//           output_format: 'docx',
//           engine: 'libreoffice'
//         },
//         export_docx: {
//           operation: 'export/url',
//           input: 'convert'
//         }
//       }
//     };

//     // Step 1: Create the job
//     console.log('Creating conversion job...');
//     const jobRes = await axios.post(
//       'https://api.cloudconvert.com/v2/jobs',
//       jobConfig,
//       { headers: { Authorization: `Bearer ${API_KEY}` } }
//     );

//     const uploadTask = jobRes.data.data.tasks.find(t => t.name === 'import_pdf');
//     const uploadUrl = uploadTask.result.form.url;
//     const formFields = uploadTask.result.form.parameters;

//     // Step 2: Upload the PDF buffer
//     console.log('Uploading PDF data...');
//     const form = new FormData();
//     for (const [key, value] of Object.entries(formFields)) {
//       form.append(key, value);
//     }
    
//     // Create a readable stream from the buffer
//     const bufferStream = new Readable();
//     bufferStream.push(pdfBuffer);
//     bufferStream.push(null); // Signal the end of the stream
    
//     form.append('file', bufferStream, {
//       filename: 'document.pdf',
//       contentType: 'application/pdf',
//     });

//     await axios.post(uploadUrl, form, { headers: form.getHeaders() });

//     // Step 3: Wait for the job to finish
//     console.log('Processing conversion...');
//     let jobStatus;
//     let statusRes;
//     do {
//       await new Promise(r => setTimeout(r, 1000));
//       statusRes = await axios.get(
//         `https://api.cloudconvert.com/v2/jobs/${jobRes.data.data.id}`,
//         { headers: { Authorization: `Bearer ${API_KEY}` } }
//       );
//       jobStatus = statusRes.data.data.status;
//       console.log(`Job status: ${jobStatus}`);
//     } while (jobStatus !== 'finished' && jobStatus !== 'error');

//     if (jobStatus === 'error') {
//       const errorTask = statusRes.data.data.tasks.find(t => t.status === 'error');
//       throw new Error(`Conversion failed: ${errorTask?.message || 'Unknown error'}`);
//     }

//     // Step 4: Download the resulting DOCX as buffer
//     console.log('Downloading converted DOCX...');
//     const exportTask = statusRes.data.data.tasks.find(t => t.name === 'export_docx');
//     const fileUrl = exportTask.result.files[0].url;

//     const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
//     const wordBuffer = Buffer.from(fileResponse.data);
    
//     // Convert buffer to base64
//     const wordBase64 = wordBuffer.toString('base64');
//     console.log(`Word document created (${wordBuffer.length} bytes)`);
//         return wordBase64;
//   } catch (error) {
//     console.error('Error converting PDF to Word:', error.message);
//     throw error;
//   }
// };



const { spawn } = require('child_process');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

async function convertPdfToWord(base64Pdf) {
  return new Promise((resolve, reject) => {
    const pdfTmp = tmp.fileSync({ postfix: '.pdf' });
    const docxTmp = tmp.fileSync({ postfix: '.docx' });

    try {
      fs.writeFileSync(pdfTmp.name, Buffer.from(base64Pdf, 'base64'));

      const scriptPath = path.join(__dirname, '..', 'utils', 'PDF Conversion Utils', 'convert_pdf.py');
      const python = spawn('python', [scriptPath, pdfTmp.name, docxTmp.name]);

      let stderr = '';

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const docxBuffer = fs.readFileSync(docxTmp.name);
            resolve({
              base64: docxBuffer.toString('base64'),
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
          } catch (err) {
            reject(new Error(`Failed to read DOCX file: ${err.message}`));
          } finally {
            pdfTmp.removeCallback();
            docxTmp.removeCallback();
          }
        } else {
          pdfTmp.removeCallback();
          docxTmp.removeCallback();
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });
    } catch (err) {
      pdfTmp.removeCallback();
      docxTmp.removeCallback();
      reject(new Error(`Error during conversion: ${err.message}`));
    }
  });
}


/**
 * Get record attachments and convert PDFs to Word
 * @param {string} recordSysId - The record system ID
 * @returns {Promise<object>} - Object containing original and converted attachments
 */
const getRecordAttachmentsAndConvert = async (recordSysId) => {
  try {
    // Step 1: Fetch the list of attachments
    const response = await callServiceNowAPI(ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS, {
      params: { sysparm_query: `table_sys_id=${recordSysId}` }
    });

    if (!response.success) {
      return { success: false, error: response.error, status: response.status };
    }

    const attachments = response.data?.result || [];

    if (attachments.length === 0) {
      return { success: false, error: "No attachments found for this record.", status: 404 };
    }

    // Step 2: Download each attachment and convert to Base64
    const attachmentsWithBase64 = [];

    for (let att of attachments) {
      try {
        // Use the service function to download and convert
        const base64Data = await downloadAttachmentAsBase64(att.download_link);

        // Store the result
        attachmentsWithBase64.push({
          file_name: att.file_name,
          content_type: att.content_type,
          base64_data: base64Data,
          sys_id: att.sys_id,
        });
      } catch (downloadError) {
        console.error(`Error downloading file: ${att.file_name}`, downloadError);
        continue; // Skip this attachment if download fails
      }
    }

    if (attachmentsWithBase64.length === 0) {
      return { success: false, error: "Failed to download any attachments.", status: 500 };
    }

    // Step 3: Convert PDF to Word for each attachment
    const convertedAttachments = [];
    
    for (let att of attachmentsWithBase64) {
      // Only convert PDFs
      if (att.content_type === 'application/pdf') {
        try {
          // Convert PDF to Word
          const wordBase64 = await convertPdfToWord(att.base64_data);
          
          // Create a new filename with .docx extension
          // const wordFileName = att.file_name.replace(/\.pdf$/i, '.docx');
          const wordFileName = att.file_name.replace(/\.pdf$/i, '.docx');
          convertedAttachments.push({
            original_file_name: att.file_name,
            word_file_name: wordFileName,
            content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            base64_data: wordBase64,
            original_sys_id: att.sys_id
          });
        } catch (conversionError) {
          console.error(`Error converting file: ${att.file_name}`, conversionError);
          continue; // Skip this attachment if conversion fails
        }
      }
    }

    // Step 4: Return both original and converted attachments
    return { 
      success: true, 
      data: {
        originalAttachments: attachmentsWithBase64,
        convertedAttachments: convertedAttachments.length > 0 ? convertedAttachments : null
      }
    };
  } catch (error) {
    console.error("Error in getRecordAttachmentsAndConvert:", error.message);
    return { 
      success: false, 
      error: error.message || "Failed to process attachments", 
      status: 500 
    };
  }
};






/**
 * Function to upload a document with metadata to ServiceNow
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const uploadDocument = async (req, res) => {
  try {
    // If the request body is a string, parse it first
    const parsedBody = JSON.parse(req.body); // Parse the string into an object
    const { document, meterFolder } = parsedBody; // Destructure the parsed object

    console.log("Received body", parsedBody);

    // Check if document and meterFolder are provided
    if (
      !document ||
      !document.FileName ||
      !document.DocumentBase64Data ||
      !meterFolder
    ) {
      return res
        .status(400)
        .json({ error: "Document and meterFolder are required" });
    }

    // Construct the body data for the ServiceNow request
    const requestBody = {
      document: {
        FileName: document.FileName,
        DocumentBase64Data: document.DocumentBase64Data.base64,
      },
      meterFolder: meterFolder,
    };

    // Call ServiceNow API to upload the document
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.UPLOAD_DOCUMENT, // Assuming this is the correct endpoint for uploading documents
      requestBody, // Send the constructed body data
      "post", // Use POST method to send body data
      false // Don't force query parameters, as we're sending a body
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    // Return the response from ServiceNow
    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /UploadDocument:", error.message);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

/**
 * Handles document upload process for Navision operations
 * @param {string} userEmail - User email
 * @param {string} recordSysId - Record system ID
 * @param {object} convertedAttachments - Converted attachments data
 * @returns {object} - Upload result data and job disposition code
 */
const { getDataFromServiceNow } = require("../services/serviceNowService");

const handleDocumentUpload = async (userEmail, recordSysId, convertedAttachments) => {
  let uploadResultData = null;
  let jobDispositionCode = "";
  let filename = "";
  
  try {
    // Only proceed if we have converted attachments
    if (convertedAttachments) {
      filename = convertedAttachments.word_file_name;
      
      // Get job disposition code from ServiceNow
      const serviceNowRes = await getDataFromServiceNow(
        ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
        {
          user_email: userEmail,
          record_sys_id: recordSysId,
        }
      );
  
      if (serviceNowRes.error) {
        return { 
          error: serviceNowRes.error, 
          status: serviceNowRes.status || 500 
        };
      } else {
        jobDispositionCode =
          serviceNowRes.result.job_assignments[0].u_work_code.value;
      }
  
      console.log("Job Disposition Code " + jobDispositionCode);
      console.log("Filename " + filename);
      
      // Create upload document request body
      const uploadDocumentRequestBody = {
        document: {
          FileName: filename,
          DocumentBase64Data: convertedAttachments.base64_data,
        },
        meterFolder: jobDispositionCode,
      };
      
      // console.log(
      //   "uploadDocumentRequestBody " + JSON.stringify(uploadDocumentRequestBody)
      // );
  
      // Upload the document
      await uploadDocument(
        { body: JSON.stringify(uploadDocumentRequestBody) }, // mock req
        {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            uploadResultData = data;
            console.log("Upload Response:", JSON.stringify(data, null, 2));
          },
        }
      );
    }
    
    return {
      success: true,
      uploadResultData,
      jobDispositionCode
    };
  } catch (error) {
    console.error("Error in handleDocumentUpload:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get the upload replace position based on the action type
 * @param {string} actionType - The type of action (deactivate, activate, replace, reactivate, createWorksheet)
 * @returns {number} - The position to replace in the paramArgs array
 */
const getUploadReplacePosition = (actionType) => {
  switch (actionType.toLowerCase()) {
    case 'deactivate':
      return 10;
    case 'activate':
      return 13;
    case 'replace':
      return 10;
    case 'reactivate':
      return 9;
    case 'createworksheet':
      return 10;
    default:
      console.warn(`Unknown action type: ${actionType}, defaulting to position 10`);
      return 10;
  }
};

/**
 * Updates paramArgs with upload data if available
 * @param {Array} paramArgs - Parameter arguments array
 * @param {object} uploadResultData - Upload result data
 * @param {string} actionType - The type of action (deactivate, activate, replace, reactivate, createWorksheet)
 * @returns {Array} - Updated paramArgs array
 */
const updateParamArgsWithUploadData = (paramArgs, uploadResultData, actionType) => {
  const uploadData = uploadResultData?.result?.data;
  
  if (uploadData !== undefined) {
    const uploadReplacePosition = getUploadReplacePosition(actionType);
    if (paramArgs.length > uploadReplacePosition) {
      paramArgs[uploadReplacePosition] = uploadData;
      console.log(`Upload data added at position ${uploadReplacePosition} for action type ${actionType}`);
    } else {
      console.warn(
        `Warning: paramArgs array is shorter than expected (${paramArgs.length} <= ${uploadReplacePosition}). Upload data not added for ${actionType}.`
      );
    }
  } else {
    console.warn("Warning: No upload data found in uploadResponse.result.data");
  }
  
  return paramArgs;
};

module.exports = {
  fetchDataFromNavisionThrowServiceNow,
  callServiceNowAPI,
  downloadAttachmentAsBase64,
  convertPdfToWord,
  getRecordAttachmentsAndConvert,
  handleDocumentUpload,
  updateParamArgsWithUploadData,
  uploadDocument
};