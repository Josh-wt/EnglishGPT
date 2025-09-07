"""
File processing service for handling PDF and image files.
"""
import base64
import io
import logging
from fastapi import HTTPException
import PyPDF2

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

def process_image_to_base64(file_content: bytes) -> str:
    """Convert image to base64 for API processing"""
    try:
        # Convert to base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        return base64_content
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
