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
from io import BytesIO
from PIL import Image
import PyPDF2
import io

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Supabase connection
from supabase import create_client, Client

# Dodo Payments integration
try:
    from subscription_service import SubscriptionService
    from dodo_payments_client import DodoPaymentsClient, WebhookValidator, create_webhook_validator
    DODO_INTEGRATION_AVAILABLE = True
    logger.info("Dodo Payments integration available")
except ImportError as e:
    logger.warning(f"Dodo Payments integration not available: {e}")
    SubscriptionService = None
    DodoPaymentsClient = None
    WebhookValidator = None
    create_webhook_validator = None
    DODO_INTEGRATION_AVAILABLE = False

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

# Create the main app without a prefix
app = FastAPI()

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

@api_router.post("/subscriptions/create-checkout")
async def create_subscription_checkout(request: Request):
    """Create a checkout session for subscription"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        # Parse JSON request body
        request_data = await request.json()

        
        user_id = request_data.get('userId')
        plan_type = request_data.get('planType')
        metadata = request_data.get('metadata', {})
        

        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        if not plan_type or plan_type not in ['monthly', 'yearly']:
            raise HTTPException(status_code=400, detail="Valid plan type is required")
        
        result = await subscription_service.create_checkout_session(user_id, plan_type, metadata)
        return result
        
    except HTTPException as he:

        raise
    except Exception as e:
        logger.error(f"Checkout creation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Checkout creation failed: {str(e)}")

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
        "supabase_connected": supabase is not None,
        "dodo_integration": DODO_INTEGRATION_AVAILABLE,
        "subscription_service": subscription_service is not None
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

# Debug endpoints for subscription troubleshooting
@api_router.get("/debug/webhook-status")
async def debug_webhook_status():
    """Check webhook configuration"""
    return {
        "webhook_key_configured": bool(os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')),
        "subscription_service": subscription_service is not None,
        "dodo_integration": DODO_INTEGRATION_AVAILABLE,
        "api_key_configured": bool(os.environ.get('DODO_PAYMENTS_API_KEY')),
        "environment": os.environ.get('DODO_PAYMENTS_ENVIRONMENT'),
        "base_url": os.environ.get('DODO_PAYMENTS_BASE_URL'),
        "endpoint_url": "https://englishgpt.everythingenglish.xyz/api/webhooks/dodo"
    }

@api_router.get("/debug/subscription-check/{user_id}")
async def debug_subscription_check(user_id: str):
    """Check user subscription status for debugging"""
    try:
        # Check user record
        user_resp = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        user_data = user_resp.data[0] if user_resp.data else None
        
        # Check subscription access
        has_access = await subscription_service._check_user_subscription_access(user_id) if subscription_service else False
        
        # Check subscription records
        sub_resp = supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).execute()
        
        # Check recent webhook events
        webhook_resp = supabase.table('dodo_webhook_events').select('*').order('created_at', desc=True).limit(5).execute()
        
        return {
            "user_found": bool(user_data),
            "user_id": user_id,
            "current_plan": user_data.get('current_plan') if user_data else None,
            "subscription_status": user_data.get('subscription_status') if user_data else None,
            "dodo_customer_id": user_data.get('dodo_customer_id') if user_data else None,
            "has_subscription_access": has_access,
            "subscription_records": sub_resp.data,
            "subscription_count": len(sub_resp.data),
            "questions_marked": user_data.get('questions_marked') if user_data else 0,
            "credits": user_data.get('credits') if user_data else 0,
            "recent_webhook_events": webhook_resp.data
        }
    except Exception as e:
        return {"error": str(e)}

@api_router.post("/debug/check-webhook-events")
async def check_webhook_events(request: dict):
    """Check webhook events for debugging"""
    try:
        customer_id = request.get('customer_id')
        
        # Get recent webhook events
        webhook_events = supabase.table('dodo_webhook_events').select('*').order('created_at', desc=True).limit(10).execute()
        
        # Filter events that might be related to this customer
        related_events = []
        all_events = []
        
        for event in webhook_events.data:
            payload = event.get('payload', {})
            event_data = payload.get('data', {})
            
            # Extract customer ID from various possible locations
            event_customer_id = (
                event_data.get('customer_id') or 
                event_data.get('customer', {}).get('customer_id') or
                event_data.get('customer', {}).get('id')
            )
            
            event_summary = {
                'event_type': event.get('event_type'),
                'processed': event.get('processed'),
                'error_message': event.get('error_message'),
                'created_at': event.get('created_at'),
                'customer_id': event_customer_id,
                'metadata': event_data.get('metadata', {})
            }
            
            all_events.append(event_summary)
            
            # Check if this event is related to our customer
            if event_customer_id == customer_id or not customer_id:
                related_events.append({
                    **event_summary,
                    'full_payload': payload
                })
        
        return {
            "total_webhook_events": len(webhook_events.data),
            "all_events_summary": all_events,
            "related_events": related_events,
            "customer_id_searched": customer_id
        }
        
    except Exception as e:
        return {"error": str(e)}

@api_router.post("/debug/manual-activate-subscription")
async def manual_activate_subscription(request: dict):
    """Manually activate subscription for paid user (emergency fix)"""
    user_id = request.get('userId')
    plan_type = request.get('planType', 'monthly')
    
    try:
        # Create subscription record manually
        subscription_record = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'dodo_subscription_id': f'manual_{int(datetime.utcnow().timestamp())}',
            'dodo_customer_id': request.get('customerId', 'manual_customer'),
            'status': 'active',
            'plan_type': plan_type,
            'current_period_start': datetime.utcnow().isoformat(),
            'current_period_end': (datetime.utcnow() + timedelta(days=30 if plan_type == 'monthly' else 365)).isoformat(),
            'cancel_at_period_end': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert subscription record
        supabase.table('dodo_subscriptions').insert(subscription_record).execute()
        
        # Update user plan
        supabase.table('assessment_users').update({
            'current_plan': 'unlimited',
            'subscription_status': 'active',
            'updated_at': datetime.utcnow().isoformat()
        }).eq('uid', user_id).execute()
        
        return {"success": True, "message": "Subscription manually activated", "subscription": subscription_record}
        
    except Exception as e:
        return {"error": str(e)}    

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

class TransactionModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    user_email: str
    amount_inr: int
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Payment Config - Ready for DodoPayments integration
USD_TO_INR = 86.6
MIN_USD = 3

# PayU endpoints removed - ready for DodoPayments integration

# Payment endpoints removed - ready for DodoPayments integration

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

IV. FINAL MARK ALLOCATION
Once both components are marked, add them together for a total out of 40.
The final assessment should justify the total mark by summarizing the strengths and weaknesses for each component, making direct reference to specific examples from the candidate's work and linking them to the level descriptors.
Mark this text based on the above criteria: Do not over-scrutinize, marks can be awarded positively and negatively. Heavily limit marks when endings are rushed/not good. Please don't call every essay a rushed ending, do remember there is a word limit, however, rushed endings will cause heavy deduction of marks.""",
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
You are marking a Cambridge International AS & A Level English Language Paper 1 Question 1(b) comparative analysis response worth 15 marks total, split between AO1 (5 marks) and AO3 (10 marks). This question requires candidates to compare their directed writing from part (a) with the stimulus text, analyzing form, structure, and language. You must assess whether the response demonstrates sophisticated comparative understanding and sophisticated comparative analysis to achieve Level 5 performance.
For AO1, you are looking for sophisticated comparative understanding of texts including meaning, context, and audience, demonstrated through insightful reference to characteristic features. The candidate must show deep grasp of how purpose and audience differ between forms and identify genre-specific conventions with sophisticated awareness. Level 5 responses will recognize that different forms serve different purposes and appeal to different audiences, such as understanding that advertisements have wider target audiences including general interest readers while reviews target those with specific practical interests in booking.
For AO3, you must verify that the response provides sophisticated comparative analysis of elements of form, structure, AND language. All three frameworks are mandatory for Level 5 achievement. The response must demonstrate sophisticated analysis of how writers' stylistic choices relate to audience and shape meaning, explaining both WHY choices were made and HOW they affect meaning. Look for analytical sophistication such as explanations of register choices, where candidates might explain choosing to lower the register of a review so the writer's voice could be understood to contain excitement and true feelings rather than mimicking elevated advertisement register.
Critical discriminators between levels include comparative integration versus separation. Level 5 responses weave integrated analysis of both texts throughout, while Level 3-4 responses show some comparison but may treat texts separately, and Level 1-2 responses show minimal comparison with predominantly single-text focus. You must also distinguish between analytical sophistication and feature identification. Level 5 responses show sophisticated awareness explaining complex relationships between choice, audience, and meaning, while Level 3 responses show clear awareness identifying and explaining basic relationships, and Level 1 responses show minimal awareness with basic feature spotting without analysis.
Assess critical precision versus general commentary. Level 5 responses use precise and fully appropriate language to link evidence with explanatory comments, while Level 2 responses merely attempt to use appropriate language. Look for precision such as analysis explaining how lengthier constructions convey a sense of frenzied, varied activity taking place over time, with shorter declaratives providing welcome interruption and pause for thought during career development.
Common failures that prevent higher marks include lengthy quotes from text as supporting evidence when responses should use brief quotes to avoid copying long text portions and wasting examination time. Responses that do not observe the question demands fully by failing to analyze form, structure, AND language cannot be awarded above Level 3 regardless of other qualities. Reflective commentary approaches when analyzing their own writing instead of analytical comparison will limit marks, as will predominantly focusing on the stimulus text while giving minimal treatment to their own directed writing.
Mark boundaries for AO3 are Level 5 achieving 9-10 marks, Level 4 achieving 7-8 marks, and Level 3 achieving 5-6 marks. The primary qualitative differences between levels are sophistication versus detail versus clarity, with insightful versus effective versus appropriate selection quality, and precise versus effective versus clear terminology and expression standards. Time allocation should reflect the 15/50 total marks representing approximately 30% of examination time.


