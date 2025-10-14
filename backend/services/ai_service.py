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

def get_evaluation_schema(question_type: str) -> dict:
    """Get the JSON schema for structured evaluation responses based on question type."""
    
    # Base schema properties
    base_properties = {
        "feedback": {
            "type": "string",
            "description": "Detailed feedback with specific examples in bullet points"
        },
        "grade": {
            "type": "string", 
            "description": "Overall grade in format like '24/25' or 'C+'"
        },
        "improvements": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 3,
            "maxItems": 3,
            "description": "Exactly 3 specific areas that need work in this essay"
        },
        "strengths": {
            "type": "array", 
            "items": {"type": "string"},
            "minItems": 3,
            "maxItems": 3,
            "description": "Exactly 3 specific strengths from this essay"
        },
        "next_steps": {
            "type": "array",
            "items": {"type": "string"}, 
            "minItems": 3,
            "maxItems": 3,
            "description": "Exactly 3 actionable future steps for the student"
        }
    }
    
    # Add question-type specific mark properties
    if question_type in ['igcse_writers_effect']:
        base_properties["reading_marks"] = {
            "type": "string",
            "description": "Reading marks in format like '13/15'"
        }
    elif question_type in ['igcse_narrative', 'igcse_descriptive']:
        base_properties["content_structure_marks"] = {
            "type": "string", 
            "description": "Content and Structure marks in format like '14/16'"
        }
        base_properties["style_accuracy_marks"] = {
            "type": "string",
            "description": "Style and Accuracy marks in format like '20/24'"
        }
    elif question_type in ['igcse_directed', 'igcse_extended_q3']:
        base_properties["reading_marks"] = {
            "type": "string",
            "description": "Reading marks in format like '12/15'"
        }
        base_properties["writing_marks"] = {
            "type": "string", 
            "description": "Writing marks in format like '20/25' for directed or '8/10' for extended"
        }
    elif question_type in ['alevel_directed', 'alevel_directed_writing']:
        base_properties["ao1_marks"] = {
            "type": "string",
            "description": "AO1 marks in format like '4/5'"
        }
        base_properties["ao2_marks"] = {
            "type": "string",
            "description": "AO2 marks in format like '5/5'"
        }
    elif question_type in ['alevel_comparative']:
        base_properties["ao1_marks"] = {
            "type": "string",
            "description": "AO1 marks in format like '4/5'"
        }
        base_properties["ao3_marks"] = {
            "type": "string",
            "description": "AO3 marks in format like '8/10'"
        }
    elif question_type in ['alevel_text_analysis']:
        base_properties["ao1_marks"] = {
            "type": "string",
            "description": "AO1 marks in format like '4/5'"
        }
        base_properties["ao2_marks"] = {
            "type": "string",
            "description": "AO2 marks in format like '18/20'"
        }
    elif question_type in ['gp_essay']:
        base_properties["ao1_marks"] = {
            "type": "string",
            "description": "AO1 marks in format like '5/6'"
        }
        base_properties["ao2_marks"] = {
            "type": "string",
            "description": "AO2 marks in format like '10/12'"
        }
        base_properties["ao3_marks"] = {
            "type": "string",
            "description": "AO3 marks in format like '9/12'"
        }
    elif question_type in ['alevel_language_change']:
        base_properties["ao2_marks"] = {
            "type": "string",
            "description": "AO2 marks in format like '4/5'"
        }
        base_properties["ao4_marks"] = {
            "type": "string",
            "description": "AO4 marks in format like '5/5'"
        }
        base_properties["ao5_marks"] = {
            "type": "string",
            "description": "AO5 marks in format like '12/15'"
        }
    
    return {
        "type": "object",
        "properties": base_properties,
        "required": list(base_properties.keys()),
        "additionalProperties": False
    }

async def call_deepseek_api(prompt: str, question_type: str = None) -> tuple[str, str]:
    """Call DeepSeek API for text evaluation with structured outputs"""
    
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
        
        # Build payload with structured output if question_type provided
        payload = {
            "model": "x-ai/grok-4-fast",
            "messages": [
                {"role": "system", "content": "You are an expert English language examiner with extensive experience in marking IGCSE and A-Level English papers. Provide detailed, constructive feedback following the specific marking criteria provided."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.3
        }
        
        # Add structured output if question_type is provided
        if question_type:
            schema = get_evaluation_schema(question_type)
            payload["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "evaluation_response",
                    "strict": True,
                    "schema": schema
                }
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
