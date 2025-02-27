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

// Main endpoint
app.get("/api/generate_pdf", async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
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

    // Fetch job assignment details
    console.log("Fetching job assignment details...");
    const jobDetails = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

    if (jobDetails.error) {
      return res.status(jobDetails.status || 500).json({ error: jobDetails.error });
    }

    console.log("Job assignment details retrieved:", jobDetails);

    // Load the original PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Register fontkit with PDFDocument
    pdfDoc.registerFontkit(fontkit);
    
    // Load and embed a Unicode font that supports Greek characters
    // First, try to use Arial if available (which usually supports Greek)
    let customFont;
    try {
      // Try to load Arial first (if available on the system)
      const arialPath = path.join(__dirname, 'fonts', 'arial.ttf');
      if (fs.existsSync(arialPath)) {
        const fontBytes = fs.readFileSync(arialPath);
        customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
      } else {
        // Fallback to Noto Sans
        const notoPath = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
        if (fs.existsSync(notoPath)) {
          const fontBytes = fs.readFileSync(notoPath);
          customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        } else {
          throw new Error('No suitable font found. Please install Arial or Noto Sans.');
        }
      }
    } catch (fontError) {
      console.error('Error loading custom font:', fontError);
      // If custom font fails, try to use a built-in font as last resort
      customFont = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman);
    }
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Keep track of any fields that couldn't be filled
    const failedFields = [];

    for (const field of fields) {
      const fieldName = field.getName();
      const matchingValue = findMatchingValue(fieldName, jobDetails);
    
      if (matchingValue) {
        try {
          if (field.constructor.name === 'PDFTextField') {
            console.log(`Attempting to fill field: ${fieldName} with value: ${matchingValue}`);
            field.setText(matchingValue);
    
            // Increase font size for the field (adjust the multiplier as needed)
            const fontSize = 10.5;  // Set this to the font size you prefer
            field.setFontSize(fontSize);  // Apply the larger font size
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
          failedFields.push({ fieldName, error: err.message });
        }
      }
    }
    

    const workCode = jobDetails.result.job_assignments[0].u_work_code?.value || 
                    jobDetails.result.job_assignments[0].u_work_code?.displayValue ||
                    `default_${Date.now()}`; // Fallback if work code is not found

    // Sanitize the work code for use in filename
    const sanitizedWorkCode = sanitizeFileName(workCode);
    // Save the filled PDF to a new file
    const modifiedPdfBytes = await pdfDoc.save();
    const fileName = `${sanitizedWorkCode}.pdf`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, modifiedPdfBytes);
    console.log("Filled PDF saved at:", filePath);

    // Return response with information about any failed fields
    const response = {
      message: "PDF filled and saved successfully",
      filePath,
    };

    if (failedFields.length > 0) {
      response.warnings = {
        message: "Some fields could not be filled properly",
        failedFields
      };
    }

    res.json(response);

  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
