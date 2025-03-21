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
  RETRIEVE_RECORD_ATTACHMENTS: "/api/now/attachment"
}

