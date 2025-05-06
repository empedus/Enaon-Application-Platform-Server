// const axios = require("axios");
// const { getDataFromServiceNow } = require("../services/serviceNowService");
// const {
//   loadPdfWithFont,
//   fillPdfForm,
//   attachPdfToServiceNow,
//   processSignatures,
// } = require("../services/pdfService");
// const ENDPOINTS = require("../utils/endpoints");
// const { PDFDocument } = require("pdf-lib");

// // // Get Attached PDF
// const getattachedpdf = async (req, res) => {
//   try {
//     const { user_email, record_sys_id } = req.query; // Keep query params

//     if (!user_email || !record_sys_id) {
//       return res.status(400).json({ error: "Missing required query parameters: user_email or record_sys_id" });
//     }

//     const getAttachedPdfResponse = await axios.get(
//       `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//       {
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         headers: { "Content-Type": "application/json" },
//         params: { user_email, record_sys_id },
//       }
//     );

//     console.log("Get attached PDF response:", getAttachedPdfResponse.data);

//     if (!getAttachedPdfResponse.data?.result?.base64_data) {
//       return res.status(404).json({ error: "Failed to fetch attached PDF data." });
//     }

//     res.status(200).json({
//       file_name: getAttachedPdfResponse.data.result.file_name,
//       content_type: getAttachedPdfResponse.data.result.content_type,
//       base64_data: getAttachedPdfResponse.data.result.base64_data,
//     });

//   } catch (error) {
//     console.error("Error fetching attached PDF:", error);

//     if (error.response) {
//       // Server responded with a status code outside the 2xx range
//       return res.status(error.response.status).json({
//         error: error.response.data || "ServiceNow API error",
//       });
//     } else if (error.request) {
//       // Request was made but no response was received
//       return res.status(503).json({ error: "No response received from ServiceNow API" });
//     } else {
//       // Something else went wrong
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// };

// const getRecordAttachments = async (req, res) => {
//   try {
//     const { record_sys_id } = req.query; // Extract query parameter

//     // Step 1: Fetch the list of attachments
//     const getAttachmentsResponse = await axios.get(
//       `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS}`,
//       {
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         headers: { "Content-Type": "application/json" },
//         params: { sysparm_query: `table_sys_id=${record_sys_id}` },
//       }
//     );

//     console.log("Get attachments response:", getAttachmentsResponse.data);

//     const attachments = getAttachmentsResponse.data?.result || [];

//     if (attachments.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No attachments found for this record." });
//     }

//     // Step 2: Download each attachment and convert to Base64
//     const attachmentsWithBase64 = [];

//     // Iterate through all attachments
//     for (let att of attachments) {
//       try {
//         // Download each attachment as raw binary data
//         const fileResponse = await axios.get(att.download_link, {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           responseType: "arraybuffer", // Get raw binary data
//         });

//         // Convert file to Base64
//         const base64Data = Buffer.from(fileResponse.data).toString("base64");

//         // Store the result
//         attachmentsWithBase64.push({
//           file_name: att.file_name,
//           content_type: att.content_type,
//           base64_data: base64Data,
//           sys_id: att.sys_id,
//         });
//       } catch (downloadError) {
//         console.error(
//           `Error downloading file: ${att.file_name}`,
//           downloadError
//         );
//         continue; // Skip this attachment if download fails
//       }
//     }

//     if (attachmentsWithBase64.length === 0) {
//       return res
//         .status(500)
//         .json({ error: "Failed to download any attachments." });
//     }

//     // Step 3: Return the attachments as Base64
//     res.status(200).json({ attachments: attachmentsWithBase64 });
//   } catch (error) {
//     console.error("Error fetching attachments:", error);

//     if (error.response) {
//       return res.status(error.response.status).json({
//         error: error.response.data || "ServiceNow API error",
//       });
//     } else if (error.request) {
//       return res
//         .status(503)
//         .json({ error: "No response received from ServiceNow API" });
//     } else {
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// };

