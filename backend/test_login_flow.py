#!/usr/bin/env python
import requests
import json

BASE_URL = 'http://localhost:8000/api'

# Test 1: Login with existing university admin
print("=== TEST 1: LOGIN WITH UNIVERSITY ADMIN ===")
login_data = {
    'username': 'fastresult@admin',
    'password': 'admin123'
}
response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Token: {data['token'][:50]}...")
    user = data.get('user', {})
    print(f"Username: {user.get('username')}")
    print(f"Role: {user.get('role')}")
    print(f"University: {user.get('university_name')}")
    print("✓ Login successful!")
    
    # Test 2: Get profile with token
    print("\n=== TEST 2: GET PROFILE WITH TOKEN ===")
    headers = {'Authorization': f'Bearer {data["token"]}'}
    profile_response = requests.get(f'{BASE_URL}/auth/profile/', headers=headers)
    print(f"Status: {profile_response.status_code}")
    if profile_response.status_code == 200:
        profile = profile_response.json()
        print(f"Profile Retrieved:")
        print(f"  Username: {profile.get('username')}")
        print(f"  Role: {profile.get('role')}")
        print(f"  University: {profile.get('university_name')}")
        print("✓ Profile fetch successful!")
    else:
        print(f"Error: {profile_response.json()}")
else:
    print(f"Error: {response.json()}")

# Test 3: Invalid credentials
print("\n=== TEST 3: INVALID CREDENTIALS ===")
invalid_data = {
    'username': 'fastresult@admin',
    'password': 'wrongpassword'
}
response = requests.post(f'{BASE_URL}/auth/login/', json=invalid_data)
print(f"Status: {response.status_code}")
if response.status_code != 200:
    print(f"Error (expected): {response.json()}")
    print("✓ Invalid credentials handled correctly!")
else:
    print("✗ Should have failed with invalid credentials!")

# Test 4: Check universities endpoint
print("\n=== TEST 4: GET UNIVERSITIES ===")
response = requests.get(f'{BASE_URL}/universities/')
print(f"Status: {response.status_code}")
if response.status_code == 200:
    universities = response.json()
    print(f"Found {len(universities)} universities")
    for uni in universities:
        print(f"  - {uni['name']} (ID: {uni['id']})")
    print("✓ Universities endpoint working!")
else:
    print(f"Error: {response.json()}")
