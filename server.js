// require("dotenv").config({ path: "./.env" });
// const express = require("express");
// const axios = require("axios");
// const path = require("path");
// const fs = require("fs");
// const { v4: uuidv4 } = require("uuid"); // Import UUID library for generating unique session IDs
// const { PDFDocument } = require("pdf-lib");
// const fontkit = require("@pdf-lib/fontkit");

// const { generateToken, verifyToken } = require("../utils/jwtUtils");
// const ENDPOINTS = require("../utils/endpoints");

// const app = express();
// const port = process.env.PORT || 3000;

// // app.use(express.json());
// app.use(express.json({ limit: "10mb" })); // For JSON payloads
// app.use(express.urlencoded({ limit: "10mb", extended: true })); // For URL-encoded data

// const servicenowBaseURL = "https://enaondev.service-now.com";
// const auth = {
//   username: process.env.SERVICENOW_USER,
//   password: process.env.SERVICENOW_PASS,
// };

// // Auth function for Meters App required
// const authorizeMeterApp = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ error: "Authorization token is required" });
//     }

//     const decoded = verifyToken(token);
//     const { accessible_apps } = decoded;

//     if (!accessible_apps || !accessible_apps.includes("Meters App")) {
//       return res.status(403).json({
//         error: "Access denied. 'Meters App' is required in accessible apps.",
//       });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };

// // Auth function for Meters App or Maintenance App required
// const authorizeMeterAppOrMaintenanceApp = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ error: "Authorization token is required" });
//     }

//     const decoded = verifyToken(token);
//     const { accessible_apps } = decoded;

//     // Check if the user has access to either "Meters App" or "Maintenance App"
//     if (
//       !accessible_apps ||
//       (!accessible_apps.includes("Meters App") &&
//         !accessible_apps.includes("Maintenance App"))
//     ) {
//       return res.status(403).json({
//         error:
//           "Access denied. 'Meters App' or 'Maintenance App' is required in accessible apps.",
//       });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };

// const getDataFromServiceNow = async (path, params) => {
//   try {
//     if (!servicenowBaseURL || !path) {
//       console.error("Error: Missing base URL or path");
//       return { error: "Server misconfiguration: Missing URL or path" };
//     }

//     const apiUrl = `${servicenowBaseURL}${path}`;
//     console.log("Making request to:", apiUrl, "with params:", params);

//     const response = await axios.get(apiUrl, {
//       auth,
//       headers: { "Content-Type": "application/json" },
//       params,
//     });

//     if (!response.data || Object.keys(response.data).length === 0) {
//       return { error: "No data found", status: 404 };
//     }

//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching data from ${path}:`, error.message);
//     return {
//       error: error.response?.data || "Failed to fetch data from ServiceNow",
//       status: error.response?.status || 500,
//     };
//   }
// };

// // 1. Authenticate user and generate JWT token
// app.get("/api/user_auth", async (req, res) => {
//   try {
//     const { user_email } = req.query;
//     if (!user_email)
//       return res
//         .status(400)
//         .json({ error: "Missing required parameter: user_email" });

//     const serviceNowResponse = await getDataFromServiceNow(
//       ENDPOINTS.AUTH_PATH,
//       { user_email }
//     );

//     if (serviceNowResponse.error) {
//       return res
//         .status(serviceNowResponse.status || 500)
//         .json({ error: serviceNowResponse.error });
//     }

//     const accessibleApps = serviceNowResponse.result.accessible_apps;
//     if (!Array.isArray(accessibleApps)) {
//       return res
//         .status(500)
//         .json({ error: "Accessible apps should be an array" });
//     }

//     const jwtPayload = {
//       user_email: serviceNowResponse.result.user_email[0],
//       accessible_apps: accessibleApps,
//     };

//     const token = generateToken(jwtPayload);
//     res.json({ result: { serviceNowData: serviceNowResponse.result, token } });
//   } catch (error) {
//     console.error("Error in /user_auth:", error.message);
//     res.status(500).json({ error: "Failed to authenticate user" });
//   }
// });

