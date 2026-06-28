from fastapi import APIRouter, HTTPException, status
from models.schemas import AnalyzeRequest, AnalysisResponse
from services.openai_service import analyze_resume_with_openai

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_resume(request: AnalyzeRequest):
    """
    Endpoint to analyze a resume against a job description.
    Runs text validations and triggers OpenAI completion with schema enforcement.
    """
    # Sanitize and validate inputs
    resume_cleaned = request.resume_text.strip()
    job_cleaned = request.job_description.strip()

    if not resume_cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume content is empty. Please upload a valid resume and ensure text is extracted."
        )
        
    if not job_cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is empty. Please paste the job description to run comparison."
        )

    # Perform analysis
    analysis_result = analyze_resume_with_openai(resume_cleaned, job_cleaned)
    return analysis_result
