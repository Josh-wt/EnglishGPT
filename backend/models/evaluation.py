"""
Evaluation and feedback related Pydantic models.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class SubmissionRequest(BaseModel):
    question_type: str
    student_response: str
    user_id: str
    marking_scheme: Optional[str] = None
    command_word: Optional[str] = None
    text_type: Optional[str] = None
    insert_document: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question_type: str
    student_response: str
    feedback: str
    grade: str
    reading_marks: Optional[str] = None
    writing_marks: Optional[str] = None
    ao1_marks: Optional[str] = None
    ao2_marks: Optional[str] = None
    ao3_marks: Optional[str] = None
    content_structure_marks: Optional[str] = None
    style_accuracy_marks: Optional[str] = None
    improvement_suggestions: List[str]
    strengths: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    full_chat: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    short_id: Optional[str] = None

class FeedbackSubmitModel(BaseModel):
    user_id: str
    evaluation_id: str
    category: str
    accurate: bool
    comments: Optional[str] = None
