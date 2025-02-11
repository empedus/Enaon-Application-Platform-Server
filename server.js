require("dotenv").config({ path: "./.env" });
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const servicenowBaseURL = process.env.SERVICENOW_INSTANCE;
const auth = {
  username: process.env.SERVICENOW_USER,
  password: process.env.SERVICENOW_PASS,
};

// Helper function to make GET requests
const getDataFromServiceNow = async (path, params, res) => {
  try {
    if (!servicenowBaseURL || !path) {
      console.error("Error: Missing base URL or path");
      return res.status(500).json({ error: "Server misconfiguration: Missing URL or path" });
    }
    
    const apiUrl = `${servicenowBaseURL}${path}`;
    console.log("Making request to:", apiUrl, "with params:", params);
    
    const response = await axios.get(apiUrl, {
      auth,
      headers: { "Content-Type": "application/json" },
      params,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from", path, ":", error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch data from ServiceNow" });
  }
};

// 1. Authenticate user
app.get("/auth", (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });
    getDataFromServiceNow(process.env.AUTH_PATH, { user_email }, res);
  } catch (error) {
    console.error("Error in /auth endpoint:", error.message);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// 2. Get specific job assignments for a user
app.get("/job-dispositions/get", (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    if (!user_email || !record_sys_id) return res.status(400).json({ error: "Missing required parameters: user_email and/or record_sys_id" });
    getDataFromServiceNow(process.env.GET_SPECIFIC_ASSIGNMENT_PATH, { user_email, record_sys_id }, res);
  } catch (error) {
    console.error("Error in /job-dispositions/get endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch specific job assignment" });
  }
});

// 3. Get all job assignments for a user
app.get("/job-dispositions/get/all", (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" });
    getDataFromServiceNow(process.env.ALL_ASSIGNMENTS_PATH, { user_email }, res);
  } catch (error) {
    console.error("Error in /job-dispositions/get/all endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch all job assignments" });
  }
});

// 4. Update Job Assignment
app.put("/update-job-disposition", async (req, res) => {
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

// 5. Get all available Work Types
app.get("/work-types", (req, res) => {
  try {
    getDataFromServiceNow(process.env.WORK_TYPES_PATH, {}, res);
  } catch (error) {
    console.error("Error in /work-types endpoint:", error.message);
    res.status(500).json({ error: "Failed to fetch work types" });
  }
});

// 6. Helper API to list available endpoints
app.get("/helper", (req, res) => {
  res.json({
    endpoints: {
      "/auth": "Authenticate a user with query param user_email",
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
