#!/usr/bin/env python3
"""
Quick diagnostic script to test if backend routes are accessible
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("🔍 Testing Backend Routes...")
print("=" * 50)

# Test 1: Root endpoint
print("\n1. Testing root endpoint (GET /)...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Health check
print("\n2. Testing health check (GET /health)...")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Register endpoint (should exist)
print("\n3. Testing register endpoint (POST /api/auth/register)...")
test_data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
}
try:
    response = requests.post(f"{BASE_URL}/api/auth/register", json=test_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Registration successful!")
    elif response.status_code == 400:
        print(f"   ⚠️  User might already exist: {response.json()}")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Wrong endpoint (what frontend was calling)
print("\n4. Testing OLD wrong endpoint (POST /auth/register)...")
try:
    response = requests.post(f"{BASE_URL}/auth/register", json=test_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:100]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 50)
print("✅ Diagnosis complete!")