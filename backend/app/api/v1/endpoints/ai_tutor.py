from fastapi import APIRouter, HTTPException
from app.schemas.schemas import AITutorQueryRequest, AITutorResponse
from app.services.ai_tutor.rag_service import ai_tutor_service

router = APIRouter()

@router.post("/query", response_model=AITutorResponse)
def query_ai_tutor(request: AITutorQueryRequest):
    """
    Query the grounded AI Finance Tutor.
    Retrieves vetted Indian financial literature with source citations and disclaimer.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    result = ai_tutor_service.answer_query(request.query)
    return result