// // 2. Get specific job assignment
// app.get(
//   "/api/meter_app/job_dispositions/get",
//   authorizeMeterApp,
//   async (req, res) => {
//     try {
//       const { user_email, record_sys_id } = req.query;
//       if (!user_email || !record_sys_id)
//         return res.status(400).json({
//           error: "Missing required parameters: user_email and/or record_sys_id",
//         });

//       const serviceNowResponse = await getDataFromServiceNow(
//         ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
//         { user_email, record_sys_id }
//       );

//       if (serviceNowResponse.error) {
//         return res
//           .status(serviceNowResponse.status || 500)
//           .json({ error: serviceNowResponse.error });
//       }

//       res.json(serviceNowResponse);
//     } catch (error) {
//       console.error("Error in /job_dispositions/get:", error.message);
//       res
//         .status(500)
//         .json({ error: "Failed to fetch specific job assignment" });
//     }
//   }
// );

// // 3. Get all job assignments
// app.get(
//   "/api/meter_app/job_dispositions/get/all",
//   authorizeMeterApp,
//   async (req, res) => {
//     try {
//       const { user_email } = req.query;
//       if (!user_email)
//         return res
//           .status(400)
//           .json({ error: "Missing required parameter: user_email" });

//       const serviceNowResponse = await getDataFromServiceNow(
//         ENDPOINTS.ALL_ASSIGNMENTS_PATH,
//         { user_email }
//       );

//       if (serviceNowResponse.error) {
//         return res
//           .status(serviceNowResponse.status || 500)
//           .json({ error: serviceNowResponse.error });
//       }

//       res.json(serviceNowResponse);
//     } catch (error) {
//       console.error("Error in /job_dispositions/get/all:", error.message);
//       res.status(500).json({ error: "Failed to fetch all job assignments" });
//     }
//   }
// );

// // 4. Update job assignment
// app.put(
//   "/api/meter_app/update_job_disposition",
//   authorizeMeterApp,
//   async (req, res) => {
//     try {
//       const { user_email, record_sys_id } = req.query;
//       if (!user_email || !record_sys_id)
//         return res.status(400).json({
//           error: "Missing required parameters: user_email and/or record_sys_id",
//         });

//       const apiUrl = `${servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`;
//       console.log(
//         "Making request to:",
//         apiUrl,
//         "with query params:",
//         { user_email, record_sys_id },
//         "and body:",
//         req.body
//       );

//       const response = await axios.put(apiUrl, req.body, {
//         auth,
//         headers: { "Content-Type": "application/json" },
//         params: { user_email, record_sys_id },
//       });

//       if (!response.data) {
//         return res
//           .status(404)
//           .json({ error: "No response data received from ServiceNow" });
//       }

//       res.json(response.data);
//     } catch (error) {
//       console.error("Error in /update_job_disposition:", error.message);
//       res
//         .status(error.response?.status || 500)
//         .json({ error: "Failed to update job assignment" });
//     }
//   }
// );

// // 5. Get available work types
// app.get("/api/meter_app/work_types", authorizeMeterApp, async (req, res) => {
//   try {
//     const serviceNowResponse = await getDataFromServiceNow(
//       ENDPOINTS.WORK_TYPES_PATH,
//       {}
//     );

//     if (serviceNowResponse.error) {
//       return res
//         .status(serviceNowResponse.status || 500)
//         .json({ error: serviceNowResponse.error });
//     }

//     res.json(serviceNowResponse);
//   } catch (error) {
//     console.error("Error in /work_types:", error.message);
//     res.status(500).json({ error: "Failed to fetch work types" });
//   }
// });

// // 6. Get Available Vehicles
// app.get(
//   "/api/vehicles",
//   authorizeMeterAppOrMaintenanceApp,
//   async (req, res) => {
//     try {
//       const serviceNowResponse = await getDataFromServiceNow(
//         ENDPOINTS.VEHICLES_PATH,
//         {}
//       );

//       if (serviceNowResponse.error) {
//         return res
//           .status(serviceNowResponse.status || 500)
//           .json({ error: serviceNowResponse.error });
//       }

//       res.json(serviceNowResponse);
//     } catch (error) {
//       console.error("Error in /vehicles:", error.message);
//       res.status(500).json({ error: "Failed to fetch vehicles" });
//     }
//   }
// );