// // Generate PDF and Attach it in the Record
// const generatePdf = async (req, res) => {
//   try {
//     const { user_email, record_sys_id } = req.query; // Keep query params
//     console.log("Request Body:", req.body);

//     if (!user_email || !record_sys_id) {
//       return res.status(400).json({
//         error: "Missing required parameters: user_email, record_sys_id",
//       });
//     }

//     console.log("Fetching PDF from ServiceNow...");

//     // Fetch base64 PDF from ServiceNow
//     let pdfResponse;
//     try {
//       pdfResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_PDF_TEMPLATE}`,
//         {
//           params: {
//             record_sys_id,
//           },
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//         }
//       );
//     } catch (pdfError) {
//       console.error("Error fetching PDF template:", pdfError.message);
//       return res.status(500).json({ error: "Failed to fetch PDF template from ServiceNow" });
//     }

//     console.log("PDF Response:", pdfResponse.data);

//     if (!pdfResponse.data.result || !pdfResponse.data.result.pdf_template_sys_id) {
//       return res
//         .status(404)
//         .json({ error: "PDF not found or invalid response from ServiceNow" });
//     }

//     const pdfTemplateSysId = pdfResponse.data.result.pdf_template_sys_id;
//     console.log('Received template sys_id ' + pdfTemplateSysId);

//     let getAttachmentsResponse;
//     try {
//       getAttachmentsResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS}`,
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: { sysparm_query: `sys_id=${pdfTemplateSysId}` },
//         }
//       );
//     } catch (attachmentsError) {
//       console.error("Error retrieving attachments:", attachmentsError.message);
//       return res.status(500).json({ error: "Failed to retrieve attachments from ServiceNow" });
//     }

//     const attachment = getAttachmentsResponse.data?.result[0] || [];

//     if (attachment.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No attachments found for this record." });
//     }

//     let fileResponse;
//     let base64Data;
//     try {
//       // Download each attachment as raw binary data
//       fileResponse = await axios.get(attachment.download_link, {
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         responseType: "arraybuffer", // Get raw binary data
//       });

//       // Convert file to Base64
//       base64Data = Buffer.from(fileResponse.data).toString("base64");
//     } catch (downloadError) {
//       console.error("Error downloading file:", downloadError.message);
//       return res.status(500).json({ error: "Failed to download attachment file" });
//     }

//     const pdfBuffer = Buffer.from(base64Data, "base64");

//     console.log("Fetching job assignment details...");
//     let jobDetails;
//     try {
//       jobDetails = await getDataFromServiceNow(
//         ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
//         {
//           user_email,
//           record_sys_id,
//         }
//       );

//       if (jobDetails.error) {
//         return res
//           .status(jobDetails.status || 500)
//           .json({ error: jobDetails.error });
//       }
//     } catch (jobDetailsError) {
//       console.error("Error fetching job details:", jobDetailsError.message);
//       return res.status(500).json({ error: "Failed to fetch job assignment details" });
//     }

//     console.log("Job assignment details retrieved:", jobDetails);

//     let pdfDoc, customFont, filledPdfDoc, modifiedPdfBytes, modifiedPdfBuffer;
//     try {
//       // Load the PDF and prepare it with fonts
//       ({ pdfDoc, customFont } = await loadPdfWithFont(pdfBuffer));

//       // Fill the PDF form with job details
//       filledPdfDoc = await fillPdfForm(pdfDoc, customFont, jobDetails);

//       // Save the modified PDF as binary
//       modifiedPdfBytes = await filledPdfDoc.save();
//       modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);
//     } catch (pdfProcessingError) {
//       console.error("Error processing PDF:", pdfProcessingError.message);
//       return res.status(500).json({ error: "Failed to process PDF document" });
//     }

//     try {
//       // Attach the PDF to ServiceNow
//       await attachPdfToServiceNow(
//         modifiedPdfBuffer,
//         record_sys_id,
//         jobDetails.result?.job_assignments?.[0]?.u_hkasp?.value + ".pdf"
//       );
//     } catch (attachError) {
//       console.error("Error attaching PDF to ServiceNow:", attachError.message);
//       return res.status(500).json({ error: "Failed to attach PDF to ServiceNow" });
//     }

