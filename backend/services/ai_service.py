"""
AI service for making API calls to various AI providers.
"""
import json
import logging
import httpx
from fastapi import HTTPException
from config.settings import (
    DEEPSEEK_API_KEY, CHUTES_ENDPOINT,
    QWEN_API_KEY, QWEN_ENDPOINT,
    CHUTES_API_KEY, CHUTES_ENDPOINT
)

logger = logging.getLogger(__name__)

async def call_deepseek_api(prompt: str) -> tuple[str, str]:
    """Call Chutes GLM 4.5 Air API for text evaluation"""
    
    # Check if API key is properly configured
    if not CHUTES_API_KEY or CHUTES_API_KEY.strip() == '':
        error_msg = "Chutes API key not configured. Please set CHUTES_API_KEY environment variable."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {CHUTES_API_KEY}",
            "Content-Type": "application/json"
        }
        
    payload = {
        "model": "zai-org/GLM-4.5-Air",
        "messages": [
            {"role": "system", "content": "You are an expert English language examiner with extensive experience in marking IGCSE and A-Level English papers. Provide detailed, constructive feedback following the specific marking criteria provided."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.3,
        "stream": False
    }
        
    try:
        response = await client.post(CHUTES_ENDPOINT, headers=headers, json=payload, timeout=60.0)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' not in result or not result['choices']:
            error_msg = "Invalid response from Chutes API: No choices in response"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        full_response = result['choices'][0]['message']['content']
        return full_response, "zai-org/GLM-4.5-Air"
            
    except httpx.TimeoutException:
        error_msg = "Chutes API request timed out. Please try again."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except httpx.HTTPStatusError as e:
        # Enhanced debugging for HTTP errors
        response_text = ""
        try:
            response_text = e.response.text
        except:
            response_text = "Unable to read response text"
        
        logger.error("Chutes API HTTP error - DETAILED DEBUG", extra={
            "component": "chutes",
            "status_code": e.response.status_code,
            "status_text": getattr(e.response, 'reason_phrase', 'Unknown'),
            "response_headers": dict(e.response.headers),
            "response_text": response_text,
            "request_url": str(e.response.request.url),
            "request_method": e.response.request.method,
            "request_headers": dict(e.response.request.headers),
            "model_used": payload.get("model", "unknown"),
            "endpoint_used": CHUTES_ENDPOINT,
            "api_key_prefix": CHUTES_API_KEY[:20] + "..." if CHUTES_API_KEY else "None"
        })
        
        if e.response.status_code == 401:
            error_msg = f"Chutes API authentication failed. Status: {e.response.status_code}, Response: {response_text}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif e.response.status_code == 429:
            error_msg = f"Chutes API rate limit exceeded. Status: {e.response.status_code}, Response: {response_text}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif e.response.status_code == 400:
            error_msg = f"Chutes API bad request. Status: {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        else:
            error_msg = f"Chutes API error: Status {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.error("Chutes API exception - DETAILED DEBUG", extra={
            "component": "chutes",
            "error": error_msg,
            "error_type": type(e).__name__,
            "model_used": payload.get("model", "unknown"),
            "endpoint_used": CHUTES_ENDPOINT,
            "api_key_prefix": CHUTES_API_KEY[:20] + "..." if CHUTES_API_KEY else "None",
            "payload_keys": list(payload.keys()) if payload else "None",
            "prompt_length": len(prompt) if prompt else 0
        })
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            error_msg = f"Chutes API authentication failed. Error: {error_msg}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif "404" in error_msg or "not found" in error_msg.lower():
            error_msg = f"Chutes API endpoint not found. Error: {error_msg}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        else:
            error_msg = f"Chutes API error: {error_msg}"
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

async def call_chutes_api(prompt: str) -> tuple[str, str]:
    """Call Chutes GLM 4.5 Air API for text evaluation"""
    
    # Check if API key is properly configured
    if not CHUTES_API_KEY or CHUTES_API_KEY.strip() == '':
        error_msg = "Chutes API key not configured. Please set CHUTES_API_KEY environment variable."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    
    headers = {
        "Authorization": f"Bearer {CHUTES_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "zai-org/GLM-4.5-Air",
        "messages": [
            {"role": "system", "content": "You are an expert English language examiner with extensive experience in marking IGCSE and A-Level English papers. Provide detailed, constructive feedback following the specific marking criteria provided."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.3,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                CHUTES_ENDPOINT,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Extract the response content
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                model_used = result.get("model", "zai-org/GLM-4.5-Air")
                return content, model_used
            else:
                error_msg = "Invalid response format from Chutes API"
                logger.error(error_msg, extra={"response": result})
                raise HTTPException(status_code=500, detail=error_msg)
                
    except httpx.TimeoutException:
        error_msg = "Chutes API request timed out. Please try again."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except httpx.HTTPStatusError as e:
        # Enhanced debugging for HTTP errors
        response_text = ""
        try:
            response_text = e.response.text
        except:
            response_text = "Unable to read response text"
        
        logger.error("Chutes API HTTP error - DETAILED DEBUG", extra={
            "component": "chutes",
            "status_code": e.response.status_code,
            "status_text": getattr(e.response, 'reason_phrase', 'Unknown'),
            "response_headers": dict(e.response.headers),
            "response_text": response_text,
            "request_url": str(e.response.request.url),
            "request_method": e.response.request.method,
            "request_headers": dict(e.response.request.headers),
            "model_used": payload.get("model", "unknown"),
            "endpoint_used": CHUTES_ENDPOINT,
            "api_key_prefix": CHUTES_API_KEY[:20] + "..." if CHUTES_API_KEY else "None"
        })
        
        if e.response.status_code == 401:
            error_msg = f"Chutes API authentication failed. Status: {e.response.status_code}, Response: {response_text}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif e.response.status_code == 429:
            error_msg = f"Chutes API rate limit exceeded. Status: {e.response.status_code}, Response: {response_text}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif e.response.status_code == 400:
            error_msg = f"Chutes API bad request. Status: {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        else:
            error_msg = f"Chutes API error: Status {e.response.status_code}, Response: {response_text}, Model: {payload.get('model', 'unknown')}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = str(e)
        logger.error("Chutes API exception - DETAILED DEBUG", extra={
            "component": "chutes",
            "error": error_msg,
            "error_type": type(e).__name__,
            "model_used": payload.get("model", "unknown"),
            "endpoint_used": CHUTES_ENDPOINT,
            "api_key_prefix": CHUTES_API_KEY[:20] + "..." if CHUTES_API_KEY else "None",
            "payload_keys": list(payload.keys()) if payload else "None",
            "prompt_length": len(prompt) if prompt else 0
        })
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            error_msg = f"Chutes API authentication failed. Error: {error_msg}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        elif "404" in error_msg or "not found" in error_msg.lower():
            error_msg = f"Chutes API endpoint not found. Error: {error_msg}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        else:
            error_msg = f"Chutes API error: {error_msg}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
