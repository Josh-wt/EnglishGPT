from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import secrets
import uuid
from datetime import datetime, timedelta    
import hashlib
import hmac
import httpx
import json
import base64
import re
from io import BytesIO
from PIL import Image
import PyPDF2
import io
from collections import defaultdict
import jwt

# Import user management services
from user_management_service import UserManagementService
from auth_recovery_middleware import create_auth_recovery_middleware, auth_recovery_required

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Get application logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Suppress verbose HTTP/2 and other library debug logs
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpcore.http2").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("hpack").setLevel(logging.WARNING)
logging.getLogger("hpack.hpack").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("PIL").setLevel(logging.WARNING)
logging.getLogger("supabase").setLevel(logging.INFO)

# Supabase connection
from supabase import create_client, Client

ROOT_DIR = Path(__file__).resolve().parent

# Force-load backend/.env regardless of working directory; allow overriding empty envs
load_dotenv(dotenv_path=ROOT_DIR / '.env', override=True)

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')

# Use service role key for backend operations (bypasses RLS)
SUPABASE_KEY = (
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_KEY')
)

if not SUPABASE_KEY:
    # Provide a clear log to help diagnose missing env
    logging.warning(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Ensure backend/.env exists and python-dotenv loads it."
    )

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Supabase: {e}")
    supabase = None

# Initialize user management service
user_management_service = None
if supabase:
    try:
        user_management_service = UserManagementService(supabase)
        logger.info("User management service initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing user management service: {e}")
        user_management_service = None
else:
    logger.warning("Cannot initialize user management service - Supabase client not available")

# Create the main app without a prefix
app = FastAPI(title="Universal Service API", version="1.0.0")

# Add auth recovery middleware if user management service is available
if user_management_service:
    try:
        auth_recovery_middleware = create_auth_recovery_middleware(user_management_service)
        app.add_middleware(type(auth_recovery_middleware), user_management_service=user_management_service)
        logger.info("Auth recovery middleware added successfully")
    except Exception as e:
        logger.error(f"Error adding auth recovery middleware: {e}")
else:
    logger.warning("Auth recovery middleware not added - user management service not available")

# CORS middleware
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    response = await call_next(request)
    return response

# Add CORS middleware for frontend - COMPREHENSIVE VERSION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://13.233.183.229",  # Your server IP
        "https://13.233.183.229",  # For future HTTPS
        "https://englishgpt.org",  # Your domain
        "https://www.englishgpt.org",  # WWW subdomain
        "https://englishgpt.everythingenglish.xyz",  # Primary domain
        "http://englishgpt.everythingenglish.xyz",  # HTTP version for development
        "https://yourdomain.com"  # Update with your production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
    max_age=3600,
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "English Marking AI API"}

# Explicit OPTIONS handler for CORS preflight
@api_router.options("/{path:path}")
async def options_handler(request: Request):
    origin = request.headers.get("origin", "*")

    
    return JSONResponse(
        content={"message": "CORS preflight successful"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600"
        }
    )

@api_router.get("/test")
async def test():
    return {"message": "Backend is working!", "supabase_connected": supabase is not None}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Backend is running",
        "supabase_connected": supabase is not None
    }

@api_router.get("/test-user/{user_id}")
async def test_user(user_id: str):
    """Test endpoint to check user data"""
    try:
        response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if not response.data:
            return {"error": "User not found"}
        
        user_data = response.data[0]
        return {
            "user_id": user_id,
            "academic_level": user_data.get('academic_level', 'NOT_SET'),
            "email": user_data.get('email', 'NOT_SET'),
            "credits": user_data.get('credits', 0),
            "current_plan": user_data.get('current_plan', 'basic')
        }
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

# AI Configuration (env only; no hardcoded defaults)
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
QWEN_API_KEY = os.environ.get('QWEN_API_KEY')
DEEPSEEK_ENDPOINT = os.environ.get('DEEPSEEK_ENDPOINT', 'https://openrouter.ai/api/v1/chat/completions')
QWEN_ENDPOINT = os.environ.get('QWEN_ENDPOINT', 'https://openrouter.ai/api/v1/chat/completions')

# Recommendations AI (separate API key and model)
RECOMMENDATIONS_API_KEY = os.environ.get('OPENROUTER_GPT_OSS_120B_KEY')
RECOMMENDATIONS_MODEL = os.environ.get('RECOMMENDATIONS_MODEL', 'openai/gpt-oss-120b')

# Define Models
class QuestionType(BaseModel):
    id: str
    name: str
    category: str
    requires_marking_scheme: bool
    description: str

class SubmissionRequest(BaseModel):
    question_type: str
    student_response: str
    user_id: str
    marking_scheme: Optional[str] = None
    insert_document: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question_type: str
    student_response: str
    feedback: str
    grade: str
    reading_marks: Optional[str] = None
    writing_marks: Optional[str] = None
    ao1_marks: Optional[str] = None
    ao2_marks: Optional[str] = None
    content_structure_marks: Optional[str] = None
    style_accuracy_marks: Optional[str] = None
    improvement_suggestions: List[str]
    strengths: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    short_id: Optional[str] = None

class BadgeModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_type: str
    badge_name: str
    badge_description: str
    badge_icon: str
    tier: str = "bronze"  # bronze, silver, gold
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    progress: int = 0
    requirement: int = 0