//     // Now, call GET_ATTACHED_PDF to fetch  content of the uploaded PDF
//     console.log("Fetching attached PDF...");
//     let getAttachedPdfResponse;
//     try {
//       getAttachedPdfResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: {
//             user_email: user_email,
//             record_sys_id: record_sys_id,
//           },
//         }
//       );

//     } catch (getAttachedPdfError) {
//       console.error("Error fetching attached PDF:", getAttachedPdfError.message);
//       return res.status(500).json({ error: "Failed to fetch attached PDF from ServiceNow" });
//     }

//     console.log("Get attached PDF response:", getAttachedPdfResponse.data);

//     const attachment_sys_id = getAttachedPdfResponse.data.result.attachment_sys_id;
//     const attachment_name = getAttachedPdfResponse.data.result.file_name;
//     let getAttachmentResponse;
//     try {
//       getAttachmentResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS}`,
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: { sys_id: attachment_sys_id },
//           // params: { sysparm_query: `table_sys_id=${attachment_sys_id}` }, // Previous
//         }
//       );
//     } catch (attachmentsError) {
//       console.error("Error retrieving attachments:", attachmentsError.message);
//       return res.status(500).json({ error: "Failed to retrieve attachments from ServiceNow" });
//     }
//     console.log('ATTACHMENT FETCHED '+getAttachmentResponse.data.result[0])
//     const attachment_fetched = getAttachmentResponse.data?.result[0] || [];

//     if (attachment.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No attachments found for this record." });
//     }

//     let file;
//     let base64;
//     try {
//       // Download each attachment as raw binary data
//       fileResponse = await axios.get(attachment_fetched.download_link, {
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         responseType: "arraybuffer", // Get raw binary data
//       });

//       // Convert file to Base64
//       base64 = Buffer.from(fileResponse.data).toString("base64");
//     } catch (downloadError) {
//       console.error("Error downloading file:", downloadError.message);
//       return res.status(500).json({ error: "Failed to download attachment file" });
//     }

//     // if (
//     //   !getAttachedPdfResponse.data.result ||
//     //   !getAttachedPdfResponse.data.result.attachment_sys_id
//     // ) {
//     //   return res
//     //     .status(404)
//     //     .json({ error: "Failed to fetch attached PDF data." });
//     // }

//     try {
//       const updateJobDispositionResponse = await axios.put(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
//         {
//           u_state: "PDF Complete", // Set the status to "Form Complete"
//           // Add any other required fields to the request body here
//         },
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: { user_email, record_sys_id },
//         }
//       );

//       console.log("Job disposition updated:", updateJobDispositionResponse.data);
//     } catch (updateError) {
//       console.error("Error updating job disposition:", updateError.message);
//       // We'll continue even if this fails, as the PDF is already generated and attached
//     }

//     // Return the base64 data of the attached PDF as response in your custom format
//     res.status(200).json({
//       file_name: attachment_name,
//       base64_data: base64

//     });
//   } catch (error) {
//     console.error(
//       "Error processing PDF:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// };

// // 8. Generate PDF with signs and Attach it in the Record
// const signPdf = async (req, res) => {
//   try {
//     const signatureTechnician = req.body.signature_technician; // Get from form-data
//     const signatureCustomer = req.body.signature_customer; // Get from form-data
//     const { user_email, record_sys_id } = req.query; // Keep query params
//     console.log("Request Body:", req.body);
//     console.log("Fetching PDF from ServiceNow...");

//     if (!user_email || !record_sys_id) {
//       return res.status(400).json({
//         error: "Missing required parameters: user_email, record_sys_id",
//       });
//     }

//     console.log("Fetching attached PDF...");
//     let getAttachedPdfResponse;
//     try {
//       getAttachedPdfResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: {
//             user_email: user_email,
//             record_sys_id: record_sys_id,
//           },
//         }
//       );

