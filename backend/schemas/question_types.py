"""
Question types configuration.
"""
# Question Types Configuration
QUESTION_TYPES = [
    {
        "id": "igcse_summary",
        "name": "Summary",
        "category": "IGCSE",
        "requires_marking_scheme": True,
        "description": "Summarize the key points from a given text"
    },
    {
        "id": "igcse_narrative",
        "name": "Narrative",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Create an engaging narrative story"
    },
    {
        "id": "igcse_descriptive",
        "name": "Descriptive",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Write a vivid descriptive piece"
    },
    {
        "id": "igcse_writers_effect",
        "name": "Writer's Effect",
        "category": "IGCSE",
        "requires_marking_scheme": False,
        "description": "Analyze the writer's use of language and its effects"
    },
    {
        "id": "igcse_directed",
        "name": "Directed Writing",
        "category": "IGCSE",
        "requires_marking_scheme": True,
        "description": "Transform text into specific formats for different audiences"
    },
    {
        "id": "alevel_comparative",
        "name": "Comparative Analysis 1(b)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Compare and analyze different texts"
    },
    {
        "id": "alevel_directed",
        "name": "Directed Writing 1(a)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": False,
        "description": "Transform text into a specific format for audience"
    },
    {
        "id": "alevel_text_analysis",
        "name": "Text Analysis Q2",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Analyze form, structure, and language in texts"
    },
    {
        "id": "alevel_language_change",
        "name": "Language Change Analysis (P3, Section A)",
        "category": "A-Level English (9093)",
        "requires_marking_scheme": True,
        "description": "Analyze historical prose extract demonstrating English language change using quantitative data"
    },
    {
        "id": "gp_essay",
        "name": "Essay (Paper 1)",
        "category": "English General Paper (8021)",
        "requires_marking_scheme": True,
        "description": "Write a well-structured essay on a given topic with clear argumentation and evidence"
    },
    {
        "id": "gp_comprehension",
        "name": "Comprehension (Paper 2)",
        "category": "English General Paper (8021)",
        "requires_marking_scheme": True,
        "description": "Answer comprehension questions based on given texts with analysis and evaluation"
    }
]

# Question totals configuration for dynamic grade computation
QUESTION_TOTALS = {
    "igcse_writers_effect": {"total": 15, "components": {"reading": 15}},
    "igcse_narrative": {"total": 40, "components": {"content_structure": 16, "style_accuracy": 24}},
    "igcse_descriptive": {"total": 40, "components": {"content_structure": 16, "style_accuracy": 24}},
    # Summary is 15 (reading) + 25 (writing) = 40 total
    "igcse_summary": {"total": 40, "components": {"reading": 15, "writing": 25}},
    # Directed writing in IGCSE typically 15 + 25 = 40
    "igcse_directed": {"total": 40, "components": {"reading": 15, "writing": 25}},
    # A-Level
    "alevel_directed": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
    "alevel_directed_writing": {"total": 10, "components": {"ao1": 5, "ao2": 5}},
    "alevel_comparative": {"total": 15, "components": {"ao1": 5, "ao3": 10}},
    "alevel_text_analysis": {"total": 25, "components": {"ao1": 5, "ao3": 20}},
    "alevel_language_change": {"total": 25, "components": {"ao2": 5, "ao4": 5, "ao5": 15}},
    # English General Paper (8021)
    "gp_essay": {"total": 30, "components": {"AO1": 6, "AO2": 12, "AO3": 12}},
    "gp_comprehension": {"total": 40, "components": {"understanding_analysis": 25, "language_expression": 15}},
}