// // Function to find matching values in the assignment response
// function findMatchingValue(fieldName, jobDetails) {
//   for (const key in jobDetails.result.job_assignments[0]) {
//     if (fieldName.toLowerCase().includes(key.toLowerCase())) {
//       return (
//         jobDetails.result.job_assignments[0][key]?.displayValue ||
//         jobDetails.result.job_assignments[0][key]?.value ||
//         ""
//       );
//     }
//   }
//   return null; // Return null if no matching value is found
// }

// // 7. Generate PDF and Attach it in the Record
// app.get("/api/meter_app/generate_pdf",authorizeMeterApp, async (req, res) => {
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
//     const pdfResponse = await axios.get(
//       `${servicenowBaseURL}${ENDPOINTS.GET_PDF_TEMPLATE}`,
//       {
//         params: {
//           user_email, // Add user_email as a query parameter
//           record_sys_id, // Add record_sys_id as a query parameter
//         },
//         auth,
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("PDF Response:", pdfResponse.data);

//     if (!pdfResponse.data.result || !pdfResponse.data.result.base64_data) {
//       return res
//         .status(404)
//         .json({ error: "PDF not found or invalid response from ServiceNow" });
//     }

//     const base64Pdf = pdfResponse.data.result.base64_data;
//     const pdfBuffer = Buffer.from(base64Pdf, "base64");

//     console.log("Fetching job assignment details...");
//     const jobDetails = await getDataFromServiceNow(
//       ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH,
//       { user_email, record_sys_id }
//     );

//     if (jobDetails.error) {
//       return res
//         .status(jobDetails.status || 500)
//         .json({ error: jobDetails.error });
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
//       const arialPath = path.join(__dirname, "fonts", "Helvetica.ttf"); // Keep original logic
//       if (fs.existsSync(arialPath)) {
//         const fontBytes = fs.readFileSync(arialPath);
//         customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//       } else {
//         const notoPath = path.join(__dirname, "fonts", "Helvetica.ttf");
//         if (fs.existsSync(notoPath)) {
//           const fontBytes = fs.readFileSync(notoPath);
//           customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
//         } else {
//           throw new Error("No suitable font found.");
//         }
//       }
//     } catch (fontError) {
//       console.error("Error loading custom font:", fontError);
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
//           console.log(`Setting field ${fieldName} to ${matchingValue}`);
//           if (field.constructor.name === "PDFTextField") {
//             field.setText(matchingValue);
//             field.setFontSize(10.5);
//             field.updateAppearances(customFont);
//           } else if (field.constructor.name === "PDFCheckBox") {
//             if (matchingValue === "checked") field.check();
//           } else if (field.constructor.name === "PDFRadioButton") {
//             field.select(matchingValue);
//           } else if (field.constructor.name === "PDFDropdown") {
//             field.select(matchingValue);
//           }
//         } catch (err) {
//           console.warn(`Failed to fill field ${fieldName}:`, err.message);
//         }
//       }
//     }

//     // Save the modified PDF as binary
//     const modifiedPdfBytes = await pdfDoc.save();
//     const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);

//     // Use ServiceNow Attachment API to upload the file
//     console.log("Uploading PDF to ServiceNow...");
//     const attachmentResponse = await axios.post(
//       `${servicenowBaseURL}/api/now/attachment/file`,
//       modifiedPdfBuffer,
//       {
//         params: {
//           table_name: "x_eedat_meters_app_job_assignments",
//           table_sys_id: record_sys_id,
//           file_name: "generated_document.pdf",
//         },
//         headers: {
//           "Content-Type": "application/pdf",
//           Accept: "application/json",
//         },
//         auth: {
//           username: process.env.SERVICENOW_USER,
//           password: process.env.SERVICENOW_PASS,
//         },
//         timeout: 30000,
//       }
//     );

//     console.log("PDF attachment response:", attachmentResponse.data);

//     // Now, call GET_ATTACHED_PDF to fetch the base64 content of the uploaded PDF
//     console.log("Fetching attached PDF...");
//     const getAttachedPdfResponse = await axios.get(
//       `${servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//       {
//         auth,
//         headers: { "Content-Type": "application/json" },
//         params: {
//           user_email: user_email,
//           record_sys_id: record_sys_id,
//         },
//       }
//     );

