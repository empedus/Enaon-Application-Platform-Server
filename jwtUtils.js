const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Preferably use a consistent secret key stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key'; // Use your own environment variable for production

// Function to generate a JWT token with a payload
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Function to verify a JWT token and handle errors appropriately
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
