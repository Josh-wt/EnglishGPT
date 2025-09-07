"""
Application configuration and environment variables.
"""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from user_management_service import UserManagementService
from auth_recovery_middleware import create_auth_recovery_middleware

# Get root directory
ROOT_DIR = Path(__file__).resolve().parent.parent

# Force-load backend/.env regardless of working directory; allow overriding empty envs
load_dotenv(dotenv_path=ROOT_DIR / '.env', override=True)

# Supabase Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')
SUPABASE_KEY = (
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_KEY')
)

# AI Configuration (env only; no hardcoded defaults)
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
QWEN_API_KEY = os.environ.get('QWEN_API_KEY')
DEEPSEEK_ENDPOINT = os.environ.get('DEEPSEEK_ENDPOINT', 'https://openrouter.ai/api/v1/chat/completions')
QWEN_ENDPOINT = os.environ.get('QWEN_ENDPOINT', 'https://openrouter.ai/api/v1/chat/completions')

# Recommendations AI (separate API key and model)
RECOMMENDATIONS_API_KEY = os.environ.get('OPENROUTER_GPT_OSS_120B_KEY')
RECOMMENDATIONS_MODEL = os.environ.get('RECOMMENDATIONS_MODEL', 'openai/gpt-oss-120b')

# CORS Origins
CORS_ORIGINS = [
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
]

# Initialize Supabase client
def get_supabase_client() -> Client:
    """Initialize and return Supabase client."""
    if not SUPABASE_KEY:
        logging.warning(
            "SUPABASE_SERVICE_ROLE_KEY is not set. Ensure backend/.env exists and python-dotenv loads it."
        )
        return None
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logging.error(f"Error initializing Supabase: {e}")
        return None

# Initialize user management service
def get_user_management_service(supabase_client: Client) -> UserManagementService:
    """Initialize and return user management service."""
    if not supabase_client:
        logging.warning("Cannot initialize user management service - Supabase client not available")
        return None
    
    try:
        user_management_service = UserManagementService(supabase_client)
        logging.info("User management service initialized successfully")
        return user_management_service
    except Exception as e:
        logging.error(f"Error initializing user management service: {e}")
        return None

# Initialize auth recovery middleware
def get_auth_recovery_middleware(user_management_service: UserManagementService):
    """Initialize and return auth recovery middleware."""
    if not user_management_service:
        logging.warning("Auth recovery middleware not added - user management service not available")
        return None
    
    try:
        auth_recovery_middleware = create_auth_recovery_middleware(user_management_service)
        logging.info("Auth recovery middleware added successfully")
        return auth_recovery_middleware
    except Exception as e:
        logging.error(f"Error adding auth recovery middleware: {e}")
        return None