//     } catch (getAttachedPdfError) {
//       console.error("Error fetching attached PDF:", getAttachedPdfError.message);
//       return res.status(500).json({ error: "Failed to fetch attached PDF from ServiceNow" });
//     }

//     console.log("Get attached PDF response:", getAttachedPdfResponse.data);

//     const attachment_sys_id = getAttachedPdfResponse.data.result.attachment_sys_id;
//     const attachment_name = getAttachedPdfResponse.data.result.file_name;
//     let getAttachmentResponse;
//     try {
//       getAttachmentResponse = await axios.get(
//         `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS}`,
//         {
//           auth: {
//             username: process.env.SERVICENOW_USER,
//             password: process.env.SERVICENOW_PASS,
//           },
//           headers: { "Content-Type": "application/json" },
//           params: { sys_id: attachment_sys_id },
//           // params: { sysparm_query: `table_sys_id=${attachment_sys_id}` }, // Previous
//         }
//       );
//     } catch (attachmentsError) {
//       console.error("Error retrieving attachments:", attachmentsError.message);
//       return res.status(500).json({ error: "Failed to retrieve attachments from ServiceNow" });
//     }
//     console.log('ATTACHMENT FETCHED '+JSON.stringify(getAttachmentResponse.data.result[0]))
//     const attachment_fetched = getAttachmentResponse.data?.result[0] || [];

//     let base64;
//     try {
//       // Download each attachment as raw binary data
//       fileResponse = await axios.get(attachment_fetched.download_link, {
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         responseType: "arraybuffer", // Get raw binary data
//       });

//       // Convert file to Base64
//       base64 = Buffer.from(fileResponse.data).toString("base64");
//     } catch (downloadError) {
//       console.error("Error downloading file:", downloadError.message);
//       return res.status(500).json({ error: "Failed to download attachment file" });
//     }

//     // console.log("Get attached PDF response:", getAttachedPdfResponse.data);
//     // const base64Pdf = getAttachedPdfResponse.data.result.base64_data;
//     const pdfBuffer = Buffer.from(base64, "base64");
//     const pdfDoc = await PDFDocument.load(pdfBuffer);

//     console.log("PDF loaded successfully");

//     if (signatureCustomer && signatureTechnician) {
//       try {
//         // Process signatures and add them to the PDF
//         const signedPdfDoc = await processSignatures(
//           pdfDoc,
//           signatureTechnician,
//           signatureCustomer
//         );

//         // After processing both signatures, save the PDF
//         const pdfBytes = await signedPdfDoc.save();
//         console.log("PDF successfully updated with both signatures.");

//         // Save the modified PDF as binary
//         const modifiedPdfBytes = await signedPdfDoc.save();
//         const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);

//         // Attach the signed PDF to ServiceNow
//         await attachPdfToServiceNow(
//           modifiedPdfBuffer,
//           record_sys_id,
//           "generated_document_signed.pdf"
//         );

//         console.log("Fetching attached PDF...");
//         const getAttachedPdfResponse = await axios.get(
//           `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//           {
//             auth: {
//               username: process.env.SERVICENOW_USER,
//               password: process.env.SERVICENOW_PASS,
//             },
//             headers: { "Content-Type": "application/json" },
//             params: {
//               user_email: user_email,
//               record_sys_id: record_sys_id,
//             },
//           }
//         );

//         console.log("Get attached PDF response:", getAttachedPdfResponse.data);

//         if (
//           !getAttachedPdfResponse.data.result ||
//           !getAttachedPdfResponse.data.result.base64_data
//         ) {
//           return res
//             .status(404)
//             .json({ error: "Failed to fetch attached PDF data." });
//         }

//         const updateJobDispositionResponse = await axios.put(
//           `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
//           {
//             u_state: "Form Signed", // Set the status to "Form Signed"
//             // Add any other required fields to the request body here
//           },
//           {
//             auth: {
//               username: process.env.SERVICENOW_USER,
//               password: process.env.SERVICENOW_PASS,
//             },
//             headers: { "Content-Type": "application/json" },
//             params: { user_email, record_sys_id },
//           }
//         );

//         console.log(
//           "Job disposition updated:",
//           updateJobDispositionResponse.data
//         );

