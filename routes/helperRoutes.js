const express = require("express")
const router = express.Router()

// Helper endpoint to list all available APIs
router.get("/", (req, res) => {
  // Create a comprehensive list of all API endpoints
  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/user_auth",
      description: "Authenticate user and generate JWT token",
      requiredParams: ["user_email"],
      returns: "User authentication data and JWT token",
    },
    {
      method: "POST",
      path: "/api/auth/microsoft",
      description: "Authenticate user with Microsoft ID token",
      requiredParams: [],
      requestBody: {
        idToken: "Microsoft Azure ID token"
      },
      returns: "User authentication data and JWT token",
    },
    {
      method: "POST",
      path: "/api/auth/update_username_pass",
      description: "Update encrypted username and password for a user in ServiceNow",
      requiredParams: [
        { user_email: "User email (query parameter)" }
      ],
      requestBody: {
        username: "Username string to be encrypted and saved",
        password: "Password string to be encrypted and saved"
      },
      returns: "Response from ServiceNow indicating success or failure of the update",
    },    
    {
      method: "GET",
      path: "/api/meter_app/job_dispositions/get",
      description: "Get specific job assignment",
      requiredParams: ["user_email", "record_sys_id"],
      returns: "Details of a specific job assignment",
    },
    {
      method: "GET",
      path: "/api/meter_app/job_dispositions/get/all",
      description: "Get all job assignments",
      requiredParams: ["user_email"],
      returns: "List of all job assignments for the user",
    },
    {
      method: "PUT",
      path: "/api/meter_app/update_job_disposition",
      description: "Update job assignment",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: "Job disposition data to update",
      returns: "Updated job assignment data",
    },
    {
      method: "GET",
      path: "/api/meter_app/work_types",
      description: "Get available work types",
      requiredParams: [],
      returns: "List of available work types",
    },
    {
      method: "GET",
      path: "/api/vehicles",
      description: "Get available vehicles",
      requiredParams: [],
      returns: "List of available vehicles",
    },
    {
      method: "GET",
      path: "/api/meter_app/generate_pdf",
      description: "Generate PDF and attach it to the record",
      requiredParams: ["user_email", "record_sys_id"],
      returns: "Generated PDF data in base64 format",
    },
    {
      method: "POST",
      path: "/api/meter_app/sign_pdf",
      description: "Generate PDF with signatures and attach it to the record",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: {
        signature_technician: "Base64 encoded technician signature image",
        signature_customer: "Base64 encoded customer signature image",
      },
      returns: "Signed PDF data in base64 format",
    },
    {
      method: "GET",
      path: "/api/meter_app/get_attached_pdf",
      description: "Get attached PDF ",
      requiredParams: ["user_email", "record_sys_id"],
      returns: "Attached PDF",
    },
    {
      method: "GET",
      path: "/api/meter_app/get_record_attachments",
      description: "Get all attachments for a record",
      requiredParams: ["record_sys_id"],
      returns: "List of attachments with base64 data",
    },
    {
      method: "POST",
      path: "/api/meter_app/upload_attachment",
      description: "Upload attachment(s) and store them in ServiceNow",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: {
        attachments: "Array of files to be uploaded as Multipart 'attachments'- 'file'",
      },
      returns: "Upload success status and file details",
    },
    {
      method: "POST",
      path: "/api/meter_app/merge_attachments",
      description: "Merge multiple attachments into a single PDF and upload it to ServiceNow",
      requiredParams: ["record_sys_id"],
      requestBody: {},
      returns: "Merged PDF upload status and file details",
    },
    {
      method: "GET",
      path: "/api/meter_app/job_disposition_state",
      description: "Get the State from specific Job Assignment",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: {},
      returns: [{"state": "Available State"}],
    },
    {
      method: "GET",
      path: "/api/helper",
      description: "Get information about all available API endpoints",
      requiredParams: [],
      returns: "List of all API endpoints with details",
    },
    {
      method: "POST",
      path: "/api/navision/BarcodeScan",
      description: "Scan barcode and retrieve information from Navision",
      requiredParams: [],
      requestBody: {
        barcode: "Barcode string to scan"
      },
      returns: "Barcode scan results from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetConnectionPressure",
      description: "Get connection pressure information from Navision",
      requiredParams: [],
      returns: "Connection pressure data from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetLocation",
      description: "Get location information from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetLocation",
        paramArgs: []
      },
      returns: "Location data from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetMeterWorkSheetComments",
      description: "Get meter worksheet comments from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetMeterWorkSheetComments",
        paramArgs: []
      },
      returns: "Meter worksheet comments from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetPhysicalLocation",
      description: "Get physical location information from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetPhysicalLocation",
        paramArgs: []
      },
      returns: "Physical location data from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetWorkTypeResult",
      description: "Get work type results from Navision",
      requiredParams: [],
      returns: "Work type results from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/Manufacturers",
      description: "Get manufacturers information from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetManufacturers",
        paramArgs: []
      },
      returns: "Manufacturers data from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetConsumptionPurpose",
      description: "Get consumption purpose information from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetConsumptionPurpose",
        paramArgs: []
      },
      returns: "Consumption purpose data from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/GetDisconectionMethods",
      description: "Get disconnection methods from Navision",
      requiredParams: [],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "GetDisconectionMethods",
        paramArgs: []
      },
      returns: "Disconnection methods from Navision",
    },
    {
      method: "GET",
      path: "/api/navision/GetDisconnectionPhotos",
      description: "Get disconnection photos from Navision",
      requiredParams: ["ikasp"],
      returns: "Disconnection photos from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/ActivateMeter",
      description: "Activate a meter in Navision",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "ActivateMeter",
        paramArgs: "Array of parameters required for meter activation"
      },
      returns: "Activation status and details from Navision",
    },
    {
      method: "POST",
      path: "/api/navision/DeactivateMeter",
      description: "Deactivate a meter in Navision",
      requiredParams: ["user_email", "record_sys_id"],
      requestBody: {
        codeUnitName: "Integration",
        functionName: "DeactivateMeter",
        paramArgs: "Array of parameters required for meter deactivation"
      },
      returns: "Deactivation status and details from Navision",
    },
    
  ]

  

  // Return the API documentation
  res.json({
    applicationName: "Meters App API",
    version: "1.0.0",
    baseUrl: "https://enaon-application-platform-server-dbce.onrender.com",
    endpoints: apiEndpoints,
    environment: {
      node: process.version,
      environment: process.env.NODE_ENV || "development",
      servicenowBaseURL: require("../utils/endpoints").servicenowBaseURL,
    },
  })
})

module.exports = router