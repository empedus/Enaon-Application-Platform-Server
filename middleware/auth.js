const { verifyToken } = require("../utils/jwtUtils")

// Auth function for Meters App required
const authorizeMeterApp = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "Authorization token is required" })
    }

    const decoded = verifyToken(token)
    const { accessible_apps } = decoded

    if (!accessible_apps || !accessible_apps.includes("Meters App")) {
      return res.status(403).json({
        error: "Access denied. 'Meters App' is required in accessible apps.",
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error("Token verification failed:", error.message)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

// Auth function for Meters App or Maintenance App required
const authorizeMeterAppOrMaintenanceApp = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "Authorization token is required" })
    }

    const decoded = verifyToken(token)
    const { accessible_apps } = decoded

    // Check if the user has access to either "Meters App" or "Maintenance App"
    if (!accessible_apps || (!accessible_apps.includes("Meters App") && !accessible_apps.includes("Maintenance App"))) {
      return res.status(403).json({
        error: "Access denied. 'Meters App' or 'Maintenance App' is required in accessible apps.",
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error("Token verification failed:", error.message)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

module.exports = {
  authorizeMeterApp,
  authorizeMeterAppOrMaintenanceApp,
}

