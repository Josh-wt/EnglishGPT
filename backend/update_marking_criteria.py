#!/usr/bin/env python3

import re

def update_marking_criteria():
    """Update all strict marking indicators to be more generous"""
    
    # Read the server.py file
    with open('server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Define the generous replacement text
    generous_text = """That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good."""
    
    # Replace all strict indicators
    replacements = [
        # Replace "STRICT MARKING REALITY CHECK:" sections
        (r'STRICT MARKING REALITY CHECK:.*?BE HARSH:.*?\.', generous_text),
        (r'STRICT MARKING REALITY CHECK:.*?\.', generous_text),
        
        # Replace specific strict phrases
        (r'Most student responses score \d+-\d+/\d+\. Scores above \d+/\d+ are RARE and exceptional\.', generous_text),
        (r'Most student summaries score \d+-\d+/\d+ total\. Scores above \d+/\d+ are RARE and exceptional\.', generous_text),
        (r'Average student work:.*?= Total \d+-\d+/\d+\.', generous_text),
        (r'BE HARSH:.*?\.', generous_text),
        
        # Replace specific strict instructions
        (r'- Most essays should score between 20-30/40\. Scores above 32/40 are EXCEPTIONAL and rare\.', generous_text),
        (r'- Only award top bands \(16-13 Content, 24-20 Style\) for truly outstanding work that feels professional\.', generous_text),
        (r'- Be highly critical of endings - rushed or weak endings should lose 3-5 marks immediately\.', generous_text),
        (r'- If you hesitate about whether work is "excellent" - it\'s not\. Award middle bands\.', generous_text),
        
        # Replace other strict indicators
        (r'Level 5 \(13-15\) is for analysis that feels like expert literary criticism\.', generous_text),
        (r'Basic identification of techniques without deep effect analysis = Level 3 maximum \(7-9\)\.', generous_text),
        (r'Average student work: Level 3-4 = 7-12/15\.', generous_text),
        
        # Replace AO1/AO2 strict requirements
        (r'AO1 marks above \d+/\d+ require sophisticated understanding and selection\.', generous_text),
        (r'AO2 marks above \d+/\d+ require perfect format adherence and accuracy\.', generous_text),
        (r'AO3 marks above \d+/\d+ require expert-level analysis and integration\.', generous_text),
        (r'Reading marks above \d+/\d+ require exceptional selection and understanding\.', generous_text),
        (r'Writing marks above \d+/\d+ require sophisticated rephrasing and organization\.', generous_text),
    ]
    
    # Apply all replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)
    
    # Write the updated content back
    with open('server.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Successfully updated marking criteria to be more generous!")

if __name__ == "__main__":
    update_marking_criteria() 