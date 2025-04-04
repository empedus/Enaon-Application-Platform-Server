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




const { fetchDataFromNavisionThrowServiceNow } = require("../services/navisionFetchService.js");
const ENDPOINTS = require("../utils/endpoints");

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
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /BarcodeScan:", error.message);
    res.status(500).json({ error: "Failed to scan barcode" });
  }
}

/**
 * Function to get connection pressure
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getConnectionPressure = async (req, res) => {
  try {
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_CONNECTION_PRESSURE
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetConnectionPressure:", error.message);
    res.status(500).json({ error: "Failed to fetch connection pressure data" });
  }
}

/**
 * Function to get location information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getLocation = async (req, res) => {
  try {
    // Fixed: Uncommented the requestBody or removed it if not needed
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetLocation",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_LOCATION, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetLocation:", error.message);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
}

/**
 * Function to get meter worksheet comments
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMeterWorkSheetComments = async (req, res) => {
  try {
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetMeterWorkSheetComments",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_METER_WORKSHEET_COMMENTS, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetMeterWorkSheetComments:", error.message);
    res.status(500).json({ error: "Failed to fetch meter worksheet comments" });
  }
}

/**
 * Function to get physical location information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getPhysicalLocation = async (req, res) => {
  try {
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetPhysicalLocation",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_PHYSICAL_LOCATION, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetPhysicalLocation:", error.message);
    res.status(500).json({ error: "Failed to fetch physical location data" });
  }
}

/**
 * Function to get work type results
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getWorkTypeResult = async (req, res) => {
  try {
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_WORK_TYPE_RESULT, 
      {}, 
      'post' 
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetWorkTypeResult:", error.message);
    res.status(500).json({ error: "Failed to fetch work type results" });
  }
}

/**
 * Function to get manufacturers
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getManufacturers = async (req, res) => {
  try {
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetManufacturers",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_MANUFACTURERS, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /Manufacturers:", error.message);
    res.status(500).json({ error: "Failed to fetch manufacturers" });
  }
}

/**
 * Function to get consumption purpose
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getConsumptionPurpose = async (req, res) => {
  try {
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetConsumptionPurpose",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_CONSUMPTION_PURPOSE, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetConsumptionPurpose:", error.message);
    res.status(500).json({ error: "Failed to fetch consumption purpose data" });
  }
}

/**
 * Function to get disconnection methods
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDisconnectionMethods = async (req, res) => {
  try {
    const requestBody = {
      codeUnitName: "Integration",
      functionName: "GetDisconectionMethods",
      paramArgs: []
    };
    
    const serviceNowResponse = await fetchDataFromNavisionThrowServiceNow(
      ENDPOINTS.GET_DISCONNECTION_METHODS, 
      requestBody
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetDisconectionMethods:", error.message);
    res.status(500).json({ error: "Failed to fetch disconnection methods" });
  }
}


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
      'get',  // Use GET method
      true    // Force query parameters
    );

    if (serviceNowResponse.error) {
      return res.status(serviceNowResponse.status || 500).json({ error: serviceNowResponse.error });
    }

    res.json(serviceNowResponse);
  } catch (error) {
    console.error("Error in /GetDisconnectionPhotos:", error.message);
    res.status(500).json({ error: "Failed to fetch disconnection photos" });
  }
}

// Export all controller functions
module.exports = {
  barcodeScan,
  getConnectionPressure,
  getLocation,
  getMeterWorkSheetComments,
  getPhysicalLocation,
  getWorkTypeResult,
  getManufacturers,
  getConsumptionPurpose,
  getDisconnectionMethods,
  getDisconnectionPhotos
};