#!/usr/bin/env python3
"""
Test script to diagnose billing history endpoint issues
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000/api"
USER_ID = "df3831b0-ff4b-40b9-b296-373eccc272bf"  # From the logs

def test_subscription_status():
    """Test subscription status endpoint"""
    print("\n=== Testing Subscription Status ===")
    url = f"{BASE_URL}/subscriptions/status?user_id={USER_ID}"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Extract subscription ID if present
            if data.get('subscription'):
                sub_id = data['subscription'].get('dodo_subscription_id') or data['subscription'].get('id')
                print(f"\nFound subscription ID: {sub_id}")
                return sub_id
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error calling subscription status: {e}")
    
    return None

def test_billing_history():
    """Test billing history endpoint"""
    print("\n=== Testing Billing History ===")
    url = f"{BASE_URL}/subscriptions/billing-history?user_id={USER_ID}&limit=20"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('data'):
                print(f"\nFound {len(data['data'])} billing records")
            else:
                print("\nNo billing records found")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error calling billing history: {e}")

def test_user_info():
    """Test user endpoint to verify user exists"""
    print("\n=== Testing User Info ===")
    url = f"{BASE_URL}/users/{USER_ID}"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"User found: {data.get('email', 'No email')}")
            print(f"Current plan: {data.get('current_plan', 'Not set')}")
            print(f"Subscription status: {data.get('subscription_status', 'Not set')}")
            print(f"Dodo customer ID: {data.get('dodo_customer_id', 'Not set')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error calling user info: {e}")

def main():
    print("=" * 60)
    print("Billing Endpoints Test Script")
    print("=" * 60)
    
    # Test user info first
    test_user_info()
    
    # Test subscription status
    subscription_id = test_subscription_status()
    
    # Test billing history
    test_billing_history()
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check docker logs for detailed debug output:")
    print("   docker logs englishgpt-api --tail 100")
    print("\n2. If billing history returns 500, check the debug logs for:")
    print("   - Database connection issues")
    print("   - Missing table or column errors")
    print("   - Data format mismatches")

if __name__ == "__main__":
    main()