class UserModel(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    academic_level: Optional[str] = None
    questions_marked: int = 0
    credits: int = 3
    current_plan: str = "free"
    dark_mode: bool = False

# Question Types Configuration
QUESTION_TYPES = [
    {
        "id": "igcse_summary",
        "name": "Summary",
        "category": "IGCSE",
        "requires_marking_scheme": True,
        "description": "Summarize the key points from a given text"
    },
    {
        "id": "igcse_narrative",
        "name": "Narrative",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Create an engaging narrative story"
    },
    {
        "id": "igcse_descriptive",
        "name": "Descriptive",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Write a vivid descriptive piece"
    },
    {
        "id": "igcse_writers_effect",
        "name": "Writer's Effect",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Analyze the writer's use of language and its effects"
    },
    {
        "id": "igcse_directed",
        "name": "Directed Writing",
        "category": "IGCSE",
        "requires_marking_scheme": True,
        "description": "Transform text into specific formats for different audiences"
    },
    {
        "id": "alevel_comparative",
        "name": "Comparative Analysis 1(b)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Compare and analyze different texts"
    },
    {
        "id": "alevel_directed",
        "name": "Directed Writing 1(a)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": False,
        "description": "Transform text into a specific format for audience"
    },
    {
        "id": "alevel_text_analysis",
        "name": "Text Analysis Q2",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Analyze form, structure, and language in texts"
    },
    {
        "id": "alevel_language_change",
        "name": "Language Change Analysis (P3, Section A)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Analyze historical prose extract demonstrating English language change using quantitative data"
    },
    {
        "id": "gp_essay",
        "name": "Essay (Paper 1)",
        "category": "English General Paper (8021)",
        "requires_marking_scheme": True,
        "description": "Write a well-structured essay on a given topic with clear argumentation and evidence"
    },
    {
        "id": "gp_comprehension",
        "name": "Comprehension (Paper 2)",
        "category": "English General Paper (8021)",
        "requires_marking_scheme": True,
        "description": "Answer comprehension questions based on given texts with analysis and evaluation"
    }
]

# Marking Criteria
MARKING_CRITERIA = {
    "igcse_descriptive": """
Core Principle for Descriptive Marking: Marking is about identifying and rewarding strengths in a candidate's work. While weaknesses exist, the primary focus is on how well the work meets the established criteria, guiding the placement within the mark scheme by identifying what the candidate does achieve.

Descriptive essays are assessed on the candidate's ability to create an imaginative and effective piece of writing, judged on two distinct skills: Content and Structure (16 Marks) and Style and Accuracy (24 Marks).

A. Content and Structure (16 Marks): The "What" and "How It's Built"

16-13 Marks (High Level): Compelling Description with sophisticated approach and excellent organization
12-9 Marks (Middle Level): Clear and Effective Description with good engagement and clear organization
8-5 Marks (Low Level): Basic Description with limited understanding and basic organization
4-1 Marks (Very Low Level): Minimal, confused description with chaotic organization

B. Style and Accuracy (24 Marks): The "Language Execution"

24-20 Marks (High Level): Sophisticated vocabulary, highly varied sentence structures, virtually error-free
19-14 Marks (Middle Level): Good vocabulary, varied sentence structures, mostly accurate
13-8 Marks (Low Level): Basic vocabulary, simple sentence structures, some errors

SPECIFIC FOCUS AREAS - Where you, the AI, consistently makes mistakes while marking:

Bad vocabulary, if the essay does not consistently display good vocabulary and flow, do not mark it higher than 27. But please think if it does or does not. And you do not always need to mark it 27

You give high marks to narratives, narratives and descriptives are not similar, please ensure high marking descriptives have descriptive qualities, and don't focus on a plot, it may have one, but the plot isn't the essay's focus. Instead the focus should be vocabulary, imagery and the six senses. Please focus you improvements feedback on those. 

7-1 Marks (Very Low Level): Very limited language, serious errors.""",
    "igcse_narrative": """Primary Focus: The candidate's ability to create an imaginative and effective piece of writing, judged on Content/Structure and Style/Accuracy.
A. Content and Structure (16 Marks): The "What" and "How It's Built"
Primary Focus: The strength of the ideas, the development of the plot/description, the creation of characters/atmosphere, and the overall organization.
Key Discriminators & How to Award/Deduct Marks:
16-13 Marks (High Level: Compelling, Sophisticated, Excellent) (If a story or description is merely "good" or "sufficient" in these categories — don't let it sit in the 13–16 band. That zone is for exceptional pieces.)
Award for:

Compelling Plot/Vivid Description: Narrative is gripping, original, with effective tension/climax/resolution. Description is exceptionally vivid, original, and appeals strongly to multiple senses.
Sophisticated Characterization (Narrative): Characters are complex, believable, and their motivations/emotions are deeply explored. May show development or strong internal conflict.
Excellent Organization: Highly effective structure (e.g., non-linear, frame story, escalating tension). Seamless transitions, logical progression, and sustained focus.
Strong Engagement: Captures and holds reader interest throughout. Creates a powerful atmosphere or mood.
Originality: Ideas and their execution feel fresh and imaginative.

Deduct for:

Minor predictability in one aspect of the plot (from 16 to 15/14).
Characterization is strong but lacks extreme depth in one area (from 15 to 14).
Organization is excellent but has one very slight awkward transition (from 14 to 13).

12-9 Marks (Middle Level: Clear, Coherent, Good)
Award for:

Clear Plot/Effective Description: Narrative is coherent, follows a logical sequence, but may be somewhat predictable. Description is clear and effective, appealing to some senses, but may lack significant originality or depth.
Clear Characterization (Narrative): Characters are generally believable and consistent, but may lack complexity or deep psychological insight.
Good Organization: Generally well-structured, clear beginning/middle/end. Paragraphing is mostly effective.
Good Engagement: Holds reader interest for most of the story/description, but may have moments of flagging.

Deduct for:

A slight lack of originality or predictability in the plot (from 12 to 11/10).
Characterization is good but could be more nuanced (from 11 to 10).
Organization is logical but basic (from 10 to 9).
Engagement is good but not consistently high (from 10 to 9).
Tendency to tell rather than show too often (from 12 downwards).

8-5 Marks (Low Level: Basic, Limited)
Award for:

Basic Plot/Limited Description: Narrative is simplistic, perhaps a mere recounting of events. Description is general, lacks detail, or appeals to few senses. May stray into narrative from description.
Limited Characterization (Narrative): Characters are one-dimensional or stereotypical. Motivations are unclear or unconvincing.
Basic Organization: Some attempt at structure, but may be disjointed or lack clear progression. Paragraphing may be inconsistent.
Limited Engagement: May not hold reader interest for long. Lacks atmosphere or tension.

SPECIFIC FOCUS AREAS - Deduct heavily for:

Predictable series of events (-3): "Reformed bully excels instantly, becomes superhero cop" type narratives that offer no complexity or tension; single events (like exam results) becoming sole proof of character change.
Gaps and implausibilities (-3): Major time periods glossed over (e.g., "three-year training to be sub-inspector"), unrealistic declarations (e.g., crime eradication "within two years… completely")—both undercut credibility.
Ending is sudden and incomplete (-3): Characters left in transitional states without resolution (e.g., "anxious at airport" with promised climax never reached), leaving no resolution or final reflection.
Limited atmosphere and sensory engagement (-3): Setting is functional rather than vivid; lacks immersive qualities.

Deduct for:

Plot is too simple or predictable (from 8 to 7).
Characterization is very basic (from 7 to 6).
Organization is messy, making the story hard to follow (from 6 to 5).
Engagement is very low; piece is bland (from 6 to 5).

4-1 Marks (Very Low Level: Minimal, Confused)
Award for:

Minimal Plot/Description: No discernible plot, or a completely rambling account. Description is very generic or absent.
No Characterization: Characters are just names, or inconsistent.
Chaotic Organization: No logical structure; ideas are jumbled.
No Engagement: Fails to interest the reader at all.

Deduct for:

Increasing levels of confusion, irrelevance, or incoherence.

0 Marks: No creditable resp onse.

B. Style and Accuracy (24 Marks): The "Language Execution"
Primary Focus: The quality of the language used (vocabulary, sentence structures, narrative techniques) and the level of technical correctness.
Key Discriminators & How to Award/Deduct Marks:
24-20 Marks (High Level: Sophisticated, Highly Controlled, Accurate)
Award for:

Sophisticated & Precise Vocabulary: Wide range, accurate, nuanced, used for powerful and deliberate effect. Fresh, imaginative word choices.
Highly Varied Sentence Structures: Excellent control of complex and varied sentence types. Controls pace, rhythm, and emphasis with skill.
Virtually Error-Free: Spelling, punctuation, and grammar are consistently accurate. Any errors are negligible and do not impede meaning.
Masterful Narrative/Descriptive Techniques: Consistently uses strong imagery, powerful figurative language (original metaphors/similes), sensory details, and 'showing' rather than 'telling.' Evokes strong atmosphere.

Deduct for:

A rare, isolated awkward phrasing or very minor grammatical slip (from 24 to 23/22).
Vocabulary is sophisticated but not consistently impactful or truly unique (from 22 to 21/20).
Techniques are strong but perhaps not every single one is executed with maximum effect (from 21 to 20).

19-14 Marks (Middle Level: Effective, Clear, Competent)
Award for:

Good Vocabulary: Clear, accurate, and generally varied. Some attempts at more sophisticated or vivid words.
Varied Sentence Structures: Attempts at different structures, some complexity, generally effective but may sometimes be repetitive or slightly awkward.
Mostly Accurate: Errors in spelling, punctuation, and grammar are present but generally minor and do not significantly impede meaning. Meaning is clear.
Effective Narrative/Descriptive Techniques: Uses some imagery and sensory details, some instances of 'showing.' Figurative language may be present but less original or impactful than higher levels.

Deduct for:

Noticeable repetition in vocabulary or sentence structures (from 19 to 17/16).
More frequent minor errors, or occasional errors that cause brief ambiguity (from 17 to 15/14).
Techniques are present but not consistently effective or may be clichéd (from 16 to 14).

13-8 Marks (Low Level: Adequate, Basic, Some Errors)
Award for:

Basic Vocabulary: Restricted range, often simple and repetitive. May use words inaccurately or awkwardly.
Simple Sentence Structures: Predominantly simple sentences, lacking variety. May contain grammatical errors.
Frequent Errors: Errors in spelling, punctuation, and grammar are frequent. They may sometimes impede meaning or cause awkwardness.
Minimal/Ineffective Techniques: Little to no evidence of specific narrative/descriptive techniques, or their use is clumsy/nonsensical. Heavy reliance on "telling."

SPECIFIC FOCUS AREAS - Deduct heavily for:

Repetition and bland diction (-4): "Because/because", "very", "extremely", "simply"—removes dynamism and impact from prose.
Over-reliance on very short, declarative sentences (-4): Little sentence variety to control pace or mood; monotonous rhythm.
Techniques: no figurative language, sensory details or fresh imagery (-4): Exposition equals telling throughout; lacks literary sophistication.
Minor errors noted but not heavily penalized: Punctuation slips (missing commas after introductory phrases, occasional capitalisation quirks); none impede meaning.
Overall assessment: Serviceable but functional prose anchored in the low–middle band.

Deduct for:

More frequent errors that sometimes obscure meaning (from 13 to 11/10).
Reliance on very basic sentence structures (from 11 to 9/8).
Figurative language is awkward or misused (from 10 to 8).

7-1 Marks (Very Low Level: Very Limited, Serious Errors)
Award for:

Very Limited Language: Extremely basic vocabulary, severe repetition.
Severe Grammatical Errors: Sentences are often incomprehensible or grammatically incorrect.
Serious Errors Impeding Meaning: Errors are so frequent and severe that the writing is largely unintelligible.
No Narrative/Descriptive Features: No attempt at imagery or effective language.

Deduct for:

Increasing levels of unintelligibility and grammatical breakdown.

0 Marks: No creditable response.

WHERE YOU, THE AI, GOES WRONG IN MARKING:

1. Deduction of too many marks for "less insight on the characters" if you're thinking: "The student should have added a brief paragraph to explain the characters/plot more". Stop thinking that, this isn't needed and please do not deduct many marks for this. 
2. Deduction of too many marks for diction consistency, please focus on spellings, grammar, tenses and vocabulary more. Do not deduct for "Verify Diction"


IV. FINAL MARK ALLOCATION
Once both components are marked, add them together for a total out of 40.
The final assessment should justify the total mark by summarizing the strengths and weaknesses for each component, making direct reference to specific examples from the candidate's work and linking them to the level descriptors.
Mark this text based on the above criteria: Do not over-scrutinize, marks can be awarded positively and negatively. Heavily limit marks when endings are rushed/not good. Please don't call every essay a rushed ending, do remember there is a word limit, however, rushed endings will cause heavy deduction of marks.""",
    "igcse_directed": """
Task Overview

Evaluate a candidate's directed writing response based on one or two reading passages totaling 650 to 750 words. Candidates must write in a specific format - speech, letter, or article - addressing a clear purpose and audience while using ideas from the texts but in their own words. The response should be 250 to 350 words.
Assessment Objectives Distribution

Reading Assessment: 15 marks total
R1: Demonstrate understanding of explicit meanings
R2: Demonstrate understanding of implicit meanings and attitudes
R3: Analyse, evaluate and develop facts, ideas and opinions, using appropriate support from the text
R5: Select and use information for specific purposes

Writing Assessment: 25 marks total
W1: Articulate experience and express what is thought, felt and imagined
W2: Organise and structure ideas and opinions for deliberate effect
W3: Use a range of vocabulary and sentence structures appropriate to context
W4: Use register appropriate to context
W5: Make accurate use of spelling, punctuation and grammar
Reading Criteria Detailed Breakdown

Level 6: 13 to 15 marks
Successfully evaluates ideas and opinions, both explicit and implicit. Assimilates ideas from the text to give a developed, sophisticated response.
Award 15 marks for: Sophisticated evaluation of subtle implicit meanings, comprehensive development of textual ideas with original insight.
Award 14 marks for: Strong evaluation with minor gaps in sophistication.
Award 13 marks for: Good evaluation but less sophisticated development.

Level 5: 10 to 12 marks
Some successful evaluation of ideas and opinions, both explicit and implicit. A thorough response, supported by a detailed selection of relevant ideas from the text.
Award 12 marks for: Clear evaluation with good textual support.
Award 11 marks for: Generally thorough but uneven evaluation.
Award 10 marks for: Adequate evaluation but limited depth.

Level 4: 7 to 9 marks
Begins to evaluate mainly explicit ideas and opinions. An appropriate response that includes relevant ideas from the text.
Award 9 marks for: Clear identification with some evaluative comment.
Award 8 marks for: Mainly identification with limited evaluation.
Award 7 marks for: Basic appropriate response with minimal evaluation.

Level 3: 5 to 6 marks
Selects and comments on explicit ideas and opinions. Makes a general response including a few relevant ideas from the text.

Level 2: 3 to 4 marks
Identifies explicit ideas and opinions. Makes a limited response with little evidence from the text.

Level 1: 1 to 2 marks
Very limited response with minimal relation to the text.

Level 0: 0 marks
No creditable content.
Writing Criteria Detailed Breakdown

Level 6: 22 to 25 marks
Highly effective style capable of conveying subtle meaning. Carefully structured for benefit of the reader. Wide range of sophisticated vocabulary, precisely used. Highly effective register for audience and purpose. Spelling, punctuation and grammar almost always accurate.
Specific deductions: Deduct 1 mark for minor vocabulary imprecision. Deduct 2 marks for occasional structural lapses. Deduct 3+ marks for any grammar errors that impede sophisticated expression.

Level 5: 18 to 21 marks
Effective style. Secure overall structure, organised to help the reader. Wide range of vocabulary, used with some precision. Effective register for audience and purpose. Spelling, punctuation and grammar mostly accurate, with occasional minor errors.
Specific deductions: Deduct 1 mark for limited vocabulary range. Deduct 2 marks for structural inconsistencies. Deduct 3+ marks for frequent minor errors affecting flow.

Level 4: 14 to 17 marks
Sometimes effective style. Ideas generally well sequenced. Range of vocabulary is adequate and sometimes effective. Sometimes effective register for audience and purpose. Spelling, punctuation and grammar generally accurate though with some errors.

Level 3: 10 to 13 marks
Inconsistent style, expression sometimes awkward but meaning clear. Relies on the sequence of the original text. Vocabulary is simple, limited in range or reliant on the original text. Some awareness of an appropriate register for audience and purpose. Frequent errors of spelling, punctuation and grammar, sometimes serious.

Level 2: 6 to 9 marks
Limited style. Response is not well sequenced. Limited vocabulary or words and phrases copied from the original text. Limited awareness of appropriate register for audience and purpose. Persistent errors of spelling, punctuation and grammar.

Level 1: 1 to 5 marks
Expression unclear. Poor sequencing of ideas. Very limited vocabulary or copying from the original text. Very limited awareness of appropriate register for audience and purpose. Persistent errors in spelling, punctuation and grammar impede communication.

Level 0: 0 marks
No creditable content.
Common Examiner Deductions and Error Patterns

Major Reading Deductions:
Excessive lifting or copying from original texts without own words adaptation results in 3 to 5 mark deductions. Failure to address implicit meanings or attitudes drops candidates to Level 3 maximum. Missing evaluation component limits responses to Level 4 maximum. Irrelevant or invented content not derived from texts results in significant mark loss.

Major Writing Deductions:
Inappropriate register for specified audience reduces writing marks by 2 to 4 marks. Over-reliance on original text vocabulary and phrasing limits Level 3 maximum achievement. Poor structural organization with weak opening or closing results in 1 to 3 mark deductions. Persistent grammar errors that impede communication drop candidates below Level 4.

Format-Specific Requirements – Expanded Guidance

Candidates are required to write in a specified format such as a speech, letter, or article. The format must be adhered to strictly as it influences tone, style, structure, and language features. Familiarity with conventions of each format is essential for a high-scoring response.
Speech Format

    Purpose: Often to inform, persuade, motivate, or entertain an audience in a live or virtual setting.

    Audience Awareness: Must directly address the audience using second-person pronouns (e.g., "you," "we"), inclusive language ("together," "our community"), and rhetorical devices to engage listeners.

    Opening: Needs a strong, attention-grabbing introduction (e.g., a rhetorical question, dramatic statement, or anecdote) to hook the audience quickly.

    Tone: Should reflect the context—formal or informal—but must maintain engagement and appropriate energy or passion throughout.

    Structure: Clear signposting and transitions are critical. Use of phrases like "Firstly," "Furthermore," and "In conclusion" help guide listeners.

    Techniques: Use of repetition, rhetorical questions, anecdotes, emotive language, and pauses or commands enhances persuasive effect.

    Closing: Memorable and motivating calls to action or a summary statement encouraging reflection or decision-making.

    Marking Focus: Examiners specifically look for the ability to connect with an audience, clarity of purpose, and use of features unique to spoken performance.

Letter Format

    Purpose: Communication directed officially or personally to a reader, with intent to inform, request, complain, or express feelings.

    Audience: Formal (e.g., a professional, authority figure) or informal (e.g., friend, family), which strongly affects tone and register.

    Opening: Clear and appropriate salutation (e.g., "Dear Sir/Madam," or "Dear John") that matches the relationship with the recipient.

    Tone and Register: Formal letters require polite, measured language with formal vocabulary and less colloquialism; informal letters allow conversational style and personal touches.

    Content Organization: Purpose should be stated early, with paragraphs serving distinct points or themes; coherence and cohesion must be strong.

    Conventions: Use of conventional phraseology, appropriate endings ("Yours faithfully," "Best wishes"), and correct paragraphing.

    Language Features: Politeness strategies, modal verbs for requests or suggestions, indirectness for complaints, and expressive devices for emotional content.

    Closing: Should contain an appropriate sign-off reflecting the relationship and tone.

    Marking Focus: Examiners check for adherence to format, tone consistency, organization, and linguistic accuracy suited to the letter type.

Article Format

    Purpose: To inform, entertain, or persuade readers in a magazine, newsletter, or website setting.

    Audience: Readers of the publication, generally a more general audience than letter recipients, requiring accessible but engaging language.

    Title/Headline: A catchy, relevant headline or title that immediately signals the article's subject and attracts interest.

    Introduction: Engaging opening paragraph that introduces the topic clearly and hooks readers.

    Body Paragraphs: Well-developed with clear topic sentences, supporting details, explanations, and evidence whether factual or anecdotal.

    Tone and Style: Often conversational or semi-formal, balancing professionalism with approachability; use of rhetorical questions and anecdotes is common.

    Techniques: Use of varied sentence structures, direct address, figurative language, and persuasive language to maintain reader interest.

    Layout and Conventions: Paragraph length and structure should aid readability; suitable subheadings may be present; use of bullet points or lists where appropriate.

    Conclusion: A clear, impactful closing paragraph summarizing key points or presenting a call to action or reflection.

    Marking Focus: Examiners focus on effectiveness of communication, clarity of expression, engagement with the audience, and adherence to journalistic style and conventions.

General Examiner Notes on Format Adherence

    Failure to adhere to the prescribed format results in mark penalties, usually limiting top-level achievement in writing.

    Candidates repeating phrases or phrasing directly from passage texts instead of producing original writing tailored to the format lose marks.

    Format features must permeate both content and language rather than appearing only superficially (e.g., a letter must also sound like a letter, not just begin with Dear...).

    Creativity and originality are rewarded, provided responses align with format conventions and audience expectations.

    Consistency throughout the piece in tone, register, and structural markers signals strong command of the chosen format.


Critical Success Indicators

High-Level Reading Performance:
Goes beyond surface identification to evaluate effectiveness of arguments. Demonstrates understanding of writers' intentions and implicit attitudes. Synthesizes ideas from both texts to create coherent response. Uses textual evidence judiciously without excessive quotation or lifting.

High-Level Writing Performance:
Maintains consistent, appropriate register throughout response. Creates engaging opening that hooks reader attention. Develops ideas logically with smooth transitions between paragraphs. Uses sophisticated vocabulary precisely and effectively. Concludes with impact, leaving lasting impression on reader.

Automatic Mark Limitations:
Responses that ignore specified format requirements cannot exceed Level 4 for writing. Excessive copying or lifting prevents achievement above Level 3 for reading. Failure to address both bullet points in task limits overall response quality. Word count significantly outside 250 to 350 range may indicate poor planning and affect both reading and writing assessmen

IMPORTANT: DO NOT BE TOO STRICT WITH MARKS. DO NOT DEDUCT TOO MANY MARKS FOR SMALL ERRORS.""",
    "igcse_writers_effect": """
This guide details how marks are gained and lost in Question 2(d), focusing on the critical assessment of a candidate's ability to analyze a writer's use of language to convey meaning and create effect.
Core Principles:
Holistic Marking: The overall quality of the response, particularly the analysis of effect, is paramount.
Quality over Quantity: Depth and precision in analysis are valued more than the sheer number of points or words chosen.
Focus on Effect: The primary goal is to explain how the writer's language choices impact the reader, convey meaning, or create a specific mood/atmosphere, not just to define words or describe literal actions.
Source-Bound: Analysis must be firmly rooted in the provided text; do not introduce external information or speculation.
Ignore Inaccurate Statements: Marks are not deducted for inaccurate statements; they are simply ignored.
Marking Levels (Recap):
Level 5 (13-15 marks): Judicious selection of best examples, wide range of techniques identified, precise explanation of effects, significant depth in analysis.
Level 4 (10-12 marks): Good selection, clear explanations, some range of techniques, some depth in analysis.
Level 3 (7-9 marks): Adequate selection, basic explanations of effects, limited range of techniques.
Level 2 (4-6 marks): Some relevant choices, simple explanations, often literal or very general.
Level 1 (1-3 marks): Limited choices, minimal explanation, often just identifying phrases with no or incorrect analysis of effect.

I. Where Marks Are Gained
Marks are primarily gained through the quality of selection and analysis of effect.
Judicious and Relevant Selection:


Choosing powerful, unusual, or vivid words and phrases that offer rich opportunities for analysis.
Selecting phrases that genuinely carry connotations beyond their literal meaning.
Ensuring choices include imagery as requested (e.g., metaphors, similes, personification).
Insight from Real Marking: Even partial choices can be considered "potentially relevant" if the chosen segment has some inherent meaning, though this limits the potential for higher marks.
Clear and Precise Explanation of Effect:


Moving Beyond Literal: Effectively explaining how a word or phrase works to create an impact on the reader, convey a specific meaning, or evoke an emotion, rather than simply defining its literal meaning or describing an action.
Exploring Connotations: Demonstrating a deep understanding of the associated meanings and implications of a word or phrase.
Depth in Analysis: Exploring multiple layers of meaning, discussing subtle nuances, or linking the effect to the overall mood, purpose, or the character's emotional/physical state. (e.g., explaining the ironic effect of a word, or how a word choice intensifies a feeling like desperation or disorientation).
Sensory and Emotional Impact: Clearly articulating how the language appeals to the senses or evokes specific emotions in the reader.
Identifying Techniques: Explicitly naming or implicitly demonstrating an understanding of various literary techniques (e.g., personification, hyperbole, alliteration, contrast) and explaining how they contribute to the effect.
Supporting Evidence: Explanations must be directly linked to the chosen words/phrases and the context of the text.

II. Where Marks Are Lost (Common Pitfalls)
Marks are lost or limited by analyses that are superficial, inaccurate, or fail to address the "effect" component.
Incomplete or Inaccurate Selection:


Partial Choices: Selecting only a segment of a phrase when the full phrase ("crackles as I squeeze it," "wisps of warm exhaust fumes tickling my nostrils," "unforgiving gradient for as far as the eye can see") is required to fully understand the writer's intention and achieve comprehensive analysis. This "misses an opportunity to explain accurately how and why" the language works.
Misinterpretations/Misreadings: Selecting a phrase but demonstrating a clear misunderstanding of its meaning in context (e.g., "does not understand its meaning" for 'steep'). This provides no valid evidence of understanding.
Irrelevant Choices: Selecting words or phrases that do not carry significant evocative power or are not central to conveying meaning/effect in the paragraph.
Superficial or Literal Explanations of Effect:


"Basic Explanations": Providing only "straightforward meaning" or a "general description" of what the word means or what action is taking place, without exploring the writer's effect on the reader. The "Real Marking" frequently uses terms like "basic explanation," "simple explanation," "faint suggestion of effect," or "general terms" for such instances.
Describing Action vs. Analyzing Effect: Focusing on what happens literally rather than how the writer's specific word choice conveys that action with particular nuance or impact.
Lack of Connotation Analysis: Failing to delve into the implied or associated meanings of a word beyond its dictionary definition.
Errors in Language and Presentation:


Repetition of Text Language: Explaining a phrase by repeating the exact words from the source text within the explanation itself. This "limits the evidence of understanding offered" as it shows a lack of ability to rephrase and analyze in one's own words.
Vague Comments: Using generic phrases like "makes it interesting" or "adds impact" without specific elaboration.
Ignoring Parts of Images: Failing to address all components of an image or phrase that contribute to its overall effect (e.g., analyzing "fumes" but ignoring "wisps" and "tickling").
Empty General Comments: Concluding with generic statements about building atmosphere or conveying emotion without specifically linking back to the analyzed examples.
Insufficient Depth/Range:


Based on the above criteria mark the essay below. The user should give two paragraphs separately, mark them as one not, two separate as Writer's Effect answers. In total give them a mark out of 15.  Do not over-scrutinize, only look for similes, metaphors, effect on the reader and effects in general. Do not look for other literary techniques. Marks can be awarded positively and negatively. Try to limit marks when mistakes are made. The structure is so that you don't need to over explain, so don't deduct marks for short explanations. That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good. Students need honest feedback to improve.
If you think the Sensory Details are good, the narrative must get over 30/40.
""",
    "igcse_summary": """
Comprehensive Guide: Understanding Marks in Summary Tasks.

I. Reading Marks (Content & Understanding) - Based on Mark Scheme provided - Out of 10 marks
- Marks are awarded for each distinct and accurate point extracted from the source text
- All content points should be taken from the mark scheme provided for the question
- Clear understanding and coverage of all required parts

II. Writing Marks (Language & Organization) - Out of 5 Marks
- Use of Own Words: Rephrasing information using your own vocabulary and sentence structures
- Clarity of Expression: Easy to understand, clear, unambiguous language
- Organization and Structure: Well-organized, logical flow
- Conciseness: Maximum relevant information within word limit


TOTAL: 15 MARKS: 10 for Reading and 5 for Writing.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_directed": """
You are marking responses to Question 1(a) from Paper 1 of the English examination. This question requires candidates to transform information from a source text into a new format, such as an email, article, or speech, for a specific audience and purpose. Your role is to mark out of 10: 5 marks for AO1 (Reading and understanding) and 5 marks for AO2 (Writing accurately and appropriately). You must evaluate the response holistically but in line with clear criteria.
Begin by evaluating AO1. You are looking for evidence that the candidate has read the source material carefully and understood its key ideas, context, and purpose. This includes recognising important content such as the causes and effects of the issue presented (e.g., plastic pollution), as well as identifying how tone, style, and structure contribute to meaning. A high-scoring response demonstrates sophisticated understanding by selecting and reshaping ideas appropriately and insightfully for the new audience and form. Merely copying or repeating parts of the source text without rewording or analysis shows limited understanding and should be marked accordingly. Pay attention to whether the candidate includes specific, relevant details from across the entire text and not just the beginning. Examiners have frequently noted that many students neglect the latter parts of the source passage, which often contain equally significant techniques or ideas. Candidates are not expected to reference every idea, but should choose the most relevant and powerful ones, particularly those which best match the specific angle or instruction in the task.
For AO2, assess how well the candidate writes for the intended purpose and audience. Check whether the response follows the correct conventions of form—for example, an email should have a subject line, salutation, closing, and formal tone. The writing must be clear, fluent, and grammatically sound. You are judging accuracy, but also voice and tone: does the candidate sound persuasive, reflective, critical, informative, or appropriate to the task? The candidate should avoid vague, generalised statements and strive instead for content that is developed logically and structured coherently. Writing should show some sophistication or variation in expression. Use of varied sentence structures, embedded quotations, and logical paragraphing are all evidence of strong writing. Mechanical writing with clunky transitions, poor grammar, or a mismatch of tone should not receive high AO2 marks, even if the ideas themselves are present.
Some may take a technique-by-technique approach, while others may move chronologically through the text (beginning, middle, end), especially if the source has clear development or narrative shift. Either approach is valid, and you should not penalise the structure as long as the analysis remains focused and coherent. Candidates often plan their response by choosing 3–4 key areas such as imagery, tone, structure, and language, and developing a paragraph around each.
When analysing techniques, candidates are encouraged to follow the PQC method—Point, Quote, Comment. They make a claim about the technique, support it with a brief quotation, and then explain the possible effect on the reader or the reason the writer may have chosen it. Strong candidates may vary this order or embed quotations more naturally, which should be rewarded. Look out for modal verbs and interpretive phrases—e.g., "might suggest", "appears to", "conveys", "implies"—which reflect a critical rather than assertive tone. Candidates should not assume the writer's intent but rather explore possible interpretations using evidence from the text.
To achieve higher marks in AO1, candidates do not need to identify or name literary devices used in the original text. Instead, reward those who show they understand how tone, stance, and form contribute to purpose — and who reflect that understanding in the tone and structure of their own response. For example, transforming a critical or alarmed tone into a persuasive or urgent appeal to a company shows sophisticated understanding, even if no literary terms are used.
You should not expect candidates to directly quote or replicate data from the source unless it is extremely relevant. However, you should reward candidates who show that they've transformed the ideas for their new purpose — for example, turning a statement about tourism into a persuasive appeal about job loss or economic collapse, even without exact figures. Reference to statistics, comparisons, or emotive phrasing from the source is useful but not essential — insight and relevance matter more than replication.

Finally, note that a strong commentary does not necessarily require a formal conclusion. If the final paragraph offers a clear final point or analysis, this is sufficient. You should expect candidates to use a wide range of connective words and varied sentence starters to create fluency in their writing. Conjunctive adverbs like "however", "furthermore", "in contrast", or "as a result" can help structure their arguments. Errors in spelling or punctuation should not be heavily penalised unless they impede understanding or detract from tone and clarity. Inconsistent/wrong tone and more than 2 grammatical errors ( both together) can NOT be given a mark higher than 2 in AO2. THIS IS A MUST. INCONSISTENT/WRONG TONE AND FREQUENT GRAMMATICAL ERRORS TOGETHER = 2/5 OR LESS AO2 MARKING.


Inconsistent/wrong tone AND frequent grammatical errors together = 2/5 or less for AO2.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_comparative": """
You are marking a Cambridge International AS & A Level English Language Paper 1 Question 1(b) comparative analysis response worth 15 marks total, split between AO1 (5 marks) and AO2 (10 marks). This question requires candidates to compare their directed writing from part (a) with the stimulus text, analyzing form, structure, and language. You must assess whether the response demonstrates sophisticated comparative understanding and sophisticated comparative analysis to achieve Level 5 performance.
For AO1, you are looking for sophisticated comparative understanding of texts including meaning, context, and audience, demonstrated through insightful reference to characteristic features. The candidate must show deep grasp of how purpose and audience differ between forms and identify genre-specific conventions with sophisticated awareness. Level 5 responses will recognize that different forms serve different purposes and appeal to different audiences, such as understanding that advertisements have wider target audiences including general interest readers while reviews target those with specific practical interests in booking.
For AO2, you must verify that the response provides sophisticated comparative analysis of elements of form, structure, AND language. All three frameworks are mandatory for Level 5 achievement. The response must demonstrate sophisticated analysis of how writers' stylistic choices relate to audience and shape meaning, explaining both WHY choices were made and HOW they affect meaning. Look for analytical sophistication such as explanations of register choices, where candidates might explain choosing to lower the register of a review so the writer's voice could be understood to contain excitement and true feelings rather than mimicking elevated advertisement register.
Critical discriminators between levels include comparative integration versus separation. Level 5 responses weave integrated analysis of both texts throughout, while Level 3-4 responses show some comparison but may treat texts separately, and Level 1-2 responses show minimal comparison with predominantly single-text focus. You must also distinguish between analytical sophistication and feature identification. Level 5 responses show sophisticated awareness explaining complex relationships between choice, audience, and meaning, while Level 3 responses show clear awareness identifying and explaining basic relationships, and Level 1 responses show minimal awareness with basic feature spotting without analysis.
Assess critical precision versus general commentary. Level 5 responses use precise and fully appropriate language to link evidence with explanatory comments, while Level 2 responses merely attempt to use appropriate language. Look for precision such as analysis explaining how lengthier constructions convey a sense of frenzied, varied activity taking place over time, with shorter declaratives providing welcome interruption and pause for thought during career development.
Common failures that prevent higher marks include lengthy quotes from text as supporting evidence when responses should use brief quotes to avoid copying long text portions and wasting examination time. Responses that do not observe the question demands fully by failing to analyze form, structure, AND language cannot be awarded above Level 3 regardless of other qualities. Reflective commentary approaches when analyzing their own writing instead of analytical comparison will limit marks, as will predominantly focusing on the stimulus text while giving minimal treatment to their own directed writing.
Mark boundaries for AO2 are Level 5 achieving 9-10 marks, Level 4 achieving 7-8 marks, and Level 3 achieving 5-6 marks. The primary qualitative differences between levels are sophistication versus detail versus clarity, with insightful versus effective versus appropriate selection quality, and precise versus effective versus clear terminology and expression standards. Time allocation should reflect the 15/50 total marks representing approximately 30% of examination time.



That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_text_analysis": """

You are marking a Cambridge International AS & A Level English Language Paper 1 Question 2 text analysis response worth 25 marks total, split between AO1 (5 marks) and AO3 (20 marks). This question requires candidates to analyze a single text focusing on form, structure, and language. This represents half the total marks available in the whole examination, so sustained response is expected proportionate to mark weighting.
For AO1, you need sophisticated understanding of text including meaning, context, and audience, demonstrated through insightful reference to characteristic features. Candidates must show deep grasp of writer's intentions and contextual factors, identifying genre conventions with sophisticated awareness. Look for recognition of conventions such as online journalism including interview quotes to give impression that subjects are actually speaking, creating enhanced tenor between audience and text.
For AO3, four specific criteria must ALL be met for Level 5 achievement. First, analysis must be sophisticated, coherent and very effectively structured. Responses should organize logically, often following form then structure then language frameworks. Second, there must be insightful selection of elements of form, structure and language for analysis. All three frameworks must be covered with sophisticated choices, prioritizing sophisticated selection over comprehensive coverage. Third, sophisticated awareness of writer's stylistic choices must include how style relates to audience and shapes meaning, explaining WHY writers made choices and HOW they affect specific audiences. Fourth, responses must use precise and fully appropriate language to link evidence with explanatory comments, with technical terminology used accurately throughout and evidence integrated seamlessly into analytical argument.
Structural analysis requirements for Level 5 include chronological analysis recognizing patterns such as circular structures beginning and ending at the same time point, organizational patterns explaining how short paragraphs allow audiences to absorb information gradually, and structural effects explaining how interruptions to chronology give sense of character changes or career transitions. Form analysis must recognize genre conventions, identify multiple purposes such as texts serving both to inform and entertain, and demonstrate understanding of audience targeting.
Language analysis sophistication requires multiple linguistic frameworks including lexical fields, register, sentence types, tense choices, and figurative language. Precise terminology must be used accurately, such as compound adjectives, neologisms, metalinguistic play, and juxtaposition. All analysis must be meaning-focused, always explaining HOW language choices shape meaning for specific audiences rather than simply identifying features.
Level progression shows clear qualitative differences. Level 3 responses demonstrate clear rather than sophisticated analysis, appropriate rather than insightful selection, basic explanation of style-audience relationships, and some but less sophisticated structural awareness. Level 2 responses show limited analysis with some structure and limited coherence, some appropriate selection but incomplete framework coverage, limited awareness of writer's stylistic choices, and attempts to use appropriate language with terminology present but imprecise. Level 1 responses demonstrate basic analysis with minimal structure or coherence, minimal selection across frameworks, minimal awareness of stylistic choices, and feature-spotting without explanation of effects.
Common failures that limit marks include describing analytical features using general terms instead of technical terminology as fully and accurately as possible. Ignoring one of the three required aspects prevents full achievement since form, structure, and language analysis are all required. Failure to include how stylistic choices relate to and shape meaning for audience prevents sophisticated analysis achievement. Merely providing lists of features does not constitute analysis and will severely limit marks.
Mark boundaries for AO3 are Level 5 achieving 17-20 marks, Level 4 achieving 13-16 marks, and Level 3 achieving 9-12 marks. Key discriminators include sophistication versus detail versus clarity as the primary qualitative difference, insightful versus effective versus appropriate selection quality hierarchy, precise versus effective versus clear terminology and expression standards, and very effectively versus effectively versus well structured organizational sophistication. Responses achieving Level 5 must demonstrate comprehensive framework coverage, sophisticated selection rather than exhaustive coverage, meaning-centered analysis always explaining audience impact, precise critical terminology throughout, coherent single-text analysis, sophisticated structural awareness of text organization, brief precise quotations seamlessly integrated, and sustained analytical register appropriate to academic analysis.


Mark boundaries for AO3: Level 5 (17-20 marks), Level 4 (13-16 marks), Level 3 (9-12 marks).

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_language_change": """
Task Overview

Evaluate a candidate's analytical essay on how Text A (a historical prose extract of 300 to 400 words, dating from approximately 1500 to the present) demonstrates English language change over time, drawing on supporting quantitative data from Text B (an n-gram graph) and Text C (a word frequency table).

Candidates must:

    Perform an in-depth linguistic analysis of Text A's features of language change, including lexis, semantics, grammar, orthography, pragmatics, and phonology.

    Cross-reference quantitative data from Texts B and C to support or extend their analysis.

    Apply relevant linguistic theories and concepts relating to language change.

    Write clearly and coherently using precise and accurate linguistic terminology.

Marking Criteria Breakdown

You must assess three areas:

First, AO2: Effective Writing (worth 5 marks). Score based on fluency, accuracy, idea development, and relevance.

Five marks indicate sophisticated expression with fluent and accurate writing, and fully developed ideas throughout. Four marks correspond to effective communication with minor, non-impeding errors and well-developed ideas. Three marks represent clear expression with occasional errors that do not impede communication and clear ideas. Two marks reflect mostly clear expression but with more frequent errors and limited idea development. One mark indicates basic expression prone to frequent errors that sometimes impede communication and minimal idea development. Zero marks mean no credible written response.

Deductions in this objective come from persistent grammar or punctuation issues, unclear organization, and communication that hinders understanding.

Second, AO4: Linguistic Understanding (worth 5 marks). Evaluate candidates' understanding of linguistic concepts, methods, and theories.

Full marks are awarded for profound, insightful understanding demonstrated through accurate and precise use of linguistic terminology and theoretical frameworks. Four marks are given where understanding is detailed but slightly less insightful. Three marks correspond to clear and appropriate conceptual references. Two marks indicate limited but partial conceptual references, and one mark signals minimal understanding with poor or missing references. Zero is for no creditable response.

Mark down where candidates show vague, superficial, or incorrect theory applications, or misuse terminology.

Third, AO5: Data Analysis and Synthesis (worth 15 marks). This is the most heavily weighted and nuanced objective.

At the highest levels (13 to 15 marks), candidates show insightful, fully appropriate selection of language features supported by sophisticated, well-integrated analysis and a nuanced argument drawing evidence from all three sources – the prose text, the n-gram graph, and the word frequency table.

Marks from 10 to 12 indicate effective and mostly appropriate selection from all three sources, with detailed logical analysis and competent synthesis, but with minor gaps.

Marks from 7 to 9 represent clear selection from at least two sources with clear but sometimes descriptive analysis and basic synthesis.

Between 4 and 6 marks, candidates offer unequal or limited selection of data with basic or fragmented analytic attempts, weak synthesis, and often neglect one or more sources.

Marks from 1 to 3 indicate minimal or inappropriate data selection, basic or incorrect analysis, and little synthesis.

Zero marks mean no creditable analysis.

Deductions in AO5 arise from ignoring any critical data source (resulting in 2 to 4 marks lost), describing features without analytical development (1 to 3 marks deducted), weak or no synthesis of evidence (1 to 3 marks lost), imprecise or incorrect use of terminology (1 to 2 marks), chronological or factual inaccuracies (1 to 2 marks), unsupported generalizations (1 to 2 marks), and repetitive or redundant arguments (1 to 2 marks).

Examiner Expectations and Guidance

To assign high marks, candidates must incorporate all three data sources meaningfully—Text A's prose, Text B's n-gram quantitative data, and Text C's word frequency information. Evidence and analysis should move beyond feature spotting or simple listing to provide clear, insightful linguistic interpretation explaining how these features illustrate English language change.

Precise and consistent use of technical linguistic vocabulary is essential, alongside well-structured essays typically arranged by linguistic features such as lexis, semantics, grammar, orthography, pragmatics, and phonology rather than source-by-source description.

Candidates should avoid chronological history narration or direct translation of archaic terms without linguistic analysis. Effective essays show complex synthesis of data, clearly linking quantitative trends with qualitative textual evidence.

Typical errors that lead to mark reduction include description without analysis, neglecting one or more data sources (especially quantitative evidence), inaccurate terminology (e.g., calling archaisms 'old-fashioned'), unsubstantiated general claims, repetitive arguments, and chronological mistakes that reveal misunderstanding of language evolution.

Summary of Marking Practice

When marking, first assess AO2, AO4, and AO5 individually, then combine scores for a holistic result.

Prioritize candidates' ability to synthesize data from all sources, deliver sustained analytical writing, and apply linguistic theory precisely.

Mark deductions must align with common examiner comments, including penalizing superficial analysis, missing data integration, and imprecise terminology use.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good and they demonstrate strong linguistic understanding.
""",
    "gp_essay": """
CAMBRIDGE INTERNATIONAL AS LEVEL ENGLISH GENERAL PAPER 8021 - PAPER 1 ESSAY MARKING CRITERIA

Core Principle for AI Marking: Cambridge marking follows a "positive marking" approach - identify and reward what candidates demonstrate they can do. Marks are awarded for strengths, not deducted for weaknesses. The primary focus is on rewarding achievement within the established criteria across AO1, AO2, and AO3.

GENERIC MARKING PRINCIPLES (Apply to ALL essays):
1. Award marks positively - credit what candidates demonstrate they know and can do
2. Do not deduct marks for errors or omissions unless they impede meaning
3. Use "best-fit" approach when essays don't fall clearly into one level - err on the side of generosity
4. First place essay in a level, then fine-tune within that level based on strength/weakness of demonstration
5. Level criteria represent the MIDDLE of each level - adjust up/down within the range accordingly
6. Examiners prioritize "disciplined management of discussion," "clear communication," and "supported judgement" over weight of facts

OMMAND WORD SPECIFIC MARKING CRITERIA FOR CAMBRIDGE 8021 PAPER 1

CORE PRINCIPLE: While all essays are assessed using the same generic level descriptors (AO1, AO2, AO3), different command words require specific demonstrations of skills and approaches. The AI should adjust expectations and weightings within the same marking framework.

═══════════════════════════════════════════════════════════════════

1. EVALUATE / EVALUATE THE EXTENT TO WHICH / EVALUATE WHETHER
   Official Definition: "Judge or calculate the quality, importance, amount, or value of something"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Critical for higher levels):
   • Must demonstrate WEIGHING OF EVIDENCE from multiple perspectives
   • Requires BALANCED CONSIDERATION before reaching judgment
   • Expects analysis of STRENGTHS AND WEAKNESSES of different positions
   • High marks demand SUPPORTED FINAL VERDICT with clear reasoning
   • Should show EXTENT/DEGREE of agreement rather than absolute positions
   
   COMMAND WORD PENALTIES:
   • ONE-SIDED ARGUMENTS: Limit to Level 3 maximum (18 marks)
   • NO CLEAR EVALUATION/JUDGMENT: Significant AO2 penalty, max Level 2-3
   • PURELY DESCRIPTIVE RESPONSES: Cannot exceed Level 2 (12 marks)
   
   REWARD PATTERNS:
   • "However", "Nevertheless", "On the other hand" signaling balance
   • Modal verbs: "may", "might", "could", "appears to" showing nuanced thinking
   • Phrases like "To a large extent", "To some degree", "Partially true"
   • Evidence-based conclusions that synthesize multiple viewpoints

═══════════════════════════════════════════════════════════════════

2. ASSESS / ASSESS THE VIEW THAT / ASSESS WHETHER
   Official Definition: "Make an informed judgement"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Slightly different from Evaluate):
   • Requires CRITICAL EXAMINATION of validity/effectiveness
   • Expects EVIDENCE-BASED JUDGMENT about worth/value
   • Must show CRITERIA for assessment (what makes something good/bad/effective)
   • Higher marks for COMPARATIVE ASSESSMENT (better/worse than alternatives)
   • Should demonstrate INFORMED PERSPECTIVE with supporting reasoning
   
   COMMAND WORD PENALTIES:
   • UNSUPPORTED ASSERTIONS: Major AO2 penalty
   • NO ASSESSMENT CRITERIA SHOWN: Limits AO2 achievement
   • PURELY OPINION-BASED without evidence: Max Level 2-3
   
   REWARD PATTERNS:
   • Clear criteria for judgment ("This is effective because...")
   • Comparative language ("More/less effective than...", "Superior to...")
   • Evidence-based reasoning ("Studies show...", "Statistics indicate...")
   • Acknowledgment of limitations while maintaining position

