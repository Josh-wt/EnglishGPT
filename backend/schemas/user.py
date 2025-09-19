"""
User-related Pydantic models.
"""
from pydantic import BaseModel, Field
from typing import Optional
import uuid

class UserModel(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    academic_level: Optional[str] = None
    credits: int = 3
    current_plan: str = "free"
    dark_mode: bool = False

class BadgeModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_type: str
    badge_name: str
    badge_description: str
    badge_icon: str
    earned_at: str
    requirement: int
    progress: int
