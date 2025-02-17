require("dotenv").config({ path: "./.env" });
const express = require("express");
const axios = require("axios");
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

// 6. Get available vehicles
app.get("/api/vehicles", authorizeMeterApp, async (req, res) => {
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

// 7. Helper API to list available endpoints
app.get("/api/helper", (req, res) => {
  try {
    res.json({
      endpoints: {
        "api/user_auth": "Authenticate a user and generate a JWT token. Requires query param 'user_email'.",
        "api/meter_app/job_dispositions/get": "Fetch a specific job assignment. Requires query params 'user_email' and 'record_sys_id'. Authorization required.",
        "api/meter_app/job_dispositions/get/all": "Fetch all job assignments for a user. Requires query param 'user_email'. Authorization required.",
        "api/meter_app/update_job_disposition": "Update a job assignment. Requires query params 'user_email' and 'record_sys_id'. Authorization required.",
        "api/meter_app/work_types": "Retrieve all available work types. Authorization required.",
        "api/helper": "Provides information about available API endpoints.",
      },
    });
  } catch (error) {
    console.error("Error in /helper:", error.message);
    res.status(500).json({ error: "Failed to retrieve endpoint information" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
