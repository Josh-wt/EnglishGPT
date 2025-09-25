"""
AI service for making API calls to various AI providers.
"""
import json
import logging
import httpx
from fastapi import HTTPException
from config.settings import (
    DEEPSEEK_API_KEY, DEEPSEEK_ENDPOINT,
    QWEN_API_KEY, QWEN_ENDPOINT
)

logger = logging.getLogger(__name__)

async def call_deepseek_api(prompt: str) -> tuple[str, str]:
    """Call DeepSeek API for text evaluation"""
    
    # Check if API key is properly configured
    if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY.strip() == '':
        error_msg = "DeepSeek API key not configured. Please set DEEPSEEK_API_KEY environment variable."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "z-ai/glm-4.5-air:free",
            "messages": [
                {"role": "system", "content": "You are an expert English language examiner with extensive experience in marking IGCSE and A-Level English papers. Provide detailed, constructive feedback following the specific marking criteria provided."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.3
        }
        
        try:
            import time
            request_start = time.time()
            logger.info(f"🚀 PERFORMANCE: Making HTTP request to DeepSeek API...")
            logger.info(f"🚀 PERFORMANCE: Request payload size: {len(str(payload))} characters")
            
            response = await client.post(DEEPSEEK_ENDPOINT, headers=headers, json=payload, timeout=60.0)
            request_time = time.time() - request_start
            
            logger.info(f"🚀 PERFORMANCE: HTTP request completed in {request_time:.2f}s")
            logger.info(f"🚀 PERFORMANCE: Response status: {response.status_code}")
            
            # Log slow requests
            if request_time > 15:
                logger.warning(f"⚠️ PERFORMANCE: Slow HTTP request: {request_time:.2f}s")
            elif request_time > 30:
                logger.error(f"❌ PERFORMANCE: Very slow HTTP request: {request_time:.2f}s")
            
            response.raise_for_status()
            
            parse_start = time.time()
            result = response.json()
            parse_time = time.time() - parse_start
            logger.info(f"🚀 PERFORMANCE: JSON parsing took {parse_time:.2f}s")
            
            if 'choices' not in result or not result['choices']:
                error_msg = "Invalid response from DeepSeek API: No choices in response"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            
            full_response = result['choices'][0]['message']['content']
            return full_response, json.dumps(payload) + "\n\nResponse:\n" + full_response
            
        except httpx.TimeoutException:
            error_msg = "DeepSeek API request timed out. Please try again."
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        except httpx.HTTPStatusError as e:
            # Enhanced debugging for HTTP errors
            response_text = ""
            try:
                response_text = e.response.text
            except:
                response_text = "Unable to read response text"
            
            logger.error(f"DeepSeek API HTTP error - Status: {e.response.status_code}, Response: {response_text}")
            
            if e.response.status_code == 401:
                error_msg = f"DeepSeek API authentication failed. Status: {e.response.status_code}, Response: {response_text}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            elif e.response.status_code == 429:
                error_msg = f"DeepSeek API rate limit exceeded. Status: {e.response.status_code}, Response: {response_text}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            elif e.response.status_code == 400:
                error_msg = f"DeepSeek API bad request. Status: {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            else:
                error_msg = f"DeepSeek API error: Status {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
        except Exception as e:
            error_msg = str(e)
            logger.error(f"DeepSeek API exception - Error: {error_msg}, Type: {type(e).__name__}")
            if "401" in error_msg or "unauthorized" in error_msg.lower():
                error_msg = f"DeepSeek API authentication failed. Error: {error_msg}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            elif "404" in error_msg or "not found" in error_msg.lower():
                error_msg = f"DeepSeek API endpoint not found. Error: {error_msg}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            else:
                error_msg = f"DeepSeek API error: {error_msg}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)

async def call_qwen_api(file_content: str, file_type: str) -> str:
    """Call Qwen API for file processing"""
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {QWEN_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Prepare the content based on file type
        if file_type.lower() == 'pdf':
            content = f"Please extract all text content from this PDF file. Provide a clean, well-formatted text extraction.\n\nFile content: {file_content}"
        else:
            content = f"Please extract all text content from this image. Provide a clean, well-formatted text extraction.\n\nImage content: {file_content}"
        
        payload = {
            "model": "qwen/qwen-vl-plus",
            "messages": [
                {"role": "system", "content": "You are an expert at extracting text from documents and images. Provide clean, accurate text extraction."},
                {"role": "user", "content": content}
            ],
            "max_tokens": 4000,
            "temperature": 0.1
        }
        
        try:
            response = await client.post(QWEN_ENDPOINT, headers=headers, json=payload, timeout=60.0)
            response.raise_for_status()
            result = response.json()
            
            if 'choices' not in result or not result['choices']:
                raise HTTPException(status_code=500, detail="Invalid response from Qwen API")
            
            return result['choices'][0]['message']['content']
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=500, detail="Qwen API request timed out")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise HTTPException(status_code=500, detail="Qwen API authentication failed")
            elif e.response.status_code == 429:
                raise HTTPException(status_code=500, detail="Qwen API rate limit exceeded")
            else:
                raise HTTPException(status_code=500, detail=f"Qwen API error: {e.response.status_code}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Qwen API error: {str(e)}")
