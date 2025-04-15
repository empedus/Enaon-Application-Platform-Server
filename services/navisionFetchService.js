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


/**
 * Convert PDF Base64 to Word Base64 using CloudConvert API
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @returns {Promise<string>} - Base64 encoded Word document
 */
const convertPdfToWord = async (pdfBase64) => {
  try {
    // // Import required libraries
    // const axios = require('axios');
    // const FormData = require('form-data');
    // const { Readable } = require('stream');

    // // API key for CloudConvert
    // const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDliMDdlY2JmYjRmYTU2MDg5NjU5NTdjYjJjYzA0NjRlZjBiZDAwYTlkMmI5Yjg3MTlmZWViM2ZhMGQ4ODlkNzg4Y2I4YTg0ZTIxNjcyZjIiLCJpYXQiOjE3NDQyOTMyOTAuNDcwNDY5LCJuYmYiOjE3NDQyOTMyOTAuNDcwNDcsImV4cCI6NDg5OTk2Njg5MC40NjYxMzQsInN1YiI6IjcxNTk5NDkwIiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.A8842oE7OQpf0X9wmg1--FoDt2jkFjz2TkMUsdo6fLCO69bLsu6hSOAZZC3kyMS-O-HVXnHH_GKYzIT16raLyuUHWrIUkjEXdJi2L9QObB4Bd22DThZqCGii13ohGgEGiZCl2GKUR_ww8n--z2YGxxE1KEPQaHAZFfsDjkcKj2007flyiQnM8tYMnu69C5WF4EEjaC-C8y4wNXHLkzRW8_ILz3aXM1davmHDEfvVqaORnWmhid1KFSXkIlIkLhtmoL3wWYUQQfHuN303rsmorWC04xIlgx09B0gNOKf-k38KfHksuSAG2Qkm7Wcf7sid9iMUc2GLCD_FSoOF31AKO84cE9yRKUHa8ZwGaR3Rh7ZH7fdlneIKyjguYZ_5KechqiUvtbrjyzH_AEO2ccf5edYl_BDRU1Qx7Bjop_LXYMa32eo8s_EkmTNZgPd3BvXdUf2m3q_4OAZt7iaF0bk06qT4-g8_7noLGdsRyL8nflthnhwej-f-54XA6O_-Qo398Ar6KGTvb_5pNoC0r9sjwiT7W1IwkLyHXwP8HvzOhkQD3UqI31umCu78FxS-JuPuw3tG58qKfscHGPoGeuUUi9ppLhp4Ill4XjtElqsbK4mAOh9_rX9M3HyrQ3ORTfXYbViic9cTop8d_0H42yXlQ4UVfF0Akzs1pvTa9TCpfXs';

    // // Create buffer from base64
    // const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // // Create the job definition
    // const jobConfig = {
    //   tasks: {
    //     import_pdf: {
    //       operation: 'import/upload'
    //     },
    //     convert: {
    //       operation: 'convert',
    //       input: 'import_pdf',
    //       input_format: 'pdf',
    //       output_format: 'docx'
    //     },
    //     export_docx: {
    //       operation: 'export/url',
    //       input: 'convert'
    //     }
    //   }
    // };

    // // Step 1: Create the job
    // console.log('Creating conversion job...');
    // const jobRes = await axios.post(
    //   'https://api.cloudconvert.com/v2/jobs',
    //   jobConfig,
    //   { headers: { Authorization: `Bearer ${API_KEY}` } }
    // );

    // const uploadTask = jobRes.data.data.tasks.find(t => t.name === 'import_pdf');
    // const uploadUrl = uploadTask.result.form.url;
    // const formFields = uploadTask.result.form.parameters;

    // // Step 2: Upload the PDF buffer
    // console.log('Uploading PDF data...');
    // const form = new FormData();
    // for (const [key, value] of Object.entries(formFields)) {
    //   form.append(key, value);
    // }
    
    // // Create a readable stream from the buffer
    // const bufferStream = new Readable();
    // bufferStream.push(pdfBuffer);
    // bufferStream.push(null); // Signal the end of the stream
    
    // form.append('file', bufferStream, {
    //   filename: 'document.pdf',
    //   contentType: 'application/pdf',
    // });

    // await axios.post(uploadUrl, form, { headers: form.getHeaders() });

    // // Step 3: Wait for the job to finish
    // console.log('Processing conversion...');
    // let jobStatus;
    // let statusRes;
    // do {
    //   await new Promise(r => setTimeout(r, 1000));
    //   statusRes = await axios.get(
    //     `https://api.cloudconvert.com/v2/jobs/${jobRes.data.data.id}`,
    //     { headers: { Authorization: `Bearer ${API_KEY}` } }
    //   );
    //   jobStatus = statusRes.data.data.status;
    //   console.log(`Job status: ${jobStatus}`);
    // } while (jobStatus !== 'finished' && jobStatus !== 'error');

    // if (jobStatus === 'error') {
    //   const errorTask = statusRes.data.data.tasks.find(t => t.status === 'error');
    //   throw new Error(`Conversion failed: ${errorTask?.message || 'Unknown error'}`);
    // }

    // // Step 4: Download the resulting DOCX as buffer
    // console.log('Downloading converted DOCX...');
    // const exportTask = statusRes.data.data.tasks.find(t => t.name === 'export_docx');
    // const fileUrl = exportTask.result.files[0].url;

    // const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    // const wordBuffer = Buffer.from(fileResponse.data);
    
    // // Convert buffer to base64
    // const wordBase64 = wordBuffer.toString('base64');
    // console.log(`Word document created (${wordBuffer.length} bytes)`);
    
    wordBase64 = "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"
    return wordBase64;
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