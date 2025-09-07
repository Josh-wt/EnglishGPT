"""
File processing routes.
"""
from fastapi import APIRouter, HTTPException, File, UploadFile
import base64
import logging
from services.ai_service import call_qwen_api
from services.file_service import extract_text_from_pdf, process_image_to_base64

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/process-file")
async def process_file(file: UploadFile = File(...)):
    """Process uploaded file to extract text"""
    try:
        file_content = await file.read()
        file_type = file.content_type
        
        if file_type == "application/pdf":
            # Try direct PDF extraction first
            try:
                extracted_text = extract_text_from_pdf(file_content)
                if extracted_text.strip():
                    return {"extracted_text": extracted_text}
            except:
                pass
            
            # Fallback to Qwen API
            base64_content = base64.b64encode(file_content).decode('utf-8')
            extracted_text = await call_qwen_api(base64_content, "pdf")
            
        elif file_type.startswith("image/"):
            base64_content = process_image_to_base64(file_content)
            extracted_text = await call_qwen_api(base64_content, "image")
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        return {"extracted_text": extracted_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")