//     console.log("Get attached PDF response:", getAttachedPdfResponse.data);

//     if (
//       !getAttachedPdfResponse.data.result ||
//       !getAttachedPdfResponse.data.result.base64_data
//     ) {
//       return res
//         .status(404)
//         .json({ error: "Failed to fetch attached PDF data." });
//     }


//     const updateJobDispositionResponse = await axios.put(
//       `${servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
//       {
//         u_state: "PDF Complete",  // Set the status to "Form Complete"
//         // Add any other required fields to the request body here
//       },
//       {
//         auth,
//         headers: { "Content-Type": "application/json" },
//         params: { user_email, record_sys_id },
//       }
//     );

//     console.log("Job disposition updated:", updateJobDispositionResponse.data);


//     // Return the base64 data of the attached PDF as response in your custom format
//     res.status(200).json({
//       file_name: getAttachedPdfResponse.data.result.file_name,
//       content_type: getAttachedPdfResponse.data.result.content_type,
//       base64_data: getAttachedPdfResponse.data.result.base64_data,
//     });
//   } catch (error) {
//     console.error(
//       "Error processing PDF:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// });

// // 8. Generate PDF with signs and Attach it in the Record
// app.post("/api/meter_app/sign_pdf",authorizeMeterApp, async (req, res) => {
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
//     const getAttachedPdfResponse = await axios.get(
//       `${servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//       {
//         auth,
//         headers: { "Content-Type": "application/json" },
//         params: {
//           user_email: user_email,
//           record_sys_id: record_sys_id,
//         },
//       }
//     );

//     console.log("Get attached PDF response:", getAttachedPdfResponse.data);
//     const base64Pdf = getAttachedPdfResponse.data.result.base64_data;
//     const pdfBuffer = Buffer.from(base64Pdf, "base64");
//     const pdfDoc = await PDFDocument.load(pdfBuffer);

//     console.log("PDF loaded successfully");

//     if (signatureCustomer && signatureTechnician) {
//       try {
//         // Generate unique session IDs for each signature
//         const sessionIdTechnician = uuidv4(); // Technician signature session ID
//         const sessionIdCustomer = uuidv4(); // Customer signature session ID

//         // Define the image folder path (TempImageFolder should already exist)
//         const folderPath = path.join(__dirname, "TempImageFolder");
//         if (!fs.existsSync(folderPath)) {
//           fs.mkdirSync(folderPath, { recursive: true });
//         }

//         // Process Technician Signature
//         if (signatureTechnician) {
//           const technicianImagePath = path.join(
//             folderPath,
//             `techniciansignature_${sessionIdTechnician}.png`
//           );
//           const base64DataTechnician = signatureTechnician.replace(
//             /^data:image\/png;base64,/,
//             ""
//           );
//           const imageBufferTechnician = Buffer.from(
//             base64DataTechnician,
//             "base64"
//           );
//           fs.writeFileSync(technicianImagePath, imageBufferTechnician);
//           console.log(
//             `Technician signature image saved for session ${sessionIdTechnician}.`
//           );

//           // Embed Technician Signature in PDF
//           const pngImageTechnician = await pdfDoc.embedPng(
//             imageBufferTechnician
//           );
//           console.log("Technician PNG image embedded successfully.");
//           const pngDimsTechnician = pngImageTechnician.scale(0.1); // Scale down technician signature image to 10%
//           const page = pdfDoc.getPages()[0] || pdfDoc.addPage();
//           page.drawImage(pngImageTechnician, {
//             x: 115, // Technician signature position X
//             y: 215, // Technician signature position Y
//             width: pngDimsTechnician.width,
//             height: pngDimsTechnician.height,
//           });

//           // Delete the technician signature image file
//           fs.unlinkSync(technicianImagePath);
//           console.log(
//             `Technician signature image deleted for session ${sessionIdTechnician}.`
//           );
//         }