Mark boundaries for AO3: Level 5 (9-10 marks), Level 4 (7-8 marks), Level 3 (5-6 marks).

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
"""
}

# --- Mark totals configuration for dynamic grade computation ---
QUESTION_TOTALS = {
    "igcse_writers_effect": {"total": 15, "components": {"reading": 15}},
    "igcse_narrative": {"total": 40, "components": {"reading": 16, "writing": 24}},
    "igcse_descriptive": {"total": 40, "components": {"reading": 16, "writing": 24}},
    # Summary is 10 (reading) + 5 (writing) = 15 total
    "igcse_summary": {"total": 15, "components": {"reading": 10, "writing": 5}},
    # Directed writing in IGCSE typically 15 + 25 = 40
    "igcse_directed": {"total": 40, "components": {"reading": 15, "writing": 25}},
    # A-Level
    "alevel_directed": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
    "alevel_comparative": {"total": 15, "components": {"ao1": 5, "ao3": 10}},
    "alevel_text_analysis": {"total": 25, "components": {"ao1": 5, "ao3": 20}},
}

def parse_marks_value(marks_text: Optional[str]) -> int:
    """Parse a marks string like '13/15', '13 out of 15', or '13' into an int score.
    Returns 0 if parsing fails or input is empty.
    """
    if not marks_text:
        return 0
    try:
        import re
        # Find all integers and take the first as achieved marks
        numbers = re.findall(r"\d+", str(marks_text))
        return int(numbers[0]) if numbers else 0
    except Exception:
        return 0

def compute_overall_grade(question_type: str, reading_marks: Optional[str], writing_marks: Optional[str], ao1_marks: Optional[str], ao2_or_ao3_marks: Optional[str]) -> str:
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
    if "reading" in components:
        achieved += parse_marks_value(reading_marks)
    if "writing" in components:
        achieved += parse_marks_value(writing_marks)
    if "ao1" in components:
        achieved += parse_marks_value(ao1_marks)
    # For AO3 we will pass in through ao2_or_ao3_marks parameter
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
    """Create a new user or get existing user"""
    try:
        user_id = user_data.get('user_id')
        email = user_data.get('email')
        name = user_data.get('name')
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        

        
        # Check if user already exists
        response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        logger.debug(f"DEBUG: Check existing user response: {response}")
        
        if response.data:
            # User exists, return the data
            existing_user = response.data[0]
            existing_user['id'] = existing_user['uid']  # For compatibility
            logger.debug(f"DEBUG: Returning existing user: {existing_user}")
            return {"user": existing_user}
        
        # Create new user with 3 free credits
        new_user_data = {
            "uid": user_id,
            "email": email,
            "display_name": name,
            "credits": 3,
            "current_plan": "free",
            "questions_marked": 0,
            "academic_level": "N/A",  # Default to N/A
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        logger.debug(f"DEBUG: Creating new user with data: {new_user_data}")
        
        # Save to Supabase
        insert_response = supabase.table('assessment_users').insert(new_user_data).execute()
        logger.debug(f"DEBUG: Insert response: {insert_response}")
        
        if insert_response.data:
            user_dict = insert_response.data[0]
            user_dict['id'] = user_dict['uid']  # For compatibility
            logger.debug(f"DEBUG: Created user successfully: {user_dict}")
            return {"user": user_dict}
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.debug(f"DEBUG: Exception in create_or_get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User creation error: {str(e)}")

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    try:
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.debug(f"DEBUG: Getting user with ID: {user_id}")
        response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        
        if not response.data:
            logger.debug(f"DEBUG: User not found for ID: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = response.data[0]
        user_data['id'] = user_data['uid']  # For compatibility
        logger.debug(f"DEBUG: Retrieved user data: {user_data}")
        logger.debug(f"DEBUG: Academic level in user data: {user_data.get('academic_level')}")
        return {"user": user_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.debug(f"DEBUG: Exception in get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User retrieval error: {str(e)}")

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, updates: dict):
    """Update user information"""
    try:
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        # Debug logging removed for production
        # print(f"DEBUG: Updating user {user_id} with: {updates}")
        
        # Update timestamp
        updates['updated_at'] = datetime.utcnow().isoformat()
        
        # Update in Supabase
        response = supabase.table('assessment_users').update(updates).eq('uid', user_id).execute()
        
        if not response.data:
            logger.debug(f"DEBUG: User not found for update, ID: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = response.data[0]
        updated_user['id'] = updated_user['uid']  # For compatibility
        logger.debug(f"DEBUG: User updated successfully: {updated_user}")
        
        # Debug: Check if academic_level was updated
        if 'academic_level' in updates:
            logger.debug(f"DEBUG: Academic level updated to: {updates['academic_level']}")
            logger.debug(f"DEBUG: User document now has academic_level: {updated_user.get('academic_level')}")
        
        return {"user": updated_user}
        
    except Exception as e:
        logger.error("User update error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail=f"User update error: {str(e)}")
        
@api_router.get("/debug/webhook-status")
async def debug_webhook_status():
    """Check webhook configuration"""
    return {
        "webhook_key_configured": bool(os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')),
        "subscription_service": subscription_service is not None,
        "endpoint_url": "https://englishgpt.everythingenglish.xyz/api/webhooks/dodo"
    }

@api_router.get("/debug/subscription-check/{user_id}")
async def debug_subscription_check(user_id: str):
    """Check user subscription status"""
    try:
        # Check user record
        user_resp = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        user_data = user_resp.data[0] if user_resp.data else None
        
        # Check subscription access
        has_access = await subscription_service._check_user_subscription_access(user_id) if subscription_service else False
        
        # Check subscription records
        sub_resp = supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).execute()
        
        return {
            "user_found": bool(user_data),
            "current_plan": user_data.get('current_plan') if user_data else None,
            "dodo_customer_id": user_data.get('dodo_customer_id') if user_data else None,
            "has_subscription_access": has_access,
            "subscription_records": sub_resp.data,
            "questions_marked": user_data.get('questions_marked') if user_data else 0
        }
    except Exception as e:
        return {"error": str(e)}
        
@api_router.get("/debug/env-check")
async def debug_env_check():
    """Check environment variables"""
    return {
        "api_key_configured": bool(os.environ.get('DODO_PAYMENTS_API_KEY')),
        "api_key_first_10": os.environ.get('DODO_PAYMENTS_API_KEY', '')[:10],
        "environment": os.environ.get('DODO_PAYMENTS_ENVIRONMENT'),
        "base_url": os.environ.get('DODO_PAYMENTS_BASE_URL')
    }
        

@api_router.post("/test-plan-update/{user_id}")
async def test_plan_update(user_id: str, plan_data: dict):
    """Test endpoint to update user plan"""
    try:

        
        updates = {
            'current_plan': plan_data.get('plan', 'free'),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Update in Supabase
        response = supabase.table('assessment_users').update(updates).eq('uid', user_id).execute()
        
        if not response.data:
            return {"error": "User not found"}
        
        updated_user = response.data[0]
        updated_user['id'] = updated_user['uid']  # For compatibility
        
        return {
            "success": True,
            "user": updated_user,
            "message": f"Plan updated to {updates['current_plan']}"
        }
        
    except Exception as e:
        logger.error(f"Plan update error: {str(e)}")
        return {"error": str(e)}

@api_router.put("/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: dict):
    """Update user preferences (dark mode, etc.)"""
    try:
        # Validate preferences
        allowed_preferences = ['dark_mode']
        filtered_preferences = {k: v for k, v in preferences.items() if k in allowed_preferences}
        
        if not filtered_preferences:
            raise HTTPException(status_code=400, detail="No valid preferences provided")
        
        # Update timestamp
        filtered_preferences['updated_at'] = datetime.utcnow().isoformat()
        
        # Update in Supabase
        response = supabase.table('assessment_users').update(filtered_preferences).eq('uid', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = response.data[0]
        updated_user['id'] = updated_user['uid']  # For compatibility
        return {"user": updated_user}
        
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
        
        # Get user data and validate limits
        user_response = supabase.table('assessment_users').select('*').eq('uid', submission.user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_response.data[0]
        current_plan = user_data.get('current_plan', 'free')
        credits = user_data.get('credits', 3)
        questions_marked = user_data.get('questions_marked', 0)
        
        logger.debug(f"DEBUG: User plan: {current_plan}, credits: {credits}")
        
        # Check subscription status for access control
        has_active_subscription = await subscription_service._check_user_subscription_access(submission.user_id)
        
        # Enforce access limits based on subscription status
        if not has_active_subscription:
            # Free users get 3 total evaluations
            if questions_marked >= 3:
                raise HTTPException(status_code=402, detail="Free plan limit reached. Upgrade to Unlimited to continue.")
        # Users with active subscription have unlimited access
        
        # Check if question type requires marking scheme
        requires_marking_scheme = submission.question_type in ['igcse_summary', 'alevel_comparative', 'alevel_text_analysis']
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
            'alevel_comparative': 'AO1_MARKS: [AO1 marks out of 5] | AO3_MARKS: [AO3 marks out of 10]',
            'alevel_directed_writing': 'AO1_MARKS: [AO1 marks out of 5] | AO2_MARKS: [AO2 marks out of 5]',
            'alevel_text_analysis': 'AO1_MARKS: [AO1 marks out of 5] | AO3_MARKS: [AO3 marks out of 20]'
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
FEEDBACK: [detailed feedback]
GRADE: [overall grade]
{sub_marks_requirement}
IMPROVEMENTS: [improvement 1] | [improvement 2] | [improvement 3]
STRENGTHS: [strength 1 - specific to this essay] | [strength 2 - specific to this essay] | [strength 3 - specific to this essay]

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
                # IGCSE narrative/descriptive need reading and writing marks
                if "READING_MARKS:" in ai_response:
                    reading_part = ai_response.split("READING_MARKS:")[1]
                    next_sections = ["WRITING_MARKS:", "IMPROVEMENTS:", "STRENGTHS:"]
                    reading_marks = reading_part.strip()
                    for section in next_sections:
                        if section in reading_part:
                            reading_marks = reading_part.split(section)[0].strip()
                            break
                
                if "WRITING_MARKS:" in ai_response:
                    writing_part = ai_response.split("WRITING_MARKS:")[1]
                    next_sections = ["IMPROVEMENTS:", "STRENGTHS:"]
                    writing_marks = writing_part.strip()
                    for section in next_sections:
                        if section in writing_part:
                            writing_marks = writing_part.split(section)[0].strip()
                            break
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
            improvement_suggestions=improvements,
            strengths=strengths
        )
        
        logger.debug("DEBUG: Created feedback response, updating user stats...")
        
        # Update user stats (credits no longer decremented)
        new_questions_marked = questions_marked + 1
        supabase.table('assessment_users').update({
            "questions_marked": new_questions_marked,
            "updated_at": datetime.utcnow().isoformat()
        }).eq('uid', submission.user_id).execute()
        
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
        # Preserve intended HTTP error codes (e.g., 400, 402, 404)
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
        # Get user and evaluations
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_response.data[0]
        
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
    import re
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
        # Get user to check if they have analytics access
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_response.data[0]
        
        # Check if user has analytics access (Pro or Genius)
        if user_data.get('current_plan') not in ['pro', 'genius']:
            raise HTTPException(status_code=403, detail="Analytics access requires Pro or Genius plan")
        
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
                    from collections import defaultdict
                    type_to_scores = defaultdict(list)
                    type_to_improvements = defaultdict(list)
                    for ev in evaluations:
                        qtype = ev.get('question_type')
                        grade_str = ev.get('grade', '')
                        # Extract achieved and total
                        import re
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

                    # Compose prompt
                    guide = (
                        "-Understand this syllabus, what does each paper evaluate and what you need to learn\n"
                        "-Make a study goal of x topics per day/week that need to be completed. Then learn from notes accordingly.\n"
                        "-Read novels (booker prize list) if you can\n"
                        "-Review example candidate responses, high and low, to understand what works and what doesn't. And incorporate the former in your essays.\n"
                        "-Practice with past papers\n"
                        "-Understand the feedback you're given, where exactly you lose marks, why do you lose marks etc. Also compare your essays with high ecr's and understand where you went wrong\n"
                        "-Keep practicing and improving\n"
                    )
                    user_prompt = (
                        "Based on the averageScore and improvementSuggestions of questionType for this student please Womend the future steps this student should take to improve, "
                        "use this knowledge of how to improve in english guide below, to guide you, answer in bullet points and write talking like a human talking to another human, so say words like \"you should\":\n\n"
                        f"Data: {json.dumps(summaries)}\n\nGuide:\n{guide}"
                    )

                    # Call OpenRouter for recommendations
                    async def call_recommendations(prompt: str) -> str:
                        async with httpx.AsyncClient() as client:
                            headers = {
                                "Authorization": f"Bearer {RECOMMENDATIONS_API_KEY}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": "https://englishgpt.org",
                                "X-Title": "EnglishGPT Recommendations"
                            }
                            payload = {
                                "model": RECOMMENDATIONS_MODEL,
                                "messages": [
                                    {"role": "system", "content": "You generate practical, encouraging study recommendations for English exam preparation. Keep it concise and actionable."},
                                    {"role": "user", "content": user_prompt}
                                ],
                                "max_tokens": 600,
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

@api_router.get("/transactions/{user_id}")
async def get_transaction_history(user_id: str):
    """Get transaction history for a specific user"""
    try:

        
        # First get user email
        user_response = supabase.table('assessment_users').select('email').eq('uid', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_email = user_response.data[0]['email']
        
        # Get transactions for this user's email
        transactions_response = supabase.table('assessment_transactions').select('*').eq('user_email', user_email).order('created_at', desc=True).execute()
        transactions = transactions_response.data
        

        return {"transactions": transactions}
    except Exception as e:
        logger.error(f"Transaction history endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Router will be included after all routes are defined

# Serve frontend build (SPA) with client-side routing fallback
FRONTEND_BUILD_DIR = (ROOT_DIR.parent / 'frontend' / 'build')
if FRONTEND_BUILD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    # No explicit close needed for supabase, it manages its own state
    pass

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

        record = feedback.dict()
        record["created_at"] = record["created_at"].isoformat()

        supabase.table("assessment_feedback").insert(record).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback save error: {str(e)}")

# Subscription API endpoints
# Initialize subscription service if available
if DODO_INTEGRATION_AVAILABLE and SubscriptionService:
    subscription_service = SubscriptionService(supabase)
    # Initialize webhook validator for server webhook endpoint
    webhook_validator = create_webhook_validator() if create_webhook_validator else WebhookValidator()
else:
    subscription_service = None

@api_router.get("/subscriptions/test")
async def test_subscription_endpoint():
    """Test endpoint for subscription service"""
    return {
        "message": "Subscription endpoint accessible",
        "service_available": subscription_service is not None,
        "dodo_integration": DODO_INTEGRATION_AVAILABLE,
        "cors_test": "✅ CORS working if you can see this"
    }

@api_router.post("/subscriptions/create-checkout")
async def create_subscription_checkout(request: Request):
    """Create a checkout session for subscription"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        # Parse JSON request body
        request_data = await request.json()

        
        user_id = request_data.get('userId')
        plan_type = request_data.get('planType')
        metadata = request_data.get('metadata', {})
        
        logger.info("create-checkout request", extra={
            "component": "subscriptions",
            "action": "create_checkout",
            "user_id": user_id,
            "plan_type": plan_type,
            "has_metadata": bool(metadata)
        })
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        if not plan_type or plan_type not in ['monthly', 'yearly']:
            raise HTTPException(status_code=400, detail="Valid plan type is required")
        
        result = await subscription_service.create_checkout_session(user_id, plan_type, metadata)
        logger.info("create-checkout response", extra={
            "component": "subscriptions",
            "action": "create_checkout.success",
            "user_id": user_id,
            "has_url": bool(result.get('checkout_url') or result.get('checkoutUrl'))
        })
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout creation failed: {str(e)}")

