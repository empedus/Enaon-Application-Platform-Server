const axios = require("axios")
const { getDataFromServiceNow } = require("../services/serviceNowService")
const { loadPdfWithFont, fillPdfForm, attachPdfToServiceNow, processSignatures } = require("../services/pdfService")
const ENDPOINTS = require("../utils/endpoints")
const { PDFDocument } = require("pdf-lib")

// Get Attached PDF
const getattachedpdf = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query; // Keep query params

    if (!user_email || !record_sys_id) {
      return res.status(400).json({ error: "Missing required query parameters: user_email or record_sys_id" });
    }

    const getAttachedPdfResponse = await axios.get(
      `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
      {
        auth: {
          username: process.env.SERVICENOW_USER,
          password: process.env.SERVICENOW_PASS,
        },
        headers: { "Content-Type": "application/json" },
        params: { user_email, record_sys_id },
      }
    );

    console.log("Get attached PDF response:", getAttachedPdfResponse.data);

    if (!getAttachedPdfResponse.data?.result?.base64_data) {
      return res.status(404).json({ error: "Failed to fetch attached PDF data." });
    }

    res.status(200).json({
      file_name: getAttachedPdfResponse.data.result.file_name,
      content_type: getAttachedPdfResponse.data.result.content_type,
      base64_data: getAttachedPdfResponse.data.result.base64_data,
    });

  } catch (error) {
    console.error("Error fetching attached PDF:", error);

    if (error.response) {
      // Server responded with a status code outside the 2xx range
      return res.status(error.response.status).json({
        error: error.response.data || "ServiceNow API error",
      });
    } else if (error.request) {
      // Request was made but no response was received
      return res.status(503).json({ error: "No response received from ServiceNow API" });
    } else {
      // Something else went wrong
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Generate PDF and Attach it in the Record
const generatePdf = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query // Keep query params
    console.log("Request Body:", req.body)

    if (!user_email || !record_sys_id) {
      return res.status(400).json({
        error: "Missing required parameters: user_email, record_sys_id",
      })
    }

    console.log("Fetching PDF from ServiceNow...")

    // Fetch base64 PDF from ServiceNow
    const pdfResponse = await axios.get(`${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_PDF_TEMPLATE}`, {
      params: {
        user_email, // Add user_email as a query parameter
        record_sys_id, // Add record_sys_id as a query parameter
      },
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
    })

    console.log("PDF Response:", pdfResponse.data)

    if (!pdfResponse.data.result || !pdfResponse.data.result.base64_data) {
      return res.status(404).json({ error: "PDF not found or invalid response from ServiceNow" })
    }

    const base64Pdf = pdfResponse.data.result.base64_data
    const pdfBuffer = Buffer.from(base64Pdf, "base64")

    console.log("Fetching job assignment details...")
    const jobDetails = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, {
      user_email,
      record_sys_id,
    })

    if (jobDetails.error) {
      return res.status(jobDetails.status || 500).json({ error: jobDetails.error })
    }

    console.log("Job assignment details retrieved:", jobDetails)

    // Load the PDF and prepare it with fonts
    const { pdfDoc, customFont } = await loadPdfWithFont(pdfBuffer)

    // Fill the PDF form with job details
    const filledPdfDoc = await fillPdfForm(pdfDoc, customFont, jobDetails)

    // Save the modified PDF as binary
    const modifiedPdfBytes = await filledPdfDoc.save()
    const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes)

    // Attach the PDF to ServiceNow
    await attachPdfToServiceNow(modifiedPdfBuffer, record_sys_id, "generated_document.pdf")

    // Now, call GET_ATTACHED_PDF to fetch the base64 content of the uploaded PDF
    console.log("Fetching attached PDF...")
    const getAttachedPdfResponse = await axios.get(`${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`, {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
      params: {
        user_email: user_email,
        record_sys_id: record_sys_id,
      },
    })

    console.log("Get attached PDF response:", getAttachedPdfResponse.data)

    if (!getAttachedPdfResponse.data.result || !getAttachedPdfResponse.data.result.base64_data) {
      return res.status(404).json({ error: "Failed to fetch attached PDF data." })
    }

    const updateJobDispositionResponse = await axios.put(
      `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
      {
        u_state: "PDF Complete", // Set the status to "Form Complete"
        // Add any other required fields to the request body here
      },
      {
        auth: {
          username: process.env.SERVICENOW_USER,
          password: process.env.SERVICENOW_PASS,
        },
        headers: { "Content-Type": "application/json" },
        params: { user_email, record_sys_id },
      },
    )

    console.log("Job disposition updated:", updateJobDispositionResponse.data)

    // Return the base64 data of the attached PDF as response in your custom format
    res.status(200).json({
      file_name: getAttachedPdfResponse.data.result.file_name,
      content_type: getAttachedPdfResponse.data.result.content_type,
      base64_data: getAttachedPdfResponse.data.result.base64_data,
    })
  } catch (error) {
    console.error("Error processing PDF:", error.response ? error.response.data : error.message)
    res.status(500).json({ error: "Failed to process PDF" })
  }
}

