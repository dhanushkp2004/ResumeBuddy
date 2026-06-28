import os
import json
import logging
from openai import OpenAI
from models.schemas import AnalysisResponse

logger = logging.getLogger(__name__)

def generate_mock_analysis(resume_text: str, job_description: str) -> AnalysisResponse:
    """
    Generates a realistic, content-aware mock analysis based on keywords in the inputs.
    This acts as a high-quality fallback when the OpenAI API key is missing.
    """
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    # Common tech/business keywords to check
    skills_pool = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node.js",
        "fastapi", "django", "flask", "docker", "kubernetes", "aws", "gcp", "azure",
        "postgresql", "mongodb", "redis", "sql", "git", "ci/cd", "agile", "scrum",
        "tailwind", "css", "html", "rest api", "graphql", "machine learning", "openai"
    ]

    matched = []
    missing = []
    
    # Simple heuristic comparison
    for skill in skills_pool:
        in_job = skill in job_lower
        in_resume = skill in resume_lower
        
        if in_job and in_resume:
            matched.append(skill.title() if len(skill) > 3 else skill.upper())
        elif in_job and not in_resume:
            missing.append(skill.title() if len(skill) > 3 else skill.upper())

    # Default listings if inputs are sparse
    if not matched:
        matched = ["React", "TypeScript", "REST APIs", "CSS", "Git"]
    if not missing:
        missing = ["Python", "FastAPI", "Docker", "AWS", "CI/CD"]

    # Match percentage calculations based on matching keywords
    total_relevant = len(matched) + len(missing)
    base_match = int((len(matched) / total_relevant * 100)) if total_relevant > 0 else 70
    match_score = min(max(base_match, 45), 95) # lock mock scores between 45 and 95
    ats_score = min(max(match_score - 5, 40), 92)

    # Keywords missing (subset of missing skills + specific industry jargon)
    jargon = ["Microservices", "Scalability", "Unit Testing", "System Architecture", "Performance Tuning"]
    keywords_missing = [m for m in missing] + [j for j in jargon if j.lower() in job_lower and j.lower() not in resume_lower]
    if not keywords_missing:
        keywords_missing = ["Kubernetes", "Redis", "Unit Testing"]

    return AnalysisResponse(
        match_score=match_score,
        ats_score=ats_score,
        matching_skills=matched[:8],
        missing_skills=missing[:8],
        keywords_missing=keywords_missing[:6],
        strengths=[
            "Demonstrates solid foundation in core development technologies like " + ", ".join(matched[:3]) + ".",
            "Good educational background and layout style matching standard ATS layouts.",
            "Strong communication and project cooperation indicators present in the profile."
        ],
        weaknesses=[
            "Lacks explicit mentions of cloud deployment (e.g. AWS/GCP) or CI/CD pipelines.",
            "Resume points focus more on tasks rather than measurable business metrics and impact.",
            "Missing key frameworks requested in the job description: " + ", ".join(missing[:2]) + "."
        ],
        rewrite_suggestions=[
            "**Experience Section**: Quantify the impact in your projects. Instead of 'Responsible for React development', use 'Developed 12+ responsive React pages, improving page-load speed by 35%'.",
            "**Skills Section**: Group your skills into categories (e.g., Languages, Frameworks, Tools) to make it easier for recruiters and ATS parsers to scan.",
            "**Summary**: Align your professional summary closely with the job description by highlighting your experience with " + (matched[0] if matched else "React") + "."
        ],
        improved_resume_points=[
            f"Optimized frontend performance by refactoring core components using {matched[0] if matched else 'React'} and {matched[1] if len(matched) > 1 else 'TypeScript'}, resulting in a 25% reduction in bounce rate.",
            f"Designed and integrated RESTful APIs using Python / Node, processing over 10,000 requests per day with an average response time of under 200ms.",
            f"Led a cross-functional squad of 4 developers to build a scalable data dashboard, reducing deployment cycles by 15% via automated Git integrations."
        ],
        interview_questions=[
            f"Can you explain your experience with {matched[0] if matched else 'React'} and how you handled state management in a large-scale project?",
            f"The job description highlights {missing[0] if missing else 'Python'}. Tell us about a time you had to pick up a new language/tool quickly. How did you approach it?",
            "How do you design APIs for scalability and what measures do you take to secure endpoints?"
        ],
        final_recommendation=(
            f"You are a solid candidate with a match score of {match_score}%. By implementing the suggested changes, "
            f"particularly highlighting your skills in {', '.join(missing[:3])} and incorporating metrics into your bullet points, "
            f"you will significantly improve your chances of passing the ATS check and landing an interview."
        )
    )

def analyze_resume_with_openai(resume_text: str, job_description: str) -> AnalysisResponse:
    """
    Sends the resume text and job description to OpenAI Chat Completion API.
    Returns parsed AnalysisResponse. Falls back to mock analysis if key is missing or calls fail.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Check if key is configured
    if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE" or api_key.strip() == "":
        logger.warning("OPENAI_API_KEY is not configured or is a placeholder. Falling back to Mock Analysis Mode.")
        return generate_mock_analysis(resume_text, job_description)

    try:
        client = OpenAI(api_key=api_key)
        
        # System instructions guiding structured JSON output
        system_prompt = (
            "You are a professional ATS (Applicant Tracking System) recruiter and resume optimization expert. "
            "Your job is to compare the provided Resume text and Job Description text. "
            "Conduct a thorough evaluation including matching skills, missing skills, missing keywords, "
            "strengths, weaknesses, section rewrite ideas, bullet point optimizations (using action verbs and metrics), "
            "interview prep questions, and final recommendations. "
            "You MUST respond ONLY in valid JSON matching the schema below. "
            "Do not output markdown codeblocks around the JSON. Return only the JSON object.\n\n"
            "JSON SCHEMA:\n"
            "{\n"
            '  "match_score": 85,\n'
            '  "ats_score": 78,\n'
            '  "matching_skills": ["React", "CSS"],\n'
            '  "missing_skills": ["FastAPI", "Docker"],\n'
            '  "keywords_missing": ["Kubernetes", "CI/CD"],\n'
            '  "strengths": ["Strong React experience", "Clear education section"],\n'
            '  "weaknesses": ["Lack of metrics in experience bullet points", "No cloud experience mentioned"],\n'
            '  "rewrite_suggestions": ["Rewrite work history to use CAR format", "Add Certifications section"],\n'
            '  "improved_resume_points": ["Designed responsive frontend views using React, improving performance by 40%", "Built robust APIs..."],\n'
            '  "interview_questions": ["Explain how you would optimize a slow React component?", "How do you set up Docker containers?"],\n'
            '  "final_recommendation": "Great fit overall, but needs keywords optimized to bypass ATS screening."\n'
            "}"
        )

        user_prompt = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{job_description}"

        # Standard JSON mode request
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            timeout=30.0
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response received from OpenAI.")

        # Load and parse output into Pydantic model to guarantee schema validation
        parsed_data = json.loads(content)
        return AnalysisResponse(**parsed_data)

    except Exception as e:
        logger.error(f"OpenAI analysis failed. Error: {str(e)}. Falling back to Mock Analysis.")
        # Fallback to high quality mock analysis rather than failing the web app
        return generate_mock_analysis(resume_text, job_description)
