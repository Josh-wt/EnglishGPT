"""
Evaluation and feedback routes.
"""
from fastapi import APIRouter, HTTPException
import logging
import secrets
import re
from datetime import datetime, timedelta
from models.evaluation import SubmissionRequest, FeedbackResponse
from services.ai_service import call_deepseek_api
from utils.grading import compute_overall_grade
from schemas.marking_criteria import MARKING_CRITERIA
from config.settings import get_user_management_service, get_supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Get services
supabase = get_supabase_client()
user_management_service = get_user_management_service(supabase)

@router.post("/evaluate", response_model=FeedbackResponse)
async def evaluate_submission(submission: SubmissionRequest):
    """Evaluate student submission using AI"""
    try:
        # Debug logging removed for production
        # print(f"DEBUG: Starting evaluation for user {submission.user_id}, question type: {submission.question_type}")
        
        # Get user data using the user management service
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_data = await user_management_service.get_user_by_id(submission.user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        current_plan = user_data.get('current_plan', 'free')
        credits = user_data.get('credits', 3)
        questions_marked = user_data.get('questions_marked', 0)
        
        logger.debug(f"DEBUG: User plan: {current_plan}, credits: {credits}")
        
        # Check if question type requires marking scheme
        requires_marking_scheme = submission.question_type in ['igcse_summary', 'alevel_comparative', 'alevel_text_analysis', 'alevel_language_change']
        has_optional_marking_scheme = submission.question_type in ['igcse_writers_effect']
        
        if requires_marking_scheme and not submission.marking_scheme:
            raise HTTPException(status_code=400, detail="This question type requires a marking scheme")
        
        # Get the marking criteria for the question type
        marking_criteria = MARKING_CRITERIA.get(submission.question_type, "")
        if not marking_criteria:
            raise HTTPException(status_code=400, detail="Invalid question type")
        
        logger.debug(f"DEBUG: Marking criteria found for {submission.question_type}")
        logger.debug(f"DEBUG: Available marking criteria keys: {list(MARKING_CRITERIA.keys())}")
        logger.debug(f"DEBUG: Question type received: '{submission.question_type}'")
        logger.debug(f"DEBUG: Marking criteria length: {len(marking_criteria)}")
        logger.debug(f"DEBUG: First 200 chars of marking criteria: {marking_criteria[:200]}")
        
        # Additional debugging to check if the right criteria is being used
        if submission.question_type == "igcse_descriptive":
            logger.debug(f"DEBUG: This should be descriptive criteria. First 500 chars: {marking_criteria[:500]}")
            # Check for specific markers that indicate descriptive criteria
            if "Core Principle for Descriptive Marking" in marking_criteria:
                logger.debug("DEBUG: Correct descriptive criteria confirmed")
                pass
            elif "Primary Focus:" in marking_criteria and "narrative" in marking_criteria.lower():
                logger.error("Narrative criteria found in descriptive request")
            else:
                logger.debug("DEBUG: Criteria type unclear")
                pass
        elif submission.question_type == "igcse_narrative":
            logger.debug(f"DEBUG: This should be narrative criteria. First 500 chars: {marking_criteria[:500]}")
            # Check for specific markers that indicate narrative criteria
            if "Primary Focus:" in marking_criteria and "Content/Structure (16 marks)" in marking_criteria:
                logger.debug("DEBUG: Correct narrative criteria confirmed")
                pass
            elif "Core Principle for Descriptive Marking" in marking_criteria:
                logger.error("Descriptive criteria found in narrative request")
            else:
                logger.debug("DEBUG: Criteria type unclear")
                pass
        elif submission.question_type == "igcse_directed":
            if "Core Principle for Directed Writing Marking" in marking_criteria:
                logger.debug("DEBUG: Correct directed writing criteria found in prompt")
                pass
            else:
                logger.debug("DEBUG: Directed writing criteria not found in prompt")
                pass
        
        # Add marking scheme to criteria if provided
        if submission.marking_scheme:
            marking_criteria = f"{marking_criteria}\n\nMarking Scheme:\n{submission.marking_scheme}"
        
        # Define sub marks requirements based on question type
        sub_marks_requirements = {
            'igcse_summary': 'READING_MARKS: [Reading marks out of 15] | WRITING_MARKS: [Writing marks out of 25]',
            'igcse_writers_effect': 'READING_MARKS: [Reading marks out of 15]',
            'igcse_directed': 'READING_MARKS: [Reading marks out of 15] | WRITING_MARKS: [Writing marks out of 25]',
            'alevel_directed': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'igcse_narrative': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'igcse_descriptive': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'alevel_comparative': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 10]',
            'alevel_directed_writing': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'alevel_text_analysis': 'AO1_MARKS: [AO1 marks out of 5] | AO3_MARKS: [AO3 marks out of 20]',
            'alevel_language_change': 'AO2_MARKS: [AO2 marks out of 5] | AO4_MARKS: [AO4 marks out of 5] | AO5_MARKS: [AO5 marks out of 15]'
        }
        
        sub_marks_requirement = sub_marks_requirements.get(submission.question_type, '')
        
        # Sanitize input to prevent prompt injection
        def sanitize_input(text):
            if not text:
                return ""
            # Remove potential prompt injection patterns
            dangerous_patterns = [
                "ignore previous instructions",
                "forget everything above",
                "system:",
                "assistant:",
                "user:",
                "human:",
                "ai:",
                "\\n\\nHuman:",
                "\\n\\nAssistant:",
                "<|im_start|>",
                "<|im_end|>",
                "###",
                "---",
                "```",
                "[INST]",
                "[/INST]"
            ]
            sanitized = text
            for pattern in dangerous_patterns:
                sanitized = sanitized.replace(pattern.lower(), "")
                sanitized = sanitized.replace(pattern.upper(), "")
                sanitized = sanitized.replace(pattern.title(), "")
            
            # Limit length to prevent overlong inputs
            if len(sanitized) > 10000:
                sanitized = sanitized[:10000] + "... [truncated for safety]"
            
            return sanitized.strip()
        
        # Sanitize all inputs
        sanitized_response = sanitize_input(submission.student_response)
        sanitized_scheme = sanitize_input(submission.marking_scheme) if submission.marking_scheme else None
        
        # IMPORTANT: Do NOT sanitize the marking_criteria as it contains the official marking guidelines
        # The marking_criteria should be used as-is to ensure correct evaluation
        
        # Enhanced prompt with detailed marking breakdown
        full_prompt = f"""
{marking_criteria}

CRITICAL MARKING INSTRUCTIONS 
That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
Please evaluate the following response and provide:
1. Detailed feedback with specific examples
2. Overall grade (e.g., "24/40" or "C+") 
3. {sub_marks_requirement}
4. Improvement suggestions
5. Key strengths - what the student did well (BE SPECIFIC TO THIS ESSAY)

IMPORTANT: For strengths, analyze the actual content and identify specific, unique strengths from THIS student's response. Don't use generic statements. Look for:
- Specific vocabulary choices that work well
- Particular sentence structures or techniques used effectively
- Unique ideas or creative approaches
- Specific examples or evidence provided
- Particular writing techniques demonstrated
- Specific aspects of organization or structure that work

Format your response as:
FEEDBACK: [detailed feedback in bullet points - each point should be a complete, standalone sentence that makes sense on its own]
GRADE: [overall grade]
{sub_marks_requirement}
IMPROVEMENTS: [improvement 1] | [improvement 2] | [improvement 3]
STRENGTHS: [strength 1 - specific to this essay] | [strength 2 - specific to this essay] | [strength 3 - specific to this essay]

CRITICAL: For the FEEDBACK section, format it as bullet points where each bullet point is a complete, standalone sentence. Do NOT split sentences across bullet points. Each bullet point should be a full, meaningful sentence that can be read independently.

Student Response: {sanitized_response}

{"Marking Scheme: " + sanitized_scheme if sanitized_scheme else ""}
"""
        
        logger.debug(f"DEBUG: Full prompt length: {len(full_prompt)}")
        logger.debug(f"DEBUG: First 500 chars of prompt: {full_prompt[:500]}")
        
        # Check if the correct marking criteria is in the prompt
        if submission.question_type == "igcse_descriptive":
            if "Core Principle for Descriptive Marking" in full_prompt:
                logger.debug("DEBUG: Correct descriptive criteria found in prompt")
                pass
            elif "Primary Focus:" in full_prompt and "Content/Structure (16 marks)" in full_prompt:
                logger.error("Narrative criteria found in descriptive prompt")
            else:
                logger.debug("DEBUG: Criteria type unclear in prompt")
                pass
        elif submission.question_type == "igcse_narrative":
            if "Primary Focus:" in full_prompt and "Content/Structure (16 marks)" in full_prompt:
                logger.debug("DEBUG: Correct narrative criteria found in prompt")
                pass
            elif "Core Principle for Descriptive Marking" in full_prompt:
                logger.error("Descriptive criteria found in narrative prompt")
            else:
                logger.debug("DEBUG: Criteria type unclear in prompt")
                pass
        elif submission.question_type == "igcse_directed":
            if "Core Principle for Directed Writing Marking" in full_prompt:
                logger.debug("DEBUG: Correct directed writing criteria found in prompt")
                pass
            else:
                logger.debug("DEBUG: Directed writing criteria not found in prompt")
                pass
        
        logger.debug("DEBUG: Calling DeepSeek API...")
        
        # Call AI API
        ai_response, _ = await call_deepseek_api(full_prompt)
        
        logger.debug(f"DEBUG: AI Response received: {ai_response[:500]}...")
        
        # Remove any bolding from the response
        ai_response = ai_response.replace('**', '')
        
        feedback_parts = ai_response.split("FEEDBACK:")
        if len(feedback_parts) > 1:
            feedback = feedback_parts[1].split("GRADE:")[0].strip()
            
            # Extract grade (raw from model first)
            grade_part = feedback_parts[1].split("GRADE:")[1] if "GRADE:" in feedback_parts[1] else ""
            grade = grade_part.split("READING_MARKS:")[0].strip() if grade_part else "Not provided"
            
            # Extract marks based on question type
            reading_marks = "N/A"
            writing_marks = "N/A"
            ao1_marks = "N/A"
            ao2_marks = "N/A"
            content_structure_marks = "N/A"
            style_accuracy_marks = "N/A"
            
            # Only extract marks that are relevant for this question type
            if submission.question_type in ['igcse_writers_effect']:
                # Writers effect only needs reading marks
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    reading_marks = reading_part.strip()
                    for section in next_sections:
                        if section in reading_part:
                            reading_marks = reading_part.split(section)[0].strip()
                            break
            elif submission.question_type in ['igcse_narrative', 'igcse_descriptive']:
                # IGCSE narrative/descriptive need Content and Structure (16 marks) and Style and Accuracy (24 marks)
                # Extract Content and Structure marks (stored in content_structure_marks)
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["WRITING_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    content_structure_marks = reading_part.strip()
                    for section in next_sections:
                        if section in reading_part:
                            content_structure_marks = reading_part.split(section)[0].strip()
                            break
                else:
                    content_structure_marks = "N/A"
                
                # Extract Style and Accuracy marks (stored in style_accuracy_marks)
                if "WRITING_MARKS:" in ai_response:
                    writing_part = ai_response.split("WRITING_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    style_accuracy_marks = writing_part.strip()
                    for section in next_sections:
                        if section in writing_part:
                            style_accuracy_marks = writing_part.split(section)[0].strip()
                            break
                else:
                    style_accuracy_marks = "N/A"
                
                # Set reading_marks and writing_marks to N/A for these question types
                reading_marks = "N/A"
                writing_marks = "N/A"
            elif submission.question_type in ['alevel_directed', 'alevel_directed_writing']:
                # A-Level directed writing needs AO1 and AO2 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO2_MARKS:" in ai_response:
                    ao2_part = ai_response.split("AO2_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    ao2_marks = ao2_part.strip()
                    for section in next_sections:
                        if section in ao2_part:
                            ao2_marks = ao2_part.split(section)[0].strip()
                            break
            elif submission.question_type in ['alevel_comparative']:
                # A-Level comparative needs AO1 and AO3 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO3_MARKS:" in ai_response:
                    ao3_part = ai_response.split("AO3_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    ao1_marks = ao3_part.strip()  # Store AO3 in ao1_marks field for now
                    for section in next_sections:
                        if section in ao3_part:
                            ao1_marks = ao3_part.split(section)[0].strip()
                            break
            elif submission.question_type in ['alevel_text_analysis']:
                # A-Level text analysis needs AO1 and AO3 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO3_MARKS:" in ai_response:
                    ao3_part = ai_response.split("AO3_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    ao2_marks = ao3_part.strip()  # Temporarily store AO3 in ao2_marks (we will compute grade dynamically)
                    for section in next_sections:
                        if section in ao3_part:
                            ao2_marks = ao3_part.split(section)[0].strip()
                            break
            elif submission.question_type in ['alevel_language_change']:
                # A-Level language change needs AO2, AO4, and AO5 marks
                if "AO2_MARKS:" in ai_response:
                    ao2_part = ai_response.split("AO2_MARKS:")[1]
                    next_sections = ["AO4_MARKS:", "AO5_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    ao2_marks = ao2_part.strip()
                    for section in next_sections:
                        if section in ao2_part:
                            ao2_marks = ao2_part.split(section)[0].strip()
                            break
                
                # Store AO4 marks in ao1_marks field (reusing existing field)
                if "AO4_MARKS:" in ai_response:
                    ao4_part = ai_response.split("AO4_MARKS:")[1]
                    next_sections = ["AO5_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    ao1_marks = ao4_part.strip()  # Store AO4 in ao1_marks field
                    for section in next_sections:
                        if section in ao4_part:
                            ao1_marks = ao4_part.split(section)[0].strip()
                            break
                
                # Extract AO5 marks and store in reading_marks field (reusing existing field)
                if "AO5_MARKS:" in ai_response:
                    ao5_part = ai_response.split("AO5_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    reading_marks = ao5_part.strip()  # Store AO5 in reading_marks field
                    for section in next_sections:
                        if section in ao5_part:
                            reading_marks = ao5_part.split(section)[0].strip()
                            break
            else:
                # Fallback: try to extract all marks
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                next_sections = ["WRITING_MARKS:", "AO1_MARKS:", "AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                reading_marks = reading_part.strip()
                for section in next_sections:
                    if section in reading_part:
                        reading_marks = reading_part.split(section)[0].strip()
                        break
            
            if "WRITING_MARKS:" in ai_response:
                writing_part = ai_response.split("WRITING_MARKS:")[1]
                next_sections = ["AO1_MARKS:", "AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                writing_marks = writing_part.strip()
                for section in next_sections:
                    if section in writing_part:
                        writing_marks = writing_part.split(section)[0].strip()
                        break
            
            if "AO1_MARKS:" in ai_response:
                ao1_part = ai_response.split("AO1_MARKS:")[1]
                next_sections = ["AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                ao1_marks = ao1_part.strip()
                for section in next_sections:
                    if section in ao1_part:
                        ao1_marks = ao1_part.split(section)[0].strip()
                        break
            
            if "AO2_MARKS:" in ai_response:
                ao2_part = ai_response.split("AO2_MARKS:")[1]
                next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                ao2_marks = ao2_part.strip()
                for section in next_sections:
                    if section in ao2_part:
                        ao2_marks = ao2_part.split(section)[0].strip()
                        break
            
            # Extract improvements
            improvements_part = ai_response.split("IMPROVEMENTS:")[1] if "IMPROVEMENTS:" in ai_response else ""
            if "STRENGTHS:" in improvements_part:
                improvements_part = improvements_part.split("STRENGTHS:")[0]
            improvements = [imp.strip() for imp in improvements_part.split("|")] if improvements_part else []
            
            # Extract strengths - completely new method
            strengths = []
            if "STRENGTHS:" in ai_response:
                strengths_part = ai_response.split("STRENGTHS:")[1].strip()
                logger.debug(f"DEBUG: Raw strengths part: {strengths_part}")
                
                # Try multiple parsing methods
                if "|" in strengths_part:
                    # Split by pipe
                    strengths = [s.strip() for s in strengths_part.split("|") if s.strip()]
                elif "\n" in strengths_part:
                    # Split by newlines
                    strengths = [s.strip() for s in strengths_part.split("\n") if s.strip() and not s.strip().startswith("Student Response:")]
                else:
                    # Use as single strength
                    strengths = [strengths_part] if strengths_part else []
                
                logger.debug(f"DEBUG: Parsed strengths: {strengths}")
            else:
                strengths = []
        else:
            feedback = ai_response
            grade = "Not provided"
            reading_marks = "N/A"
            writing_marks = "N/A"
            ao1_marks = "N/A"
            ao2_marks = "N/A"
            improvements = []
            strengths = []
        
        # Compute dynamic overall grade, overriding AI grade when possible
        dynamic_grade = compute_overall_grade(
            submission.question_type,
            reading_marks,
            writing_marks,
            ao1_marks,
            ao2_marks,
            content_structure_marks,
            style_accuracy_marks
        )
        if dynamic_grade:
            grade = dynamic_grade

        # Create feedback response
        feedback_response = FeedbackResponse(
            user_id=submission.user_id,
            question_type=submission.question_type,
            student_response=sanitized_response,
            feedback=feedback,
            grade=grade,
            reading_marks=reading_marks,
            writing_marks=writing_marks,
            ao1_marks=ao1_marks,
            ao2_marks=ao2_marks,
            content_structure_marks=content_structure_marks if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
            style_accuracy_marks=style_accuracy_marks if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
            improvement_suggestions=improvements,
            strengths=strengths
        )
        
        logger.debug("DEBUG: Created feedback response, updating user stats...")
        
        # Update user stats
        new_questions_marked = questions_marked + 1
        await user_management_service.update_user(submission.user_id, {
            "questions_marked": new_questions_marked
        })
        
        # Save to database
        # Generate a short, URL-safe id (5 chars) for shareable URLs
        short_id = secrets.token_urlsafe(4)[:5]
        feedback_response.short_id = short_id

        evaluation_data = feedback_response.dict()
        evaluation_data['timestamp'] = evaluation_data['timestamp'].isoformat()
        # Also persist short_id alongside the evaluation record (requires DB column)
        try:
            supabase.table('assessment_evaluations').insert(evaluation_data).execute()
        except Exception:
            # Fallback: if the DB doesn't have short_id column yet, strip it and insert
            eval_copy = {k: v for k, v in evaluation_data.items() if k != 'short_id'}
            supabase.table('assessment_evaluations').insert(eval_copy).execute()
        
        logger.debug("DEBUG: Evaluation completed successfully")
        return feedback_response
        
    except HTTPException as http_exc:
        # Preserve intended HTTP error codes (e.g., 400, 404)
        raise http_exc
    except Exception as e:
        logger.error("ERROR in evaluate_submission", extra={"error": str(e)})
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")

@router.get("/test-history/{user_id}")
async def test_history(user_id: str):
    """Test endpoint to check evaluation history"""
    try:
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).limit(10).execute()
        evaluations = evaluations_response.data
        
        return {
            "user_id": user_id,
            "evaluations": evaluations,
            "count": len(evaluations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History test error: {str(e)}")

@router.get("/history/{user_id}")
async def get_evaluation_history(user_id: str):
    """Get evaluation history for a user"""
    try:
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).limit(100).execute()
        evaluations = evaluations_response.data
        
        return {"evaluations": evaluations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval error: {str(e)}")

@router.get("/evaluations/user/{user_id}")
async def get_user_evaluations(user_id: str):
    """Get all evaluations for a specific user"""
    try:
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).execute()
        evaluations = evaluations_response.data
        
        return {"evaluations": evaluations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User evaluations retrieval error: {str(e)}")

@router.get("/evaluations/{evaluation_id}")
async def get_evaluation_by_id(evaluation_id: str):
    """Get a specific evaluation by ID"""
    try:
        evaluation_response = supabase.table('assessment_evaluations').select('*').eq('id', evaluation_id).execute()
        evaluation = evaluation_response.data[0] if evaluation_response.data else None
        
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        return {"evaluation": evaluation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation retrieval error: {str(e)}")

@router.post("/feedback")
async def submit_feedback(feedback: dict):
    """Submit user feedback about the evaluation system"""
    try:
        feedback_data = {
            "user_id": feedback.get("user_id"),
            "evaluation_id": feedback.get("evaluation_id"),
            "feedback_type": feedback.get("feedback_type"),
            "feedback_text": feedback.get("feedback_text"),
            "rating": feedback.get("rating"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        supabase.table('assessment_feedback').insert(feedback_data).execute()
        
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback submission error: {str(e)}")
