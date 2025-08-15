#!/usr/bin/env python3
import requests
import json

# Test the failing endpoints
base_url = "http://localhost:8000/api"

print("Testing /api/test endpoint...")
try:
    r = requests.get(f"{base_url}/test")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting /api/users endpoint...")
try:
    r = requests.get(f"{base_url}/users")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting specific user endpoint...")
user_id = "fUwa9VjOkGhVOiaXqrneyP4r74o1"
try:
    r = requests.get(f"{base_url}/users/{user_id}")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting user creation...")
try:
    data = {
        "user_id": user_id,
        "email": "test@example.com", 
        "name": "Test User"
    }
    r = requests.post(f"{base_url}/users", json=data)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")