from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import User, ResearchNote, Strategy
from app.schemas.schemas import (
    ResearchNoteCreate, ResearchNoteResponse, StrategyCreate, StrategyResponse
)

router = APIRouter()

@router.get("/notes", response_model=List[ResearchNoteResponse])
def get_research_notes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Retrieve saved research notes."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
    return db.query(ResearchNote).filter(ResearchNote.user_id == user.id).all() if user else []

@router.post("/notes", response_model=ResearchNoteResponse)
def create_research_note(
    note_in: ResearchNoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Save an educational hypothesis or observation."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
        if not user:
            raise HTTPException(status_code=400, detail="User account required to save research.")

    note = ResearchNote(
        user_id=user.id,
        symbol=note_in.symbol,
        title=note_in.title,
        content=note_in.content,
        tags=note_in.tags
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/strategies", response_model=List[StrategyResponse])
def get_user_strategies(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Retrieve saved user strategies."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
    return db.query(Strategy).filter(Strategy.user_id == user.id).all() if user else []

@router.post("/strategies", response_model=StrategyResponse)
def create_user_strategy(
    strategy_in: StrategyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Save a quantitative strategy definition."""
    if not user:
        user = db.query(User).filter(User.email == "demo@tradewise.in").first()
        if not user:
            raise HTTPException(status_code=400, detail="User account required to save strategy.")

    strategy = Strategy(
        user_id=user.id,
        name=strategy_in.name,
        description=strategy_in.description,
        strategy_type=strategy_in.strategy_type,
        parameters=strategy_in.parameters
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy
