// const { fetchDataFromNavisionThrowServiceNow } = require("../services/navisionFetchService.js");
// const ENDPOINTS = require("../utils/endpoints");/**
//  * Function to scan barcodes
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const barcodeScan = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { barcode } = req.body

//     if (!barcode) {
//       return res.status(400).json({ error: "Barcode is required" })
//     }

//     // Log the endpoint path to debug
//     //console.log("BARCODE_SCAN path:", ENDPOINTS.BARCODE_SCAN);

//     // Pass the explicit path string instead of relying on ENDPOINTS constant
//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.BARCODE_SCAN, // Use the explicit path
//       { barcode },
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /BarcodeScan:", error.message)
//     res.status(500).json({ error: "Failed to scan barcode" })
//   }
// }

// /**
//  * Function to get connection pressure
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getConnectionPressure = async (req, res) => {
//   try {
//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_CONNECTION_PRESSURE,
//       {}, // Empty object as requestBody
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetConnectionPressure:", error.message)
//     res.status(500).json({ error: "Failed to fetch connection pressure data" })
//   }
// }

// /**
//  * Function to get location information
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getLocation = async (req, res) => {
//   try {
//     // const requestBody = {
//     //   codeUnitName: "Integration",
//     //   functionName: "GetLocation",
//     //   paramArgs: []
//     // }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_LOCATION,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetLocation:", error.message)
//     res.status(500).json({ error: "Failed to fetch location data" })
//   }
// }

// /**
//  * Function to get meter worksheet comments
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getMeterWorkSheetComments = async (req, res) => {
//   try {
//     const requestBody = {
//       codeUnitName: "Integration",
//       functionName: "GetMeterWorkSheetComments",
//       paramArgs: []
//     }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_METER_WORKSHEET_COMMENTS,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetMeterWorkSheetComments:", error.message)
//     res.status(500).json({ error: "Failed to fetch meter worksheet comments" })
//   }
// }

// /**
//  * Function to get physical location information
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getPhysicalLocation = async (req, res) => {
//   try {
//     const requestBody = {
//       codeUnitName: "Integration",
//       functionName: "GetPhysicalLocation",
//       paramArgs: []
//     }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_PHYSICAL_LOCATION,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetPhysicalLocation:", error.message)
//     res.status(500).json({ error: "Failed to fetch physical location data" })
//   }
// }

// /**
//  * Function to get work type results
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getWorkTypeResult = async (req, res) => {
//   try {
//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_WORK_TYPE_RESULT,
//       {}, // Empty object for GET request
//       'get'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetWorkTypeResult:", error.message)
//     res.status(500).json({ error: "Failed to fetch work type results" })
//   }
// }

// /**
//  * Function to get manufacturers
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getManufacturers = async (req, res) => {
//   try {
//     const requestBody = {
//       codeUnitName: "Integration",
//       functionName: "GetManufacturers",
//       paramArgs: []
//     }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_MANUFACTURERS,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /Manufacturers:", error.message)
//     res.status(500).json({ error: "Failed to fetch manufacturers" })
//   }
// }

// /**
//  * Function to get consumption purpose
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getConsumptionPurpose = async (req, res) => {
//   try {
//     const requestBody = {
//       codeUnitName: "Integration",
//       functionName: "GetConsumptionPurpose",
//       paramArgs: []
//     }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_CONSUMPTION_PURPOSE,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetConsumptionPurpose:", error.message)
//     res.status(500).json({ error: "Failed to fetch consumption purpose data" })
//   }
// }

// /**
//  * Function to get disconnection methods
//  * @param {object} req - Express request object
//  * @param {object} res - Express response object
//  */
// const getDisconnectionMethods = async (req, res) => {
//   try {
//     const requestBody = {
//       codeUnitName: "Integration",
//       functionName: "GetDisconectionMethods",
//       paramArgs: []
//     }

//     const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
//       ENDPOINTS.GET_DISCONNECTION_METHODS,
//       requestBody,
//       'post'
//     )

//     if (serviceNowResponse.error) {
//       return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error })
//     }

//     // Simply return the response from ServiceNow
//     res.json(serviceNowResponse)
//   } catch (error) {
//     console.error("Error in /GetDisconectionMethods:", error.message)
//     res.status(500).json({ error: "Failed to fetch disconnection methods" })
//   }
// }

// // Export all controller functions
// module.exports = {
//   barcodeScan,
//   getConnectionPressure,
//   getLocation,
//   getMeterWorkSheetComments,
//   getPhysicalLocation,
//   getWorkTypeResult,
//   getManufacturers,
//   getConsumptionPurpose,
//   getDisconnectionMethods
// }

const {
  fetchDataFromNavisionThrowServiceNow,
  getRecordAttachmentsAndConvert,
} = require("../services/navisionFetchService.js");
const ENDPOINTS = require("../utils/endpoints");
const { v4: uuidv4 } = require('uuid');

/**
 * Function to scan barcodes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const barcodeScan = async (req, res) => {
  try {
    console.log(req.body);
    // Get barcode from request body or query parameters for flexibility
    const barcode = req.body.barcode || req.query.barcode;

    if (!barcode) {
      return res.status(400).json({ error: "Barcode is required" });
    }

    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.BARCODE_SCAN,
      { barcode }
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /BarcodeScan:", error.message);
    res.status(500).json({ error: "Failed to scan barcode" });
  }
};

/**
 * Function to get connection pressure based on user email
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getConnectionPressure = async (req, res) => {
  try {
    // Extract user_email from the query params
    const { user_email } = req.query;
    if (!user_email) {
      return res.status(400).json({ error: "Missing user_email parameter" });
    }
    console.log("User email:", user_email);

    // Send user_email as query parameter to the service
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_CONNECTION_PRESSURE,
      {}, // No request body
      'post', // Explicitly provide method
      false, // No need for request body
      { user_email } // Include user_email in query parameters
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetConnectionPressure:", error.message);
    res.status(500).json({ error: "Failed to fetch connection pressure data" });
  }
};

/**
 * Function to get location information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getLocation = async (req, res) => {
  try {
    // Extract user_email from the query params
    const { user_email } = req.query;
    if (!user_email) {
      return res.status(400).json({ error: "Missing user_email parameter" });
    }
    console.log("User email:", user_email);

    // Send user_email as query parameter to the service
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_LOCATION,
      {}, // No request body
      'post', // Explicitly provide method
      false, // No need for request body
      { user_email } // Include user_email in query parameters
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetLocation:", error.message);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
};





/**
 * Function to get meter worksheet comments
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMeterWorkSheetComments = async (req, res) => {
  try {
    const { user_email } = req.query;  // Extract user_email from query params

    if (!user_email) {
      return res.status(400).json({ error: "Missing user_email query parameter" });
    }

    console.log("User email is " + user_email);

    // Assuming you need to pass the user_email as part of the query parameters
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_METER_WORKSHEET_COMMENTS,
      {}, // No request body needed now
      'post', // Use POST method
      false, // Not sending the request body
      { user_email } // Pass user_email as query param
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetMeterWorkSheetComments:", error.message);
    res.status(500).json({ error: "Failed to fetch meter worksheet comments" });
  }
};


/**
 * Function to get physical location information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getPhysicalLocation = async (req, res) => {
  try {
    const { user_email } = req.query;
    console.log("User is " + user_email)
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_PHYSICAL_LOCATION,
      {}, // No body
      'post', // Explicitly provide method
      false,
      { user_email } // additionalQueryParams
    
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetPhysicalLocation:", error.message);
    res.status(500).json({ error: "Failed to fetch physical location data" });
  }
};

/**
 * Function to get worktyperesult information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getWorkTypeResult = async (req, res) => {
  try {
    const { user_email } = req.query;
    console.log("User is " + user_email);

    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_WORK_TYPE_RESULT,
      {}, // No body data
      'post', // Explicitly provide method
      false, // No additional body content
      { user_email } // additional query parameter
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetWorkTypeResult:", error.message);
    res.status(500).json({ error: "Failed to fetch work type results" });
  }
};


/**
 * Function to get manufacturers
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getManufacturers = async (req, res) => {
  try {
    // Extract user_email from the query parameters
    const { user_email } = req.query;

    // Check if the user_email is provided
    if (!user_email) {
      return res.status(400).json({ error: "User email is required" });
    }

    console.log("User email: " + user_email);

    // Send the user_email as a query parameter
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_MANUFACTURERS,
      {}, // No body needed
      'post', // Use GET method (since no body is being passed)
      false, // No body is needed
      { user_email } // Add the user_email query parameter to the request
    );

    // Check for errors in the response
    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    // Send the successful response
    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /Manufacturers:", error.message);
    res.status(500).json({ error: "Failed to fetch manufacturers" });
  }
};




/**
 * Function to get workperson
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getWorkperson = async (req, res) => {
  try {
    const requestBody = {
      CodeUnitName: "Integration",
      CodeUnitMethod: "GetWorkperson",
      CodeUnitMethodParameters: ["symonitoring"],
    };

    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_WORKPERSON,
      requestBody
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /workperson:", error.message);
    res.status(500).json({ error: "Failed to fetch workperson" });
  }
};



/**
 * Function to get consumption purpose
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getConsumptionPurpose = async (req, res) => {
  try {
    const { user_email } = req.query;
    
    if (!user_email) {
      return res.status(400).json({ error: "Missing user_email parameter" });
    }
    
    console.log("User email: " + user_email);

    // Call the service to fetch the data from Navision with user_email as query parameter
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_CONSUMPTION_PURPOSE,
      {}, // No body, since it's just query params
      'post', // Explicitly provide method as 'post'
      false,
      { user_email } // Sending user_email as additional query param
    );

    // If the response has an error, return the error
    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    // If the request is successful, return the response from the service
    res.json(serviceNowResponse);
    
  } catch (error) {
    console.error("Error in /GetConsumptionPurpose:", error.message);
    res.status(500).json({ error: "Failed to fetch consumption purpose data" });
  }
};


/**
 * Function to get disconnectionMethods information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDisconnectionMethods = async (req, res) => {
  try {
    const { user_email } = req.query;
    console.log("User is " + user_email)
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_DISCONNECTION_METHODS,
      {}, // No body
      'post', // Explicitly provide method
      false,
      { user_email } // additionalQueryParams
    
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetDisconectionMethods:", error.message);
    res.status(500).json({ error: "Failed to fetch disconnection Methods data" });
  }
};

/**
 * Function to get Disconnection photos
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDisconnectionPhotos = async (req, res) => {
  try {
    // Get ikasp from query parameters
    const ikasp = req.query.ikasp;

    if (!ikasp) {
      return res.status(400).json({ error: "IKASP parameter is required" });
    }

    // Use isQueryParam=true to ensure ikasp is sent as a query parameter
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_DISCONNECTION_PHOTOS,
      { ikasp },
      "get", // Use GET method
      true // Force query parameters
    );

    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetDisconnectionPhotos:", error.message);
    res.status(500).json({ error: "Failed to fetch disconnection photos" });
  }
};

/**
 * Function to upload a document with metadata to ServiceNow
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const uploadDocument = async (req, res) => {
  try {
    // Destructure document and meterFolder from request body
    const { document, meterFolder } = req.body;

    // Check if document and meterFolder are provided
    if (
      !document ||
      !document.FileName ||
      !document.DocumentBase64Data ||
      !meterFolder
    ) {
      return res
        .status(400)
        .json({ error: "Document and meterFolder are required" });
    }

    // Construct the body data for the ServiceNow request
    const requestBody = {
      document: {
        FileName: document.FileName,
        DocumentBase64Data: document.DocumentBase64Data,
      },
      meterFolder: meterFolder,
    };

    // Call ServiceNow API to upload the document
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.UPLOAD_DOCUMENT, // Assuming this is the correct endpoint for uploading documents
      requestBody, // Send the constructed body data
      "post", // Use POST method to send body data
      false // Don't force query parameters, as we're sending a body
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res
        .status(serviceNowResponse.status || 500)
        .json({ error: serviceNowResponse.error });
    }

    // Return the response from ServiceNow
    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /UploadDocument:", error.message);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

/**
 * Function to deactivate a meter
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

const deactivateMeter = async (req, res) => {
  try {
    // Get user_email and record_Sys_id from query parameters
    const userEmail = req.query.user_email;
    const recordSysId = req.query.record_sys_id;

    // Validate query parameters
    if (!userEmail || !recordSysId) {
      return res.status(400).json({
        error:
          "Missing required query parameters: user_email and record_sys_id are required",
      });
    }

    // Step 1: Get attachments and convert PDF to Word
    const attachmentsResult = await getRecordAttachmentsAndConvert(recordSysId);

    // If there was an error getting or converting attachments, continue with the deactivation
    // but include the error in the response
    let attachmentsError = null;
    let convertedAttachments = null;
    let originalAttachments = null;

    if (!attachmentsResult.success) {
      attachmentsError = attachmentsResult.error;
      console.warn(`Warning: ${attachmentsError}`);
      // We'll continue with the deactivation process even if attachment conversion fails
    } else {
      convertedAttachments = attachmentsResult.data.convertedAttachments;
      originalAttachments = attachmentsResult.data.originalAttachments;
    }

    // Step 2: Get the request body for deactivating the meter
    // Clone the paramArgs array to avoid modifying the original request
    const paramArgs = req.body.paramArgs ? [...req.body.paramArgs] : [];
    
    // Validate that paramArgs exists and is an array
    if (!paramArgs || !Array.isArray(paramArgs)) {
      return res
        .status(400)
        .json({ error: "paramArgs is required and must be an array" });
    }
    
    // Generate a UUID
    const WSTrnId = uuidv4();
    console.log("Generated UUID:", WSTrnId);
    
    // Add the UUID after the 16th element (index 15)
    // The position is fixed at index 16 (after the 16th element)
    const insertPosition = 16;
    
    // Insert the UUID at the specified position
    // If the array is shorter than the position, the UUID will be added at the end
    if (paramArgs.length >= insertPosition) {
      paramArgs.splice(insertPosition, 0, WSTrnId);
    } else {
      // If the array is shorter than expected, append the UUID
      paramArgs.push(WSTrnId);
      console.warn(`Warning: paramArgs array is shorter than expected (${paramArgs.length} < ${insertPosition}). UUID added at the end.`);
    }

    const requestBody = {
      codeUnitName: "Integration",
      functionName: "DeactivateMeter",
      paramArgs: paramArgs,
    };

    // Print the request body to console for debugging
    console.log("Request body for ServiceNow API:", JSON.stringify(requestBody, null, 2));

    // Step 3: Call ServiceNow API to deactivate the meter with query parameters
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.DEACTIVATE_METER,
      requestBody,
      "post",
      false,
      { user_email: userEmail, record_sys_id: recordSysId }
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({
        error: serviceNowResponse.error,
        attachmentsError: attachmentsError,
        convertedAttachments: convertedAttachments,
      });
    }

    // Step 4: Return the response from ServiceNow along with the converted attachments
    res.json({
      ...serviceNowResponse,
      attachmentsError: attachmentsError,
      convertedAttachments: convertedAttachments,
      originalAttachments: originalAttachments,
    });
  } catch (error) {
    console.error("Error in /DeactivateMeter:", error.message);
    res.status(500).json({ error: "Failed to deactivate meter" });
  }
};



/**
 * Function to deactivate a meter
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const activateMeter = async (req, res) =>{
  try {
    // Get user_email and record_Sys_id from query parameters
    const userEmail = req.query.user_email;
    const recordSysId = req.query.record_sys_id;

    // Validate query parameters
    if (!userEmail || !recordSysId) {
      return res.status(400).json({
        error:
          "Missing required query parameters: user_email and record_sys_id are required",
      });
    }

    // Step 1: Get attachments and convert PDF to Word
    const attachmentsResult = await getRecordAttachmentsAndConvert(recordSysId);

    // If there was an error getting or converting attachments, continue with the deactivation
    // but include the error in the response
    let attachmentsError = null;
    let convertedAttachments = null;
    let originalAttachments = null;

    if (!attachmentsResult.success) {
      attachmentsError = attachmentsResult.error;
      console.warn(`Warning: ${attachmentsError}`);
      // We'll continue with the deactivation process even if attachment conversion fails
    } else {
      convertedAttachments = attachmentsResult.data.convertedAttachments;
      originalAttachments = attachmentsResult.data.originalAttachments;
    }

    // Step 2: Get the request body for deactivating the meter
    // Clone the paramArgs array to avoid modifying the original request
    const paramArgs = req.body.paramArgs ? [...req.body.paramArgs] : [];
    
    // Validate that paramArgs exists and is an array
    if (!paramArgs || !Array.isArray(paramArgs)) {
      return res
        .status(400)
        .json({ error: "paramArgs is required and must be an array" });
    }
    
    // Generate a UUID
    const WSTrnId = uuidv4();
    console.log("Generated UUID:", WSTrnId);
    
    // Add the UUID after the 16th element (index 15)
    // The position is fixed at index 24 (after the 16th element)
    const insertPosition = 24;
    
    // Insert the UUID at the specified position
    // If the array is shorter than the position, the UUID will be added at the end
    if (paramArgs.length >= insertPosition) {
      paramArgs.splice(insertPosition, 0, WSTrnId);
    } else {
      // If the array is shorter than expected, append the UUID
      paramArgs.push(WSTrnId);
      console.warn(`Warning: paramArgs array is shorter than expected (${paramArgs.length} < ${insertPosition}). UUID added at the end.`);
    }

    const requestBody = {
      codeUnitName: "Integration",
      functionName: "ActivateMeter",
      paramArgs: paramArgs,
    };

    // Print the request body to console for debugging
    console.log("Request body for ServiceNow API:", JSON.stringify(requestBody, null, 2));

    // Step 3: Call ServiceNow API to deactivate the meter with query parameters
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.ACTIVATE_METER,
      requestBody,
      "post",
      false,
      { user_email: userEmail, record_sys_id: recordSysId }
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({
        error: serviceNowResponse.error,
        attachmentsError: attachmentsError,
        convertedAttachments: convertedAttachments,
      });
    }

    // Step 4: Return the response from ServiceNow along with the converted attachments
    res.json({
      ...serviceNowResponse,
      attachmentsError: attachmentsError,
      convertedAttachments: convertedAttachments,
      originalAttachments: originalAttachments,
    });
  } catch (error) {
    console.error("Error in /ActivateMeter:", error.message);
    res.status(500).json({ error: "Failed to activate meter" });
  }
}

/**
 * Function to deactivate a meter
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const reactivateMeter = async (req, res) =>{
  try {
    // Get user_email and record_Sys_id from query parameters
    const userEmail = req.query.user_email;
    const recordSysId = req.query.record_sys_id;

    // Validate query parameters
    if (!userEmail || !recordSysId) {
      return res.status(400).json({
        error:
          "Missing required query parameters: user_email and record_sys_id are required",
      });
    }

    // Step 1: Get attachments and convert PDF to Word
    const attachmentsResult = await getRecordAttachmentsAndConvert(recordSysId);

    // If there was an error getting or converting attachments, continue with the deactivation
    // but include the error in the response
    let attachmentsError = null;
    let convertedAttachments = null;
    let originalAttachments = null;

    if (!attachmentsResult.success) {
      attachmentsError = attachmentsResult.error;
      console.warn(`Warning: ${attachmentsError}`);
      // We'll continue with the deactivation process even if attachment conversion fails
    } else {
      convertedAttachments = attachmentsResult.data.convertedAttachments;
      originalAttachments = attachmentsResult.data.originalAttachments;
    }

    // Step 2: Get the request body for deactivating the meter
    // Clone the paramArgs array to avoid modifying the original request
    const paramArgs = req.body.paramArgs ? [...req.body.paramArgs] : [];
    
    // Validate that paramArgs exists and is an array
    if (!paramArgs || !Array.isArray(paramArgs)) {
      return res
        .status(400)
        .json({ error: "paramArgs is required and must be an array" });
    }
    
    // Generate a UUID
    const WSTrnId = uuidv4();
    console.log("Generated UUID:", WSTrnId);
    
    // Add the UUID after the 16th element (index 15)
    // The position is fixed at index 24 (after the 16th element)
    const insertPosition = 16;
    
    // Insert the UUID at the specified position
    // If the array is shorter than the position, the UUID will be added at the end
    if (paramArgs.length >= insertPosition) {
      paramArgs.splice(insertPosition, 0, WSTrnId);
    } else {
      // If the array is shorter than expected, append the UUID
      paramArgs.push(WSTrnId);
      console.warn(`Warning: paramArgs array is shorter than expected (${paramArgs.length} < ${insertPosition}). UUID added at the end.`);
    }

    const requestBody = {
      codeUnitName: "Integration",
      functionName: "ReactivateMeter",
      paramArgs: paramArgs,
    };

    // Print the request body to console for debugging
    console.log("Request body for ServiceNow API:", JSON.stringify(requestBody, null, 2));

    // Step 3: Call ServiceNow API to deactivate the meter with query parameters
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.REACTIVATE_METER,
      requestBody,
      "post",
      false,
      { user_email: userEmail, record_sys_id: recordSysId }
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({
        error: serviceNowResponse.error,
        attachmentsError: attachmentsError,
        convertedAttachments: convertedAttachments,
      });
    }

    // Step 4: Return the response from ServiceNow along with the converted attachments
    res.json({
      ...serviceNowResponse,
      attachmentsError: attachmentsError,
      convertedAttachments: convertedAttachments,
      originalAttachments: originalAttachments,
    });
  } catch (error) {
    console.error("Error in /ActivateMeter:", error.message);
    res.status(500).json({ error: "Failed to activate meter" });
  }
}



/**
 * Function to deactivate a meter
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const replaceMeter = async (req, res) =>{
  try {
    // Get user_email and record_Sys_id from query parameters
    const userEmail = req.query.user_email;
    const recordSysId = req.query.record_sys_id;

    // Validate query parameters
    if (!userEmail || !recordSysId) {
      return res.status(400).json({
        error:
          "Missing required query parameters: user_email and record_sys_id are required",
      });
    }

    // Step 1: Get attachments and convert PDF to Word
    const attachmentsResult = await getRecordAttachmentsAndConvert(recordSysId);

    // If there was an error getting or converting attachments, continue with the deactivation
    // but include the error in the response
    let attachmentsError = null;
    let convertedAttachments = null;
    let originalAttachments = null;

    if (!attachmentsResult.success) {
      attachmentsError = attachmentsResult.error;
      console.warn(`Warning: ${attachmentsError}`);
      // We'll continue with the deactivation process even if attachment conversion fails
    } else {
      convertedAttachments = attachmentsResult.data.convertedAttachments;
      originalAttachments = attachmentsResult.data.originalAttachments;
    }

    // Step 2: Get the request body for deactivating the meter
    // Clone the paramArgs array to avoid modifying the original request
    const paramArgs = req.body.paramArgs ? [...req.body.paramArgs] : [];
    
    // Validate that paramArgs exists and is an array
    if (!paramArgs || !Array.isArray(paramArgs)) {
      return res
        .status(400)
        .json({ error: "paramArgs is required and must be an array" });
    }
    
    // Generate a UUID
    const WSTrnId = uuidv4();
    console.log("Generated UUID:", WSTrnId);
    
    // Add the UUID after the 16th element (index 15)
    // The position is fixed at index 23 (after the 16th element)
    const insertPosition = 23;
    
    // Insert the UUID at the specified position
    // If the array is shorter than the position, the UUID will be added at the end
    if (paramArgs.length >= insertPosition) {
      paramArgs.splice(insertPosition, 0, WSTrnId);
    } else {
      // If the array is shorter than expected, append the UUID
      paramArgs.push(WSTrnId);
      console.warn(`Warning: paramArgs array is shorter than expected (${paramArgs.length} < ${insertPosition}). UUID added at the end.`);
    }

    const requestBody = {
      codeUnitName: "Integration",
      functionName: "ReplaceMeter",
      paramArgs: paramArgs,
    };

    // Print the request body to console for debugging
    console.log("Request body for ServiceNow API:", JSON.stringify(requestBody, null, 2));

    // Step 3: Call ServiceNow API to deactivate the meter with query parameters
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.REPLACE_METER,
      requestBody,
      "post",
      false,
      { user_email: userEmail, record_sys_id: recordSysId }
    );

    // If ServiceNow returns an error, return it as a response
    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({
        error: serviceNowResponse.error,
        attachmentsError: attachmentsError,
        convertedAttachments: convertedAttachments,
      });
    }

    // Step 4: Return the response from ServiceNow along with the converted attachments
    res.json({
      ...serviceNowResponse,
      attachmentsError: attachmentsError,
      convertedAttachments: convertedAttachments,
      originalAttachments: originalAttachments,
    });
  } catch (error) {
    console.error("Error in /ActivateMeter:", error.message);
    res.status(500).json({ error: "Failed to activate meter" });
  }
}

// Export all controller functions
module.exports = {
  uploadDocument,
  barcodeScan,
  getConnectionPressure,
  getLocation,
  getMeterWorkSheetComments,
  getPhysicalLocation,
  getWorkTypeResult,
  getManufacturers,
  getConsumptionPurpose,
  getDisconnectionMethods,
  getDisconnectionPhotos,
  deactivateMeter,
  activateMeter,
  reactivateMeter,
  replaceMeter,
  getWorkperson
};
