from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.models import User, PaperAccount
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new student/trader account."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "student",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize paper trading account with virtual ₹10,00,000
    paper_acc = PaperAccount(
        user_id=user.id,
        account_number=f"TW-PAPER-{user.id + 10000}",
        balance=1000000.0,
        initial_balance=1000000.0,
        realized_pnl=0.0
    )
    db.add(paper_acc)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/guest-login", response_model=Token)
def guest_login(db: Session = Depends(get_db)):
    """One-click guest/demo login for educational evaluation."""
    demo_user = db.query(User).filter(User.email == "demo@tradewise.in").first()
    if not demo_user:
        demo_user = User(
            email="demo@tradewise.in",
            hashed_password=hash_password("tradewise2026"),
            full_name="TradeWise Demo Student",
            role="student",
            is_active=True,
            is_verified=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # Ensure paper account exists
    paper_acc = db.query(PaperAccount).filter(PaperAccount.user_id == demo_user.id).first()
    if not paper_acc:
        paper_acc = PaperAccount(
            user_id=demo_user.id,
            account_number="TW-PAPER-10001",
            balance=1000000.0,
            initial_balance=1000000.0,
            realized_pnl=0.0
        )
        db.add(paper_acc)
        db.commit()

    token = create_access_token({"sub": demo_user.id, "email": demo_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": demo_user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get currently authenticated user profile."""
    return current_user
