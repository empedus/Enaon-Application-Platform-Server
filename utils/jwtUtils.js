const jwt = require("jsonwebtoken")

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = {
  generateToken,
  verifyToken,
}

