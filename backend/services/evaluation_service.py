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
            'igcse_extended_q3': 'READING_MARKS: [Reading marks out of 15 - must be in format like "10/15"] | WRITING_MARKS: [Writing marks out of 10 - must be in format like "7/10"]',
            'alevel_directed': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'igcse_narrative': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'igcse_descriptive': 'READING_MARKS: [Content and Structure marks out of 16] | WRITING_MARKS: [Style and Accuracy marks out of 24]',
            'alevel_comparative': 'AO1_MARKS: [AO1 marks out of 5] | AO3_MARKS: [AO3 marks out of 10]',
            'alevel_directed_writing': 'AO2_MARKS: [AO2 marks out of 15]',
            'alevel_text_analysis': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 20]',
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
        
        logger.info(f"📋 Base marking criteria loaded for: {submission.question_type}")
        
        # For IGCSE directed writing, combine general criteria with text-type-specific criteria
        if submission.question_type == 'igcse_directed':
            logger.info(f"🎯 IGCSE Directed detected - text_type: {submission.text_type}")
            if submission.text_type:
                text_type_key = f"igcse_directed_{submission.text_type}"
                logger.info(f"🔍 Looking for text-type criteria with key: {text_type_key}")
                text_type_criteria = self.marking_criteria.get(text_type_key, "")
                if text_type_criteria:
                    logger.info(f"✅ Text-type criteria found and added: {text_type_key}")
                    logger.info(f"📏 Combined criteria length: {len(marking_criteria)} + {len(text_type_criteria)} = {len(marking_criteria) + len(text_type_criteria)}")
                    marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
                else:
                    logger.warning(f"⚠️ No text-type criteria found for key: {text_type_key}")
                    logger.warning(f"⚠️ Available text-type keys: {[k for k in self.marking_criteria.keys() if k.startswith('igcse_directed_')]}")
            else:
                logger.warning(f"⚠️ IGCSE Directed but no text_type provided in submission!")
                logger.warning(f"⚠️ This means only base criteria will be used, not letter/speech/article specific criteria")
        
        # For IGCSE Extended Q3, combine general criteria with text-type-specific criteria
        if submission.question_type == 'igcse_extended_q3':
            logger.info(f"🎯 IGCSE Extended Q3 detected - text_type: {submission.text_type}")
            if submission.text_type:
                text_type_key = f"igcse_extended_q3_{submission.text_type}"
                logger.info(f"🔍 Looking for text-type criteria with key: {text_type_key}")
                text_type_criteria = self.marking_criteria.get(text_type_key, "")
                if text_type_criteria:
                    logger.info(f"✅ Text-type criteria found and added: {text_type_key}")
                    logger.info(f"📏 Combined criteria length: {len(marking_criteria)} + {len(text_type_criteria)} = {len(marking_criteria) + len(text_type_criteria)}")
                    marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
                else:
                    logger.warning(f"⚠️ No text-type criteria found for key: {text_type_key}")
                    logger.warning(f"⚠️ Available text-type keys: {[k for k in self.marking_criteria.keys() if k.startswith('igcse_extended_q3_')]}")
            else:
                logger.warning(f"⚠️ IGCSE Extended Q3 but no text_type provided in submission!")
                logger.warning(f"⚠️ This means only base criteria will be used, not speech/journal/interview/article/report specific criteria")
        
        # For A-Level directed writing, combine general criteria with text-type-specific criteria
        if submission.question_type == 'alevel_directed':
            logger.info(f"🎯 A-Level Directed detected - text_type: {submission.text_type}")
            if submission.text_type:
                text_type_key = f"alevel_directed_{submission.text_type}"
                logger.info(f"🔍 Looking for text-type criteria with key: {text_type_key}")
                text_type_criteria = self.marking_criteria.get(text_type_key, "")
                if text_type_criteria:
                    logger.info(f"✅ Text-type criteria found and added: {text_type_key}")
                    logger.info(f"📏 Combined criteria length: {len(marking_criteria)} + {len(text_type_criteria)} = {len(marking_criteria) + len(text_type_criteria)}")
                    marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
                else:
                    logger.warning(f"⚠️ No text-type criteria found for key: {text_type_key}")
                    logger.warning(f"⚠️ Available text-type keys: {[k for k in self.marking_criteria.keys() if k.startswith('alevel_directed_')]}")
            else:
                logger.warning(f"⚠️ A-Level Directed but no text_type provided in submission!")
                logger.warning(f"⚠️ This means only base criteria will be used, not leaflet/speech/report/article/letter/blog/review/diary specific criteria")
        
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
{"🚨 CRITICAL NARRATIVE SCORE LIMIT - MANDATORY INSTRUCTION 🚨" if submission.question_type == 'igcse_narrative' else ""}
{"DO NOT GIVE NARRATIVES MORE THAN 34/40 UNLESS THEY HAVE EXCEPTIONAL VOCABULARY. Only award 35/40 or higher if the vocabulary is truly outstanding and sophisticated throughout the essay." if submission.question_type == 'igcse_narrative' else ""}
I DO NOT WANT TO SEE ANY MARKS DEDUCTED FOR POOR CHARACTERIZATION. I DO NOT WANT TO SEE POOR CHARACTERIZATION BEING MENTIONED IN THE IMPROVEMENTS SUGGESTIONSFEEDBACK

