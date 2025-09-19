"""
Core evaluation service containing the main evaluation logic.
"""
import logging
import secrets
import re
from datetime import datetime
from typing import Optional, Dict, Any, List
from models.evaluation import SubmissionRequest, FeedbackResponse
from services.ai_service import call_deepseek_api
from utils.grading import compute_overall_grade
from schemas.marking_criteria import MARKING_CRITERIA

logger = logging.getLogger(__name__)

class EvaluationService:
    """Service for handling essay evaluations."""
    
    def __init__(self):
        self.marking_criteria = MARKING_CRITERIA
    
    def sanitize_input(self, text: str) -> str:
        """Sanitize input to prevent prompt injection."""
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
    
    def get_sub_marks_requirements(self, question_type: str) -> str:
        """Get sub-marks requirements for a question type."""
        sub_marks_requirements = {
            'igcse_summary': 'READING_MARKS: [Reading marks out of 15 - must be in format like "10/15"] | WRITING_MARKS: [Writing marks out of 25 - must be in format like "17/25"]',
            'igcse_writers_effect': 'READING_MARKS: [Reading marks out of 15]',
            'igcse_directed': 'READING_MARKS: [Reading marks out of 15 - must be in format like "10/15"] | WRITING_MARKS: [Writing marks out of 25 - must be in format like "17/25"]',
            'alevel_directed': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'igcse_narrative': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'igcse_descriptive': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'alevel_comparative': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 10]',
            'alevel_directed_writing': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'alevel_text_analysis': 'AO1_MARKS: [AO1 marks out of 5] | AO3_MARKS: [AO3 marks out of 20]',
            'alevel_reflective_commentary': 'AO3_MARKS: [AO3 marks out of 10]',
            'alevel_language_change': 'AO2_MARKS: [AO2 marks out of 5] | AO4_MARKS: [AO4 marks out of 5] | AO5_MARKS: [AO5 marks out of 15]',
            'gp_essay': 'AO1_MARKS: [AO1 marks out of 6] | AO2_MARKS: [AO2 marks out of 12] | AO3_MARKS: [AO3 marks out of 12]'
        }
        
        return sub_marks_requirements.get(question_type, '')
    
    def get_gp_essay_command_word_criteria(self, command_word: str) -> str:
        """Get specific command word criteria for GP Essay."""
        if not command_word:
            return ""
        
        # Map command words to their specific criteria sections
        command_word_mapping = {
            'evaluate': 'EVALUATE / EVALUATE THE EXTENT TO WHICH / EVALUATE WHETHER',
            'evaluate the extent to which': 'EVALUATE / EVALUATE THE EXTENT TO WHICH / EVALUATE WHETHER',
            'evaluate whether': 'EVALUATE / EVALUATE THE EXTENT TO WHICH / EVALUATE WHETHER',
            'assess': 'ASSESS / ASSESS THE VIEW THAT / ASSESS WHETHER',
            'assess the view that': 'ASSESS / ASSESS THE VIEW THAT / ASSESS WHETHER',
            'assess whether': 'ASSESS / ASSESS THE VIEW THAT / ASSESS WHETHER',
            'discuss': 'DISCUSS / DISCUSS THIS STATEMENT',
            'discuss this statement': 'DISCUSS / DISCUSS THIS STATEMENT',
            'to what extent': 'TO WHAT EXTENT / HOW FAR DO YOU AGREE',
            'how far do you agree': 'TO WHAT EXTENT / HOW FAR DO YOU AGREE',
            'consider': 'CONSIDER / WHAT IS YOUR VIEW',
            'what is your view': 'CONSIDER / WHAT IS YOUR VIEW',
            'analyse': 'ANALYSE / EXAMINE',
            'examine': 'ANALYSE / EXAMINE'
        }
        
        # Normalize command word (lowercase, trim)
        normalized_command = command_word.lower().strip()
        
        # Find matching section header
        section_header = command_word_mapping.get(normalized_command)
        if not section_header:
            return ""
        
        # Extract the specific criteria for this command word from the marking criteria
        gp_essay_criteria = self.marking_criteria.get('gp_essay', '')
        
        # Find the start of the command word section
        start_marker = f"{section_header}"
        start_index = gp_essay_criteria.find(start_marker)
        
        if start_index == -1:
            return ""
        
        # Find the end of this section (next section or end of command word criteria)
        end_markers = [
            "═══════════════════════════════════════════════════════════════════",
            "IMPLEMENTATION GUIDANCE FOR AI MARKING:",
            "ASSESSMENT LEVELS (Total: 30 marks):"
        ]
        
        end_index = len(gp_essay_criteria)
        for marker in end_markers:
            marker_index = gp_essay_criteria.find(marker, start_index)
            if marker_index != -1 and marker_index < end_index:
                end_index = marker_index
        
        # Extract the specific command word criteria
        command_word_criteria = gp_essay_criteria[start_index:end_index].strip()
        
        return command_word_criteria
    
    def build_evaluation_prompt(self, submission: SubmissionRequest) -> str:
        """Build the complete evaluation prompt."""
        # Get marking criteria
        marking_criteria = self.marking_criteria.get(submission.question_type, "")
        if not marking_criteria:
            raise ValueError("Invalid question type")
        
        # For IGCSE directed writing, combine general criteria with text-type-specific criteria
        if submission.question_type == 'igcse_directed' and submission.text_type:
            text_type_key = f"igcse_directed_{submission.text_type}"
            text_type_criteria = self.marking_criteria.get(text_type_key, "")
            if text_type_criteria:
                marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
        
        # For GP Essay, combine general criteria with command-word-specific criteria
        if submission.question_type == 'gp_essay' and submission.command_word:
            command_word_criteria = self.get_gp_essay_command_word_criteria(submission.command_word)
            if command_word_criteria:
                marking_criteria = f"{marking_criteria}\n\n{command_word_criteria}"
        
        # Add marking scheme to criteria if provided
        if submission.marking_scheme:
            marking_criteria = f"{marking_criteria}\n\nMarking Scheme:\n{submission.marking_scheme}"
        
        # Get sub-marks requirements
        sub_marks_requirement = self.get_sub_marks_requirements(submission.question_type)
        
        # Sanitize inputs
        sanitized_response = self.sanitize_input(submission.student_response)
        sanitized_scheme = self.sanitize_input(submission.marking_scheme) if submission.marking_scheme else None
        
        # Build the complete prompt
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

