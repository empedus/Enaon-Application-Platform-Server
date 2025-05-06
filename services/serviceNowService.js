const axios = require("axios")
const { auth } = require("../config/serviceNow")
const ENDPOINTS = require("../utils/endpoints")

const getDataFromServiceNow = async (path, params) => {
  try {
    const { servicenowBaseURL } = ENDPOINTS

    if (!servicenowBaseURL || !path) {
      console.error("Error: Missing base URL or path")
      return { error: "Server misconfiguration: Missing URL or path" }
    }

    // Construct URL exactly as in the original code
    const apiUrl = `${servicenowBaseURL}${path}`
    console.log("Making request to:", apiUrl, "with params:", params)

    // Make the request exactly as in the original code
    const response = await axios.get(apiUrl, {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
      params,
    })

    if (!response.data || Object.keys(response.data).length === 0) {
      return { error: "No data found", status: 404 }
    }

    return response.data
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error.message)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
    }
    return {
      error: error.response?.data || "Failed to fetch data from ServiceNow",
      status: error.response?.status || 500,
    }
  }
}


// New function for DELETE requests to ServiceNow
const deleteDataFromServiceNow = async (path, params) => {
  try {
    const { servicenowBaseURL } = ENDPOINTS

    if (!servicenowBaseURL || !path) {
      console.error("Error: Missing base URL or path")
      return { error: "Server misconfiguration: Missing URL or path" }
    }

    // Construct URL
    const apiUrl = `${servicenowBaseURL}${path}`
    console.log("Making DELETE request to:", apiUrl, "with params:", params)

    // Make the DELETE request
    const response = await axios.delete(apiUrl, {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
      params,
    })

    if (!response.data || Object.keys(response.data).length === 0) {
      return { message: "Resource deleted successfully", status: 200 }
    }

    return response.data
  } catch (error) {
    console.error(`Error deleting data from ${path}:`, error.message)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
    }
    return {
      error: error.response?.data || "Failed to delete data from ServiceNow",
      status: error.response?.status || 500,
    }
  }
}

// Function to find matching values in the assignment response
function findMatchingValue(fieldName, jobDetails) {
  for (const key in jobDetails.result.job_assignments[0]) {
    if (fieldName.toLowerCase().includes(key.toLowerCase())) {
      return (
        jobDetails.result.job_assignments[0][key]?.displayValue ||
        jobDetails.result.job_assignments[0][key]?.value ||
        ""
      )
    }
  }
  return null // Return null if no matching value is found
}

module.exports = {
  getDataFromServiceNow,
  findMatchingValue,
  deleteDataFromServiceNow
}

