"""
Core evaluation service containing the main evaluation logic.
"""
import json
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
        
        # Map command words to their specific criteria keys
        command_word_mapping = {
            'evaluate': 'gp_essay_evaluate',
            'evaluate the extent to which': 'gp_essay_evaluate',
            'evaluate whether': 'gp_essay_evaluate',
            'assess': 'gp_essay_assess',
            'assess the view that': 'gp_essay_assess',
            'assess whether': 'gp_essay_assess',
            'discuss': 'gp_essay_discuss',
            'discuss this statement': 'gp_essay_discuss',
            'to what extent': 'gp_essay_to_what_extent',
            'how far do you agree': 'gp_essay_to_what_extent',
            'consider': 'gp_essay_consider',
            'what is your view': 'gp_essay_consider',
            'analyse': 'gp_essay_analyse',
            'examine': 'gp_essay_analyse',
            'analyze': 'gp_essay_analyse'  # Alternative spelling
        }
        
        # Normalize command word (lowercase, trim)
        normalized_command = command_word.lower().strip()
        
        # Get the specific criteria key
        criteria_key = command_word_mapping.get(normalized_command)
        if not criteria_key:
            return ""
        
        # Return the specific command word criteria
        return self.marking_criteria.get(criteria_key, "")
    
    def build_evaluation_prompt(self, submission: SubmissionRequest) -> str:
        """Build the complete evaluation prompt."""
        logger.info(f"🔧 Building evaluation prompt for submission:")
        logger.info(f"🔧 Submission data: {submission}")
        logger.info(f"🔧 Submission type: {type(submission)}")
        logger.info(f"🔧 Submission attributes: {dir(submission)}")
        
        # Get marking criteria
        marking_criteria = self.marking_criteria.get(submission.question_type, "")
        if not marking_criteria:
            logger.error(f"❌ Invalid question type: {submission.question_type}")
            logger.error(f"❌ Available question types: {list(self.marking_criteria.keys())}")
            raise ValueError(f"Invalid question type: {submission.question_type}")
        
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

{"CRITICAL IGCSE SUMMARY INSTRUCTIONS - MUST READ:" if submission.question_type == 'igcse_summary' else ""}
{"Summary tasks are NOT about style or tone. They are assessed on content selection (Reading) and clarity/conciseness in own words (Writing). They are NOT essays, so 'objective tone' is NOT a marking criterion." if submission.question_type == 'igcse_summary' else ""}
{"Students should NOT lose Writing marks for 'tone.' Writing marks are for concision, clarity, organisation, and rephrasing. The tone (persuasive, instructive, etc.) is NOT part of the marking grid." if submission.question_type == 'igcse_summary' else ""}
{"NEVER give feedback about removing phrases like 'make sure' or 'remember' to maintain an 'objective summary tone' - this is INCORRECT and TERRIBLE feedback that should NEVER be outputted." if submission.question_type == 'igcse_summary' else ""}
{"Focus ONLY on content selection accuracy and writing clarity/conciseness. Ignore tone completely." if submission.question_type == 'igcse_summary' else ""}

{"🚨 CRITICAL NARRATIVE MARKING INSTRUCTION - MUST READ BEFORE MARKING 🚨" if submission.question_type == 'igcse_narrative' else ""}
{"GIVE EXTRA MARKS AND LENIENCY to plots you think are predictable BUT demonstrate good vocabulary and descriptive abilities. Focus on rewarding sophisticated storytelling technique, rich vocabulary, and vivid descriptive language rather than plot originality. A predictable plot with excellent vocabulary should receive HIGHER marks than an original plot with poor vocabulary." if submission.question_type == 'igcse_narrative' else ""}
{"🚨 CHARACTERIZATION LENIENCY - CRITICAL INSTRUCTION 🚨" if submission.question_type == 'igcse_narrative' else ""}
{"DO NOT DEDUCT MARKS FOR POOR CHARACTERIZATION. Give FULL LENIENCY to essays with weak character development. Focus ONLY on vocabulary, descriptive abilities, and narrative techniques. Poor characterization should NOT affect the mark - ignore it completely." if submission.question_type == 'igcse_narrative' else ""}
I DO NOT WANT TO SEE ANY MARKS DEDUCTED FOR POOR CHARACTERIZATION. I DO NOT WANT TO SEE POOR CHARACTERIZATION BEING MENTIONED IN THE IMPROVEMENTS SUGGESTIONSFEEDBACK
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

