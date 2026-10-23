from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import Course, Lesson, Quiz, LearningProgress, User
from app.schemas.schemas import (
    CourseResponse, LessonDetailResponse, QuizAttemptSubmit, QuizAttemptResult
)

router = APIRouter()

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    """Retrieve all structured courses from the Indian Financial Academy."""
    courses = db.query(Course).order_by(Course.order).all()
    return courses

@router.get("/courses/{slug}", response_model=CourseResponse)
def get_course_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve detailed course curriculum."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    return course

@router.get("/lessons/{slug}", response_model=LessonDetailResponse)
def get_lesson_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve complete lesson text, learning objectives, and interactive quizzes."""
    lesson = db.query(Lesson).filter(Lesson.slug == slug).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return lesson

@router.post("/quizzes/submit", response_model=QuizAttemptResult)
def submit_quiz_answer(
    attempt: QuizAttemptSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Verify quiz submission and return feedback with educational rationale."""
    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz question not found.")
        
    is_correct = (attempt.selected_option_index == quiz.correct_option_index)
    
    # Track progress if user authenticated
    if user and is_correct:
        progress = db.query(LearningProgress).filter(
            LearningProgress.user_id == user.id,
            LearningProgress.lesson_id == quiz.lesson_id
        ).first()
        if not progress:
            progress = LearningProgress(
                user_id=user.id,
                lesson_id=quiz.lesson_id,
                completed=True,
                score=100.0
            )
            db.add(progress)
            db.commit()

    return {
        "quiz_id": quiz.id,
        "is_correct": is_correct,
        "correct_option_index": quiz.correct_option_index,
        "explanation": quiz.explanation
    }
