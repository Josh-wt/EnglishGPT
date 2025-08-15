#!/usr/bin/env python3

def fix_final_duplicate():
    """Fix the final duplicate line in the CRITICAL MARKING INSTRUCTIONS section"""
    
    # Read the server.py file
    with open('server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the problematic section
    old_section = """CRITICAL MARKING INSTRUCTIONS 
That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
- That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good."""
    
    new_section = """CRITICAL MARKING INSTRUCTIONS 
That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good."""
    
    content = content.replace(old_section, new_section)
    
    # Write the fixed content back
    with open('server.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Successfully fixed the final duplicate!")

if __name__ == "__main__":
    fix_final_duplicate() 