from pydantic import BaseModel, Field
from typing import List

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="The full extracted text of the resume")
    job_description: str = Field(..., description="The pasted job description to analyze against")

class AnalysisResponse(BaseModel):
    match_score: int = Field(..., description="Overall match score between 0 and 100")
    ats_score: int = Field(..., description="ATS compatibility score between 0 and 100")
    matching_skills: List[str] = Field(..., description="Key technical and soft skills present in the resume that match the job description")
    missing_skills: List[str] = Field(..., description="Crucial technical and soft skills listed in the job description but missing from the resume")
    keywords_missing: List[str] = Field(..., description="ATS-specific keywords and industry terms from the job description not found in the resume")
    strengths: List[str] = Field(..., description="Key professional strengths and alignment points found in the resume")
    weaknesses: List[str] = Field(..., description="Areas of weakness, experience gaps, or formatting issues in the resume")
    rewrite_suggestions: List[str] = Field(..., description="Section-by-section optimization suggestions (e.g. Profile, Experience, Skills)")
    improved_resume_points: List[str] = Field(..., description="AI-rewritten resume bullet points using action verbs, metrics, and target keywords")
    interview_questions: List[str] = Field(..., description="Highly relevant interview preparation questions derived from the job description requirements")
    final_recommendation: str = Field(..., description="Final overall recommendation, summaries, and career coaching guidance")
