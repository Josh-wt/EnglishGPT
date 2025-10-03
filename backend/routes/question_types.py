"""
Question types routes.
"""
from fastapi import APIRouter
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Question types data - matches frontend constants
QUESTION_TYPES = [
    {
        "id": "igcse_summary",
        "name": "Summary",
        "category": "IGCSE",
        "description": "Summarize the key points from a given text",
        "requires_marking_scheme": True
    },
    {
        "id": "igcse_narrative",
        "name": "Narrative",
        "category": "IGCSE",
        "description": "Create an engaging narrative story",
        "requires_marking_scheme": False
    },
    {
        "id": "igcse_descriptive",
        "name": "Descriptive",
        "category": "IGCSE",
        "description": "Write a vivid descriptive piece",
        "requires_marking_scheme": False
    },
    {
        "id": "igcse_writers_effect",
        "name": "Writer's Effect",
        "category": "IGCSE",
        "description": "Analyze the writer's use of language and its effects",
        "requires_marking_scheme": True
    },
    {
        "id": "igcse_directed",
        "name": "Directed Writing",
        "category": "IGCSE",
        "description": "Transform text into specific formats for different audiences",
        "requires_marking_scheme": True
    },
    {
        "id": "igcse_extended_q3",
        "name": "Extended Writing Q3",
        "category": "IGCSE",
        "description": "Extended writing task with specific text type requirements",
        "requires_marking_scheme": True
    },
    {
        "id": "alevel_comparative",
        "name": "Comparative Analysis 1(b)",
        "category": "A-Level English (9093)",
        "description": "Compare and analyze different texts",
        "requires_marking_scheme": True
    },
    {
        "id": "alevel_directed",
        "name": "Directed Writing 1(a)",
        "category": "A-Level English (9093)",
        "description": "Transform text into a specific format for audience",
        "requires_marking_scheme": True
    },
        {
            "id": "alevel_text_analysis",
            "name": "Text Analysis Q2",
            "category": "A-Level English (9093)",
            "description": "Analyze form, structure, and language in texts",
            "requires_marking_scheme": True
        },
        {
            "id": "alevel_reflective_commentary",
            "name": "Reflective Commentary P2, Q1(b)",
            "category": "A-Level English (9093)",
            "description": "Reflective commentary on writing process and choices",
            "requires_marking_scheme": True
        },
    {
        "id": "alevel_language_change",
        "name": "Language Change Analysis (P3, Section A)",
        "category": "A-Level English (9093)",
        "description": "Analyze historical prose extract demonstrating English language change using quantitative data",
        "requires_marking_scheme": True
    },
    {
        "id": "gp_essay",
        "name": "Paper 1, Essay Question",
        "category": "English General Paper (8021)",
        "description": "Essay question requiring evaluation, assessment, or analysis with command words like 'evaluate', 'assess', etc.",
        "requires_marking_scheme": True
    }
]

@router.get("/question-types")
async def get_question_types():
    """Get all question types"""
    try:
        logger.info("Fetching all question types")
        return {
            "question_types": QUESTION_TYPES,
            "total": len(QUESTION_TYPES)
        }
    except Exception as e:
        logger.error(f"Error fetching question types: {str(e)}")
        return {
            "question_types": [],
            "total": 0,
            "error": str(e)
        }

@router.get("/question-types/level/{level}")
async def get_question_types_by_level(level: str):
    """Get question types by academic level"""
    try:
        logger.info(f"Fetching question types for level: {level}")
        
        # Filter question types by level
        filtered_types = []
        for question_type in QUESTION_TYPES:
            if level.lower() == "igcse" and question_type["category"] == "IGCSE":
                filtered_types.append(question_type)
            elif level.lower() == "alevel" and "A-Level" in question_type["category"]:
                filtered_types.append(question_type)
            elif level.lower() == "gp" and question_type["category"] == "English General Paper (8021)":
                filtered_types.append(question_type)
        
        return {
            "question_types": filtered_types,
            "level": level,
            "total": len(filtered_types)
        }
    except Exception as e:
        logger.error(f"Error fetching question types for level {level}: {str(e)}")
        return {
            "question_types": [],
            "level": level,
            "total": 0,
            "error": str(e)
        }

@router.get("/question-types/{question_type_id}")
async def get_question_type(question_type_id: str):
    """Get a specific question type by ID"""
    try:
        logger.info(f"Fetching question type: {question_type_id}")
        
        # Find the question type
        question_type = None
        for qt in QUESTION_TYPES:
            if qt["id"] == question_type_id:
                question_type = qt
                break
        
        if not question_type:
            return {
                "error": "Question type not found",
                "question_type_id": question_type_id
            }
        
        return {
            "question_type": question_type
        }
    except Exception as e:
        logger.error(f"Error fetching question type {question_type_id}: {str(e)}")
        return {
            "error": str(e),
            "question_type_id": question_type_id
        }

@router.get("/question-types/{question_type_id}/examples")
async def get_question_type_examples(question_type_id: str):
    """Get examples for a specific question type"""
    try:
        logger.info(f"Fetching examples for question type: {question_type_id}")
        
        # For now, return empty examples - this can be expanded later
        return {
            "question_type_id": question_type_id,
            "examples": [],
            "message": "Examples not yet implemented"
        }
    except Exception as e:
        logger.error(f"Error fetching examples for question type {question_type_id}: {str(e)}")
        return {
            "error": str(e),
            "question_type_id": question_type_id
        }
