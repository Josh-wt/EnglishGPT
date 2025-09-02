#!/usr/bin/env python3
"""
Test Grade Computation
This script tests the grade computation to see why it's returning 0/40
"""

import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Import the functions from server.py
import re

def parse_marks_value(marks_text):
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

def compute_overall_grade(question_type, reading_marks, writing_marks, ao1_marks, ao2_or_ao3_marks):
    """Compute a dynamic overall grade string 'score/total' for the given question type."""
    
    # QUESTION_TOTALS configuration
    QUESTION_TOTALS = {
        "igcse_summary": {"total": 40, "components": {"reading": 15, "writing": 25}},
        "igcse_writers_effect": {"total": 15, "components": {"reading": 15}},
        "igcse_directed": {"total": 40, "components": {"reading": 15, "writing": 25}},
        "alevel_directed": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
        "igcse_narrative": {"total": 40, "components": {"reading": 16, "writing": 24}},
        "igcse_descriptive": {"total": 40, "components": {"reading": 16, "writing": 24}},
        "alevel_comparative": {"total": 15, "components": {"ao1": 5, "ao3": 10}},
        "alevel_directed_writing": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
        "alevel_text_analysis": {"total": 25, "components": {"ao1": 5, "ao3": 20}},
        "alevel_language_change": {"total": 25, "components": {"ao2": 5, "ao4": 5, "ao5": 15}},
    }
    
    cfg = QUESTION_TOTALS.get(question_type)
    if not cfg:
        return ""

    achieved = 0
    components = cfg["components"]
    
    # Special handling for alevel_language_change which uses AO2/AO4/AO5
    if question_type == "alevel_language_change":
        if "ao2" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)
        if "ao4" in components:
            achieved += parse_marks_value(ao1_marks)
        if "ao5" in components:
            achieved += parse_marks_value(reading_marks)
    else:
        # Standard handling for other question types
        if "reading" in components:
            achieved += parse_marks_value(reading_marks)
        if "writing" in components:
            achieved += parse_marks_value(writing_marks)
        if "ao1" in components:
            achieved += parse_marks_value(ao1_marks)
        if "ao2" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)
        if "ao3" in components:
            achieved += parse_marks_value(ao2_or_ao3_marks)

    total = cfg["total"]
    return f"{achieved}/{total}"

def test_grade_computation():
    """Test the grade computation with the actual data"""
    
    print("🚀 Testing Grade Computation")
    print("=" * 50)
    
    # Test with the actual data from the database
    question_type = "igcse_descriptive"
    reading_marks = "14/16 |"
    writing_marks = "20/24"
    ao1_marks = "N/A"
    ao2_marks = "N/A"
    
    print(f"Question type: {question_type}")
    print(f"Reading marks: '{reading_marks}'")
    print(f"Writing marks: '{writing_marks}'")
    print(f"AO1 marks: '{ao1_marks}'")
    print(f"AO2 marks: '{ao2_marks}'")
    
    # Test parse_marks_value function
    print(f"\n--- Testing parse_marks_value ---")
    reading_parsed = parse_marks_value(reading_marks)
    writing_parsed = parse_marks_value(writing_marks)
    ao1_parsed = parse_marks_value(ao1_marks)
    ao2_parsed = parse_marks_value(ao2_marks)
    
    print(f"Reading marks parsed: {reading_parsed}")
    print(f"Writing marks parsed: {writing_parsed}")
    print(f"AO1 marks parsed: {ao1_parsed}")
    print(f"AO2 marks parsed: {ao2_parsed}")
    
    # Test compute_overall_grade function
    print(f"\n--- Testing compute_overall_grade ---")
    grade = compute_overall_grade(question_type, reading_marks, writing_marks, ao1_marks, ao2_marks)
    print(f"Computed grade: {grade}")
    
    # Expected: 14 + 20 = 34/40
    expected = "34/40"
    print(f"Expected grade: {expected}")
    print(f"Match: {grade == expected}")
    
    # Test with different mark formats
    print(f"\n--- Testing different mark formats ---")
    test_cases = [
        ("14/16", 14),
        ("14/16 |", 14),
        ("14 out of 16", 14),
        ("14", 14),
        ("N/A", 0),
        ("", 0),
        (None, 0),
    ]
    
    for test_input, expected_output in test_cases:
        result = parse_marks_value(test_input)
        print(f"'{test_input}' -> {result} (expected: {expected_output})")
    
    print("\n✅ Grade computation test completed!")

if __name__ == "__main__":
    test_grade_computation()
