# # convert_pdf.py
# from pdf2docx import Converter
# import sys

# if len(sys.argv) != 3:
#     print("Usage: python convert_pdf.py input.pdf output.docx")
#     sys.exit(1)

# pdf_file = sys.argv[1]
# docx_file = sys.argv[2]

# cv = Converter(pdf_file)
# cv.convert(docx_file)
# cv.close()


import sys
import os
import tempfile
from docx import Document
from docx.shared import Inches
from pdf2image import convert_from_path
 
def pdf_to_docx_as_image(pdf_path, docx_path):
    images = convert_from_path(pdf_path, dpi=300, poppler_path=r"C:\Users\User\Downloads\poppler-24.08.0\Library\bin")
    doc = Document()
 
    for i, img in enumerate(images):
        if i > 0:
            doc.add_page_break()
        temp_img = os.path.join(tempfile.gettempdir(), f"page_{i}.png")
        img.save(temp_img, "PNG")
        doc.add_picture(temp_img, width=Inches(6.5))  # Width to fit A4 page minus margins
 
    doc.save(docx_path)
 
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_pdf.py input.pdf output.docx")
        sys.exit(1)
 
    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]
 
    pdf_to_docx_as_image(pdf_path, docx_path)