CRITICAL: When providing marks, ALWAYS include both the awarded marks and total marks in format like "10/15" or "17/25". Never provide just the awarded marks alone.

IMPORTANT: For strengths, analyze the actual content and identify specific, unique strengths from THIS student's response. Don't use generic statements. Look for:
- Specific vocabulary choices that work well
- Particular sentence structures or techniques used effectively
- Unique ideas or creative approaches
- Specific examples or evidence provided
- Particular writing techniques demonstrated
- Specific aspects of organization or structure that work

CRITICAL: For NEXT STEPS, provide 3 specific, actionable steps the student should take to improve their writing. These should be concrete actions like:
- "Practice writing topic sentences that clearly state your main argument"
- "Read 3 sample essays and identify how they use evidence to support claims"
- "Write 5 practice sentences using advanced vocabulary from your word bank"
- "Create an outline template and use it for your next 3 essays"
- "Study how professional writers use transitions between paragraphs"

Format your response EXACTLY as follows with clear line breaks:

FEEDBACK: 
[detailed feedback in bullet points - each point should be a complete, standalone sentence that makes sense on its own]

GRADE: 
[overall grade]

{sub_marks_requirement}

IMPROVEMENTS: 
[improvement 1] | [improvement 2] | [improvement 3]

STRENGTHS: 
[strength 1 - specific to this essay] | [strength 2 - specific to this essay] | [strength 3 - specific to this essay]

NEXT STEPS: 
[specific action 1] | [specific action 2] | [specific action 3]