═══════════════════════════════════════════════════════════════════

3. DISCUSS / DISCUSS THIS STATEMENT
   Official Definition: "Write about issue(s) or topic(s) in depth in a structured way"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Different from Evaluate/Assess):
   • Must PRESENT MULTIPLE VIEWPOINTS with equal consideration
   • Requires THOROUGH EXPLORATION of different angles/perspectives
   • Expects STRUCTURED EXAMINATION of various aspects
   • Can reach conclusion but not essential for high marks
   • Values DEPTH OF EXPLORATION over definitive judgment
   
   COMMAND WORD PENALTIES:
   • ONE-SIDED DISCUSSION: Limit to Level 3 maximum
   • SUPERFICIAL TREATMENT: Affects AO2 significantly
   • NO ALTERNATIVE PERSPECTIVES: Cannot achieve Level 4-5
   
   REWARD PATTERNS:
   • "Some argue that...", "Others contend that...", "Another perspective is..."
   • Structured exploration: "Economically...", "Socially...", "Politically..."
   • Recognition of complexity: "This issue is complex because..."
   • Multiple stakeholder perspectives considered

═══════════════════════════════════════════════════════════════════

4. TO WHAT EXTENT / HOW FAR DO YOU AGREE
   Official Definition: Create argument showing degree of agreement/disagreement

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Most demanding command word):
   • Must demonstrate SPECTRUM THINKING rather than binary positions
   • Requires EXPLICIT POSITIONING on extent scale ("largely", "partially", "minimally")
   • Expects GRADUATED ANALYSIS showing different degrees of validity
   • Higher marks for SOPHISTICATED POSITIONING ("In certain contexts", "Under specific conditions")
   • Must show WHY extent varies (conditions, circumstances, limitations)
   
   COMMAND WORD PENALTIES:
   • BINARY THINKING (completely true/false): Limit to Level 3
   • NO EXPLICIT EXTENT STATEMENT: Significant AO2 penalty
   • FAILURE TO SHOW VARYING DEGREES: Max Level 2-3
   
   REWARD PATTERNS:
   • Explicit extent language: "To a considerable extent...", "To a limited degree..."
   • Conditional statements: "This is true when...", "This applies primarily to..."
   • Graduated analysis: "More true for X than Y", "Varies depending on..."
   • Contextual qualification: "In developed countries... however in developing nations..."

