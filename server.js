require("dotenv").config({ path: "./.env" })
const express = require("express")
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Import routes
const authRoutes = require("./routes/authRoutes")
const jobRoutes = require("./routes/jobRoutes")
const vehicleRoutes = require("./routes/vehicleRoutes")
const pdfRoutes = require("./routes/pdfRoutes")
const helperRoutes = require("./routes/helperRoutes")
const uploadRoutes = require("./routes/attachmentRoutes")
const navisionRoutes = require("./routes/navisionRoutes")

// Use routes
app.use("/api", authRoutes)
app.use("/api/meter_app", jobRoutes)
app.use("/api", vehicleRoutes)
app.use("/api/meter_app", pdfRoutes)
app.use("/api/helper", helperRoutes)
app.use("/api/meter_app", uploadRoutes)
app.use("/api/navision", navisionRoutes)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  console.log("ServiceNow URL:", require("./utils/endpoints").servicenowBaseURL)
})

