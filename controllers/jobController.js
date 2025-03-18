const axios = require("axios")
const { getDataFromServiceNow } = require("../services/serviceNowService")
const ENDPOINTS = require("../utils/endpoints")

// 2. Get specific job assignment
const getSpecificJobAssignment = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query
    if (!user_email || !record_sys_id)
      return res.status(400).json({
        error: "Missing required parameters: user_email and/or record_sys_id",
      })

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, {
      user_email,
      record_sys_id,
    })

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    res.json(serviceNowResponse)
  } catch (error) {
    console.error("Error in /job_dispositions/get:", error.message)
    res.status(500).json({ error: "Failed to fetch specific job assignment" })
  }
}

// 3. Get all job assignments
const getAllJobAssignments = async (req, res) => {
  try {
    const { user_email } = req.query
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" })

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.ALL_ASSIGNMENTS_PATH, { user_email })

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    res.json(serviceNowResponse)
  } catch (error) {
    console.error("Error in /job_dispositions/get/all:", error.message)
    res.status(500).json({ error: "Failed to fetch all job assignments" })
  }
}

// 4. Update job assignment
const updateJobAssignment = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query
    if (!user_email || !record_sys_id)
      return res.status(400).json({
        error: "Missing required parameters: user_email and/or record_sys_id",
      })

    const apiUrl = `${ENDPOINTS.servicenowBaseURL}${ENDPOINTS.UPDATE_JOB_DISPOSITION_PATH}`
    console.log(
      "Making request to:",
      apiUrl,
      "with query params:",
      { user_email, record_sys_id },
      "and body:",
      req.body,
    )

    const response = await axios.put(apiUrl, req.body, {
      auth: {
        username: process.env.SERVICENOW_USER,
        password: process.env.SERVICENOW_PASS,
      },
      headers: { "Content-Type": "application/json" },
      params: { user_email, record_sys_id },
    })

    if (!response.data) {
      return res.status(404).json({ error: "No response data received from ServiceNow" })
    }

    res.json(response.data)
  } catch (error) {
    console.error("Error in /update_job_disposition:", error.message)
    res.status(error.response?.status || 500).json({ error: "Failed to update job assignment" })
  }
}

// 5. Get available work types
const getWorkTypes = async (req, res) => {
  try {
    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.WORK_TYPES_PATH, {})

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    res.json(serviceNowResponse)
  } catch (error) {
    console.error("Error in /work_types:", error.message)
    res.status(500).json({ error: "Failed to fetch work types" })
  }
}

const getJobAssignmentState = async (req, res) => {
  try {
    const { user_email, record_sys_id } = req.query
    if (!user_email || !record_sys_id)
      return res.status(400).json({
        error: "Missing required parameters: user_email and/or record_sys_id",
      })

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.GET_SPECIFIC_ASSIGNMENT_PATH, {
      user_email,
      record_sys_id,
    })

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    res.json(serviceNowResponse.result.job_assignments.map(job => ({
      state: job.u_state?.displayValue || job.u_state?.value || null
    })));  } catch (error) {
    console.error("Error in /job_dispositions/get:", error.message)
    res.status(500).json({ error: "Failed to fetch specific job assignment" })
  }
}

module.exports = {
  getSpecificJobAssignment,
  getAllJobAssignments,
  updateJobAssignment,
  getWorkTypes,
  getJobAssignmentState
}

