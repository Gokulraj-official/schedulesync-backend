$API_URL = "http://localhost:5000/api"
$ADMIN_EMAIL = "admin@schedulesync.com"
$ADMIN_PASSWORD = "admin123456"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Admin Features API Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as admin
Write-Host "🔐 Step 1: Login as Admin..." -ForegroundColor Yellow

$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $TOKEN = $loginData.token
    
    if (-not $TOKEN) {
        Write-Host "❌ Login failed" -ForegroundColor Red
        Write-Host "Response: $($loginResponse.Content)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Statistics
Write-Host "📊 Step 2: Get Admin Dashboard Statistics..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-WebRequest -Uri "$API_URL/admin/statistics" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"} `
        -UseBasicParsing
    
    $stats = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Statistics retrieved:" -ForegroundColor Green
    Write-Host ($stats.statistics | ConvertTo-Json -Depth 3) -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get statistics: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get Users
Write-Host "👥 Step 3: Get All Users..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-WebRequest -Uri "$API_URL/admin/users" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"} `
        -UseBasicParsing
    
    $users = $usersResponse.Content | ConvertFrom-Json
    Write-Host "✅ Users retrieved: $($users.count) users found" -ForegroundColor Green
    Write-Host ($users.users | Select-Object -First 2 | ConvertTo-Json -Depth 2) -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Get Bookings
Write-Host "📅 Step 4: Get All Bookings..." -ForegroundColor Yellow
try {
    $bookingsResponse = Invoke-WebRequest -Uri "$API_URL/admin/bookings" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"} `
        -UseBasicParsing
    
    $bookings = $bookingsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Bookings retrieved: $($bookings.count) bookings found" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get bookings: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Get Audit Logs
Write-Host "🔍 Step 5: Get Audit Logs..." -ForegroundColor Yellow
try {
    $auditResponse = Invoke-WebRequest -Uri "$API_URL/admin/audit-logs" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"} `
        -UseBasicParsing
    
    $audit = $auditResponse.Content | ConvertFrom-Json
    Write-Host "✅ Audit logs retrieved: $($audit.count) logs found" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get audit logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Admin API Test Completed!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