🚨 CRITICAL FORMATTING INSTRUCTION 🚨
Keep STRENGTHS, IMPROVEMENTS, and NEXT STEPS completely separate. Do NOT mix them up or put next steps content in the strengths section. Do NOT put improvements or strengths content in the next steps section. Each section must contain ONLY its own content.

FORMAT REQUIREMENTS:
- IMPROVEMENTS: Only areas that need work in THIS specific essay
- STRENGTHS: Only what the student did well in THIS specific essay  
- NEXT STEPS: Only actionable future actions for the student

DO NOT put "IMPROVEMENTS:" or "STRENGTHS:" labels inside the NEXT STEPS section. Each section must be completely independent. 

PLEASE DO NOT GIVE MORE THAN 3 STRENGTHS AND 3 IMPROVEMENTS AND 3 NEXT STEPS. PLEASE DO NOT GIVE LESS THAN 3 STRENGTHS AND 3 IMPROVEMENTS AND 3 NEXT STEPS.

STRENGTHS should ONLY contain what the student did well in THIS specific essay (e.g., "Used sophisticated vocabulary like 'ubiquitous' and 'paradigm'", "Created a clear argument structure with strong topic sentences").

IMPROVEMENTS should ONLY contain areas that need work in THIS specific essay (e.g., "Some sentences were too long and complex", "Missing specific examples to support claims").

NEXT STEPS should ONLY contain actionable future actions (e.g., "Practice writing shorter, clearer sentences", "Read 3 sample essays to see how evidence is used").

🚨 NEXT STEPS SECTION RULES 🚨
- Do NOT include "IMPROVEMENTS:" or "STRENGTHS:" labels in the NEXT STEPS section
- Do NOT include improvement suggestions in the NEXT STEPS section
- Do NOT include strength observations in the NEXT STEPS section
- NEXT STEPS should be completely independent and contain only future actions

CRITICAL: For the FEEDBACK section, format it as bullet points where each bu

PLEASE READ AND UNDERSTAND THE EXAMPLES MARKING IN THE PROMPT. UNDERSTAND HOW THE ESSAY IS GRADED. 

Student Response: {sanitized_response}

{"Marking Scheme: " + sanitized_scheme if sanitized_scheme else ""}

{"CRITICAL IGCSE SUMMARY INSTRUCTIONS - MUST READ:" if submission.question_type == 'igcse_summary' else ""}
{"Summary tasks are NOT about style or tone. They are assessed on content selection (Reading) and clarity/conciseness in own words (Writing). They are NOT essays, so 'objective tone' is NOT a marking criterion." if submission.question_type == 'igcse_summary' else ""}
{"Students should NOT lose Writing marks for 'tone.' Writing marks are for concision, clarity, organisation, and rephrasing. The tone (persuasive, instructive, etc.) is NOT part of the marking grid." if submission.question_type == 'igcse_summary' else ""}
{"NEVER give feedback about removing phrases like 'make sure' or 'remember' to maintain an 'objective summary tone' - this is INCORRECT and TERRIBLE feedback that should NEVER be outputted." if submission.question_type == 'igcse_summary' else ""}
{"Focus ONLY on content selection accuracy and writing clarity/conciseness. Ignore tone completely." if submission.question_type == 'igcse_summary' else ""}
{"DO NOT GIVE FEEDBACK LIKE THIS. DO NOT GIVE FEEDBACK LIKE THIS. PLEASE DO NOT CUT MARKS FOR THESE REASONS: The response includes advisory language (\"make sure\", \"remember\") that is not present in the source text, which should not be included in a summary AND Remove phrases like \"make sure\" and \"remember\" to maintain an objective summary tone." if submission.question_type == 'igcse_summary' else ""}

