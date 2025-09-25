#!/usr/bin/env python3
"""
Script to check current user data and force refresh
"""
import os
import sys
import asyncio
from supabase import create_client, Client

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.settings import SUPABASE_URL, SUPABASE_KEY

async def check_user_data(user_id: str):
    """Check current user data"""
    try:
        # Initialize Supabase client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print(f"Checking user data for: {user_id}")
        
        # Check in the main table
        response = supabase_client.table('assessment_users').select('*').eq('uid', user_id).execute()
        
        if response.data:
            user_data = response.data[0]
            print(f"User data from main table:")
            print(f"  - current_plan: {user_data.get('current_plan')}")
            print(f"  - credits: {user_data.get('credits')}")
            print(f"  - questions_marked: {user_data.get('questions_marked')}")
            print(f"  - email: {user_data.get('email')}")
            print(f"  - created_at: {user_data.get('created_at')}")
            print(f"  - updated_at: {user_data.get('updated_at')}")
        else:
            print("No user data found in main table")
        
        # Check in the active view
        response = supabase_client.table('active_assessment_users').select('*').eq('uid', user_id).execute()
        
        if response.data:
            user_data = response.data[0]
            print(f"User data from active view:")
            print(f"  - current_plan: {user_data.get('current_plan')}")
            print(f"  - credits: {user_data.get('credits')}")
            print(f"  - questions_marked: {user_data.get('questions_marked')}")
            print(f"  - email: {user_data.get('email')}")
        else:
            print("No user data found in active view")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    target_user_id = "bbb1f94e-12bf-45fa-b962-35591c34bf33"  # Replace with the actual user ID
    asyncio.run(check_user_data(target_user_id))
