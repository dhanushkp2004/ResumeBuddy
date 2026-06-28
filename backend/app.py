import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes import health, upload, analyze

app = FastAPI(
    title="ResumeBuddy API",
    description="Backend API for parsing resumes and scoring matching indexes using OpenAI.",
    version="1.0.0"
)

# Set up CORS middleware to support Vite frontend running on local ports
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local preview ease, or narrow to origins for stricter environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all error handler returning user-friendly messages rather than stacktraces.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"}
    )

# Register routes
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(analyze.router)

if __name__ == "__main__":
    import uvicorn
    # Allow running directly via python app.py if needed
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