//         // // Return the base64 data of the attached PDF as response in your custom format
//         // res.status(200).json({
//         //   file_name: attachment_name,
//         //   base64_data: base64

//         // });
//       } catch (error) {
//         console.error("Error processing signatures:", error);
//         throw error;
//       }
//     }
//   } catch (error) {
//     console.error("Error processing PDF:", error.message);
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// };

// module.exports = {
//   generatePdf,
//   signPdf,
//   getattachedpdf,
//   getRecordAttachments,
// };

const axios = require("axios");
const { getDataFromServiceNow } = require("../services/serviceNowService");
const {
  loadPdfWithFont,
  fillPdfForm,
  attachPdfToServiceNow,
  processSignatures,
  callServiceNowAPI,
  fetchPdfTemplate,
  fetchAttachmentById,
  downloadAttachmentAsBase64,
  fetchAttachedPdf,
  updateJobDisposition,
} = require("../services/pdfService");
const ENDPOINTS = require("../utils/endpoints");
const { PDFDocument } = require("pdf-lib");

// Get Attached PDF
const getattachedpdf = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;

    if (!user_email || !record_sys_id) {
      return res
        .status(400)
        .json({
          error:
            "Missing required query parameters: user_email or record_sys_id",
        });
    }

    // Use the new service function
    const pdfData = await fetchAttachedPdf(user_email, record_sys_id);

    res.status(200).json(pdfData);
  } catch (error) {
    console.error("Error fetching attached PDF:", error);

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

const getRecordAttachments = async (req, res) => {
  try {
    const { record_sys_id } = req.query;

    // Step 1: Fetch the list of attachments using the service function
    const response = await callServiceNowAPI(
      ENDPOINTS.RETRIEVE_RECORD_ATTACHMENTS,
      {
        params: { sysparm_query: `table_sys_id=${record_sys_id}` },
      }
    );

    if (!response.success) {
      return res.status(response.status || 500).json({ error: response.error });
    }

    const attachments = response.data?.result || [];

    if (attachments.length === 0) {
      return res
        .status(404)
        .json({ error: "No attachments found for this record." });
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
        console.error(
          `Error downloading file: ${att.file_name}`,
          downloadError
        );
        continue; // Skip this attachment if download fails
      }
    }

    if (attachmentsWithBase64.length === 0) {
      return res
        .status(500)
        .json({ error: "Failed to download any attachments." });
    }

    // Step 3: Return the attachments as Base64
    res.status(200).json({ attachments: attachmentsWithBase64 });
  } catch (error) {
    console.error("Error fetching attachments:", error);

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

// Generate PDF and Attach it in the Record
const generatePdf = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    console.log("Request Body:", req.body);

    if (!user_email || !record_sys_id) {
      return res.status(400).json({
        error: "Missing required parameters: user_email, record_sys_id",
      });
    }

    // Fetch PDF template using the service function
    let pdfTemplateData;
    try {
      pdfTemplateData = await fetchPdfTemplate(record_sys_id);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    const pdfTemplateSysId = pdfTemplateData.pdf_template_sys_id;
    console.log("Received template sys_id " + pdfTemplateSysId);

    // Fetch the attachment using the service function
    let attachment;
    try {
      attachment = await fetchAttachmentById(pdfTemplateSysId);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    // Download the attachment as base64
    let base64Data;
    try {
      base64Data = await downloadAttachmentAsBase64(attachment.download_link);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

    const pdfBuffer = Buffer.from(base64Data, "base64");

    console.log("Fetching job assignment details...");
    let jobDetails;
    try {
      jobDetails = await getDataFromServiceNow(
        ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
        {
          user_email,
          record_sys_id,
        }
      );

      if (jobDetails.error) {
        return res
          .status(jobDetails.status || 500)
          .json({ error: jobDetails.error });
      }
    } catch (jobDetailsError) {
      console.error("Error fetching job details:", jobDetailsError.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch job assignment details" });
    }

    console.log("Job assignment details retrieved:", jobDetails);

    let pdfDoc, customFont, filledPdfDoc, modifiedPdfBytes, modifiedPdfBuffer;
    try {
      // Load the PDF and prepare it with fonts
      ({ pdfDoc, customFont } = await loadPdfWithFont(pdfBuffer));

      // Fill the PDF form with job details
      filledPdfDoc = await fillPdfForm(pdfDoc, customFont, jobDetails);

      // Save the modified PDF as binary
      modifiedPdfBytes = await filledPdfDoc.save();
      modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);
    } catch (pdfProcessingError) {
      console.error("Error processing PDF:", pdfProcessingError.message);
      return res.status(500).json({ error: "Failed to process PDF document" });
    }

    const fileName =
      jobDetails.result?.job_assignments?.[0]?.u_ikasp?.value + ".pdf";
    console.log("The filename is(HKASP) " + fileName);
    try {
      // Attach the PDF to ServiceNow
      await attachPdfToServiceNow(modifiedPdfBuffer, record_sys_id, fileName);
    } catch (attachError) {
      console.error("Error attaching PDF to ServiceNow:", attachError.message);
      return res
        .status(500)
        .json({ error: "Failed to attach PDF to ServiceNow" });
    }

    // Fetch the attached PDF using the service function
    let pdfData;
    try {
      pdfData = await fetchAttachedPdf(user_email, record_sys_id);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    // Update job disposition
    await updateJobDisposition(user_email, record_sys_id, "PDF Complete");

    // Return the base64 data of the attached PDF
    res.status(200).json(pdfData);
  } catch (error) {
    console.error(
      "Error processing PDF:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to process PDF" });
  }
};

// Sign PDF and Attach it in the Record
const signPdf = async (req, res) => {
  try {
    const signatureTechnician = req.body.signature_technician;
    const signatureCustomer = req.body.signature_customer;
    const { user_email, record_sys_id } = req.query;
    console.log("Request Body:", req.body);

    if (!user_email || !record_sys_id) {
      return res.status(400).json({
        error: "Missing required parameters: user_email, record_sys_id",
      });
    }

    // Fetch the attached PDF using the service function
    let pdfData;
    try {
      pdfData = await fetchAttachedPdf(user_email, record_sys_id);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    const pdfBuffer = Buffer.from(pdfData.base64_data, "base64");
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    console.log("PDF loaded successfully");

    if (signatureCustomer && signatureTechnician) {
      try {
        // Process signatures and add them to the PDF
        const signedPdfDoc = await processSignatures(
          pdfDoc,
          signatureTechnician,
          signatureCustomer
        );

        // Save the modified PDF as binary
        const modifiedPdfBytes = await signedPdfDoc.save();
        const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);
        let jobDetails;
        try {
          jobDetails = await getDataFromServiceNow(
            ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
            {
              user_email,
              record_sys_id,
            }
          );

          if (jobDetails.error) {
            return res
              .status(jobDetails.status || 500)
              .json({ error: jobDetails.error });
          }
        } catch (jobDetailsError) {
          console.error("Error fetching job details:", jobDetailsError.message);
          return res
            .status(500)
            .json({ error: "Failed to fetch job assignment details" });
        }
        // Attach the signed PDF to ServiceNow
        await attachPdfToServiceNow(
          modifiedPdfBuffer,
          record_sys_id,
          jobDetails.result?.job_assignments?.[0]?.u_ikasp?.value + ".pdf"
        );

        // Update job disposition
        await updateJobDisposition(user_email, record_sys_id, "Form Signed");

        // Return success
        res.status(200).json({
          message: "PDF signed and uploaded successfully",
          file_name: jobDetails.result?.job_assignments?.[0]?.u_ikasp?.value + ".pdf",
        });
      } catch (error) {
        console.error("Error processing signatures:", error);
        throw error;
      }
    } else {
      return res.status(400).json({
        error: "Both technician and customer signatures are required",
      });
    }
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to process PDF" });
  }
};





module.exports = {
  generatePdf,
  signPdf,
  getattachedpdf,
  getRecordAttachments
};
