const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const { PDFDocument } = require("pdf-lib")
const fontkit = require("@pdf-lib/fontkit")
const axios = require("axios")
const { findMatchingValue } = require("./serviceNowService")
const ENDPOINTS = require("../utils/endpoints")

async function loadPdfWithFont(pdfBuffer) {
  // Load the original PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  console.log("PDF loaded successfully in PDF")

  // Register fontkit with PDFDocument
  pdfDoc.registerFontkit(fontkit)

  // Load and embed a Unicode font that supports Greek characters
  let customFont
  try {
    const arialPath = path.join(__dirname, "..", "fonts", "Helvetica.ttf")
    if (fs.existsSync(arialPath)) {
      const fontBytes = fs.readFileSync(arialPath)
      customFont = await pdfDoc.embedFont(fontBytes, { subset: true })
    } else {
      const notoPath = path.join(__dirname, "..", "fonts", "Helvetica.ttf")
      if (fs.existsSync(notoPath)) {
        const fontBytes = fs.readFileSync(notoPath)
        customFont = await pdfDoc.embedFont(fontBytes, { subset: true })
      } else {
        throw new Error("No suitable font found.")
      }
    }
  } catch (fontError) {
    console.error("Error loading custom font:", fontError)
    customFont = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman)
  }

  return { pdfDoc, customFont }
}

async function fillPdfForm(pdfDoc, customFont, jobDetails) {
  const form = pdfDoc.getForm()
  const fields = form.getFields()

  // Fill in fields with values
  for (const field of fields) {
    const fieldName = field.getName()
    const matchingValue = findMatchingValue(fieldName, jobDetails)

    if (matchingValue) {
      try {
        console.log(`Setting field ${fieldName} to ${matchingValue}`)
        if (field.constructor.name === "PDFTextField") {
          field.setText(matchingValue)
          field.setFontSize(10.5)
          field.updateAppearances(customFont)
        } else if (field.constructor.name === "PDFCheckBox") {
          if (matchingValue === "checked") field.check()
        } else if (field.constructor.name === "PDFRadioButton") {
          field.select(matchingValue)
        } else if (field.constructor.name === "PDFDropdown") {
          field.select(matchingValue)
        }
      } catch (err) {
        console.warn(`Failed to fill field ${fieldName}:`, err.message)
      }
    }
  }

  return pdfDoc
}

async function attachPdfToServiceNow(pdfBuffer, record_sys_id, fileName) {
  // Use ServiceNow Attachment API to upload the file
  console.log("Uploading PDF to ServiceNow...")
  const attachmentResponse = await axios.post(`${ENDPOINTS.servicenowBaseURL}/api/now/attachment/file`, pdfBuffer, {
    params: {
      table_name: "x_eedat_meters_app_job_assignments",
      table_sys_id: record_sys_id,
      file_name: fileName,
    },
    headers: {
      "Content-Type": "application/pdf",
      Accept: "application/json",
    },
    auth: {
      username: process.env.SERVICENOW_USER,
      password: process.env.SERVICENOW_PASS,
    },
    timeout: 30000,
  })

  return attachmentResponse.data
}

async function processSignatures(pdfDoc, signatureTechnician, signatureCustomer) {
  // Generate unique session IDs for each signature
  const sessionIdTechnician = uuidv4() // Technician signature session ID
  const sessionIdCustomer = uuidv4() // Customer signature session ID

  // Define the image folder path (TempImageFolder should already exist)
  const folderPath = path.join(__dirname, "..", "TempImageFolder")
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  // Process Technician Signature
  if (signatureTechnician) {
    const technicianImagePath = path.join(folderPath, `techniciansignature_${sessionIdTechnician}.png`)
    const base64DataTechnician = signatureTechnician.replace(/^data:image\/png;base64,/, "")
    const imageBufferTechnician = Buffer.from(base64DataTechnician, "base64")
    fs.writeFileSync(technicianImagePath, imageBufferTechnician)
    console.log(`Technician signature image saved for session ${sessionIdTechnician}.`)

    // Embed Technician Signature in PDF
    const pngImageTechnician = await pdfDoc.embedPng(imageBufferTechnician)
    console.log("Technician PNG image embedded successfully.")
    const pngDimsTechnician = pngImageTechnician.scale(0.1) // Scale down technician signature image to 10%
    const page = pdfDoc.getPages()[0] || pdfDoc.addPage()
    page.drawImage(pngImageTechnician, {
      x: 115, // Technician signature position X
      y: 215, // Technician signature position Y
      width: pngDimsTechnician.width,
      height: pngDimsTechnician.height,
    })

    // Delete the technician signature image file
    fs.unlinkSync(technicianImagePath)
    console.log(`Technician signature image deleted for session ${sessionIdTechnician}.`)
  }

  // Process Customer Signature
  if (signatureCustomer) {
    const customerImagePath = path.join(folderPath, `customersignature_${sessionIdCustomer}.png`)
    const base64DataCustomer = signatureCustomer.replace(/^data:image\/png;base64,/, "")
    const imageBufferCustomer = Buffer.from(base64DataCustomer, "base64")
    fs.writeFileSync(customerImagePath, imageBufferCustomer)
    console.log(`Customer signature image saved for session ${sessionIdCustomer}.`)

    // Embed Customer Signature in PDF
    const pngImageCustomer = await pdfDoc.embedPng(imageBufferCustomer)
    console.log("Customer PNG image embedded successfully.")
    const pngDimsCustomer = pngImageCustomer.scale(0.1) // Scale down customer signature image to 10%
    const page = pdfDoc.getPages()[0] || pdfDoc.addPage()
    page.drawImage(pngImageCustomer, {
      x: 500, // Customer signature position X
      y: 215, // Customer signature position Y
      width: pngDimsCustomer.width,
      height: pngDimsCustomer.height,
    })

    // Delete the customer signature image file
    fs.unlinkSync(customerImagePath)
    console.log(`Customer signature image deleted for session ${sessionIdCustomer}.`)
  }

  return pdfDoc
}

module.exports = {
  loadPdfWithFont,
  fillPdfForm,
  attachPdfToServiceNow,
  processSignatures,
}

