from fastapi import APIRouter, UploadFile, File, HTTPException, status
from services.parser import parse_resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Endpoint to upload and extract text from a resume (PDF or DOCX).
    Maximum size is checked (10 MB limit).
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing."
        )

    # Read file content
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file. Error: {str(e)}"
        )

    # Check for empty file
    if not file_bytes:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Parse and extract text using the parser service
    extracted_text = parse_resume(file.filename, file_bytes)

    return {
        "filename": file.filename,
        "size_bytes": len(file_bytes),
        "char_count": len(extracted_text),
        "text": extracted_text
    }
