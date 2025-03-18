const express = require("express")
const router = express.Router()
const jobController = require("../controllers/jobController")
const { authorizeMeterApp } = require("../middleware/auth")

// 2. Get specific job assignment
router.get("/job_dispositions/get", authorizeMeterApp, jobController.getSpecificJobAssignment)

// 3. Get all job assignments
router.get("/job_dispositions/get/all", authorizeMeterApp, jobController.getAllJobAssignments)

// 4. Update job assignment
router.put("/update_job_disposition", authorizeMeterApp, jobController.updateJobAssignment)

// 5. Get available work types
router.get("/work_types", authorizeMeterApp, jobController.getWorkTypes)

router.get("/job_disposition_state", authorizeMeterApp, jobController.getJobAssignmentState)


module.exports = router