{"🚨 CRITICAL IGCSE EXTENDED Q3 INFORMALITY INSTRUCTION - MUST READ 🚨" if submission.question_type == 'igcse_extended_q3' else ""}
{"BE CRITICAL OF INFORMAL LANGUAGE AND CUT MARKS FOR EXCESSIVE INFORMALITY. Extended Q3 requires formal, sophisticated writing appropriate for academic contexts. Deduct marks for: slang, contractions, casual expressions, overly conversational tone, or inappropriate informality. Provide specific feedback about formal language requirements and suggest more sophisticated alternatives." if submission.question_type == 'igcse_extended_q3' else ""}
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
{"CRITICAL FOR IGCSE DESCRIPTIVE: Do NOT cut marks for narrative elements or storytelling aspects. Descriptive writing can include narrative elements and should not be penalized for this. Focus on descriptive language, imagery, and sensory details rather than penalizing narrative structure." if submission.question_type == 'igcse_descriptive' else ""}
"""
        
        return full_prompt
    
    def parse_structured_response(self, ai_response: str, question_type: str) -> Dict[str, Any]:
        """Parse structured JSON response from AI - MUST be perfect."""
        # Parse JSON response - this MUST work with structured outputs
        response_data = json.loads(ai_response)
        
        # Extract base fields
        feedback = response_data.get("feedback", "")
        grade = response_data.get("grade", "Not provided")
        improvements = response_data.get("improvements", [])
        strengths = response_data.get("strengths", [])
        next_steps = response_data.get("next_steps", [])
        
        # Initialize result with base fields
        result = {
            "feedback": feedback,
            "grade": grade,
            "improvements": improvements,
            "strengths": strengths,
            "next_steps": next_steps
        }
        
        # Add only relevant marks based on question type
        if question_type in ['igcse_writers_effect']:
            result["reading_marks"] = response_data.get("reading_marks", "N/A")
        elif question_type in ['igcse_narrative', 'igcse_descriptive']:
            result["content_structure_marks"] = response_data.get("content_structure_marks", "N/A")
            result["style_accuracy_marks"] = response_data.get("style_accuracy_marks", "N/A")
        elif question_type in ['igcse_directed', 'igcse_extended_q3']:
            result["reading_marks"] = response_data.get("reading_marks", "N/A")
            result["writing_marks"] = response_data.get("writing_marks", "N/A")
        elif question_type in ['alevel_directed']:
            result["ao1_marks"] = response_data.get("ao1_marks", "N/A")
            result["ao2_marks"] = response_data.get("ao2_marks", "N/A")
        elif question_type in ['alevel_directed_writing']:
            result["ao2_marks"] = response_data.get("ao2_marks", "N/A")
        elif question_type in ['alevel_comparative']:
            result["ao1_marks"] = response_data.get("ao1_marks", "N/A")
            result["ao3_marks"] = response_data.get("ao3_marks", "N/A")
        elif question_type in ['alevel_text_analysis']:
            result["ao1_marks"] = response_data.get("ao1_marks", "N/A")
            result["ao2_marks"] = response_data.get("ao2_marks", "N/A")
        elif question_type in ['gp_essay']:
            result["ao1_marks"] = response_data.get("ao1_marks", "N/A")
            result["ao2_marks"] = response_data.get("ao2_marks", "N/A")
            result["ao3_marks"] = response_data.get("ao3_marks", "N/A")
        elif question_type in ['alevel_reflective_commentary']:
            result["ao3_marks"] = response_data.get("ao3_marks", "N/A")
        elif question_type in ['alevel_language_change']:
            result["ao2_marks"] = response_data.get("ao2_marks", "N/A")
            result["ao4_marks"] = response_data.get("ao4_marks", "N/A")
            result["ao5_marks"] = response_data.get("ao5_marks", "N/A")
        
        return result

    
    async def evaluate_submission(self, submission: SubmissionRequest) -> FeedbackResponse:
        """Evaluate a student submission and return feedback."""
        import time
        start_time = time.time()
        
        try:
            logger.info(f"🔧 Starting evaluation for submission:")
            logger.info(f"🔧 Question Type: {submission.question_type}")
            logger.info(f"🔧 Text Type: {submission.text_type}")
            logger.info(f"🔧 Command Word: {submission.command_word}")
            logger.info(f"🔧 Has Marking Scheme: {bool(submission.marking_scheme)}")
            logger.info(f"🔧 User ID: {submission.user_id}")
            logger.info(f"🔧 Response Length: {len(submission.student_response)} chars")
            
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
            
            # Call AI API with structured outputs
            ai_start = time.time()
            logger.info(f"🚀 PERFORMANCE: Starting AI API call with structured outputs...")
            logger.info(f"🚀 PERFORMANCE: Prompt length: {len(full_prompt)} characters")
            ai_response, _ = await call_deepseek_api(full_prompt, submission.question_type)
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
            
            # Parse AI response using structured outputs (MUST be perfect)
            parse_start = time.time()
            parsed_data = self.parse_structured_response(ai_response, submission.question_type)
            logger.info("✅ Successfully parsed structured JSON response")
            parse_time = time.time() - parse_start
            
            logger.debug(f"Response parsing took {parse_time:.2f}s")
            
            # Compute dynamic overall grade
            grade_start = time.time()
            dynamic_grade = compute_overall_grade(
                submission.question_type,
                parsed_data.get("reading_marks"),
                parsed_data.get("writing_marks"),
                parsed_data.get("ao1_marks"),
                parsed_data.get("ao2_marks"),
                parsed_data.get("content_structure_marks"),
                parsed_data.get("style_accuracy_marks"),
                parsed_data.get("ao3_marks"),
                parsed_data.get("ao4_marks"),
                parsed_data.get("ao5_marks")
            )
            grade_time = time.time() - grade_start
            
            if dynamic_grade:
                parsed_data["grade"] = dynamic_grade
            
            # Create feedback response with only relevant marks
            feedback_response = FeedbackResponse(
                user_id=submission.user_id,
                question_type=submission.question_type,
                student_response=self.sanitize_input(submission.student_response),
                feedback=parsed_data["feedback"],
                grade=parsed_data["grade"],
                reading_marks=parsed_data.get("reading_marks"),
                writing_marks=parsed_data.get("writing_marks"),
                ao1_marks=parsed_data.get("ao1_marks"),
                ao2_marks=parsed_data.get("ao2_marks"),
                ao3_marks=parsed_data.get("ao3_marks"),
                content_structure_marks=parsed_data.get("content_structure_marks"),
                style_accuracy_marks=parsed_data.get("style_accuracy_marks"),
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