{"CRITICAL IGCSE NARRATIVE/DESCRIPTIVE INSTRUCTIONS - MUST READ:" if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else ""}
{"If your feedback and understanding of the essay concludes that the essay has consistent grammatical errors and bad sentence structures, the essay must not be given more than 21/40 and consider giving it less than 20/40. Please remember this rule ONLY applies if the essay needs CONSISTENTLY (NOT ONE OFF) to: Develop more complex sentence structures to vary the rhythm and flow of the narrative AND Fix grammatical errors, particularly with pronoun usage and awkward phrasing." if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else ""}
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
            if grade_part:
                # Find the next section after GRADE
                next_sections = ["READING_MARKS:", "AO1_MARKS:", "IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
                grade = grade_part.strip()
                for section in next_sections:
                    if section in grade_part:
                        grade = grade_part.split(section)[0].strip()
                        break
            else:
                grade = "Not provided"
            
            # Extract marks based on question type
            reading_marks = "N/A"
            writing_marks = "N/A"
            ao1_marks = "N/A"
            ao2_marks = "N/A"
            ao3_marks = "N/A"
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
                    ao3_marks = ao3_part.strip()
                    for section in next_sections:
                        if section in ao3_part:
                            ao3_marks = ao3_part.split(section)[0].strip()
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
                    # For GP essays, AO2_MARKS should be followed by AO3_MARKS, so split on that
                    if "AO3_MARKS:" in ao2_part:
                        ao2_marks = ao2_part.split("AO3_MARKS:")[0].strip()
                    else:
                        # If no AO3_MARKS found, look for other sections
                        next_sections = ["IMPROVEMENTS:", "STRENGTHS:", "NEXT STEPS:"]
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
                
                # Clean up any mixed content - remove IMPROVEMENTS and STRENGTHS labels
                next_steps_part = next_steps_part.replace("IMPROVEMENTS:", "").replace("STRENGTHS:", "")
                
                # Try multiple parsing methods
                if "|" in next_steps_part:
                    # Split by pipe and filter out any items that contain improvement/strength labels
                    raw_steps = [s.strip() for s in next_steps_part.split("|") if s.strip()]
                    next_steps = [step for step in raw_steps if not any(label in step.upper() for label in ["IMPROVEMENTS:", "STRENGTHS:", "IMPROVEMENT:", "STRENGTH:"])]
                elif "\n" in next_steps_part:
                    # Split by newlines and filter
                    raw_steps = [s.strip() for s in next_steps_part.split("\n") if s.strip() and not s.strip().startswith("Student Response:")]
                    next_steps = [step for step in raw_steps if not any(label in step.upper() for label in ["IMPROVEMENTS:", "STRENGTHS:", "IMPROVEMENT:", "STRENGTH:"])]
                else:
                    # Use as single next step if it doesn't contain mixed content
                    if not any(label in next_steps_part.upper() for label in ["IMPROVEMENTS:", "STRENGTHS:", "IMPROVEMENT:", "STRENGTH:"]):
                        next_steps = [next_steps_part] if next_steps_part else []
                    else:
                        next_steps = []
                
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
            ao3_marks = "N/A"
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
            "ao3_marks": ao3_marks,
            "content_structure_marks": content_structure_marks,
            "style_accuracy_marks": style_accuracy_marks,
            "improvements": improvements,
            "strengths": strengths,
            "next_steps": next_steps
        }
    
    async def evaluate_submission(self, submission: SubmissionRequest) -> FeedbackResponse:
        """Evaluate a student submission and return feedback."""
        import time
        start_time = time.time()
        
        try:
            logger.info(f"🔧 Starting evaluation for submission:")
            logger.info(f"🔧 Submission object: {submission}")
            logger.info(f"🔧 Submission dict: {submission.__dict__ if hasattr(submission, '__dict__') else 'No __dict__'}")
            logger.info(f"🔧 Submission type: {type(submission)}")
            
            # Validate question type
            if submission.question_type not in self.marking_criteria:
                logger.error(f"❌ Invalid question type: {submission.question_type}")
                logger.error(f"❌ Available question types: {list(self.marking_criteria.keys())}")
                raise ValueError(f"Invalid question type: {submission.question_type}")
            
            # Check if question type requires marking scheme
            requires_marking_scheme = submission.question_type in [
                'igcse_summary', 'alevel_comparative', 'alevel_text_analysis', 'alevel_language_change'
            ]
            
            if requires_marking_scheme and not submission.marking_scheme:
                raise ValueError("This question type requires a marking scheme")
            
            # Build evaluation prompt
            prompt_start = time.time()
            full_prompt = self.build_evaluation_prompt(submission)
            prompt_time = time.time() - prompt_start
            
            logger.debug(f"Prompt building took {prompt_time:.2f}s, length: {len(full_prompt)}")
            
            # Call AI API
            ai_start = time.time()
            logger.info(f"🚀 PERFORMANCE: Starting AI API call...")
            logger.info(f"🚀 PERFORMANCE: Prompt length: {len(full_prompt)} characters")
            ai_response, _ = await call_deepseek_api(full_prompt)
            ai_time = time.time() - ai_start
            
            logger.info(f"🚀 PERFORMANCE: AI API call completed in {ai_time:.2f}s")
            logger.info(f"🚀 PERFORMANCE: Response length: {len(ai_response)} characters")
            
            # Log slow AI calls
            if ai_time > 15:
                logger.warning(f"⚠️ PERFORMANCE: Slow AI call detected: {ai_time:.2f}s")
            elif ai_time > 30:
                logger.error(f"❌ PERFORMANCE: Very slow AI call: {ai_time:.2f}s")
            
            # Store full chat data for admin view
            full_chat_data = {
                "prompt": full_prompt,
                "response": ai_response,
                "timestamp": datetime.now().isoformat()
            }
            
            # Parse AI response
            parse_start = time.time()
            parsed_data = self.parse_ai_response(ai_response, submission.question_type)
            parse_time = time.time() - parse_start
            
            logger.debug(f"Response parsing took {parse_time:.2f}s")
            
            # Compute dynamic overall grade
            grade_start = time.time()
            dynamic_grade = compute_overall_grade(
                submission.question_type,
                parsed_data["reading_marks"],
                parsed_data["writing_marks"],
                parsed_data["ao1_marks"],
                parsed_data["ao2_marks"],
                parsed_data["content_structure_marks"],
                parsed_data["style_accuracy_marks"],
                parsed_data["ao3_marks"] if submission.question_type == 'gp_essay' else None
            )
            grade_time = time.time() - grade_start
            
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
                ao3_marks=parsed_data["ao3_marks"] if submission.question_type in ['gp_essay'] else None,
                content_structure_marks=parsed_data["content_structure_marks"] if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
                style_accuracy_marks=parsed_data["style_accuracy_marks"] if submission.question_type in ['igcse_narrative', 'igcse_descriptive'] else None,
                improvement_suggestions=parsed_data["improvements"],
                strengths=parsed_data["strengths"],
                next_steps=parsed_data["next_steps"],
                full_chat=json.dumps(full_chat_data)
            )
            
            # Generate short ID for shareable URLs
            short_id = secrets.token_urlsafe(4)[:5]
            feedback_response.short_id = short_id
            
            total_time = time.time() - start_time
            logger.info(f"Evaluation completed in {total_time:.2f}s (prompt: {prompt_time:.2f}s, AI: {ai_time:.2f}s, parse: {parse_time:.2f}s, grade: {grade_time:.2f}s)")
            
            # Log performance warnings
            if total_time > 30:
                logger.warning(f"Slow evaluation detected: {total_time:.2f}s for question type {submission.question_type}")
            if ai_time > 20:
                logger.warning(f"Slow AI API call: {ai_time:.2f}s")
            
            return feedback_response
            
        except Exception as e:
            total_time = time.time() - start_time
            logger.error(f"ERROR in evaluate_submission after {total_time:.2f}s: {str(e)}")
            raise
