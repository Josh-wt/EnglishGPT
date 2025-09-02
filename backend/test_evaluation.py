#!/usr/bin/env python3
"""
Test Evaluation System
This script tests the evaluation system to see why it's returning 0/40 with no submarks
"""

import asyncio
import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cnd0cXNwZXlhanR0bnV6d2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc2OTQxMywiZXhwIjoyMDY5MzQ1NDEzfQ.aEjvfQgXlYqGfumqbmp2YKXFNOAhYdf7gONbWNnOpDk'

async def test_evaluation_system():
    """Test the evaluation system"""
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized")
        
        # Test user ID
        user_id = "cfebece0-f495-417a-9671-d6a3225d196a"
        
        print(f"\n🔍 Testing evaluation system for user: {user_id}")
        
        # Step 1: Check if user exists
        print("\n--- Step 1: Check if user exists ---")
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if user_response.data:
            user_data = user_response.data[0]
            print(f"✅ User found: {user_data['email']}")
            print(f"   Plan: {user_data.get('current_plan')}")
            print(f"   Questions marked: {user_data.get('questions_marked')}")
        else:
            print("❌ User not found")
            return
        
        # Step 2: Check existing evaluations
        print("\n--- Step 2: Check existing evaluations ---")
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).execute()
        evaluations = evaluations_response.data or []
        
        print(f"Found {len(evaluations)} evaluations")
        
        if evaluations:
            latest_eval = evaluations[0]
            print(f"Latest evaluation:")
            print(f"   ID: {latest_eval.get('id')}")
            print(f"   Question type: {latest_eval.get('question_type')}")
            print(f"   Grade: {latest_eval.get('grade')}")
            print(f"   Reading marks: {latest_eval.get('reading_marks')}")
            print(f"   Writing marks: {latest_eval.get('writing_marks')}")
            print(f"   AO1 marks: {latest_eval.get('ao1_marks')}")
            print(f"   AO2 marks: {latest_eval.get('ao2_marks')}")
            print(f"   Feedback: {latest_eval.get('feedback', '')[:100]}...")
        else:
            print("No evaluations found")
        
        # Step 3: Test the new user evaluations endpoint
        print("\n--- Step 3: Test user evaluations endpoint ---")
        try:
            # This would normally be an API call, but we'll test the database query directly
            user_eval_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).order('timestamp', desc=True).execute()
            user_evaluations = user_eval_response.data or []
            print(f"✅ User evaluations query successful: {len(user_evaluations)} evaluations")
        except Exception as e:
            print(f"❌ User evaluations query failed: {str(e)}")
        
        # Step 4: Check if there are any evaluations with 0/40 grades
        print("\n--- Step 4: Check for 0/40 grades ---")
        zero_grades = [e for e in evaluations if e.get('grade') == '0/40']
        if zero_grades:
            print(f"Found {len(zero_grades)} evaluations with 0/40 grade")
            for eval_data in zero_grades:
                print(f"   Evaluation ID: {eval_data.get('id')}")
                print(f"   Question type: {eval_data.get('question_type')}")
                print(f"   Reading marks: {eval_data.get('reading_marks')}")
                print(f"   Writing marks: {eval_data.get('writing_marks')}")
                print(f"   AO1 marks: {eval_data.get('ao1_marks')}")
                print(f"   AO2 marks: {eval_data.get('ao2_marks')}")
        else:
            print("No evaluations with 0/40 grade found")
        
        # Step 5: Check evaluation creation process
        print("\n--- Step 5: Check evaluation creation ---")
        if evaluations:
            latest = evaluations[0]
            print(f"Latest evaluation details:")
            print(f"   Student response length: {len(latest.get('student_response', ''))}")
            print(f"   Feedback length: {len(latest.get('feedback', ''))}")
            print(f"   Full chat length: {len(latest.get('full_chat', '') or '')}")
            
            # Check if marks were extracted properly
            has_marks = any([
                latest.get('reading_marks'),
                latest.get('writing_marks'),
                latest.get('ao1_marks'),
                latest.get('ao2_marks')
            ])
            print(f"   Has any marks: {has_marks}")
            
            if not has_marks:
                print("   ⚠️ No marks were extracted - this might be the issue!")
        
        print("\n✅ Evaluation system test completed!")
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting Evaluation System Test")
    print("=" * 50)
    
    # Run the async test
    asyncio.run(test_evaluation_system())
    
    print("\n✅ Test completed!")
