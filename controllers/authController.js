const { getDataFromServiceNow } = require("../services/serviceNowService")
const { generateToken } = require("../utils/jwtUtils")
const ENDPOINTS = require("../utils/endpoints")

// 1. Authenticate user and generate JWT token
const authenticateUser = async (req, res) => {
  try {
    const { user_email } = req.query
    if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" })

    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.AUTH_PATH, { user_email })

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    const accessibleApps = serviceNowResponse.result.accessible_apps
    if (!Array.isArray(accessibleApps)) {
      return res.status(500).json({ error: "Accessible apps should be an array" })
    }

    const jwtPayload = {
      user_email: serviceNowResponse.result.user_email[0],
      accessible_apps: accessibleApps,
    }

    const token = generateToken(jwtPayload)
    res.json({ result: { serviceNowData: serviceNowResponse.result, token } })
  } catch (error) {
    console.error("Error in /user_auth:", error.message)
    res.status(500).json({ error: "Failed to authenticate user" })
  }
}

module.exports = {
  authenticateUser,
}

