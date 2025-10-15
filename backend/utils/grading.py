"""
Grading utilities for computing overall grades and parsing marks.
"""
import re
from typing import Optional
from schemas.question_types import QUESTION_TOTALS

def parse_marks_value(marks_text: Optional[str]) -> int:
    """Parse a marks string like '13/15', '13 out of 15', or '13' into an int score.
    Returns 0 if parsing fails or input is empty.
    """
    if not marks_text:
        return 0
    try:
        # Find all integers and take the first as achieved marks
        numbers = re.findall(r"\d+", str(marks_text))
        return int(numbers[0]) if numbers else 0
    except Exception:
        return 0

def compute_overall_grade(question_type: str, reading_marks: Optional[str], writing_marks: Optional[str], ao1_marks: Optional[str], ao2_marks: Optional[str], content_structure_marks: Optional[str] = None, style_accuracy_marks: Optional[str] = None, ao3_marks: Optional[str] = None, ao4_marks: Optional[str] = None, ao5_marks: Optional[str] = None) -> str:
    """Compute a dynamic overall grade string 'score/total' for the given question type.
    Uses QUESTION_TOTALS and the extracted component marks.
    """
    cfg = QUESTION_TOTALS.get(question_type)
    if not cfg:
        # Fallback: cannot compute; return empty to allow upstream to keep AI-provided grade
        return ""

    achieved = 0
    # Map component values based on type
    components = cfg["components"]
    
    # Special handling for descriptive/narrative questions which use content_structure and style_accuracy
    if question_type in ["igcse_narrative", "igcse_descriptive"]:
        if "content_structure" in components:
            achieved += parse_marks_value(content_structure_marks)
        if "style_accuracy" in components:
            achieved += parse_marks_value(style_accuracy_marks)
    # Special handling for alevel_language_change which uses AO2/AO4/AO5
    elif question_type == "alevel_language_change":
        if "ao2" in components:
            achieved += parse_marks_value(ao2_marks)
        if "ao4" in components:
            achieved += parse_marks_value(ao4_marks)
        if "ao5" in components:
            achieved += parse_marks_value(ao5_marks)
    # Special handling for GP essay which uses AO1, AO2, AO3 (uppercase)
    elif question_type == "gp_essay":
        if "AO1" in components:
            achieved += parse_marks_value(ao1_marks)
        if "AO2" in components:
            achieved += parse_marks_value(ao2_marks)
        if "AO3" in components:
            achieved += parse_marks_value(ao3_marks)
    else:
        # Standard handling for other question types
        if "reading" in components:
            achieved += parse_marks_value(reading_marks)
        if "writing" in components:
            achieved += parse_marks_value(writing_marks)
        if "ao1" in components:
            achieved += parse_marks_value(ao1_marks)
        if "ao2" in components:
            achieved += parse_marks_value(ao2_marks)
        if "ao3" in components:
            achieved += parse_marks_value(ao3_marks)

    total = cfg["total"]
    return f"{achieved}/{total}"
