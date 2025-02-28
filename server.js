require("dotenv").config({ path: "./.env" });
const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
//const fontkit = require('fontkit'); // Import fontkit
//const { PDFDocument, StandardFonts} = require("pdf-lib");
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const { generateToken, verifyToken } = require("./jwtUtils");
const ENDPOINTS = require("./endpoints");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const servicenowBaseURL = 'https://enaondev.service-now.com';
const auth = {
  username: process.env.SERVICENOW_USER,
  password: process.env.SERVICENOW_PASS,
};


// Auth function for Meters App required
const authorizeMeterApp = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    const decoded = verifyToken(token);
    const { accessible_apps } = decoded;

    if (!accessible_apps || !accessible_apps.includes("Meters App")) {
      return res.status(403).json({ error: "Access denied. 'Meters App' is required in accessible apps." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Auth function for Meters App or Maintenance App required
const authorizeMeterAppOrMaintenanceApp = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    const decoded = verifyToken(token);
    const { accessible_apps } = decoded;

    // Check if the user has access to either "Meters App" or "Maintenance App"
    if (!accessible_apps || (!accessible_apps.includes("Meters App") && !accessible_apps.includes("Maintenance App"))) {
      return res.status(403).json({ error: "Access denied. 'Meters App' or 'Maintenance App' is required in accessible apps." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const getDataFromServiceNow = async (path, params) => {
  try {
    if (!servicenowBaseURL || !path) {
      console.error("Error: Missing base URL or path");
      return { error: "Server misconfiguration: Missing URL or path" };
    }

    const apiUrl = `${servicenowBaseURL}${path}`;
    console.log("Making request to:", apiUrl, "with params:", params);

    const response = await axios.get(apiUrl, {
      auth,
      headers: { "Content-Type": "application/json" },
      params,
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return { error: "No data found", status: 404 };
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error.message);
    return { error: error.response?.data || "Failed to fetch data from ServiceNow", status: error.response?.status || 500 };
  }
};

// 1. Authenticate user and generate JWT token
app.get("/api/user_auth", async (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.AUTH_PATH, { user_email });

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    const accessibleApps = serviceNowResponse.result.accessible_apps;
    if (!Array.isArray(accessibleApps)) {
      return res.status(500).json({ error: "Accessible apps should be an array" });
    }

    const jwtPayload = {
      user_email: serviceNowResponse.result.user_email[0],
      accessible_apps: accessibleApps,
    };

    const token = generateToken(jwtPayload);
    res.json({ result: { serviceNowData: serviceNowResponse.result, token } });
  } catch (error) {
    console.error("Error in /user_auth:", error.message);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// 2. Get specific job assignment
app.get("/api/meter_app/job_dispositions/get", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    if (!user_email || !record_sys_id) return res.status(400).json({ error: "Missing required parameters: user_email and/or record_sys_id" });

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /job_dispositions/get:", error.message);
    res.status(500).json({ error: "Failed to fetch specific job assignment" });
  }
});

// 3. Get all job assignments
app.get("/api/meter_app/job_dispositions/get/all", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.ALL_ASSIGNMENTS_PATH, { user_email });

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /job_dispositions/get/all:", error.message);
    res.status(500).json({ error: "Failed to fetch all job assignments" });
  }
});

// 4. Update job assignment
app.put("/api/meter_app/update_job_disposition", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    if (!user_email || !record_sys_id) return res.status(400).json({ error: "Missing required parameters: user_email and/or record_sys_id" });

    const apiUrl = `${servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`;
    console.log("Making request to:", apiUrl, "with query params:", { user_email, record_sys_id }, "and body:", req.body);

    const response = await axios.put(apiUrl, req.body, {
      auth,
      headers: { "Content-Type": "application/json" },
      params: { user_email, record_sys_id },
    });

    if (!response.data) {
      return res.status(404).json({ error: "No response data received from ServiceNow" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error in /update_job_disposition:", error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to update job assignment" });
  }
});

// 5. Get available work types
app.get("/api/meter_app/work_types", authorizeMeterApp, async (req, res) => {
  try {
    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.WORK_TYPES_PATH, {});

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /work_types:", error.message);
    res.status(500).json({ error: "Failed to fetch work types" });
  }
});



// 6. Get Available Vehicles
app.get("/api/vehicles", authorizeMeterAppOrMaintenanceApp, async (req, res) => {
  try {
    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.VEHICLES_PATH, {});

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /vehicles:", error.message);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});



// Function to find matching values in the assignment response
function findMatchingValue(fieldName, jobDetails) {
  for (const key in jobDetails.result.job_assignments[0]) {
    if (fieldName.toLowerCase().includes(key.toLowerCase())) {
      return jobDetails.result.job_assignments[0][key]?.displayValue || jobDetails.result.job_assignments[0][key]?.value || "";
    }
  }
  return null;  // Return null if no matching value is found
}

function sanitizeFileName(fileName) {
  // Remove invalid file system characters and trim spaces
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filesystem characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .trim();
}

// // Generate pdf and Attach it in the right record in ServiceNow
// app.get("/api/generate_pdf", async (req, res) => {
//   try {
//     const { user_email, record_sys_id } = req.query;
//     if (!user_email || !record_sys_id) {
//       return res.status(400).json({ error: "Missing required parameters: user_email, record_sys_id" });
//     }

//     console.log("Fetching PDF from ServiceNow...");

//     // Fetch base64 PDF from ServiceNow
//     const pdfResponse = await axios.get(`${servicenowBaseURL}${ENDPOINTS.GET_PDF_BASE64}`, {
//       auth,
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!pdfResponse.data.result || !pdfResponse.data.result.base64_data) {
//       return res.status(404).json({ error: "PDF not found or invalid response from ServiceNow" });
//     }

//     const base64Pdf = pdfResponse.data.result.base64_data;
//     const pdfBuffer = Buffer.from(base64Pdf, "base64");

//     // Fetch job assignment details
//     console.log("Fetching job assignment details...");
//     const jobDetails = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

//     if (jobDetails.error) {
//       return res.status(jobDetails.status || 500).json({ error: jobDetails.error });
//     }

//     console.log("Job assignment details retrieved:", jobDetails);

//     // Load the original PDF with pdf-lib
//     const pdfDoc = await PDFDocument.load(pdfBuffer);
    
//     // Register fontkit with PDFDocument
//     pdfDoc.registerFontkit(fontkit);
    
//     // Load and embed a Unicode font that supports Greek characters
//     // First, try to use Arial if available (which usually supports Greek)
//     let customFont;
//     try {
//       // Try to load Arial first (if available on the system)
//       const arialPath = path.join(__dirname, 'fonts', 'arial.ttf');
//       if (fs.existsSync(arialPath)) {
//         const fontBytes = fs.readFileSync(arialPath);
//         customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//       } else {
//         // Fallback to Noto Sans
//         const notoPath = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
//         if (fs.existsSync(notoPath)) {
//           const fontBytes = fs.readFileSync(notoPath);
//           customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//         } else {
//           throw new Error('No suitable font found. Please install Arial or Noto Sans.');
//         }
//       }
//     } catch (fontError) {
//       console.error('Error loading custom font:', fontError);
//       // If custom font fails, try to use a built-in font as last resort
//       customFont = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman);
//     }
    
//     const form = pdfDoc.getForm();
//     const fields = form.getFields();

//     // Keep track of any fields that couldn't be filled
//     const failedFields = [];

//     for (const field of fields) {
//       const fieldName = field.getName();
//       const matchingValue = findMatchingValue(fieldName, jobDetails);
    
//       if (matchingValue) {
//         try {
//           if (field.constructor.name === 'PDFTextField') {
//             console.log(`Attempting to fill field: ${fieldName} with value: ${matchingValue}`);
//             field.setText(matchingValue);
    
//             // Increase font size for the field (adjust the multiplier as needed)
//             const fontSize = 10.5;  // Set this to the font size you prefer
//             field.setFontSize(fontSize);  // Apply the larger font size
//             field.updateAppearances(customFont);
    
//           } else if (field.constructor.name === 'PDFCheckBox') {
//             if (matchingValue === 'checked') field.check();
//           } else if (field.constructor.name === 'PDFRadioButton') {
//             field.select(matchingValue);
//           } else if (field.constructor.name === 'PDFDropdown') {
//             field.select(matchingValue);
//           }
//         } catch (err) {
//           console.warn(`Failed to fill field ${fieldName}:`, err.message);
//           failedFields.push({ fieldName, error: err.message });
//         }
//       }
//     }
    

//     const workCode = jobDetails.result.job_assignments[0].u_work_code?.value || 
//                     jobDetails.result.job_assignments[0].u_work_code?.displayValue ||
//                     `default_${Date.now()}`; // Fallback if work code is not found

//     // Sanitize the work code for use in filename
//     const sanitizedWorkCode = sanitizeFileName(workCode);
//     // Save the filled PDF to a new file
//     const modifiedPdfBytes = await pdfDoc.save();
//     const fileName = `${sanitizedWorkCode}.pdf`;
//     const filePath = path.join(__dirname, fileName);

//     fs.writeFileSync(filePath, modifiedPdfBytes);
//     console.log("Filled PDF saved at:", filePath);

//     // Return response with information about any failed fields
//     const response = {
//       message: "PDF filled and saved successfully",
//       filePath,
//     };

//     if (failedFields.length > 0) {
//       response.warnings = {
//         message: "Some fields could not be filled properly",
//         failedFields
//       };
//     }

//     res.json(response);

//   } catch (error) {
//     console.error("Error processing PDF:", error.message);
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// });

///////////////////
////////////////
//////////////////
//////////////////
///////////////
//////////////
// // Generate pdf and Attach it in the right record in ServiceNow
// app.get("/api/generate_pdf", async (req, res) => {
//   try {
//     const { user_email, record_sys_id } = req.query;
//     if (!user_email || !record_sys_id) {
//       return res.status(400).json({ error: "Missing required parameters: user_email, record_sys_id" });
//     }

//     console.log("Fetching PDF from ServiceNow...");

//     // Fetch base64 PDF from ServiceNow
//     const pdfResponse = await axios.get(`${servicenowBaseURL}${ENDPOINTS.GET_PDF_BASE64}`, {
//       auth,
//       headers: { "Content-Type": "application/json" },
//     });

//     // Log the response from ServiceNow to check the data structure
//     console.log("PDF Response from ServiceNow:", pdfResponse.data);

//     if (!pdfResponse.data.result || !pdfResponse.data.result.base64_data) {
//       return res.status(404).json({ error: "PDF not found or invalid response from ServiceNow" });
//     }

//     const base64Pdf = pdfResponse.data.result.base64_data;
//     console.log("Base64 PDF fetched from ServiceNow:", base64Pdf);  // Log the base64 data received from ServiceNow

    
//     const pdfBuffer = Buffer.from(base64Pdf, "base64");
//     console.log("PDF Buffer created from base64 data");
//     console.log("PDF Buffer length:", pdfBuffer.length);  // Log the length of the buffer to check if it's valid

//     // Fetch job assignment details
//     console.log("Fetching job assignment details...");
//     const jobDetails = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

//     if (jobDetails.error) {
//       return res.status(jobDetails.status || 500).json({ error: jobDetails.error });
//     }

//     console.log("Job assignment details retrieved:", jobDetails);

//     // Load the original PDF with pdf-lib
//     const pdfDoc = await PDFDocument.load(pdfBuffer);
//     console.log("PDF loaded successfully");

//     // Register fontkit with PDFDocument
//     pdfDoc.registerFontkit(fontkit);

//     // Load and embed a Unicode font that supports Greek characters
//     let customFont;
//     try {
//       const arialPath = path.join(__dirname, 'fonts', 'arial.ttf');
//       if (fs.existsSync(arialPath)) {
//         const fontBytes = fs.readFileSync(arialPath);
//         customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//       } else {
//         const notoPath = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
//         if (fs.existsSync(notoPath)) {
//           const fontBytes = fs.readFileSync(notoPath);
//           customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//         } else {
//           throw new Error('No suitable font found.');
//         }
//       }
//     } catch (fontError) {
//       console.error('Error loading custom font:', fontError);
//       customFont = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman);
//     }

//     const form = pdfDoc.getForm();
//     const fields = form.getFields();

//     // Fill in fields with values
//     for (const field of fields) {
//       const fieldName = field.getName();
//       const matchingValue = findMatchingValue(fieldName, jobDetails);
    
//       if (matchingValue) {
//         try {
//           console.log(`Setting field ${fieldName} to ${matchingValue}`);  // Log the field name and value
//           if (field.constructor.name === 'PDFTextField') {
//             field.setText(matchingValue);
//             field.setFontSize(10.5);
//             field.updateAppearances(customFont);
//           } else if (field.constructor.name === 'PDFCheckBox') {
//             if (matchingValue === 'checked') field.check();
//           } else if (field.constructor.name === 'PDFRadioButton') {
//             field.select(matchingValue);
//           } else if (field.constructor.name === 'PDFDropdown') {
//             field.select(matchingValue);
//           }
//         } catch (err) {
//           console.warn(`Failed to fill field ${fieldName}:`, err.message);
//         }
//       }
//     }

//     // Convert the modified PDF to base64 - FIXED PART
//     const modifiedPdfBytes = await pdfDoc.save();
//     console.log("Modified PDF generated");

//     // Convert Uint8Array to Buffer before encoding to base64
//     const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);
//     const base64PdfString = modifiedPdfBuffer.toString('base64');
//     console.log("Base64 PDF data being sent:", base64PdfString);

//     // Send base64 PDF to ServiceNow endpoint with query params (user_email, record_sys_id)
//     const attachPdfResponse = await axios.post(
//       `${servicenowBaseURL}${ENDPOINTS.ATTACH_PDF}`, // Use the endpoint from ENDPOINTS.ATTACH_PDF
//       {
//         file_data: base64PdfString,
//       },
//       {
//         params: { user_email, record_sys_id }, // Include the query params
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("PDF attached successfully:", attachPdfResponse.data);

//     // Return success response
//     res.json({
//       message: "PDF filled and attached successfully",
//       attachPdfResponse: attachPdfResponse.data,
//     });

//   } catch (error) {
//     console.error("Error processing PDF:", error.message);
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// });

// Generate PDF and Attach it in the right record in ServiceNow
app.get("/api/generate_pdf", async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query; // Keep query params
    const signatureTechnician = req.body.signature_technician; // Get from form-data
    const signatureCustomer = req.body.signature_customer; // Get from form-data
    console.log("Request Body:", req.body);
    console.log("Technician Signature Base64:", signatureTechnician ? signatureTechnician.substring(0, 30) + "..." : "Not provided");
    console.log("Customer Signature Base64:", signatureCustomer ? signatureCustomer.substring(0, 30) + "..." : "Not provided");

    if (!user_email || !record_sys_id) {
      return res.status(400).json({ error: "Missing required parameters: user_email, record_sys_id" });
    }

    console.log("Fetching PDF from ServiceNow...");

    // Fetch base64 PDF from ServiceNow
    const pdfResponse = await axios.get(`${servicenowBaseURL}${ENDPOINTS.GET_PDF_BASE64}`, {
      auth,
      headers: { "Content-Type": "application/json" },
    });

    if (!pdfResponse.data.result || !pdfResponse.data.result.base64_data) {
      return res.status(404).json({ error: "PDF not found or invalid response from ServiceNow" });
    }

    const base64Pdf = pdfResponse.data.result.base64_data;
    const pdfBuffer = Buffer.from(base64Pdf, "base64");

    console.log("Fetching job assignment details...");
    const jobDetails = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

    if (jobDetails.error) {
      return res.status(jobDetails.status || 500).json({ error: jobDetails.error });
    }

    console.log("Job assignment details retrieved:", jobDetails);

    // Load the original PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    console.log("PDF loaded successfully");

    // Register fontkit with PDFDocument
    pdfDoc.registerFontkit(fontkit);

    // Load and embed a Unicode font that supports Greek characters
    let customFont;
    try {
      const arialPath = path.join(__dirname, 'fonts', 'Helvetica.ttf');  // Keep original logic
      if (fs.existsSync(arialPath)) {
        const fontBytes = fs.readFileSync(arialPath);
        customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
      } else {
        const notoPath = path.join(__dirname, 'fonts', 'Helvetica.ttf');
        if (fs.existsSync(notoPath)) {
          const fontBytes = fs.readFileSync(notoPath);
          customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        } else {
          throw new Error('No suitable font found.');
        }
      }
    } catch (fontError) {
      console.error('Error loading custom font:', fontError);
      customFont = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman);
    }

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Fill in fields with values
    for (const field of fields) {
      const fieldName = field.getName();
      const matchingValue = findMatchingValue(fieldName, jobDetails);
    
      if (matchingValue) {
        try {
          console.log(`Setting field ${fieldName} to ${matchingValue}`);
          if (field.constructor.name === 'PDFTextField') {
            field.setText(matchingValue);
            field.setFontSize(10.5);
            field.updateAppearances(customFont);
          } else if (field.constructor.name === 'PDFCheckBox') {
            if (matchingValue === 'checked') field.check();
          } else if (field.constructor.name === 'PDFRadioButton') {
            field.select(matchingValue);
          } else if (field.constructor.name === 'PDFDropdown') {
            field.select(matchingValue);
          }
        } catch (err) {
          console.warn(`Failed to fill field ${fieldName}:`, err.message);
        }
      }
    }

    // Get the first page to place the signatures
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add technician signature if provided
    if (signatureTechnician) {
      console.log("Embedding technician signature...");
      const technicianSignatureBytes = Buffer.from(signatureTechnician, "base64");
      const technicianSignatureImage = await pdfDoc.embedPng(technicianSignatureBytes);
      firstPage.drawImage(technicianSignatureImage, {
        x: 150,
        y: 586,
        width: 100,
        height: 50
      });
    }

    // Add customer signature if provided
    if (signatureCustomer) {
      console.log("Embedding customer signature...");
      const customerSignatureBytes = Buffer.from(signatureCustomer, "base64");
      const customerSignatureImage = await pdfDoc.embedPng(customerSignatureBytes);
      firstPage.drawImage(customerSignatureImage, {
        x: 529,
        y: 586,
        width: 100,
        height: 50
      });
    }

    // Save the modified PDF as binary
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);

    // Use ServiceNow Attachment API to upload the file
    const attachmentResponse = await axios.post(
      `${servicenowBaseURL}/api/now/attachment/file`, 
      modifiedPdfBuffer,
      {
        params: {
          table_name: 'x_eedat_meters_app_job_assignments',
          table_sys_id: record_sys_id,
          file_name: 'generated_document.pdf'
        },
        headers: {
          'Content-Type': 'application/pdf',
          'Accept': 'application/json'
        },
        auth: {
          username: process.env.SERVICENOW_USER,
          password: process.env.SERVICENOW_PASS
        },
        timeout: 30000
      }
    );

    console.log("PDF attached successfully:", attachmentResponse.data);

    // Return success response
    res.json({
      message: "PDF filled and attached successfully",
      attachment: attachmentResponse.data
    });

  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