// 8. Generate PDF with signs and Attach it in the Record
const signPdf = async (req, res) => {
  try {
    const signatureTechnician = req.body.signature_technician // Get from form-data
    const signatureCustomer = req.body.signature_customer // Get from form-data
    const { user_email, record_sys_id } = req.query // Keep query params
    console.log("Request Body:", req.body)
    console.log("Fetching PDF from ServiceNow...")

    if (!user_email || !record_sys_id) {
      return res.status(400).json({
        error: "Missing required parameters: user_email, record_sys_id",
      })
    }

    console.log("Fetching attached PDF...")
    const getAttachedPdfResponse = await axios.get(`${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`, {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
      params: {
        user_email: user_email,
        record_sys_id: record_sys_id,
      },
    })

    console.log("Get attached PDF response:", getAttachedPdfResponse.data)
    const base64Pdf = getAttachedPdfResponse.data.result.base64_data
    const pdfBuffer = Buffer.from(base64Pdf, "base64")
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    console.log("PDF loaded successfully")

    if (signatureCustomer && signatureTechnician) {
      try {
        // Process signatures and add them to the PDF
        const signedPdfDoc = await processSignatures(pdfDoc, signatureTechnician, signatureCustomer)

        // After processing both signatures, save the PDF
        const pdfBytes = await signedPdfDoc.save()
        console.log("PDF successfully updated with both signatures.")

        // Save the modified PDF as binary
        const modifiedPdfBytes = await signedPdfDoc.save()
        const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes)

        // Attach the signed PDF to ServiceNow
        await attachPdfToServiceNow(modifiedPdfBuffer, record_sys_id, "generated_document_signed.pdf")

        console.log("Fetching attached PDF...")
        const getAttachedPdfResponse = await axios.get(`${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`, {
          auth: {
            username: process.env.SERVICENOW_USER,
            password: process.env.SERVICENOW_PASS,
          },
          headers: { "Content-Type": "application/json" },
          params: {
            user_email: user_email,
            record_sys_id: record_sys_id,
          },
        })

        console.log("Get attached PDF response:", getAttachedPdfResponse.data)

        if (!getAttachedPdfResponse.data.result || !getAttachedPdfResponse.data.result.base64_data) {
          return res.status(404).json({ error: "Failed to fetch attached PDF data." })
        }

        const updateJobDispositionResponse = await axios.put(
          `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
          {
            u_state: "Form Signed", // Set the status to "Form Signed"
            // Add any other required fields to the request body here
          },
          {
            auth: {
              username: process.env.SERVICENOW_USER,
              password: process.env.SERVICENOW_PASS,
            },
            headers: { "Content-Type": "application/json" },
            params: { user_email, record_sys_id },
          },
        )

        console.log("Job disposition updated:", updateJobDispositionResponse.data)

        // Return the base64 data of the attached PDF as response in your custom format
        res.status(200).json({
          file_name: getAttachedPdfResponse.data.result.file_name,
          content_type: getAttachedPdfResponse.data.result.content_type,
          base64_data: getAttachedPdfResponse.data.result.base64_data,
        })
      } catch (error) {
        console.error("Error processing signatures:", error)
        throw error
      }
    }
  } catch (error) {
    console.error("Error processing PDF:", error.message)
    res.status(500).json({ error: "Failed to process PDF" })
  }
}

module.exports = {
  generatePdf,
  signPdf,
  getattachedpdf,
}

