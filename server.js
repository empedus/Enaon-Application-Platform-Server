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

console.log("Loaded Environment Variables:");
console.log("SERVICENOW_INSTANCE:", process.env.SERVICENOW_INSTANCE);
console.log("WORK_TYPES_PATH:", process.env.WORK_TYPES_PATH);
console.log("JOB_DISPOSITION_PATH:", process.env.JOB_DISPOSITION_PATH);
console.log("ALL_ASSIGNMENTS_PATH:", process.env.ALL_ASSIGNMENTS_PATH);
console.log("AUTH_PATH:", process.env.AUTH_PATH);
console.log("UPDATE_JOB_PATH:", process.env.UPDATE_JOB_PATH);

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
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch data" });
  }
};

// 1. Authenticate user
app.get("/auth", (req, res) => {
  const { user_email } = req.query;
  getDataFromServiceNow(process.env.AUTH_PATH, { user_email }, res);
});

// 2. Get specific job assignments for a user
app.get("/job-dispositions", (req, res) => {
  const { user_email, record_sys_id } = req.query;
  getDataFromServiceNow(process.env.JOB_DISPOSITION_PATH, { user_email, record_sys_id }, res);
});

// 3. Get all job assignments for a user
app.get("/all-assignments", (req, res) => {
  const { user_email } = req.query;
  getDataFromServiceNow(process.env.ALL_ASSIGNMENTS_PATH, { user_email }, res);
});

// 4. Update Job Assignment
app.post("/update-job", async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query;
    const apiUrl = `${servicenowBaseURL}${process.env.UPDATE_JOB_PATH}`;
    console.log("Making request to:", apiUrl, "with query params:", { user_email, record_sys_id }, "and body:", req.body);

    const response = await axios.post(apiUrl, req.body, {
      auth,
      headers: { "Content-Type": "application/json" },
      params: { user_email, record_sys_id },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error updating job assignment:", error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to update job assignment" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
