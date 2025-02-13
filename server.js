require("dotenv").config({ path: "./.env" });
const express = require("express");
const axios = require("axios");
const { generateToken, verifyToken } = require('./jwtUtils');  // Import the generateToken and verifyToken functions

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const servicenowBaseURL = process.env.SERVICENOW_INSTANCE;
const auth = {
  username: process.env.SERVICENOW_USER,
  password: process.env.SERVICENOW_PASS,
};

// Middleware to check for the Authorization token and verify "Meters App" in the accessible_apps
const authorizeMeterApp = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from Authorization header

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    const decoded = verifyToken(token);  // Verify and decode the JWT token
    const { accessible_apps } = decoded;

    if (!accessible_apps || !accessible_apps.includes("Meters App")) {
      return res.status(403).json({ error: "Access denied. 'Meters App' is required in accessible apps." });
    }

    req.user = decoded;  // Optionally attach the decoded token to the request object
    next();  // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Helper function to make GET requests
const getDataFromServiceNow = async (path, params) => {
  try {
    if (!servicenowBaseURL || !path) {
      console.error("Error: Missing base URL or path");
      return { error: "Server misconfiguration: Missing URL or path" };  // Return error object instead of sending response
    }

    const apiUrl = `${servicenowBaseURL}${path}`;
    console.log("Making request to:", apiUrl, "with params:", params);

    const response = await axios.get(apiUrl, {
      auth,
      headers: { "Content-Type": "application/json" },
      params,
    });
    console.log('ServiceNow Response: ' + JSON.stringify(response.data));

    return response.data;  // Return data instead of sending response here
  } catch (error) {
    console.error("Error fetching data from", path, ":", error.message);
    return { error: "Failed to fetch data from ServiceNow" };  // Return error object
  }
};

// 1. Authorize user, Get Accessible Apps, and Generate JWT Token
app.get("/user_auth", async (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });

    const serviceNowResponse = await getDataFromServiceNow(process.env.AUTH_PATH, { user_email });

    if (!serviceNowResponse || !serviceNowResponse.result) {
      return res.status(500).json({ error: "ServiceNow response format is invalid" });
    }

    const accessibleApps = serviceNowResponse.result.accessible_apps;

    if (!Array.isArray(accessibleApps)) {
      return res.status(500).json({ error: "Accessible apps should be an array" });
    }

    const jwtPayload = {
      user_email: serviceNowResponse.result.user_email[0], // assuming it's an array, take the first element
      accessible_apps: accessibleApps,
    };

    //Generate the JWT token
    const token = generateToken(jwtPayload);

    res.json({
      result: {
        serviceNowData: serviceNowResponse.result,  
        token,  
      },
    });

  } catch (error) {
    console.error("Error in /user_auth endpoint:", error.message);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// 2. Get specific job assignments for a user (with authorization middleware)
app.get("/meter_app/job-dispositions/get", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    if (!user_email || !record_sys_id) return res.status(400).json({ error: "Missing required parameters: user_email and/or record_sys_id" });
    
    const serviceNowResponse = await getDataFromServiceNow(process.env.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id });

    if (serviceNowResponse.error) {
      return res.status(500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);  // Send the fetched data to the client

  } catch (error) {
    console.error("Error in /job-dispositions/get endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch specific job assignment" });
  }
});

// 3. Get all job assignments for a user (with authorization middleware)
app.get("/meter_app/job-dispositions/get/all", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });

    const serviceNowResponse = await getDataFromServiceNow(process.env.ALL_ASSIGNMENTS_PATH, { user_email });

    if (serviceNowResponse.error) {
      return res.status(500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);  // Send the fetched data to the client

  } catch (error) {
    console.error("Error in /job-dispositions/get/all endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch all job assignments" });
  }
});

// 4. Update Job Assignment (with authorization middleware)
app.put("/meter_app/update-job-disposition", authorizeMeterApp, async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    if (!user_email || !record_sys_id) return res.status(400).json({ error: "Missing required parameters: user_email and/or record_sys_id" });
    
    const apiUrl = `${servicenowBaseURL}${process.env.UPDATE_JOB_DISPOSITION_PATH}`;
    console.log("Making request to:", apiUrl, "with query params:", { user_email, record_sys_id }, "and body:", req.body);

    const response = await axios.put(apiUrl, req.body, {
      auth,
      headers: { "Content-Type": "application/json" },
      params: { user_email, record_sys_id },
    });
    res.json(response.data);

  } catch (error) {
    console.error("Error in /update-job-disposition endpoint:", error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to update job assignment" });
  }
});

// 5. Get all available Work Types (with authorization middleware)
app.get("/meter_app/work-types", authorizeMeterApp, async (req, res) => {
  try {
    // Fetch available work types from ServiceNow
    const serviceNowResponse = await getDataFromServiceNow(process.env.WORK_TYPES_PATH, {});

    if (serviceNowResponse.error) {
      return res.status(500).json({ error: serviceNowResponse.error });
    }

    // Return the fetched work types from ServiceNow to the client
    res.json(serviceNowResponse);  // Send the fetched data to the client

  } catch (error) {
    console.error("Error in /work-types endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch work types" });
  }
});

// 6. Helper API to list available endpoints
app.get("/helper", (req, res) => {
  res.json({
    endpoints: {
      "/user_auth": "Authenticate a user with query param user_email",
      "/job-dispositions/get": "Fetch a specific job assignment with query params user_email and record_sys_id",
      "/job-dispositions/get/all": "Fetch all job assignments for a user with query param user_email",
      "/update-job-disposition": "Update a job assignment with query params user_email, record_sys_id and request body containing update details",
      "/work-types": "Retrieve all available work types",
      "/helper": "Provides information about available API endpoints"
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