@api_router.get("/subscriptions/status")
async def get_subscription_status(user_id: str):
    """Get user's subscription status"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        logger.debug("status request", extra={"component": "subscriptions", "action": "status", "user_id": user_id})
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        status = await subscription_service.get_subscription_status(user_id)
        logger.debug("status response", extra={"component": "subscriptions", "action": "status.success", "user_id": user_id, "active": status.has_active_subscription})
        return status.dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subscription status: {str(e)}")

@api_router.post("/subscriptions/cancel")
async def cancel_subscription(request: dict):
    """Cancel user's subscription"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        user_id = request.get('userId')
        subscription_id = request.get('subscriptionId')
        cancel_at_period_end = request.get('cancelAtPeriodEnd', True)
        logger.info("cancel request", extra={"component": "subscriptions", "action": "cancel", "user_id": user_id, "subscription_id": subscription_id, "at_period_end": cancel_at_period_end})
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        result = await subscription_service.cancel_subscription(user_id, subscription_id, cancel_at_period_end)
        logger.info("cancel response", extra={"component": "subscriptions", "action": "cancel.success", "user_id": user_id, "subscription_id": subscription_id})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription cancellation failed: {str(e)}")

@api_router.post("/subscriptions/reactivate")
async def reactivate_subscription(request: dict):
    """Reactivate user's subscription"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        user_id = request.get('userId')
        subscription_id = request.get('subscriptionId')
        logger.info("reactivate request", extra={"component": "subscriptions", "action": "reactivate", "user_id": user_id, "subscription_id": subscription_id})
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        result = await subscription_service.reactivate_subscription(user_id, subscription_id)
        logger.info("reactivate response", extra={"component": "subscriptions", "action": "reactivate.success", "user_id": user_id, "subscription_id": subscription_id})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription reactivation failed: {str(e)}")

@api_router.post("/subscriptions/customer-portal")
async def create_customer_portal_session(request: dict):
    """Create customer portal session for payment method management"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        user_id = request.get('userId')
        logger.info("customer-portal request", extra={"component": "subscriptions", "action": "customer_portal", "user_id": user_id})
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        result = await subscription_service.create_customer_portal_session(user_id)
        logger.info("customer-portal response", extra={"component": "subscriptions", "action": "customer_portal.success", "user_id": user_id, "has_url": bool(result.get('portal_url'))})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Customer portal creation failed: {str(e)}")

