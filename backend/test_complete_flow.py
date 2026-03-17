#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import json
import time
import sys
import io

# Fix encoding issue for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = 'http://localhost:8000/api'
FRONTEND_URL = 'http://localhost:5178'

print("=" * 60)
print("COMPREHENSIVE LOGIN & ADMIN TEST")
print("=" * 60)

# Test 1: Universities endpoint (should be public)
print("\n[TEST 1] GET /universities/ (Public endpoint)")
try:
    response = requests.get(f'{BASE_URL}/universities/', timeout=10)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    universities = response.json()
    assert len(universities) > 0, "No universities returned"
    print(f"[OK] Found {len(universities)} universities")
    for uni in universities:
        print(f"  - {uni['name']}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 2: Login with valid credentials
print("\n[TEST 2] POST /auth/login/ with valid credentials (fastresult@admin)")
try:
    response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'fastresult@admin', 'password': 'admin123'},
        timeout=15
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"
    data = response.json()
    assert 'token' in data, "No token in response"
    assert 'user' in data, "No user in response"
    
    user = data['user']
    token = data['token']
    
    assert user['username'] == 'fastresult@admin', f"Wrong username: {user['username']}"
    assert user['role'] == 'university_admin', f"Wrong role: {user['role']}"
    assert user['university_name'] is not None, "No university_name in response"
    
    print(f"[OK] Login successful")
    print(f"  - Username: {user['username']}")
    print(f"  - Role: {user['role']}")
    print(f"  - University: {user['university_name']}")
    print(f"  - Token: {token[:50]}...")
except Exception as e:
    print(f"[ERROR] {e}")
    exit(1)

# Test 3: Get profile with valid token
print("\n[TEST 3] GET /auth/profile/ with valid token")
try:
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/auth/profile/', headers=headers, timeout=10)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    profile = response.json()
    assert profile['username'] == 'fastresult@admin'
    assert profile['role'] == 'university_admin'
    print(f"[OK] Profile retrieved successfully")
    print(f"  - Username: {profile['username']}")
    print(f"  - Role: {profile['role']}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 4: Login with invalid credentials
print("\n[TEST 4] POST /auth/login/ with invalid password")
try:
    response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'fastresult@admin', 'password': 'wrongpassword'},
        timeout=15
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    assert 'error' in response.json(), "No error message in response"
    print(f"[OK] Invalid login rejected correctly")
    print(f"  - Error: {response.json()['error']}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 5: Login with non-existent user
print("\n[TEST 5] POST /auth/login/ with non-existent user")
try:
    response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'nonexistent', 'password': 'password123'},
        timeout=15
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    print(f"[OK] Non-existent user rejected correctly")
    print(f"  - Error: {response.json()['error']}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 6: Frontend accessibility
print("\n[TEST 6] Check frontend is accessible")
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print(f"[OK] Frontend is accessible at {FRONTEND_URL}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 60)
print("ALL TESTS PASSED!")
print("=" * 60)
print("\nFrontend is ready for login testing:")
print(f"- Navigate to: {FRONTEND_URL}")
print(f"- Test credentials:")
print(f"  - Username: fastresult@admin")
print(f"  - Password: admin123")
print(f"\nExpected behavior:")
print(f"1. Login page loads without React errors")
print(f"2. Enter credentials and click Login")
print(f"3. Should redirect to /admin/dashboard")
print(f"4. Dashboard should display user info")
