#!/bin/bash

# SchedulSync Automated Reminders - System Test Script
# Tests all reminder functions and API endpoints

echo "================================"
echo "SCHEDULYNC REMINDERS TEST SUITE"
echo "================================"
echo ""

# Get user token (replace with actual token)
TOKEN="your-auth-token-here"
BASE_URL="http://localhost:5000/api"

echo "📋 TEST 1: Fetch Reminder Preferences"
echo "========================================"
curl -X GET "${BASE_URL}/reminders/preferences" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "📋 TEST 2: Update Reminder Preferences"
echo "========================================"
curl -X PUT "${BASE_URL}/reminders/preferences" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "remindersEnabled": true,
    "reminder24HoursBefore": true,
    "reminder1HourBefore": true,
    "reminderDayOf": true,
    "dayOfReminderTime": "09:00",
    "notificationMethods": ["push", "email"],
    "quietHoursEnabled": false,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "includeSlotDetails": true,
    "includeFacultyDetails": true
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "📋 TEST 3: Get Upcoming Reminders"
echo "========================================"
curl -X GET "${BASE_URL}/reminders/upcoming" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "📋 TEST 4: Toggle All Reminders"
echo "========================================"
curl -X PUT "${BASE_URL}/reminders/toggle" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}' \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "📋 TEST 5: Send Test Reminder"
echo "========================================"
# Note: Replace booking-id with an actual booking ID
curl -X POST "${BASE_URL}/reminders/test" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "your-booking-id-here"}' \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "✅ All API endpoint tests completed!"
echo ""
echo "Next Steps:"
echo "1. Check backend console for reminder scheduler logs"
echo "2. Verify Socket.io events are being emitted"
echo "3. Test countdown timer in mobile app"
echo "4. Check database for updated reminders"
echo ""
