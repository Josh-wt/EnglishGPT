#!/usr/bin/env python3
"""
Test User Recovery Script
This script tests the new user management system and recovers the specific failing user
"""

import asyncio
import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from user_management_service import UserManagementService


# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cnd0cXNwZXlhanR0bnV6d2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc2OTQxMywiZXhwIjoyMDY5MzQ1NDEzfQ.aEjvfQgXlYqGfumqbmp2YKXFNOAhYdf7gONbWNnOpDk'

async def test_user_recovery():
    """Test the user recovery system with the failing user"""
    
    if not SUPABASE_KEY:
        print("❌ SUPABASE_SERVICE_ROLE_KEY is not set")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized")
        
        # Initialize user management service
        user_management_service = UserManagementService(supabase)
        print("✅ User management service initialized")
        
        # The failing user from the logs
        failing_user_id = "cfebece0-f495-417a-9671-d6a3225d196a"
        test_email = "test@example.com"  # We need an email for recovery
        
        print(f"\n🔍 Testing user recovery for: {failing_user_id}")
        
        # Step 1: Check if user exists
        print("\n--- Step 1: Check if user exists ---")
        existing_user = await user_management_service.get_user_by_id(failing_user_id)
        if existing_user:
            print(f"✅ User already exists: {existing_user['email']}")
            print(f"   Plan: {existing_user.get('current_plan')}")
            print(f"   Credits: {existing_user.get('credits')}")
            print(f"   Questions marked: {existing_user.get('questions_marked')}")
        else:
            print("❌ User not found in database")
        
        # Step 2: Test user recovery/creation
        print("\n--- Step 2: Test user recovery/creation ---")
        recovery_result = await user_management_service.handle_auth_database_mismatch(
            auth_user_id=failing_user_id,
            email=test_email,
            metadata={
                'name': 'Test Recovery User',
                'avatar_url': None
            }
        )
        
        if recovery_result['success']:
            print(f"✅ User recovery successful!")
            print(f"   Recovery method: {recovery_result['recovery_method']}")
            print(f"   Message: {recovery_result['message']}")
            print(f"   User: {recovery_result['user']['email']}")
        else:
            print(f"❌ User recovery failed: {recovery_result.get('error')}")
            return
        
        # Step 3: Test user retrieval
        print("\n--- Step 3: Test user retrieval ---")
        retrieved_user = await user_management_service.get_user_by_id(failing_user_id)
        if retrieved_user:
            print(f"✅ User retrieval successful!")
            print(f"   Email: {retrieved_user['email']}")
            print(f"   Plan: {retrieved_user.get('current_plan')}")
            print(f"   Credits: {retrieved_user.get('credits')}")
            print(f"   Academic level: {retrieved_user.get('academic_level')}")
        else:
            print("❌ User retrieval failed")
            return
        
        # Step 4: Test user update
        print("\n--- Step 4: Test user update ---")
        update_result = await user_management_service.update_user(failing_user_id, {
            'academic_level': 'igcse_test',
            'current_plan': 'unlimited'
        })
        
        if update_result:
            print(f"✅ User update successful!")
            print(f"   Academic level: {update_result.get('academic_level')}")
            print(f"   Plan: {update_result.get('current_plan')}")
        else:
            print("❌ User update failed")
            return
        
        # Step 5: Test user management stats
        print("\n--- Step 5: Test user management stats ---")
        stats = await user_management_service.get_user_management_stats()
        if stats:
            print(f"✅ User management stats retrieved!")
            print(f"   Total users: {stats.get('total_users', 0)}")
            print(f"   Active users: {stats.get('active_users', 0)}")
            print(f"   Deleted users: {stats.get('deleted_users', 0)}")
        else:
            print("❌ Failed to get user management stats")
        
        # Step 6: Test audit log
        print("\n--- Step 6: Test audit log ---")
        audit_log = await user_management_service.get_user_audit_log(failing_user_id, limit=10)
        if audit_log:
            print(f"✅ Audit log retrieved! ({len(audit_log)} entries)")
            for entry in audit_log[:3]:  # Show first 3 entries
                print(f"   {entry['performed_at']}: {entry['operation']} - {entry['email']}")
        else:
            print("❌ No audit log entries found")
        
        print("\n🎉 All tests completed successfully!")
        print(f"\n📋 Summary:")
        print(f"   User ID: {failing_user_id}")
        print(f"   Email: {retrieved_user['email']}")
        print(f"   Status: Active")
        print(f"   Plan: {retrieved_user.get('current_plan')}")
        print(f"   Recovery method: {recovery_result['recovery_method']}")
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

async def test_sql_functions():
    """Test the SQL functions directly"""
    
    print("\n🧪 Testing SQL functions directly...")
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test the create_or_restore_assessment_user function
        test_user_id = "test-user-12345"
        test_email = "test.sql@example.com"
        
        print(f"\n--- Testing create_or_restore_assessment_user function ---")
        result = supabase.rpc(
            'create_or_restore_assessment_user',
            {
                'p_uid': test_user_id,
                'p_email': test_email,
                'p_display_name': 'Test SQL User',
                'p_academic_level': 'igcse',
                'p_current_plan': 'free',
                'p_credits': 3,
                'p_is_launch_user': False
            }
        ).execute()
        
        if result.data:
            print(f"✅ SQL function test successful! User UID: {result.data}")
        else:
            print(f"❌ SQL function test failed: {result}")
        
        # Test the get_user_management_stats function
        print(f"\n--- Testing get_user_management_stats function ---")
        stats_result = supabase.rpc('get_user_management_stats').execute()
        
        if stats_result.data:
            print(f"✅ Stats function test successful!")
            stats = stats_result.data
            print(f"   Total users: {stats.get('total_users', 0)}")
            print(f"   Active users: {stats.get('active_users', 0)}")
            print(f"   Deleted users: {stats.get('deleted_users', 0)}")
        else:
            print(f"❌ Stats function test failed: {stats_result}")
        
        # Clean up test user
        print(f"\n--- Cleaning up test user ---")
        cleanup_result = supabase.rpc(
            'soft_delete_assessment_user',
            {
                'p_uid': test_user_id,
                'p_deleted_by': None
            }
        ).execute()
        
        if cleanup_result.data:
            print(f"✅ Test user soft deleted successfully")
        else:
            print(f"⚠️ Test user cleanup may have failed")
        
    except Exception as e:
        print(f"❌ Error during SQL function testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting User Recovery Test")
    print("=" * 50)
    
    # Run the async test
    asyncio.run(test_user_recovery())
    
    # Test SQL functions
    asyncio.run(test_sql_functions())
    
    print("\n✅ Test completed!")
