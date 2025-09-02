#!/usr/bin/env python3
"""
Test script for user recovery functionality
"""

import asyncio
import jwt
from datetime import datetime, timedelta

def create_test_token(user_id: str, email: str, name: str = "Test User"):
    """Create a test JWT token for testing"""
    payload = {
        'sub': user_id,
        'email': email,
        'name': name,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    
    # Create a simple test token (not for production use)
    token = jwt.encode(payload, 'test-secret', algorithm='HS256')
    return token

async def test_user_recovery():
    """Test the user recovery functionality"""
    import httpx
    
    # Test user data
    user_id = "0b418324-7597-4b2c-846f-531f82c10088"
    email = "phantomgaming146@gmail.com"
    name = "Panda Panda"
    
    # Create test token
    token = create_test_token(user_id, email, name)
    
    print(f"🔍 Testing user recovery for: {user_id}")
    print(f"📧 Email: {email}")
    print(f"👤 Name: {name}")
    
    async with httpx.AsyncClient() as client:
        # Test the recovery endpoint
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        recovery_data = {
            'user_id': user_id,
            'email': email,
            'metadata': {
                'name': name,
                'provider': 'google'
            }
        }
        
        try:
            print("🔄 Testing user recovery endpoint...")
            response = await client.post(
                'http://localhost:5000/api/users/recover',
                json=recovery_data,
                headers=headers
            )
            
            print(f"📊 Response status: {response.status_code}")
            print(f"📄 Response body: {response.text}")
            
            if response.status_code == 200:
                print("✅ User recovery successful!")
                user_data = response.json()
                print(f"👤 Recovered user: {user_data.get('user', {}).get('uid')}")
            else:
                print("❌ User recovery failed")
                
        except Exception as e:
            print(f"❌ Error testing recovery: {str(e)}")
        
        # Test the get user endpoint
        try:
            print("\n🔄 Testing get user endpoint...")
            response = await client.get(
                f'http://localhost:5000/api/users/{user_id}',
                headers=headers
            )
            
            print(f"📊 Response status: {response.status_code}")
            print(f"📄 Response body: {response.text}")
            
            if response.status_code == 200:
                print("✅ Get user successful!")
            else:
                print("❌ Get user failed")
                
        except Exception as e:
            print(f"❌ Error testing get user: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_user_recovery())