═══════════════════════════════════════════════════════════════════

5. CONSIDER / WHAT IS YOUR VIEW
   Official Definition: "Review and respond to given information"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (More personal but still analytical):
   • Allows more PERSONAL PERSPECTIVE but must be JUSTIFIED
   • Requires THOUGHTFUL CONSIDERATION of different aspects
   • Expects REASONED PERSONAL POSITION with supporting evidence
   • Values REFLECTIVE THINKING and INFORMED OPINION
   • Must show AWARENESS of alternative views even if disagreeing
   
   COMMAND WORD PENALTIES:
   • PURELY SUBJECTIVE OPINION: Limit to Level 2-3
   • NO JUSTIFICATION OF VIEW: Major AO2 penalty
   • IGNORANCE of other perspectives: Affects AO2
   
   REWARD PATTERNS:
   • "I believe that... because...", "My view is that... due to..."
   • "While others might argue..., I maintain that..."
   • Personal examples used appropriately to support position
   • Acknowledgment of complexity in forming view

═══════════════════════════════════════════════════════════════════

6. ANALYSE / EXAMINE
   Official Definition: "Examine in detail to show meaning, identify elements and relationships"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Focus on breakdown and understanding):
   • Must BREAK DOWN complex issues into component parts
   • Requires examination of RELATIONSHIPS and CONNECTIONS
   • Expects DETAILED EXPLORATION of causes, effects, implications
   • Values SYSTEMATIC EXAMINATION rather than broad coverage
   • Should show HOW different elements interact or influence each other
   
   COMMAND WORD PENALTIES:
   • PURELY DESCRIPTIVE without analysis: Max Level 2
   • NO BREAKDOWN of complexity: Limits AO2 achievement
   • SURFACE-LEVEL treatment: Affects level placement
   
   REWARD PATTERNS:
   • "This is caused by...", "This leads to...", "The relationship between..."
   • Systematic breakdown: "The main factors are...", "This comprises..."
   • Cause-effect relationships explored
   • Interconnections identified and explained

