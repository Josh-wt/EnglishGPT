"""
Logging configuration for the application.
"""
import logging

def configure_logging():
    """Configure application logging."""
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

    return logger
