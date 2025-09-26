#!/usr/bin/env python3
"""
Script to manually update a user's plan to unlimited
"""
import os
import sys
import asyncio

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from user_management_service import UserManagementService
from config.settings import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client, Client

async def update_user_plan(user_id: str):
    """Update user's plan to unlimited"""
    try:
        # Initialize Supabase client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Initialize user management service
        user_service = UserManagementService(supabase_client)
        
        print(f"Updating user {user_id} to unlimited plan...")
        
        # Update user's plan and credits
        update_data = {
            'current_plan': 'unlimited',
            'credits': 99999  # Unlimited credits
        }
        
        # Update user in database
        result = user_service.supabase.table('assessment_users').update(update_data).eq('uid', user_id).execute()
        
        if result.data:
            print(f"✅ Successfully updated user {user_id} to unlimited plan")
            print(f"Updated data: {result.data[0]}")
        else:
            print(f"❌ Failed to update user {user_id} plan")
            
    except Exception as e:
        print(f"❌ Error updating user plan: {e}")

if __name__ == "__main__":
    # User ID from the logs
    user_id = "bbb1f94e-12bf-45fa-b962-35591c34bf33"
    asyncio.run(update_user_plan(user_id))