═══════════════════════════════════════════════════════════════════

IMPLEMENTATION GUIDANCE FOR AI MARKING:

STEP 1: IDENTIFY COMMAND WORD
• Extract main command word from question
• Apply specific expectations alongside generic levels

STEP 2: CHECK COMMAND WORD REQUIREMENTS
• Has the essay addressed the specific demands of the command word?
• Are the required thinking skills demonstrated?
• Is the approach appropriate to the command word?

STEP 3: APPLY COMMAND WORD PENALTIES
• If command word requirements not met, apply maximum level limits
• Ensure penalties are applied consistently

STEP 4: REWARD COMMAND WORD STRENGTHS
• Look for specific language patterns and approaches
• Credit sophisticated handling of command word demands
• Award higher marks for exceptional command word responses

STEP 5: INTEGRATE WITH GENERIC LEVELS
• Use command word criteria to fine-tune placement within generic levels
• Ensure overall mark reflects both generic achievement and command word handling
• Balance command word requirements with AO1 and AO3 achievement

COMMON COMMAND WORD COMBINATIONS:
• "Evaluate the extent to which" = Combine Evaluate + To What Extent requirements
• "Assess whether" = Assess requirements with clear yes/no positioning
• "Discuss and evaluate" = Full discussion followed by evaluative conclusion

EXAMINER GUIDANCE QUOTES:
"Examiners will be guided more by careful selection and application of information, effective analysis and evaluation, and supported judgement, than by weight of facts" [web:78][web:6]

"The simple method of using connectives such as 'however', 'nevertheless', introduces balance and recognition of other points of view"  

Mark essays by first checking generic level placement, then applying command word criteria to confirm or adjust the level and fine-tune the mark within that level.

ASSESSMENT LEVELS (Total: 30 marks):

LEVEL 5 (25-30 marks) - EXCEPTIONAL ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects a RANGE of FULLY RELEVANT information that EFFECTIVELY exemplifies the MAIN ASPECTS of the response
• Applies a RANGE of examples APPROPRIATELY to support main ideas and opinions
• Information is precisely chosen and skillfully deployed

AO2 Analysis and Evaluation:
• ANALYSES POSSIBLE MEANINGS of the question and DEFINES THE SCOPE clearly
• Develops, analyses and evaluates a RANGE OF ARGUMENTS to reach a SUPPORTED CONCLUSION
• Develops a STRONG ARGUMENT with CLEAR USE of supportive evidence
• Shows sophisticated understanding of complexity and nuance

AO3 Communication using Written English:
• Communicates clearly with CONSISTENTLY APPROPRIATE register throughout
• Uses a WIDE RANGE of vocabulary and VARIETY of language features
• Uses language with CONTROL AND ACCURACY - errors only relate to sophisticated words/structures
• Constructs COHESIVE response linking ideas, arguments and paragraphs CONVINCINGLY
• Text is WELL ORGANISED with excellent structure

Award 25-30 based on strength within level:
30: Exceptional in all areas, sophisticated analysis, outstanding communication
29: Very strong across all AOs with minor areas for development  
28: Strong achievement with some very good elements
27: Good solid achievement meeting most criteria well
26: Competent achievement meeting criteria adequately
25: Just meets the level criteria

