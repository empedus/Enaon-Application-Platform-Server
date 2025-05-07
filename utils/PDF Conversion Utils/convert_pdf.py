# convert_pdf.py
from pdf2docx import Converter
import sys

if len(sys.argv) != 3:
    print("Usage: python convert_pdf.py input.pdf output.docx")
    sys.exit(1)

pdf_file = sys.argv[1]
docx_file = sys.argv[2]

cv = Converter(pdf_file)
cv.convert(docx_file)
cv.close()
