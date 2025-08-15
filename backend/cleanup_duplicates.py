#!/usr/bin/env python3

def cleanup_duplicates():
    """Clean up duplicated generous text lines"""
    
    # Read the server.py file
    with open('server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace multiple consecutive instances of the generous text with a single instance
    generous_text = "That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good."
    
    # Replace multiple consecutive lines with the same text
    import re
    content = re.sub(
        rf'({re.escape(generous_text)}\s*\n)+',
        generous_text + '\n',
        content
    )
    
    # Also clean up the CRITICAL MARKING INSTRUCTIONS section
    content = re.sub(
        r'CRITICAL MARKING INSTRUCTIONS\s*\n' + re.escape(generous_text) + r'\s*\n' + re.escape(generous_text) + r'\s*\n' + re.escape(generous_text) + r'\s*\n- ' + re.escape(generous_text),
        'CRITICAL MARKING INSTRUCTIONS\n' + generous_text,
        content
    )
    
    # Write the cleaned content back
    with open('server.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Successfully cleaned up duplicated generous text!")

if __name__ == "__main__":
    cleanup_duplicates() 