CRITICAL: Keep STRENGTHS, IMPROVEMENTS, and NEXT STEPS completely separate. Do NOT mix them up or put next steps content in the strengths section.

STRENGTHS should ONLY contain what the student did well in THIS specific essay (e.g., "Used sophisticated vocabulary like 'ubiquitous' and 'paradigm'", "Created a clear argument structure with strong topic sentences").

IMPROVEMENTS should ONLY contain areas that need work in THIS specific essay (e.g., "Some sentences were too long and complex", "Missing specific examples to support claims").

NEXT STEPS should ONLY contain actionable future actions (e.g., "Practice writing shorter, clearer sentences", "Read 3 sample essays to see how evidence is used").

CRITICAL: For the FEEDBACK section, format it as bullet points where each bu

PLEASE READ AND UNDERSTAND THE EXAMPLES MARKING IN THE PROMPT. UNDERSTAND HOW THE ESSAY IS GRADED. 

Student Response: {sanitized_response}

{"Marking Scheme: " + sanitized_scheme if sanitized_scheme else ""}
"""
        
        return full_prompt
    
    def parse_ai_response(self, ai_response: str, question_type: str) -> Dict[str, Any]:
        """Parse the AI response and extract structured data."""
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
            
            # Extract marks based on question type
            if question_type in ['igcse_writers_effect']:
                # Writers effect only needs reading marks
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    reading_marks = reading_part.strip()
                    for section in next_sections:
                        if section in reading_part:
                            reading_marks = reading_part.split(section)[0].strip()
                            break
            elif question_type in ['igcse_narrative', 'igcse_descriptive']:
                # IGCSE narrative/descriptive need Content and Structure (16 marks) and Style and Accuracy (24 marks)
                # Extract Content and Structure marks (stored in content_structure_marks)
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["WRITING_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
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
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
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
            elif question_type in ['alevel_directed', 'alevel_directed_writing']:
                # A-Level directed writing needs AO1 and AO2 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO2_MARKS:" in ai_response:
                    ao2_part = ai_response.split("AO2_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao2_marks = ao2_part.strip()
                    for section in next_sections:
                        if section in ao2_part:
                            ao2_marks = ao2_part.split(section)[0].strip()
                            break
            elif question_type in ['alevel_comparative']:
                # A-Level comparative needs AO1 and AO3 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO3_MARKS:" in ai_response:
                    ao3_part = ai_response.split("AO3_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao3_part.strip()  # Store AO3 in ao1_marks field for now
                    for section in next_sections:
                        if section in ao3_part:
                            ao1_marks = ao3_part.split(section)[0].strip()
                            break
            elif question_type in ['alevel_text_analysis']:
                # A-Level text analysis needs AO1 and AO3 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO3_MARKS:" in ai_response:
                    ao3_part = ai_response.split("AO3_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao2_marks = ao3_part.strip()  # Temporarily store AO3 in ao2_marks (we will compute grade dynamically)
                    for section in next_sections:
                        if section in ao3_part:
                            ao2_marks = ao3_part.split(section)[0].strip()
                            break
            elif question_type in ['gp_essay']:
                # GP essay needs AO1, AO2, and AO3 marks
                if "AO1_MARKS:" in ai_response:
                    ao1_part = ai_response.split("AO1_MARKS:")[1]
                    next_sections = ["AO2_MARKS:", "AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao1_part.strip()
                    for section in next_sections:
                        if section in ao1_part:
                            ao1_marks = ao1_part.split(section)[0].strip()
                            break
                
                if "AO2_MARKS:" in ai_response:
                    ao2_part = ai_response.split("AO2_MARKS:")[1]
                    next_sections = ["AO3_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao2_marks = ao2_part.strip()
                    for section in next_sections:
                        if section in ao2_part:
                            ao2_marks = ao2_part.split(section)[0].strip()
                            break
                
                if "AO3_MARKS:" in ai_response:
                    ao3_part = ai_response.split("AO3_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao3_marks = ao3_part.strip()
                    for section in next_sections:
                        if section in ao3_part:
                            ao3_marks = ao3_part.split(section)[0].strip()
                            break
                
                # Set reading_marks and writing_marks to N/A for GP essay
                reading_marks = "N/A"
                writing_marks = "N/A"
            elif question_type in ['alevel_language_change']:
                # A-Level language change needs AO2, AO4, and AO5 marks
                if "AO2_MARKS:" in ai_response:
                    ao2_part = ai_response.split("AO2_MARKS:")[1]
                    next_sections = ["AO4_MARKS:", "AO5_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao2_marks = ao2_part.strip()
                    for section in next_sections:
                        if section in ao2_part:
                            ao2_marks = ao2_part.split(section)[0].strip()
                            break
                
                # Store AO4 marks in ao1_marks field (reusing existing field)
                if "AO4_MARKS:" in ai_response:
                    ao4_part = ai_response.split("AO4_MARKS:")[1]
                    next_sections = ["AO5_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    ao1_marks = ao4_part.strip()  # Store AO4 in ao1_marks field
                    for section in next_sections:
                        if section in ao4_part:
                            ao1_marks = ao4_part.split(section)[0].strip()
                            break
                
                # Extract AO5 marks and store in reading_marks field (reusing existing field)
                if "AO5_MARKS:" in ai_response:
                    ao5_part = ai_response.split("AO5_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    reading_marks = ao5_part.strip()  # Store AO5 in reading_marks field
                    for section in next_sections:
                        if section in ao5_part:
                            reading_marks = ao5_part.split(section)[0].strip()
                            break
            else:
                # Fallback: try to extract all marks
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["WRITING_MARKS:", "AO1_MARKS:", "AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                    reading_marks = reading_part.strip()
                    for section in next_sections:
                        if section in reading_part:
                            reading_marks = reading_part.split(section)[0].strip()
                            break
            
            if "WRITING_MARKS:" in ai_response:
                writing_part = ai_response.split("WRITING_MARKS:")[1]
                next_sections = ["AO1_MARKS:", "AO2_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
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
            improvements = []
            if "IMPROVEMENTS:" in ai_response:
                improvements_part = ai_response.split("IMPROVEMENTS:")[1].strip()
                # Remove NEXT STEPS if present
                if "NEXT STEPS:" in improvements_part:
                    improvements_part = improvements_part.split("NEXT STEPS:")[0].strip()
                # Remove STRENGTHS if present
                if "STRENGTHS:" in improvements_part:
                    improvements_part = improvements_part.split("STRENGTHS:")[0].strip()
                
                logger.debug(f"DEBUG: Raw improvements part: {improvements_part}")
                
                # Try multiple parsing methods
                if "|" in improvements_part:
                    # Split by pipe
                    improvements = [s.strip() for s in improvements_part.split("|") if s.strip()]
                elif "\n" in improvements_part:
                    # Split by newlines
                    improvements = [s.strip() for s in improvements_part.split("\n") if s.strip() and not s.strip().startswith("Student Response:")]
                else:
                    # Use as single improvement
                    improvements = [improvements_part] if improvements_part else []
                
                logger.debug(f"DEBUG: Parsed improvements: {improvements}")
            else:
                improvements = []
            
            # Extract strengths
            strengths = []
            if "STRENGTHS:" in ai_response:
                strengths_part = ai_response.split("STRENGTHS:")[1].strip()
                # Remove NEXT STEPS if present
                if "NEXT STEPS:" in strengths_part:
                    strengths_part = strengths_part.split("NEXT STEPS:")[0].strip()
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
            
            # Extract next steps
            next_steps = []
            if "NEXT STEPS:" in ai_response:
                next_steps_part = ai_response.split("NEXT STEPS:")[1].strip()
                logger.debug(f"DEBUG: Raw next steps part: {next_steps_part}")
                
                # Try multiple parsing methods
                if "|" in next_steps_part:
                    # Split by pipe
                    next_steps = [s.strip() for s in next_steps_part.split("|") if s.strip()]
                elif "\n" in next_steps_part:
                    # Split by newlines
                    next_steps = [s.strip() for s in next_steps_part.split("\n") if s.strip() and not s.strip().startswith("Student Response:")]
                else:
                    # Use as single next step
                    next_steps = [next_steps_part] if next_steps_part else []
                
                logger.debug(f"DEBUG: Parsed next steps: {next_steps}")
            else:
                next_steps = []
        else:
            feedback = ai_response
            grade = "Not provided"
            reading_marks = "N/A"
            writing_marks = "N/A"
            ao1_marks = "N/A"
            ao2_marks = "N/A"
            improvements = []
            strengths = []
            next_steps = []
        
        return {
            "feedback": feedback,
            "grade": grade,
            "reading_marks": reading_marks,
            "writing_marks": writing_marks,
            "ao1_marks": ao1_marks,
            "ao2_marks": ao2_marks,
            "content_structure_marks": content_structure_marks,
            "style_accuracy_marks": style_accuracy_marks,
            "improvements": improvements,
            "strengths": strengths,
            "next_steps": next_steps
        }
    
    async def evaluate_submission(self, submission: SubmissionRequest) -> FeedbackResponse:
        """Evaluate a student submission and return feedback."""
        try:
            # Validate question type
            if submission.question_type not in self.marking_criteria:
                raise ValueError("Invalid question type")
            
            # Check if question type requires marking scheme
            requires_marking_scheme = submission.question_type in [
                'igcse_summary', 'alevel_comparative', 'alevel_text_analysis', 'alevel_language_change'
            ]
            
            if requires_marking_scheme and not submission.marking_scheme:
                raise ValueError("This question type requires a marking scheme")
            
            # Build evaluation prompt
            full_prompt = self.build_evaluation_prompt(submission)
            
            logger.debug(f"DEBUG: Full prompt length: {len(full_prompt)}")
            logger.debug(f"DEBUG: First 500 chars of prompt: {full_prompt[:500]}")
            
            # Call AI API
            logger.debug("DEBUG: Calling DeepSeek API...")
            ai_response, _ = await call_deepseek_api(full_prompt)
            
            logger.debug(f"DEBUG: AI Response received: {ai_response[:500]}...")
            
            # Parse AI response
            parsed_data = self.parse_ai_response(ai_response, submission.question_type)
            
            # Compute dynamic overall grade
            dynamic_grade = compute_overall_grade(
                submission.question_type,
                parsed_data["reading_marks"],
                parsed_data["writing_marks"],
                parsed_data["ao1_marks"],
                parsed_data["ao2_marks"],
                parsed_data["content_structure_marks"],
                parsed_data["style_accuracy_marks"]
            )
            
            if dynamic_grade:
                parsed_data["grade"] = dynamic_grade
            
            # Create feedback response
            feedback_response = FeedbackResponse(
                user_id=submission.user_id,
                question_type=submission.question_type,
                student_response=self.sanitize_input(submission.student_response),
                feedback=parsed_data["feedback"],
                grade=parsed_data["grade"],
                reading_marks=parsed_data["reading_marks"],
                writing_marks=parsed_data["writing_marks"],
                ao1_marks=parsed_data["ao1_marks"],
                ao2_marks=parsed_data["ao2_marks"],
                content_structure_marks=parsed_data["content_structure_marks"] if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
                style_accuracy_marks=parsed_data["style_accuracy_marks"] if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
                improvement_suggestions=parsed_data["improvements"],
                strengths=parsed_data["strengths"],
                next_steps=parsed_data["next_steps"]
            )
            
            # Generate short ID for shareable URLs
            short_id = secrets.token_urlsafe(4)[:5]
            feedback_response.short_id = short_id
            
            logger.debug("DEBUG: Evaluation completed successfully")
            return feedback_response
            
        except Exception as e:
            logger.error(f"ERROR in evaluate_submission: {str(e)}")
            raise
