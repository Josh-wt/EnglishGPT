#!/usr/bin/env python3

from server import MARKING_CRITERIA, QUESTION_TYPES

def test_marking_criteria_selection():
    """Test that the correct marking criteria is selected for each question type"""
    
    print("Testing marking criteria selection...")
    print("=" * 50)
    
    # Test descriptive question type
    descriptive_criteria = MARKING_CRITERIA.get("igcse_descriptive", "")
    print(f"igcse_descriptive criteria length: {len(descriptive_criteria)}")
    print(f"Contains 'descriptive': {'descriptive' in descriptive_criteria.lower()}")
    print(f"Contains 'narrative': {'narrative' in descriptive_criteria.lower()}")
    print(f"First 200 chars: {descriptive_criteria[:200]}")
    print()
    
    # Test narrative question type
    narrative_criteria = MARKING_CRITERIA.get("igcse_narrative", "")
    print(f"igcse_narrative criteria length: {len(narrative_criteria)}")
    print(f"Contains 'descriptive': {'descriptive' in narrative_criteria.lower()}")
    print(f"Contains 'narrative': {'narrative' in narrative_criteria.lower()}")
    print(f"First 200 chars: {narrative_criteria[:200]}")
    print()
    
    # Test all question types
    print("Testing all question types:")
    for question in QUESTION_TYPES:
        question_id = question['id']
        criteria = MARKING_CRITERIA.get(question_id, "")
        print(f"{question_id}: {'✓' if criteria else '✗'} (length: {len(criteria)})")
    
    print()
    print("Available marking criteria keys:")
    for key in sorted(MARKING_CRITERIA.keys()):
        print(f"  - {key}")
    
    print()
    print("Question type IDs:")
    for question in QUESTION_TYPES:
        print(f"  - {question['id']}")

if __name__ == "__main__":
    test_marking_criteria_selection() 