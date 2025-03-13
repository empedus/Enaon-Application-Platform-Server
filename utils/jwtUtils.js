const jwt = require("jsonwebtoken");
const { JwksClient } = require("jwks-rsa");
require("dotenv").config(); // Load environment variables

// JWT secret key from environment variables

const JWT_SECRET = process.env.JWT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const JWKS_URI = process.env.JWKS_URI.replace("${MICROSOFT_TENANT_ID}", MICROSOFT_TENANT_ID);
const AUDIENCE = process.env.AUDIENCE;
const ISSUER = process.env.ISSUER.replace("${MICROSOFT_TENANT_ID}", MICROSOFT_TENANT_ID);

// Ensure required variables are set
if (!JWT_SECRET || !MICROSOFT_TENANT_ID || !JWKS_URI || !AUDIENCE || !ISSUER) {
  throw new Error("Missing required environment variables!");
}

// JWKS client for Microsoft token verification
const jwksClient = new JwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 1 day
});

// Generate JWT token
const generateToken = (payload) => {
  console.log("Generating token with payload: ", payload);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  console.log("Generated JWT Token: ", token);
  return token;
};

// Verify JWT token
const verifyToken = (token) => {
  console.log("Verifying JWT Token: ", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Verified JWT Token: ", decoded);
    return decoded;
  } catch (err) {
    console.error("Error verifying JWT token: ", err);
    throw err;
  }
};

// Verify Microsoft token
const verifyMicrosoftToken = async (token) => {
  try {
    // Decode the token header to extract the key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true }).header;
    if (!decodedHeader || !decodedHeader.kid) {
      throw new Error("Token header does not contain a valid 'kid'");
    }

    console.log("Decoded Header: ", decodedHeader);
    const kid = decodedHeader.kid; // Get the key ID from the token header
    console.log("Key ID (kid) from header: ", kid);

    // Fetch the signing key from Microsoft's JWKS endpoint
    console.log("Fetching signing key from JWKS URI: ", JWKS_URI);
    const key = await jwksClient.getSigningKey(kid);
    if (!key) {
      throw new Error(`Signing key with kid ${kid} not found`);
    }

    console.log("Fetched Key: ", key);
    const signingKey = key.getPublicKey();
    console.log("Extracted Public Signing Key: ", signingKey);

    // Verify the token using the fetched signing key
    console.log("Verifying token with signing key...");
    const decodedToken = jwt.verify(token, signingKey, {
      audience: AUDIENCE, // Loaded from .env
      issuer: ISSUER, // Loaded from .env
    });

    console.log("Token successfully verified: ", decodedToken);
    return decodedToken;
  } catch (error) {
    console.error("Error during verification process:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error: ", error.message);
    } else {
      console.error("Non-JWT Error: ", error.message);
    }
    throw error;
  }
};

// Export functions
module.exports = {
  generateToken,
  verifyToken,
  verifyMicrosoftToken,
};
