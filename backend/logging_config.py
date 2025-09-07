"""
Logging configuration for the FastAPI backend.

This module configures logging levels to reduce noise from HTTP libraries
while maintaining useful application logs.
"""

import logging
import os
from typing import Dict

def configure_logging(app_level: str = None) -> None:
    """
    Configure logging for the application.
    
    Args:
        app_level: Logging level for the application (INFO, DEBUG, WARNING, ERROR)
                  If not provided, uses LOG_LEVEL env var or defaults to INFO
    """
    # Get log level from environment or use default
    if app_level is None:
        app_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, app_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Define logging levels for different components
    log_levels: Dict[str, str] = {
        # Suppress verbose HTTP/2 and protocol logs
        'httpcore': 'WARNING',
        'httpcore.http2': 'WARNING',
        'httpx': 'WARNING',
        'hpack': 'WARNING',
        'hpack.hpack': 'WARNING',
        'urllib3': 'WARNING',
        'urllib3.connectionpool': 'WARNING',
        'requests': 'WARNING',
        'requests.packages.urllib3': 'WARNING',
        
        # Suppress other verbose libraries
        'PIL': 'WARNING',
        'PIL.Image': 'WARNING',
        'PyPDF2': 'WARNING',
        'asyncio': 'WARNING',
        
        # Database and API clients
        'supabase': 'INFO',
        'postgrest': 'WARNING',
        'gotrue': 'WARNING',
        'realtime': 'WARNING',
        'storage3': 'WARNING',
        
        # FastAPI and Starlette
        'uvicorn': 'INFO',
        'uvicorn.access': 'INFO',
        'uvicorn.error': 'ERROR',
        'fastapi': 'INFO',
        'starlette': 'INFO',
        
        # Application modules (can be adjusted as needed)
        '__main__': app_level,
        'server': app_level,
    }
    
    # Apply logging levels
    for logger_name, level in log_levels.items():
        logging.getLogger(logger_name).setLevel(getattr(logging, level))
    
    # Log the configuration
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured with application level: {app_level}")
    
    # Show which loggers are set to DEBUG (for troubleshooting)
    if app_level == 'DEBUG':
        debug_loggers = [name for name, level in log_levels.items() if level == 'DEBUG']
        if debug_loggers:
            logger.debug(f"Debug logging enabled for: {', '.join(debug_loggers)}")

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Name of the logger (typically __name__)
    
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)

# Environment-based configuration helpers
def is_debug_mode() -> bool:
    """Check if debug mode is enabled via environment variable."""
    return os.getenv('DEBUG', 'false').lower() in ('true', '1', 'yes')

def is_production() -> bool:
    """Check if running in production environment."""
    return os.getenv('APP_ENV', 'development').lower() == 'production'