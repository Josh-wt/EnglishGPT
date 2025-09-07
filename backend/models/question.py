"""
Question type related Pydantic models.
"""
from pydantic import BaseModel

class QuestionType(BaseModel):
    id: str
    name: str
    category: str
    requires_marking_scheme: bool
    description: str
