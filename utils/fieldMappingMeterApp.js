// utils\fieldMappingMeterApp.js

/**
 * Complete mapping of PDF form field names to job details keys
 */
const fieldMapping = {
    // Form fields mapped to job details keys
    'Check Box1': null, // No matching field in job details
    'u_work_code': 'u_work_code',
    'u_executor_company': 'u_executor_company',
    'u_supply_point': 'u_supply_point',
    'u_customer_name': 'u_customer_name',
    'u_customer_phones': 'u_customer_phones',
    'u_visit_date': 'u_visit_date',
    'u_visit_time': 'u_visit_time',
    'u_municipality': 'u_municipality',
    'u_address': 'u_address',
    'u_supply_address': 'u_supply_address',
    'u_floor_apartment': 'u_floor_apartment',
    'u_sector': 'u_sector',
    'u_island': 'u_island',
    'u_meter_sn': 'u_meter_sn',
    'u_barcode_metriti': 'u_barcode_metriti',
    'u_manufacturer': 'u_manufacturer',
    'u_manufacture_year': 'u_manufacture_year',
    'u_digit_count': 'u_digit_count',
    'u_usage_code': 'u_usage_code',
    'u_arxiki_endeiksi': 'u_arxiki_endeiksi',
    'u_install_date': 'u_install_date',
    'u_start_time': 'u_start_time',
    'u_end_time': 'u_end_time',
    'u_regulator_pressure': 'u_regulator_pressure',
    'u_oxima': 'u_oxima',
    'u_date': 'test date', 
    'u_time': "test time", 
    '-': null, // No mapping for this field
    'u_ikasp': 'u_ikasp',
    'u_consumption_purpose_name': 'u_consumption_purpose_name',
    'u_work_type.u_description': 'u_work_type_description',
    'u_technician.name': 'u_technician',
    'u_kentro_euthinhs': 'u_kentro_euthinhs',
    'u_new_meter': 'u_meter_type_description', // Assuming this maps to meter type
    'u_meter_type_description': 'u_meter_type_description',
    'u_isxys_egkatastashs_new': 'u_isxys_egkatastashs_new',
    'u_paratiriseis': 'u_paratiriseis',
    'u_phisical_location_description': 'u_phisical_location_description',
    'visit_result_enum': 'visit_result_description',
    'u_visit_result_final': 'u_visit_result_final',
    'u_megisti_paroxh_new': 'u_megisti_paroxh_new',
    'u_yparxi_vanas': 'u_yp_vana_asfaleias',
    'u_arxiki_katastasi': 'u_arxiki_katastash',
    'u_paratiriseis_metriti': 'u_paratiriseis_metriti'
  };
  
  // Export just the field mapping
  module.exports = {
    fieldMapping
  };