LEVEL 4 (19-24 marks) - STRONG ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects RELEVANT information that exemplifies the MAIN ASPECTS of response
• Applies examples APPROPRIATELY to support main ideas and opinions
• Generally well-chosen information with mostly effective deployment

AO2 Analysis and Evaluation:
• ANALYSES the meaning of the question to INFORM THE SCOPE of response
• Develops, analyses and BEGINS TO EVALUATE different arguments to reach supported conclusion
• Develops a WELL-REASONED argument with use of supportive evidence
• Shows clear understanding with some analytical depth

AO3 Communication using Written English:
• Communicates clearly with APPROPRIATE use of register
• Uses a RANGE of vocabulary and language features
• Uses language with CONTROL and SOME ACCURACY - errors relate to less common words/structures
• Constructs CLEAR response which links ideas, arguments and paragraphs
• Text is GENERALLY WELL ORGANISED

Award 19-24 based on strength within level:
24: Very strong achievement approaching Level 5
23: Strong achievement with most criteria met well
22: Good achievement meeting criteria clearly
21: Competent achievement with some stronger elements
20: Adequate achievement meeting basic criteria
19: Just meets the level requirements

LEVEL 3 (13-18 marks) - SOUND ACHIEVEMENT  
AO1 Selection and Application of Information:
• Selects information that exemplifies SOME of the main aspects of response
• Applies examples to support the main ideas and opinions
• Information generally relevant but may lack full development

AO2 Analysis and Evaluation:
• DEMONSTRATES UNDERSTANDING of the meaning of the question in response
• DEVELOPS and BRINGS TOGETHER some arguments to form a conclusion
• Constructs an argument which is LOGICAL and USUALLY SUPPORTED by evidence
• Shows basic understanding with some attempt at analysis

AO3 Communication using Written English:
• Communicates clearly OVERALL but with INCONSISTENT use of appropriate register
• Uses EVERYDAY vocabulary and SOME VARIED language features
• Uses language with SOME CONTROL - errors are noticeable but DO NOT IMPEDE communication
• Constructs a MOSTLY COHERENT response which links ideas, arguments and paragraphs
• Text has SOME ORGANISATION but may not be sustained throughout

Award 13-18 based on strength within level:
18: Upper end - approaching Level 4 in some areas
17: Good solid achievement within level
16: Competent achievement meeting criteria adequately  
15: Basic achievement meeting criteria with some gaps
14: Adequate achievement with noticeable weaknesses
13: Just meets the level requirements

LEVEL 2 (7-12 marks) - LIMITED ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects LIMITED information that exemplifies aspects of response
• Applies examples that are LINKED TO SOME of the ideas and opinions
• Information may be partially relevant or underdeveloped

AO2 Analysis and Evaluation:
• Demonstrates PARTIAL UNDERSTANDING of the meaning of the question
• REFERS TO arguments to form a conclusion
• Constructs an argument PARTIALLY SUPPORTED by evidence
• Shows basic understanding with limited analysis

AO3 Communication using Written English:
• Communicates clearly IN PLACES with INCONSISTENT use of register
• Uses BASIC vocabulary with LIMITED language features
• Uses language with LIMITED CONTROL - errors are FREQUENT and SOMETIMES IMPEDE communication
• Constructs a FRAGMENTED response which links SOME ideas and/or arguments
• Organization is weak or inconsistent

Award 7-12 based on achievement:
12: Shows some competence approaching Level 3
11: Basic achievement with some clearer elements
10: Limited achievement meeting some criteria
9: Weak achievement with significant gaps
8: Very limited achievement  
7: Minimal achievement just meeting level

LEVEL 1 (1-6 marks) - MINIMAL ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects LIMITED information that is relevant to the question
• Makes examples which MAY NOT LINK to ideas and opinions
• Information largely irrelevant or misapplied

AO2 Analysis and Evaluation:
• Makes a LIMITED RESPONSE to the question
• Makes some form of BASIC CONCLUSION
• Constructs a WEAK ARGUMENT
• Shows very limited understanding

AO3 Communication using Written English:
• Communicates with LACK OF CLARITY and/or register is INAPPROPRIATE
• Uses BASIC vocabulary with very limited range
• Uses language with control RARELY - errors are frequent and communication is OFTEN LOST
• Constructs a response but it is NOT ORGANISED and ideas are NOT LINKED
• Structure is unclear or absent

Award 1-6 based on minimal achievement shown:
6: Some attempt at meeting criteria
5-4: Very limited achievement
3-2: Minimal achievement
1: Barely creditable content

LEVEL 0 (0 marks) - NO CREDITABLE CONTENT
• No response or response completely irrelevant to question
• Illegible or incomprehensible response

SPECIFIC GUIDANCE FOR AI IMPLEMENTATION:

QUESTION-SPECIFIC CONSIDERATIONS:
• Before marking, identify the command word and apply appropriate emphasis
• Check essay addresses the specific question asked, not just the general topic
• Look for evidence that candidate has understood the scope and parameters of the question

EVIDENCE AND EXAMPLES:
• Credit relevant examples from any appropriate source (current events, historical, personal, literary, etc.)
• Higher levels require RANGE of examples, not just quantity
• Examples must be APPLIED to support argument, not just listed
• Contemporary examples are valuable but not essential for high marks

ARGUMENT STRUCTURE:
• Look for clear thesis/position statement
• Check for logical development of ideas
• Reward balanced consideration where appropriate to question type  
• Strong conclusions should synthesize arguments rather than just summarize

LANGUAGE ASSESSMENT:
• Focus on communication effectiveness rather than perfection
• Errors only significant if they impede meaning
• Reward ambitious vocabulary attempts even if not perfectly executed
• Register should be consistently appropriate for academic essay

COMMON MARKING SCENARIOS:
• Essay with strong argument but limited examples: Focus on AO2 strength, moderate AO1
• Essay with many examples but weak analysis: Focus on AO1, lower AO2
• Well-written but off-topic: Cannot exceed Level 2 regardless of language quality
• One-sided argument for "discuss" question: Limit to Level 3 maximum
• No clear conclusion: Impacts AO2 significantly

FINAL MARK DETERMINATION:
1. Read essay holistically first
2. Identify strongest AO and weakest AO
3. Place in level using "best-fit" approach
4. Fine-tune within level based on overall strength
5. Ensure mark reflects achievement across all three AOs
6. When in doubt between levels, err toward generosity

Mark this essay based on the above criteria, providing specific evidence from the candidate's work to justify the level and mark awarded.
"""
}

# --- Mark totals configuration for dynamic grade computation ---
QUESTION_TOTALS = {
    "igcse_writers_effect": {"total": 15, "components": {"reading": 15}},
            "igcse_narrative": {"total": 40, "components": {"content_structure": 16, "style_accuracy": 24}},
        "igcse_descriptive": {"total": 40, "components": {"content_structure": 16, "style_accuracy": 24}},
    # Summary is 15 (reading) + 25 (writing) = 40 total
    "igcse_summary": {"total": 40, "components": {"reading": 15, "writing": 25}},
    # Directed writing in IGCSE typically 15 + 25 = 40
    "igcse_directed": {"total": 40, "components": {"reading": 15, "writing": 25}},
    # A-Level
    "alevel_directed": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
    "alevel_directed_writing": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
    "alevel_comparative": {"total": 15, "components": {"ao1": 5, "ao3": 10}},
    "alevel_text_analysis": {"total": 25, "components": {"ao1": 5, "ao3": 20}},
    "alevel_language_change": {"total": 25, "components": {"ao2": 5, "ao4": 5, "ao5": 15}},
    # English General Paper (8021)
    "gp_essay": {"total": 40, "components": {"content_argument": 25, "language_expression": 15}},
    "gp_comprehension": {"total": 40, "components": {"understanding_analysis": 25, "language_expression": 15}},
}

def parse_marks_value(marks_text: Optional[str]) -> int:
    """Parse a marks string like '13/15', '13 out of 15', or '13' into an int score.
    Returns 0 if parsing fails or input is empty.
    """
    if not marks_text:
        return 0
    try:
        # Find all integers and take the first as achieved marks
        numbers = re.findall(r"\d+", str(marks_text))
        return int(numbers[0]) if numbers else 0
    except Exception:
        return 0

def compute_overall_grade(question_type: str, reading_marks: Optional[str], writing_marks: Optional[str], ao1_marks: Optional[str], ao2_or_ao3_marks: Optional[str], content_structure_marks: Optional[str] = None, style_accuracy_marks: Optional[str] = None) -> str:
    """Compute a dynamic overall grade string 'score/total' for the given question type.
    Uses QUESTION_TOTALS and the extracted component marks.
    """
    cfg = QUESTION_TOTALS.get(question_type)
    if not cfg:
        # Fallback: cannot compute; return empty to allow upstream to keep AI-provided grade
        return ""

    achieved = 0
    # Map component values based on type
    components = cfg["components"]
    
    # Special handling for descriptive/narrative questions which use content_structure and style_accuracy
    if question_type in ["igcse_narrative", "igcse_descriptive"]:
        if "content_structure" in components:
            achieved += parse_marks_value(content_structure_marks)
        if "style_accuracy" in components:
            achieved += parse_marks_value(style_accuracy_marks)
    # Special handling for alevel_language_change which uses AO2/AO4/AO5
    elif question_type == "alevel_language_change":
        # For language change: ao2_or_ao3_marks contains AO2, ao1_marks contains AO4, reading_marks contains AO5
        if "ao2" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)  # AO2 marks
        if "ao4" in components:
            achieved += parse_marks_value(ao1_marks)  # AO4 marks stored in ao1_marks field
        if "ao5" in components:
            achieved += parse_marks_value(reading_marks)  # AO5 marks stored in reading_marks field
    else:
        # Standard handling for other question types
        if "reading" in components:
            achieved += parse_marks_value(reading_marks)
        if "writing" in components:
            achieved += parse_marks_value(writing_marks)
        if "ao1" in components:
            achieved += parse_marks_value(ao1_marks)
        # For AO2 and AO3 we will pass in through ao2_or_ao3_marks parameter
        if "ao2" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)
        if "ao3" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)

    total = cfg["total"]
    return f"{achieved}/{total}"

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
            "model": "moonshotai/kimi-k2:free",
            "messages": [
                {"role": "system", "content": "You are an expert English language examiner with extensive experience in marking IGCSE and A-Level English papers. Provide detailed, constructive feedback following the specific marking criteria provided."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.3
        }
        

        
        try:
            response = await client.post(DEEPSEEK_ENDPOINT, headers=headers, json=payload, timeout=60.0)

            
            response.raise_for_status()
            result = response.json()
            
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
            logger.error("DeepSeek API HTTP error", extra={
                "component": "deepseek",
                "status": e.response.status_code,
                "response": getattr(e.response, 'text', None)
            })
            if e.response.status_code == 401:
                error_msg = "DeepSeek API authentication failed. Please check your API key."
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            elif e.response.status_code == 429:
                error_msg = "DeepSeek API rate limit exceeded. Please try again later."
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            else:
                error_msg = f"DeepSeek API error: {e.response.status_code} - {e.response.text}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
        except Exception as e:
            # Provide a more helpful error message
            error_msg = str(e)
            logger.error("DeepSeek API exception", extra={
                "component": "deepseek",
                "error": error_msg
            })
            if "401" in error_msg or "unauthorized" in error_msg.lower():
                error_msg = "DeepSeek API authentication failed. Please check your API key configuration."
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            elif "404" in error_msg or "not found" in error_msg.lower():
                error_msg = "DeepSeek API endpoint not found. Please check your API endpoint configuration."
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
            "model": "qwen/qwen2.5-vl-72b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are an expert at extracting text from documents and images. Provide clean, accurate text extraction."},
                {"role": "user", "content": content}
            ],
            "max_tokens": 1500,
            "temperature": 0.1
        }
        
        try:
            response = await client.post(QWEN_ENDPOINT, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Qwen API error: {str(e)}")

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

def process_image_to_base64(file_content: bytes) -> str:
    """Convert image to base64 for API processing"""
    try:
        # Convert to base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        return base64_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

# Routes
@api_router.get("/users")
async def get_all_users():
    """Get all users"""
    try:
        response = supabase.table('assessment_users').select('*').execute()
        return {"users": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

@api_router.post("/users")
async def create_or_get_user(user_data: dict):
    """Create a new user or get existing user using the user management service"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_id = user_data.get('user_id')
        email = user_data.get('email')
        name = user_data.get('name')
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        logger.info(f"Creating or getting user: {user_id} ({email})")
        
        # Use the user management service to create or restore user
        result = await user_management_service.create_or_restore_user(
            user_id=user_id,
            email=email,
            display_name=name,
            academic_level='igcse',
            current_plan='unlimited',  # Launch event benefit
            credits=999999,  # Effectively unlimited
            is_launch_user=True,  # Track users who got the launch benefit
            photo_url=None,
            dark_mode=False
        )
        
        if result['success']:
            logger.info(f"Successfully created/restored user: {user_id}")
            return {
                "user": result['user'],
                "operation": result['operation'],
                "message": result['message']
            }
        else:
            logger.error(f"Failed to create/restore user: {user_id} - {result.get('error')}")
            raise HTTPException(status_code=500, detail=f"User creation/restoration failed: {result.get('error')}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in create_or_get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User creation error: {str(e)}")

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, request: Request):
    """Get user by ID using the user management service with automatic recovery"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.info(f"Getting user with ID: {user_id}")
        
        # Use the user management service to get user
        user_data = await user_management_service.get_user_by_id(user_id)
        
        if user_data:
            logger.info(f"Successfully retrieved user: {user_id}")
            return {"user": user_data}
        else:
            # User not found - try to recover from auth data
            logger.warning(f"User not found for ID: {user_id}, attempting recovery")
            
            # Try to extract user info from auth headers
            auth_header = request.headers.get('authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    # Decode the JWT token to get user info
                    import jwt
                    # Note: This is a simplified approach - in production you'd verify the token
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    email = decoded.get('email', f"{user_id}@recovered.user")
                    name = decoded.get('name', 'Recovered User')
                    
                    logger.info(f"Attempting recovery with email: {email}")
                    
                    # Attempt to create/restore user with extracted info
                    recovery_result = await user_management_service.create_or_restore_user(
                        user_id=user_id,
                        email=email,
                        display_name=name,
                        academic_level='igcse',
                        current_plan='free',
                        credits=3,
                        is_launch_user=False
                    )
                    
                    if recovery_result['success']:
                        logger.info(f"Successfully recovered user: {user_id}")
                        return {"user": recovery_result['user']}
                    else:
                        logger.error(f"Failed to recover user: {user_id} - {recovery_result.get('error')}")
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Cannot recover user - {recovery_result.get('error')}"
                        )
                        
                except Exception as jwt_error:
                    logger.error(f"JWT decode failed for user {user_id}: {str(jwt_error)}")
                    # Fallback to basic recovery
                    recovery_result = await user_management_service.create_or_restore_user(
                        user_id=user_id,
                        email=f"{user_id}@recovered.user",
                        display_name="Recovered User",
                        academic_level='igcse',
                        current_plan='free',
                        credits=3,
                        is_launch_user=False
                    )
                    
                    if recovery_result['success']:
                        logger.info(f"Successfully recovered user with fallback: {user_id}")
                        return {"user": recovery_result['user']}
                    else:
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Cannot recover user - missing email information"
                        )
            else:
                # No auth header - return error
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot recover user - missing authentication"
                )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User retrieval error: {str(e)}")

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, updates: dict):
    """Update user information using the user management service"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.info(f"Updating user: {user_id}")
        
        # Use the user management service to update user
        updated_user = await user_management_service.update_user(user_id, updates)
        
        if updated_user:
            logger.info(f"Successfully updated user: {user_id}")
            return {"user": updated_user}
        else:
            logger.warning(f"User not found for update, ID: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User update error: {str(e)}")

