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
      return res
        .status(400)
        .json({ error: "Missing required parameter: idToken" });
    }

    // Verify Microsoft token and extract user info
    const verifiedToken = await verifyMicrosoftToken(idToken);
    const user_email = verifiedToken.unique_name || verifiedToken.upn; // Extract email
    console.log("the user email is " + user_email);
    if (!user_email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    const serviceNowResponse = await getDataFromServiceNow(
      ENDPOINTS.AUTH_PATH,
      { user_email }
    );

    console.log(
      "ServiceNow Response:",
      JSON.stringify(serviceNowResponse, null, 2)
    ); // Debugging

    if (!serviceNowResponse || !serviceNowResponse.result) {
      return res
        .status(500)
        .json({ error: "Invalid response from ServiceNow" });
    }

    // Extract accessible_apps correctly
    const accessibleApps = Array.isArray(
      serviceNowResponse.result.accessible_apps
    )
      ? serviceNowResponse.result.accessible_apps
      : [];

    console.log("Extracted accessibleApps:", accessibleApps);

    // Ensure accessible_apps is a valid array before using it
    if (!accessibleApps.length) {
      console.error("No accessible apps found for the user.");
      return res
        .status(403)
        .json({ error: "User has no accessible applications" });
    }

    // Generate new JWT payload for your API
    const jwtPayload = {
      user_email: Array.isArray(serviceNowResponse.result.user_email)
        ? serviceNowResponse.result.user_email[0] // Extract first email if it's an array
        : serviceNowResponse.result.user_email,
      accessible_apps: accessibleApps,
      name: verifiedToken.name, // Add user's name from Microsoft token
      require_username_pass: serviceNowResponse.result.require_username_pass
    };

    // Generate and return your API token
    const token = generateToken(jwtPayload);
    res.json({ result: { serviceNowData: serviceNowResponse.result, token } });
  } catch (error) {
    console.error("Error in authenticateUser:", error.message);
    res.status(401).json({ success: false, error: error.message });
  }
};

module.exports = {
  authenticateUser,
};
