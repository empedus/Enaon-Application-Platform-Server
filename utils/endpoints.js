// Endpoints for ServiceNow API
const servicenowBaseURL = "https://enaondev.service-now.com"

module.exports = {
  servicenowBaseURL,
  WORK_TYPES_PATH: "/api/x_eedat_meters_app/meter_app/work_types/get/all",
  GET_SPECIFIC_ASSIGNMENT_PATH: "/api/x_eedat_meters_app/meter_app/job_dispositions/get",
  ALL_ASSIGNMENTS_PATH: "/api/x_eedat_meters_app/meter_app/job_dispositions/get/all",
  AUTH_PATH: "/api/x_eedat_meters_app/user_auth",
  UPDATE_JOB_DISPOSITION_PATH: "/api/x_eedat_meters_app/meter_app/job_dispositions/update",
  VEHICLES_PATH: "/api/x_eedat_meters_app/vehicles/get/all",
  GET_PDF_TEMPLATE: "/api/x_eedat_meters_app/meter_app/get_pdf_template_sys_id",
  GET_ATTACHED_PDF: "/api/x_eedat_meters_app/meter_app/get_attached_pdf",
  RETRIEVE_RECORD_ATTACHMENTS: "/api/now/attachment",
  UPDATE_USERNAME_PASS: "/api/x_eedat_meters_app/user_auth/update_username_pass",


  // Navision API endpoints
  BARCODE_SCAN: "/api/x_eedat_meters_app/navision/BarcodeScan",
  GET_CONNECTION_PRESSURE: "/api/x_eedat_meters_app/navision/GetConnectionPressure",
  GET_LOCATION: "/api/x_eedat_meters_app/navision/GetLocation",
  GET_METER_WORKSHEET_COMMENTS: "/api/x_eedat_meters_app/navision/GetMeterWorkSheetComments",
  GET_PHYSICAL_LOCATION: "/api/x_eedat_meters_app/navision/GetPhysicalLocation",
  GET_WORK_TYPE_RESULT: "/api/x_eedat_meters_app/navision/GetWorkTypeResult",
  GET_MANUFACTURERS: "/api/x_eedat_meters_app/navision/Manufacturers",
  GET_CONSUMPTION_PURPOSE: "/api/x_eedat_meters_app/navision/GetConsumptionPurpose",
  GET_DISCONNECTION_METHODS: "/api/x_eedat_meters_app/navision/GetDisconectionMethods",
  GET_DISCONNECTION_PHOTOS: "/api/x_eedat_meters_app/navision/GetDisconnectionPhotos",
  UPLOAD_DOCUMENT: "/api/x_eedat_meters_app/navision/UploadDocument",
  DEACTIVATE_METER: "/api/x_eedat_meters_app/navision/DeactivateMeter",
  ACTIVATE_METER: "/api/x_eedat_meters_app/navision/ActivateMeter",
  REACTIVATE_METER: "/api/x_eedat_meters_app/navision/ReactivateMeter",
  REPLACE_METER: "/api/x_eedat_meters_app/navision/ReplaceMeter",
  GET_WORKPERSON: "/api/x_eedat_meters_app/navision/GetWorkperson"
}