//         // Process Customer Signature
//         if (signatureCustomer) {
//           const customerImagePath = path.join(
//             folderPath,
//             `customersignature_${sessionIdCustomer}.png`
//           );
//           const base64DataCustomer = signatureCustomer.replace(
//             /^data:image\/png;base64,/,
//             ""
//           );
//           const imageBufferCustomer = Buffer.from(base64DataCustomer, "base64");
//           fs.writeFileSync(customerImagePath, imageBufferCustomer);
//           console.log(
//             `Customer signature image saved for session ${sessionIdCustomer}.`
//           );

//           // Embed Customer Signature in PDF
//           const pngImageCustomer = await pdfDoc.embedPng(imageBufferCustomer);
//           console.log("Customer PNG image embedded successfully.");
//           const pngDimsCustomer = pngImageCustomer.scale(0.1); // Scale down customer signature image to 10%
//           const page = pdfDoc.getPages()[0] || pdfDoc.addPage();
//           page.drawImage(pngImageCustomer, {
//             x: 500, // Customer signature position X
//             y: 215, // Customer signature position Y
//             width: pngDimsCustomer.width,
//             height: pngDimsCustomer.height,
//           });

//           // Delete the customer signature image file
//           fs.unlinkSync(customerImagePath);
//           console.log(
//             `Customer signature image deleted for session ${sessionIdCustomer}.`
//           );
//         }

//         // After processing both signatures, save the PDF
//         const pdfBytes = await pdfDoc.save();
//         console.log("PDF successfully updated with both signatures.");

//         // Save the modified PDF as binary
//         const modifiedPdfBytes = await pdfDoc.save();
//         const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);

//         // Use ServiceNow Attachment API to upload the file
//         console.log("Uploading PDF to ServiceNow...");
//         const attachmentResponse = await axios.post(
//           `${servicenowBaseURL}/api/now/attachment/file`,
//           modifiedPdfBuffer,
//           {
//             params: {
//               table_name: "x_eedat_meters_app_job_assignments",
//               table_sys_id: record_sys_id,
//               file_name: "generated_document_signed.pdf",
//             },
//             headers: {
//               "Content-Type": "application/pdf",
//               Accept: "application/json",
//             },
//             auth: {
//               username: process.env.SERVICENOW_USER,
//               password: process.env.SERVICENOW_PASS,
//             },
//             timeout: 30000,
//           }
//         );

//         console.log("Fetching attached PDF...");
//         const getAttachedPdfResponse = await axios.get(
//           `${servicenowBaseURL}${ENDPOINTS.GET_ATTACHED_PDF}`,
//           {
//             auth,
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
//           `${servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`,
//           {
//             u_state: "Form Signed",  // Set the status to "Form Signed"
//             // Add any other required fields to the request body here
//           },
//           {
//             auth,
//             headers: { "Content-Type": "application/json" },
//             params: { user_email, record_sys_id },
//           }
//         );
    
//         console.log("Job disposition updated:", updateJobDispositionResponse.data);

//         // Return the base64 data of the attached PDF as response in your custom format
//         res.status(200).json({
//           file_name: getAttachedPdfResponse.data.result.file_name,
//           content_type: getAttachedPdfResponse.data.result.content_type,
//           base64_data: getAttachedPdfResponse.data.result.base64_data,
//         });
//       } catch (error) {
//         console.error("Error processing signatures:", error);
//       }
//     }
//   } catch (error) {
//     console.error("Error processing PDF:", error.message);
//     res.status(500).json({ error: "Failed to process PDF" });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

require("dotenv").config({ path: "./.env" })
const express = require("express")
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Import routes
const authRoutes = require("./routes/authRoutes")
const jobRoutes = require("./routes/jobRoutes")
const vehicleRoutes = require("./routes/vehicleRoutes")
const pdfRoutes = require("./routes/pdfRoutes")
const helperRoutes = require("./routes/helperRoutes")
const uploadRoutes = require("./routes/attachmentRoutes")
// Use routes
app.use("/api", authRoutes)
app.use("/api/meter_app", jobRoutes)
app.use("/api", vehicleRoutes)
app.use("/api/meter_app", pdfRoutes)
app.use("/api/helper", helperRoutes)
app.use("/api/meter_app", uploadRoutes)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  console.log("ServiceNow URL:", require("./utils/endpoints").servicenowBaseURL)
})

