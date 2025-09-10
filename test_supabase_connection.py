#!/usr/bin/env python3
"""
Test script to verify Supabase connection and user management service
"""
import os
import sys
import asyncio
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from config.settings import get_supabase_client, get_user_management_service

async def test_supabase_connection():
    """Test Supabase connection and user management service"""
    print("🔍 Testing Supabase connection...")
    
    # Test Supabase client
    supabase = get_supabase_client()
    if not supabase:
        print("❌ Failed to initialize Supabase client")
        return False
    
    print("✅ Supabase client initialized successfully")
    
    # Test user management service
    user_service = get_user_management_service(supabase)
    if not user_service:
        print("❌ Failed to initialize user management service")
        return False
    
    print("✅ User management service initialized successfully")
    
    # Test database connection by trying to get user stats
    try:
        stats = await user_service.get_user_management_stats()
        print(f"✅ Database connection successful. Stats: {stats}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_user_recovery():
    """Test user recovery functionality"""
    print("\n🔍 Testing user recovery functionality...")
    
    supabase = get_supabase_client()
    user_service = get_user_management_service(supabase)
    
    if not user_service:
        print("❌ User service not available")
        return False
    
    # Test user creation/recovery
    test_user_id = "test-user-recovery-123"
    test_email = f"{test_user_id}@test.recovery"
    
    try:
        result = await user_service.create_or_restore_user(
            user_id=test_user_id,
            email=test_email,
            display_name="Test Recovery User",
            academic_level='igcse',
            current_plan='free',
            credits=3,
            is_launch_user=False
        )
        
        if result['success']:
            print(f"✅ User recovery test successful: {result['message']}")
            return True
        else:
            print(f"❌ User recovery test failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ User recovery test exception: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Supabase connection tests...\n")
    
    # Test basic connection
    connection_ok = await test_supabase_connection()
    
    if connection_ok:
        # Test user recovery
        recovery_ok = await test_user_recovery()
        
        if recovery_ok:
            print("\n🎉 All tests passed! Supabase is working correctly.")
        else:
            print("\n⚠️ Connection works but user recovery has issues.")
    else:
        print("\n❌ Supabase connection failed. Check your environment variables.")
    
    print("\n📋 Environment variables check:")
    print(f"SUPABASE_URL: {os.environ.get('SUPABASE_URL', 'NOT SET')}")
    print(f"SUPABASE_SERVICE_ROLE_KEY: {'SET' if os.environ.get('SUPABASE_SERVICE_ROLE_KEY') else 'NOT SET'}")

if __name__ == "__main__":
    asyncio.run(main())