@api_router.post("/users/recover")
async def recover_user(user_data: dict, request: Request):
    """Recover a user with auth/database mismatch"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_id = user_data.get('user_id')
        email = user_data.get('email')
        metadata = user_data.get('metadata', {})
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        # If email is not provided, try to extract from auth token
        if not email:
            auth_header = request.headers.get('authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    email = decoded.get('email')
                    if not metadata.get('name'):
                        metadata['name'] = decoded.get('name', 'Recovered User')
                except Exception as jwt_error:
                    logger.error(f"JWT decode failed: {str(jwt_error)}")
                    raise HTTPException(status_code=400, detail="Cannot extract email from token")
            else:
                raise HTTPException(status_code=400, detail="Email is required and no auth token provided")
        
        logger.info(f"Attempting to recover user: {user_id} ({email})")
        
        # Use the user management service to handle the mismatch
        recovery_result = await user_management_service.handle_auth_database_mismatch(
            auth_user_id=user_id,
            email=email,
            metadata=metadata
        )
        
        if recovery_result['success']:
            logger.info(f"Successfully recovered user: {user_id}")
            return {
                "success": True,
                "user": recovery_result['user'],
                "recovery_method": recovery_result['recovery_method'],
                "message": recovery_result['message']
            }
        else:
            logger.error(f"Failed to recover user: {user_id} - {recovery_result.get('error')}")
            raise HTTPException(
                status_code=500, 
                detail=f"User recovery failed: {recovery_result.get('error')}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in recover_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User recovery error: {str(e)}")

@api_router.get("/users/stats")
async def get_user_management_stats():
    """Get user management statistics"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        stats = await user_management_service.get_user_management_stats()
        return {"stats": stats}
        
    except Exception as e:
        logger.error(f"Error getting user management stats: {str(e)}")
        return {"error": str(e)}

@api_router.get("/users/orphaned")
async def get_orphaned_users():
    """Get list of potentially orphaned users (soft-deleted)"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        orphaned_users = await user_management_service.find_orphaned_users()
        return {"orphaned_users": orphaned_users}
        
    except Exception as e:
        logger.error(f"Error getting orphaned users: {str(e)}")
        return {"error": str(e)}

@api_router.get("/debug/env-check")
async def debug_env_check():
    """Check environment variables"""
    return {
        "api_key_configured": False,
        "api_key_first_10": '',
        "environment": None,
        "base_url": None
    }

@api_router.put("/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: dict):
    """Update user preferences (dark mode, etc.) using the user management service"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        # Validate preferences
        allowed_preferences = ['dark_mode']
        filtered_preferences = {k: v for k, v in preferences.items() if k in allowed_preferences}
        
        if not filtered_preferences:
            raise HTTPException(status_code=400, detail="No valid preferences provided")
        
        # Use the user management service to update user
        updated_user = await user_management_service.update_user(user_id, filtered_preferences)
        
        if updated_user:
            return {"user": updated_user}
        else:
            raise HTTPException(status_code=404, detail="User not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preferences update error: {str(e)}")

@api_router.get("/question-types")
async def get_question_types():
    return {"question_types": QUESTION_TYPES}

@api_router.post("/process-file")
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

@api_router.post("/evaluate", response_model=FeedbackResponse)
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

