import os
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Simple health check endpoint that also reports if OpenAI API key is configured.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    is_openai_configured = bool(api_key and api_key != "YOUR_OPENAI_API_KEY_HERE" and api_key.strip() != "")
    
    return {
        "status": "healthy",
        "openai_configured": is_openai_configured,
        "mode": "production" if is_openai_configured else "mock-fallback"
    }
