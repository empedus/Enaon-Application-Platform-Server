const { getDataFromServiceNow } = require("../services/serviceNowService")
const ENDPOINTS = require("../utils/endpoints")

// 6. Get Available Vehicles
const getVehicles = async (req, res) => {
  try {
    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.VEHICLES_PATH, {})

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
    }

    res.json(serviceNowResponse)
  } catch (error) {
    console.error("Error in /vehicles:", error.message)
    res.status(500).json({ error: "Failed to fetch vehicles" })
  }
}

module.exports = {
  getVehicles,
}