@api_router.get("/subscriptions/billing-history")
async def get_billing_history(user_id: str, limit: int = 50):
    """Get user's billing history"""
    if not subscription_service:
        raise HTTPException(status_code=503, detail="Subscription service unavailable")
    try:
        logger.debug("billing-history request", extra={"component": "subscriptions", "action": "billing_history", "user_id": user_id, "limit": limit})
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        history = await subscription_service.get_billing_history(user_id, limit)
        result = {"data": [item.dict() for item in history]}
        logger.debug("billing-history response", extra={"component": "subscriptions", "action": "billing_history.success", "user_id": user_id, "count": len(result["data"])})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get billing history: {str(e)}")
@api_router.post("/webhooks/dodo")
async def handle_dodo_webhook(request: Request):
    """Enhanced webhook handler with proper validation"""
    try:
        body = await request.body()
        # Support multiple possible header names (standard and legacy)
        def _first_header(keys):
            for key in keys:
                value = request.headers.get(key)
                if value:
                    return key, value
            return None, ''

        sig_header_used, signature = _first_header(['webhook-signature', 'x-dodo-signature', 'dodo-signature', 'signature'])
        ts_header_used, timestamp = _first_header(['webhook-timestamp', 'x-dodo-timestamp', 'dodo-timestamp', 'timestamp'])

        logger.info("webhook received", extra={
            "component": "subscriptions",
            "action": "webhook.received",
            "sig_prefix": signature[:8] if signature else '',
            "body_len": len(body),
            "sig_header": sig_header_used,
            "ts_header": ts_header_used
        })
        
        # Validate webhook signature
        is_valid = webhook_validator.validate_webhook(body, signature, timestamp)
        
        if not is_valid:
            logger.error("webhook signature validation failed", extra={"component": "subscriptions", "action": "webhook.invalid_signature"})
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Parse webhook data
        webhook_data = json.loads(body.decode('utf-8'))
        event_id = webhook_data.get('id')
        event_type = webhook_data.get('type')
        logger.info("webhook parsed", extra={
            "component": "subscriptions",
            "action": "webhook.parsed",
            "event_id": event_id,
            "event_type": event_type
        })
        
        # Process webhook
        success = await subscription_service.handle_subscription_webhook(webhook_data)
        logger.info("webhook handled", extra={
            "component": "subscriptions",
            "action": "webhook.handled",
            "event_id": event_id,
            "event_type": event_type,
            "success": success
        })
        
        if success:
            logger.info("webhook processed", extra={"component": "subscriptions", "action": "webhook.success"})
            return {"status": "success"}
        else:
            logger.error("webhook processing failed", extra={"component": "subscriptions", "action": "webhook.failure"})
            raise HTTPException(status_code=500, detail="Webhook processing failed")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected webhook error: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")
        
# Include the API router after all routes are defined
app.include_router(api_router)