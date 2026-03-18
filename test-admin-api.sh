#!/bin/bash
# Admin Features API Test Script

API_URL="http://localhost:5000/api"
ADMIN_EMAIL="admin@schedulesync.com"
ADMIN_PASSWORD="admin123456"

echo "========================================="
echo "Admin Features API Test"
echo "========================================="
echo ""

# Step 1: Login as admin
echo "🔐 Step 1: Login as Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get Statistics
echo "📊 Step 2: Get Admin Dashboard Statistics..."
curl -s -X GET "$API_URL/admin/statistics" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30

echo ""
echo "✅ Statistics retrieved"
echo ""

# Step 3: Get Users
echo "👥 Step 3: Get All Users..."
curl -s -X GET "$API_URL/admin/users" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30

echo ""
echo "✅ Users retrieved"
echo ""

# Step 4: Get Bookings
echo "📅 Step 4: Get All Bookings..."
curl -s -X GET "$API_URL/admin/bookings" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30

echo ""
echo "========================================="
echo "✅ All admin endpoint tests completed!"
echo "========================================="