@api_router.post("/badges/check/{user_id}")
async def check_and_award_badges(user_id: str):
    """Check user activity and award badges"""
    try:
        # Get user and evaluations using the user management service
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_data = await user_management_service.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        
        # Badge definitions
        badges_to_check = [
            # Streak badges
            {"type": "streak", "name": "3-Day Streak", "description": "Submit for 3 consecutive days", "icon": "🔥", "requirement": 3},
            {"type": "streak", "name": "7-Day Streak", "description": "Submit for 7 consecutive days", "icon": "🏆", "requirement": 7},
            {"type": "streak", "name": "30-Day Streak", "description": "Submit for 30 consecutive days", "icon": "💎", "requirement": 30},
            
            # Volume badges
            {"type": "volume", "name": "10 Essay Milestone", "description": "Submit 10 essays", "icon": "📝", "requirement": 10},
            {"type": "volume", "name": "25 Essay Milestone", "description": "Submit 25 essays", "icon": "📚", "requirement": 25},
            {"type": "volume", "name": "50 Essay Milestone", "description": "Submit 50 essays", "icon": "🎯", "requirement": 50},
            
            # Word count badges
            {"type": "words", "name": "10K Word Club", "description": "Write 10,000 words total", "icon": "✍️", "requirement": 10000},
            {"type": "words", "name": "25K Word Club", "description": "Write 25,000 words total", "icon": "📖", "requirement": 25000},
            
            # Improvement badges
            {"type": "improvement", "name": "Band Booster", "description": "Improve by 2 bands", "icon": "⬆️", "requirement": 2},
            {"type": "improvement", "name": "Perseverance Award", "description": "Submit 5 times on same question type", "icon": "💪", "requirement": 5},
            
            # Exploration badges
            {"type": "exploration", "name": "Paper Explorer", "description": "Try 5 different question types", "icon": "🗺️", "requirement": 5},
            {"type": "exploration", "name": "IGCSE Specialist", "description": "Complete 10 IGCSE questions", "icon": "🎓", "requirement": 10},
            {"type": "exploration", "name": "A-Level Expert", "description": "Complete 10 A-Level questions", "icon": "🏅", "requirement": 10}
        ]
        
        awarded_badges = []
        
        for badge_def in badges_to_check:
            # Check if user already has this badge
            existing_badges_response = supabase.table('assessment_badges').select('*').eq('user_id', user_id).eq('badge_name', badge_def["name"]).execute()
            if existing_badges_response.data:
                continue
            
            progress = 0
            earned = False
            
            if badge_def["type"] == "streak":
                # Calculate current streak
                dates = [datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00")) for e in evaluations]
                dates.sort()
                current_streak = calculate_streak(dates)
                progress = current_streak
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "volume":
                progress = len(evaluations)
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "words":
                total_words = sum(len(e["student_response"].split()) for e in evaluations)
                progress = total_words
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "improvement":
                # Check for grade improvements
                improvements = 0
                for i in range(1, len(evaluations)):
                    prev_grade = extract_numeric_grade(evaluations[i-1]["grade"])
                    curr_grade = extract_numeric_grade(evaluations[i]["grade"])
                    if curr_grade > prev_grade:
                        improvements += 1
                progress = improvements
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "exploration":
                if badge_def["name"] == "Paper Explorer":
                    unique_types = set(e["question_type"] for e in evaluations)
                    progress = len(unique_types)
                    earned = progress >= badge_def["requirement"]
                elif badge_def["name"] == "IGCSE Specialist":
                    igcse_count = sum(1 for e in evaluations if e["question_type"].startswith("igcse"))
                    progress = igcse_count
                    earned = progress >= badge_def["requirement"]
                elif badge_def["name"] == "A-Level Expert":
                    alevel_count = sum(1 for e in evaluations if e["question_type"].startswith("alevel"))
                    progress = alevel_count
                    earned = progress >= badge_def["requirement"]
            
            if earned:
                # Award badge
                badge_data = {
                    "user_id": user_id,
                    "badge_type": badge_def["type"],
                    "badge_name": badge_def["name"],
                    "badge_description": badge_def["description"],
                    "badge_icon": badge_def["icon"],
                    "progress": progress,
                    "requirement": badge_def["requirement"],
                    "earned_at": datetime.utcnow().isoformat()
                }
                supabase.table('assessment_badges').insert(badge_data).execute()
                awarded_badges.append(badge_data)
        
        return {"awarded_badges": awarded_badges}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Badge check error: {str(e)}")

def calculate_streak(dates):
    """Calculate current streak from sorted dates"""
    if not dates:
        return 0
    
    # Group by date (ignore time)
    date_strings = list(set(date.strftime("%Y-%m-%d") for date in dates))
    date_strings.sort()
    
    if not date_strings:
        return 0
    
    # Check if today or yesterday is in the list
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if today not in date_strings and yesterday not in date_strings:
        return 0
    
    # Count consecutive days backwards from today/yesterday
    current_streak = 0
    check_date = datetime.now().date()
    
    for _ in range(len(date_strings)):
        if check_date.strftime("%Y-%m-%d") in date_strings:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return current_streak

def extract_numeric_grade(grade_str):
    """Extract numeric value from grade string"""
    match = re.search(r'(\d+)', grade_str)
    return int(match.group(1)) if match else 0

@api_router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get all badges for a user"""
    try:
        badges_response = supabase.table('assessment_badges').select('*').eq('user_id', user_id).order('earned_at', desc=True).limit(100).execute()
        badges = badges_response.data
        return {"badges": badges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Badge retrieval error: {str(e)}")

@api_router.get("/analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """Get analytics data for a specific user"""
    try:
        # Get user to check if they have analytics access using the user management service
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_data = await user_management_service.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has analytics access (unlimited plan)
        if user_data.get('current_plan') != 'unlimited':
            raise HTTPException(status_code=403, detail="Analytics access requires Unlimited plan")
        
        # Get user's evaluations
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        
        # Calculate analytics data
        analytics_data = {
            "total_responses": len(evaluations),
            "evaluations": evaluations,
            "user_plan": user_data.get('current_plan'),
            "questions_marked": user_data.get('questions_marked', 0),
            "credits_remaining": user_data.get('credits', 0)
        }

        # Recommendations: only after first 5 submissions and update every 5
        recommendations = None
        if len(evaluations) >= 5:
            try:
                # Determine if we need to refresh: every 5 submissions
                refresh_needed = (len(evaluations) % 5 == 0)
                # Fetch last cached recommendations if present
                rec_key = f"recos_{user_id}"
                rec_resp = supabase.table('assessment_meta').select('*').eq('key', rec_key).execute()
                cached = rec_resp.data[0] if rec_resp.data else None

                if refresh_needed or not cached:
                    # Aggregate per question type: average score and improvement suggestions
                    type_to_scores = defaultdict(list)
                    type_to_improvements = defaultdict(list)
                    for ev in evaluations:
                        qtype = ev.get('question_type')
                        grade_str = ev.get('grade', '')
                        # Extract achieved and total
                        nums = re.findall(r"(\d+)\/(\d+)", str(grade_str))
                        if nums:
                            achieved = int(nums[0][0])
                            total = int(nums[0][1]) if int(nums[0][1]) > 0 else 1
                            pct = achieved / total
                            type_to_scores[qtype].append(pct)
                        for imp in ev.get('improvement_suggestions', []) or []:
                            if isinstance(imp, str) and imp:
                                type_to_improvements[qtype].append(imp)

                    summaries = []
                    for qtype, scores in type_to_scores.items():
                        avg_pct = sum(scores) / max(len(scores), 1)
                        avg_score_pct = round(avg_pct * 100)
                        improvements_sample = type_to_improvements.get(qtype, [])[:10]
                        summaries.append({
                            "questionType": qtype,
                            "averageScorePercent": avg_score_pct,
                            "improvementSuggestions": improvements_sample,
                        })

                    # Compose enhanced prompt aligned with KimiK2 evaluation style
                    guide = (
                        "CRITICAL FOCUS AREAS:\n"
                        "1. Vocabulary Enhancement: Focus on advanced vocabulary that demonstrates sophistication\n"
                        "2. Structure & Organization: Clear progression of ideas with effective paragraphing\n"
                        "3. Evidence & Analysis: Use specific textual evidence and detailed analysis\n"
                        "4. Writing Techniques: Employ varied sentence structures and literary devices\n"
                        "5. Time Management: Practice completing responses within allocated time\n"
                        "6. Marking Criteria Mastery: Understand exactly what examiners look for\n"
                        "7. Comparative Analysis: For comparative essays, balance discussion between texts\n"
                        "8. Critical Thinking: Develop original insights and interpretations\n"
                    )
                    
                    user_prompt = f"""
You are analyzing a student's English assessment performance using the KimiK2 evaluation methodology.

STUDENT PERFORMANCE DATA:
{json.dumps(summaries, indent=2)}

EVALUATION APPROACH (KimiK2 Style):
- Give specific, actionable recommendations
- Focus on vocabulary improvement as a priority (highest marks for good vocabulary)
- Identify patterns across multiple assessments
- Provide concrete examples of how to improve
- Be encouraging while being honest about areas needing work

{guide}

Based on this student's specific performance patterns, generate personalized recommendations following this structure:

1. **Immediate Priority Areas** (2-3 most critical improvements needed)
   - Be specific about WHAT to improve and HOW

2. **Vocabulary Development Strategy**
   - Specific vocabulary areas to focus on based on their weak question types
   - Resources and techniques for vocabulary enhancement

3. **Question-Type Specific Improvements**
   - For each weak question type, provide targeted advice
   - Include specific techniques that work for that question type

4. **Study Plan** (Weekly structure)
   - Concrete daily/weekly goals
   - Balance between practice and learning new concepts

5. **Success Indicators**
   - What improvements to look for in next 5 assessments
   - Measurable goals to track progress

Remember: This student has completed {len(evaluations)} assessments. Tailor your advice to their current level and progression.

Format your response in clear bullet points, using "you" to address the student directly. Be encouraging but specific - avoid generic advice."""

                    # Call OpenRouter API for recommendations using OPENROUTER_GPT_OSS_120B_KEY
                    async def call_recommendations(prompt: str) -> str:
                        if not RECOMMENDATIONS_API_KEY:
                            raise Exception("OPENROUTER_GPT_OSS_120B_KEY not configured for recommendations")
                        
                        async with httpx.AsyncClient() as client:
                            headers = {
                                "Authorization": f"Bearer {RECOMMENDATIONS_API_KEY}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": "https://englishgpt.everythingenglish.xyz",
                                "X-Title": "EnglishGPT Recommendations"
                            }
                            
                            # Enhanced system prompt with KimiK2-style evaluation approach
                            system_prompt = """You are an expert English language tutor using the KimiK2 evaluation methodology. 
                            Generate practical, encouraging study recommendations based on student performance data. 
                            Focus heavily on vocabulary improvement as it yields the highest marks.
                            Be specific, actionable, and personalized to the student's weaknesses."""
                            
                            payload = {
                                "model": RECOMMENDATIONS_MODEL,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": prompt}
                                ],
                                "max_tokens": 800,
                                "temperature": 0.5
                            }
                            
                            r = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60.0)
                            r.raise_for_status()
                            res = r.json()
                            return res['choices'][0]['message']['content']

                    rec_text = await call_recommendations(user_prompt)

                    # Cache recommendations
                    record = {
                        "key": rec_key,
                        "value": rec_text,
                        "updated_at": datetime.utcnow().isoformat(),
                        "meta": json.dumps({"count": len(evaluations)})
                    }
                    if cached:
                        supabase.table('assessment_meta').update(record).eq('key', rec_key).execute()
                    else:
                        supabase.table('assessment_meta').insert(record).execute()
                    recommendations = rec_text
                else:
                    recommendations = cached.get('value')
            except Exception as e:
                logger.error(f"Recommendations error: {str(e)}")
                recommendations = None

        analytics_data["recommendations"] = recommendations

        return {"analytics": analytics_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@api_router.get("/test-history/{user_id}")
async def test_history(user_id: str):
    """Test endpoint to check if history works for a user"""
    try:

        
        # Check if user exists
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if not user_response.data:
            return {"error": "User not found", "user_id": user_id}
        
        # Check if evaluations exist
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        
        return {
            "user_exists": True,
            "evaluations_count": len(evaluations),
            "evaluations": evaluations[:5]  # Return first 5 for testing
        }
        
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        return {"error": str(e), "user_id": user_id}

@api_router.get("/history/{user_id}")
async def get_evaluation_history(user_id: str):
    """Get evaluation history for a specific user"""
    try:

        
        # Get evaluations from Supabase
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        

        return {"evaluations": evaluations}
    except Exception as e:
        logger.error(f"History endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/evaluations/user/{user_id}")
async def get_user_evaluations(user_id: str):
    """Get all evaluations for a specific user"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        # Verify user exists
        user_data = await user_management_service.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get evaluations for this user
        response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).execute()
        
        evaluations = response.data or []
        logger.info(f"Retrieved {len(evaluations)} evaluations for user {user_id}")
        
        return {"evaluations": evaluations}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/evaluations/{evaluation_id}")
async def get_evaluation_by_id(evaluation_id: str):
    """Public endpoint to fetch a single evaluation by its ID or short_id for shareable links"""
    try:
        # Debug logging removed for production
        # print(f"DEBUG: Looking for evaluation_id: {evaluation_id}")
        data = []
        
        # Try full UUID first, but only if it looks like a UUID to avoid PG uuid parse errors
        def _looks_like_uuid(value: str) -> bool:
            try:
                uuid.UUID(str(value))
                return True
            except Exception:
                return False

        if _looks_like_uuid(evaluation_id):
            # Debug logging removed for production
        # print(f"DEBUG: Trying UUID query for {evaluation_id}")
            try:
                response = supabase.table('assessment_evaluations').select('*').eq('id', evaluation_id).execute()
                data = response.data or []
                # Debug logging removed for production
        # print(f"DEBUG: UUID query returned {len(data)} results")
            except Exception as e:
                # Debug logging removed for production
        # print(f"DEBUG: UUID query failed: {e}")
                data = []
        
        if not data:
            # Fallback to short_id if column exists
            # Debug logging removed for production
        # print(f"DEBUG: Trying short_id query for {evaluation_id}")
            try:
                response2 = supabase.table('assessment_evaluations').select('*').eq('short_id', evaluation_id).execute()
                data = response2.data or []
                # Debug logging removed for production
        # print(f"DEBUG: short_id query returned {len(data)} results")
            except Exception as e:
                # Debug logging removed for production
        # print(f"DEBUG: short_id query failed: {e}")
                # If short_id column doesn't exist, try to find evaluation differently
                # Maybe the short_id is actually part of the main ID or stored elsewhere
                try:
                    # Debug logging removed for production
        # print(f"DEBUG: Trying fallback - searching all evaluations containing {evaluation_id}")
                    # This is a fallback - get recent evaluations and check if any match
                    response3 = supabase.table('assessment_evaluations').select('*').order('timestamp', desc=True).limit(50).execute()
                    all_evals = response3.data or []
                    # Debug logging removed for production
        # print(f"DEBUG: Fallback search through {len(all_evals)} recent evaluations")
                    # Look for evaluation where ID contains the short string or vice versa
                    for eval_item in all_evals:
                        eval_id = str(eval_item.get('id', ''))
                        if evaluation_id in eval_id or eval_id.endswith(evaluation_id):
                            # Debug logging removed for production
                            # print(f"DEBUG: Found match by ID pattern: {eval_id}")
                            data = [eval_item]
                            break
                except Exception as e2:
                    # Debug logging removed for production
                    # print(f"DEBUG: Fallback search also failed: {e2}")
                    pass
                data = []
        
        if not data:
            # Debug logging removed for production
            # print(f"DEBUG: No evaluation found for {evaluation_id}")
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        # Debug logging removed for production
        # print(f"DEBUG: Returning evaluation: {data[0].get('id')}")
        return {"evaluation": data[0]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_evaluation_by_id: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# --- Feedback collection ---

class FeedbackSubmitModel(BaseModel):
    evaluation_id: str
    user_id: str
    category: str  # overall | strengths | improvements
    accurate: bool
    comments: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackSubmitModel):
    """Store user feedback about marking accuracy in Supabase."""
    try:
        if feedback.category not in ["overall", "strengths", "improvements"]:
            raise HTTPException(status_code=400, detail="Invalid feedback category")

        if not supabase:
            logger.error("Supabase client not initialized")
            raise HTTPException(status_code=500, detail="Database connection error")

        record = feedback.dict()
        record["created_at"] = record["created_at"].isoformat()
        
        logger.info(f"Attempting to insert feedback: {record}")
        
        try:
            result = supabase.table("assessment_feedback").insert(record).execute()
            logger.info(f"Feedback inserted successfully: {result}")
            return {"success": True}
        except Exception as supabase_error:
            logger.error(f"Supabase insert error: {str(supabase_error)}")
            # Check if it's a table not found error
            if "assessment_feedback" in str(supabase_error):
                logger.error("Table 'assessment_feedback' may not exist")
            raise HTTPException(status_code=500, detail=f"Database insert error: {str(supabase_error)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in submit_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Feedback save error: {str(e)}")

# Include the API router after all routes are defined
app.include_router(api_router)

# Serve frontend build (SPA) with client-side routing fallback
FRONTEND_BUILD_DIR = (ROOT_DIR.parent / 'frontend' / 'build')
if FRONTEND_BUILD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")

# Note: Logging is already configured at the top of the file
# This is just getting the logger instance for this section
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    # No explicit close needed for supabase, it manages its own state
    pass