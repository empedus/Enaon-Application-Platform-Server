// const { getDataFromServiceNow } = require("../services/serviceNowService")
// const { generateToken } = require("../utils/jwtUtils")
// const ENDPOINTS = require("../utils/endpoints")

// // 1. Authenticate user and generate JWT token
// const authenticateUser = async (req, res) => {
//   try {
//     const { user_email } = req.query
//     if (!user_email) return res.status(400).json({ error: "Missing required parameter: user_email" })

//     const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.AUTH_PATH, { user_email })

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     const accessibleApps = serviceNowResponse.result.accessible_apps
//     if (!Array.isArray(accessibleApps)) {
//       return res.status(500).json({ error: "Accessible apps should be an array" })
//     }

//     const jwtPayload = {
//       user_email: serviceNowResponse.result.user_email[0],
//       accessible_apps: accessibleApps,
//     }

//     const token = generateToken(jwtPayload)
//     res.json({ result: { serviceNowData: serviceNowResponse.result, token } })
//   } catch (error) {
//     console.error("Error in /user_auth:", error.message)
//     res.status(500).json({ error: "Failed to authenticate user" })
//   }
// }

// module.exports = {
//   authenticateUser,
// }


const { verifyMicrosoftToken } = require("../utils/jwtUtils");
const { getDataFromServiceNow } = require("../services/serviceNowService");
const { generateToken } = require("../utils/jwtUtils");
const ENDPOINTS = require("../utils/endpoints");

const authenticateUser = async (req, res) => {
  try {
    const { idToken } = req.body; // Get the Azure ID token

    if (!idToken) {
      return res.status(400).json({ error: "Missing required parameter: idToken" });
    }

    // Verify Microsoft token and extract user info
    const verifiedToken = await verifyMicrosoftToken(idToken);
    const user_email = verifiedToken.unique_name || verifiedToken.upn; // Extract email
    console.log('the user email is ' + user_email)
    if (!user_email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    // Fetch user data from ServiceNow
    const serviceNowResponse = await getDataFromServiceNow(ENDPOINTS.AUTH_PATH, { user_email });

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    const accessibleApps = serviceNowResponse.result.accessible_apps;
    if (!Array.isArray(accessibleApps)) {
      return res.status(500).json({ error: "Accessible apps should be an array" });
    }

    // Generate new JWT payload for your API
    const jwtPayload = {
      user_email,
      accessible_apps,
      name: verifiedToken.name, // Add user's name from Microsoft token
    };

    // Generate and return your API token
    const token = generateToken(jwtPayload);
    res.json({ result: { serviceNowData: serviceNowResponse.result, token } });

  } catch (error) {
    console.error("Error in authenticateUser:", error.message);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};

module.exports = {
  authenticateUser,
};

