#!/bin/bash

API_BASE_URL="http://localhost:4000/api"

echo "🚀 Email Login Test Suite"
echo "========================="
echo ""

# Test server connectivity first
echo "🔌 Testing Server Connectivity..."
SERVER_RESPONSE=$(curl -s http://localhost:4000/ || echo "ERROR")

if [[ $SERVER_RESPONSE == "ERROR" || $SERVER_RESPONSE == "" ]]; then
    echo "❌ Cannot connect to server"
    echo "   Make sure the server is running on http://localhost:4000"
    exit 1
else
    echo "✅ Server is responding"
    echo ""
fi

echo "🧪 Testing Email-Based Login System"
echo "====================================="
echo ""

passed_tests=0
total_tests=5

# Test 1: Admin Login
echo "🔍 Testing: Admin Login"
echo "   Email: admin@rmp.com"
echo "   Password: admin123"

admin_response=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rmp.com","password":"admin123"}')

if echo "$admin_response" | grep -q '"success":true'; then
    echo "   ✅ PASS - Login successful"
    user_name=$(echo "$admin_response" | grep -o '"nombre_completo":"[^"]*"' | cut -d'"' -f4)
    echo "   User: $user_name"
    ((passed_tests++))
else
    echo "   ❌ FAIL - Login failed"
    echo "   Response: $admin_response"
fi
echo ""

# Test 2: Demo Login
echo "🔍 Testing: Demo Login"
echo "   Email: demo@rmp.com"
echo "   Password: demo123"

demo_response=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rmp.com","password":"demo123"}')

if echo "$demo_response" | grep -q '"success":true'; then
    echo "   ✅ PASS - Login successful"
    user_name=$(echo "$demo_response" | grep -o '"nombre_completo":"[^"]*"' | cut -d'"' -f4)
    echo "   User: $user_name"
    ((passed_tests++))
else
    echo "   ❌ FAIL - Login failed"
    echo "   Response: $demo_response"
fi
echo ""

# Test 3: Invalid Email
echo "🔍 Testing: Invalid Email"
echo "   Email: invalid@test.com"
echo "   Password: wrongpass"

invalid_response=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrongpass"}')

if echo "$invalid_response" | grep -q '"success":false'; then
    echo "   ✅ PASS - Correctly rejected"
    ((passed_tests++))
else
    echo "   ❌ FAIL - Should have been rejected"
    echo "   Response: $invalid_response"
fi
echo ""

# Test 4: Wrong Password
echo "🔍 Testing: Wrong Password"
echo "   Email: admin@rmp.com"
echo "   Password: wrongpass"

wrong_pass_response=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rmp.com","password":"wrongpass"}')

if echo "$wrong_pass_response" | grep -q '"success":false'; then
    echo "   ✅ PASS - Correctly rejected"
    ((passed_tests++))
else
    echo "   ❌ FAIL - Should have been rejected"
    echo "   Response: $wrong_pass_response"
fi
echo ""

# Test 5: Empty Email
echo "🔍 Testing: Empty Email"
echo "   Email: (empty)"
echo "   Password: admin123"

empty_email_response=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":"admin123"}')

if echo "$empty_email_response" | grep -q '"success":false'; then
    echo "   ✅ PASS - Correctly rejected"
    ((passed_tests++))
else
    echo "   ❌ FAIL - Should have been rejected"
    echo "   Response: $empty_email_response"
fi
echo ""

# Results
echo "📊 Test Results:"
echo "   Passed: $passed_tests/$total_tests"
success_rate=$((passed_tests * 100 / total_tests))
echo "   Success Rate: $success_rate%"

if [ $passed_tests -eq $total_tests ]; then
    echo "🎉 All tests passed! Email login system is working correctly."
    exit 0
else
    echo "⚠️  Some tests failed. Please review the issues above."
    exit 1
fi
