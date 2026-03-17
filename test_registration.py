#!/usr/bin/env python3
"""
Test script for the updated SRMS registration system
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_registration_flow():
    """Test the complete registration flow"""

    print("Testing SRMS Registration System")
    print("=" * 40)

    # Test 1: Try to register a student without pre-uploaded data
    print("\n1. Testing student registration without pre-uploaded data...")
    student_data = {
        'student_id': 'STU001',
        'email': 'student@example.com',
        'password': 'testpass123',
        'first_name': 'John',
        'last_name': 'Doe'
    }

    try:
        response = requests.post(f'{BASE_URL}/auth/register/student/', json=student_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 400 and 'not found' in response.json().get('error', '').lower():
            print("✓ Correctly rejected registration - student data not pre-uploaded")
        else:
            print("✗ Unexpected response")

    except Exception as e:
        print(f"Error: {e}")

    # Test 2: Try to register a lecturer without pre-uploaded data
    print("\n2. Testing lecturer registration without pre-uploaded data...")
    lecturer_data = {
        'employee_id': 'LEC001',
        'email': 'lecturer@example.com',
        'password': 'testpass123',
        'first_name': 'Jane',
        'last_name': 'Smith'
    }

    try:
        response = requests.post(f'{BASE_URL}/auth/register/lecturer/', json=lecturer_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 400 and 'not found' in response.json().get('error', '').lower():
            print("✓ Correctly rejected registration - lecturer data not pre-uploaded")
        else:
            print("✗ Unexpected response")

    except Exception as e:
        print(f"Error: {e}")

    print("\n3. Testing bulk upload endpoints (requires authentication)...")
    print("Note: Bulk upload testing requires a logged-in university admin user")
    print("The endpoints are available at:")
    print(f"  - POST {BASE_URL}/management/students/upload/")
    print(f"  - POST {BASE_URL}/management/lecturers/upload/")

    print("\n4. Expected CSV format for student upload:")
    print("student_id,first_name,last_name,email,faculty,department,program")
    print("STU001,John,Doe,john@example.com,Science,Computer Science,BSc Computer Science")

    print("\n5. Expected CSV format for lecturer upload:")
    print("employee_id,first_name,last_name,email,faculty,department,rank")
    print("LEC001,Jane,Smith,jane@example.com,Science,Computer Science,Senior Lecturer")

if __name__ == '__main__':
    test_registration_flow()