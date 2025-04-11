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

    const response = await axios.get(url, config);
    
    return { 
      success: true, 
      data: response.data, 
      status: response.status 
    };
  } catch (error) {
    console.error(`Error calling ServiceNow API ${path}:`, error.message);
    
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

/**
 * Convert PDF Base64 to Word Base64 using officegen
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @returns {Promise<string>} - Base64 encoded Word document
 */
const convertPdfToWord = async (pdfBase64) => {
  try {
    // Import required libraries
    const officegen = require('officegen');
    const pdf = require('pdf-parse');
    
    // Create buffer from base64
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Parse PDF to extract text
    const pdfData = await pdf(pdfBuffer);
    
    // Create a Word document
    const docx = officegen('docx');
    
    // Set document properties
    docx.setDocSubject('Converted from PDF');
    docx.setDocKeywords('PDF, Word, Conversion');
    docx.setDescription('Document converted from PDF to Word');
    
    // Split text into paragraphs
    const paragraphs = pdfData.text
      .split('\n')
      .filter(line => line.trim() !== '');
    
    // Add paragraphs to the document
    for (const text of paragraphs) {
      const p = docx.createP();
      p.addText(text);
    }
    
    // Create a buffer to store the Word document
    const chunks = [];
    
    // Generate the document and collect chunks
    return new Promise((resolve, reject) => {
      // Create a writable stream that collects chunks
      const outputStream = new require('stream').Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      });
      
      // Handle document generation events
      docx.on('finalize', function() {
        console.log('Word document finalized');
      });
      
      docx.on('error', function(err) {
        console.error('Error creating Word document:', err);
        reject(err);
      });
      
      // Pipe the document to our stream
      docx.generate(outputStream);
      
      // When the stream ends, combine chunks and convert to base64
      outputStream.on('finish', function() {
        const wordBuffer = Buffer.concat(chunks);
        const wordBase64 = wordBuffer.toString('base64');
        console.log(`Word document created (${wordBuffer.length} bytes)`);
        resolve(wordBase64);
      });
      
      outputStream.on('error', function(err) {
        console.error('Error in output stream:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error converting PDF to Word:', error.message);
    throw error;
  }
};




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
          const wordFileName = att.file_name.replace(/\.pdf$/i, '.doc');
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

module.exports = {
  fetchDataFromNavisionThrowServiceNow,
  callServiceNowAPI,
  downloadAttachmentAsBase64,
  convertPdfToWord,
  getRecordAttachmentsAndConvert
};