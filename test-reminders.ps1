# SchedulSync Automated Reminders - System Test Script (PowerShell)
# Tests all reminder functions and API endpoints

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SCHEDULYNC REMINDERS TEST SUITE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TOKEN = "your-auth-token-here"
$BASE_URL = "http://localhost:5000/api"
$BOOKING_ID = "your-booking-id-here"

# Helper function for API calls
function Test-ReminderAPI {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null
    )
    
    Write-Host "📋 TEST: $Name" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Green
        Write-Host "✅ Request successful" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 1: Fetch Reminder Preferences
Test-ReminderAPI -Name "Fetch Reminder Preferences" -Method "GET" -Endpoint "/reminders/preferences"

# Test 2: Update Reminder Preferences
$updateBody = @{
    remindersEnabled = $true
    reminder24HoursBefore = $true
    reminder1HourBefore = $true
    reminderDayOf = $true
    dayOfReminderTime = "09:00"
    notificationMethods = @("push", "email")
    quietHoursEnabled = $false
    quietHoursStart = "22:00"
    quietHoursEnd = "08:00"
    includeSlotDetails = $true
    includeFacultyDetails = $true
}
Test-ReminderAPI -Name "Update Reminder Preferences" -Method "PUT" -Endpoint "/reminders/preferences" -Body $updateBody

# Test 3: Get Upcoming Reminders
Test-ReminderAPI -Name "Get Upcoming Reminders" -Method "GET" -Endpoint "/reminders/upcoming"

# Test 4: Toggle All Reminders OFF
$toggleBody = @{
    enabled = $false
}
Test-ReminderAPI -Name "Toggle All Reminders (OFF)" -Method "PUT" -Endpoint "/reminders/toggle" -Body $toggleBody

# Test 5: Toggle All Reminders ON
$toggleBody = @{
    enabled = $true
}
Test-ReminderAPI -Name "Toggle All Reminders (ON)" -Method "PUT" -Endpoint "/reminders/toggle" -Body $toggleBody

# Test 6: Send Test Reminder
$testBody = @{
    bookingId = $BOOKING_ID
}
Test-ReminderAPI -Name "Send Test Reminder" -Method "POST" -Endpoint "/reminders/test" -Body $testBody

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All API endpoint tests completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Next Steps to Verify:" -ForegroundColor Cyan
Write-Host "1. ✓ Check backend console for reminder scheduler logs" -ForegroundColor Gray
Write-Host "2. ✓ Verify Socket.io events are being emitted to clients" -ForegroundColor Gray
Write-Host "3. ✓ Test countdown timer in mobile app" -ForegroundColor Gray
Write-Host "4. ✓ Verify database entries in reminder collections" -ForegroundColor Gray
Write-Host "5. ✓ Check notification delivery in NotificationService logs" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Debugging Tips:" -ForegroundColor Cyan
Write-Host "- Check Node console: tail -f server.log | grep ReminderScheduler" -ForegroundColor Gray
Write-Host "- Check Socket.io: Look for 'reminder' events in browser console" -ForegroundColor Gray
Write-Host "- Check MongoDB: db.reminderpreferences.find()" -ForegroundColor Gray
Write-Host "- Check Bookings: db.bookings.find({}, {reminders: 1})" -ForegroundColor Gray
