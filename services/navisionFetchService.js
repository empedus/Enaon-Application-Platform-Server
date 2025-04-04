const axios = require("axios");
const ENDPOINTS = require("../utils/endpoints");

/**
 * Fetches data from Navision through ServiceNow
 * @param {string} path - The API endpoint path
 * @param {object} [requestBodyOrParams={}] - The request body (for POST) or query parameters (for GET)
 * @param {string} [method='post'] - HTTP method (default: 'post')
 * @param {boolean} [isQueryParam=false] - Whether to send data as query parameters even for POST requests
 * @returns {Promise<object>} - The response data or error object
 */
const fetchDataFromNavisionThrowServiceNow = async (
  path,
  requestBodyOrParams = {},
  method = "post",
  isQueryParam = false
) => {
  try {
    // Validate inputs
    if (!path) {
      console.error("Error: Missing path parameter");
      return { error: "Missing path parameter", status: 400 };
    }

    // Access servicenowBaseURL directly from ENDPOINTS
    const servicenowBaseURL = ENDPOINTS.servicenowBaseURL;
    if (!servicenowBaseURL) {
      console.error("Error: Missing base URL in ENDPOINTS");
      return { error: "Server misconfiguration: Missing base URL", status: 500 };
    }

    // Normalize method to lowercase
    const normalizedMethod = (method || "post").toLowerCase();
    
    // Ensure requestBodyOrParams is an object
    const normalizedData = requestBodyOrParams || {};

    // Construct URL
    const apiUrl = `${servicenowBaseURL}${path}`;
    
    // Set up common request config with auth
    const config = {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };

    // Log request details with simplified output
    console.log(`Request to ${path} (${normalizedMethod.toUpperCase()})`);
    
    // Make the request based on the method and isQueryParam flag
    let response;
    
    if (normalizedMethod === "get" || isQueryParam) {
      // For GET requests or when isQueryParam is true, send data as query parameters
      response = await axios({
        method: normalizedMethod,
        url: apiUrl,
        params: normalizedData,
        ...config
      });
    } else {
      // For POST requests, send data in the request body
      response = await axios.post(apiUrl, normalizedData, config);
    }

    // Check for empty response
    if (!response.data) {
      console.warn(`Empty response from ${path}`);
      return { data: null, status: response.status };
    }

    // Return the response data
    return response.data;
  } catch (error) {
    // Simplified error logging
    console.error(`Error fetching data from ${path}: ${error.message}`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }

    // Return a structured error object
    return {
      error: error.response?.data?.error || error.response?.data || error.message || "Failed to fetch data from Navision",
      status: error.response?.status || 500,
      isError: true
    };
  }
};

module.exports = {
  fetchDataFromNavisionThrowServiceNow,
};