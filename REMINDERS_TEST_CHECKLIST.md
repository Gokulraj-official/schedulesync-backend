# Automated Reminders - Comprehensive Test Checklist

## 🔍 Database Models Verification

### ✅ Booking Model - Reminders Sub-Document
- [ ] Field `reminders.reminderEnabled` exists (Boolean, default: true)
- [ ] Field `reminders.sent24HoursBefore` exists (Boolean, default: false)
- [ ] Field `reminders.sentAt24HoursBefore` exists (Date)
- [ ] Field `reminders.sent1HourBefore` exists (Boolean, default: false)
- [ ] Field `reminders.sentAt1HourBefore` exists (Date)
- [ ] Field `reminders.sentDayOf` exists (Boolean, default: false)
- [ ] Field `reminders.sentAtDayOf` exists (Date)
- [ ] Field `reminders.lastReminderSent` exists (Date)
- [ ] Field `reminders.reminderNotes` exists (String)

**Test Command:**
```javascript
db.bookings.findOne({status: "approved"}, {reminders: 1})
// Should show all reminder fields
```

### ✅ ReminderPreference Model
- [ ] Field `user` exists (ObjectId, unique, ref: User)
- [ ] Field `remindersEnabled` exists (Boolean, default: true)
- [ ] Field `reminder24HoursBefore` exists (Boolean, default: true)
- [ ] Field `reminder1HourBefore` exists (Boolean, default: true)
- [ ] Field `reminderDayOf` exists (Boolean, default: true)
- [ ] Field `dayOfReminderTime` exists (String, default: "09:00")
- [ ] Field `notificationMethods` exists (Object: {pushNotification, email, sms})
- [ ] Field `quietHoursEnabled` exists (Boolean, default: false)
- [ ] Field `quietHoursStart` exists (String, default: "22:00")
- [ ] Field `quietHoursEnd` exists (String, default: "08:00")
- [ ] Field `includeSlotDetails` exists (Boolean, default: true)
- [ ] Field `includeFacultyDetails` exists (Boolean, default: true)
- [ ] Field `customMessage` exists (String)
- [ ] Field `timezone` exists (String, default: "Asia/Kolkata")
- [ ] Timestamps (createdAt, updatedAt) exist

**Test Command:**
```javascript
db.reminderpreferences.findOne()
// Should show complete preference structure
```

---

## 🔧 Backend Services Verification

### ✅ reminderScheduler.js Functions
1. **process24HourReminders()**
   - [ ] Finds bookings 24 hours before start time
   - [ ] Checks `prefs.remindersEnabled` is true
   - [ ] Checks `prefs.reminder24HoursBefore` is true
   - [ ] Creates notification via `NotificationService.createNotification()`
   - [ ] Checks `prefs.notificationMethods.pushNotification` (NOT `.includes('push')`)
   - [ ] Sends push if enabled
   - [ ] Emits Socket.io event with `type: 'reminder_24hour'`
   - [ ] Updates `booking.reminders.sent24HoursBefore = true`
   - [ ] Logs to console: `[ReminderScheduler] 24-hour reminder sent...`

2. **process1HourReminders()**
   - [ ] Finds bookings 1 hour before start time
   - [ ] Checks `prefs.remindersEnabled` is true
   - [ ] Checks `prefs.reminder1HourBefore` is true
   - [ ] Creates notification
   - [ ] Checks `prefs.notificationMethods.pushNotification` (NOT `.includes('push')`)
   - [ ] Sends push if enabled
   - [ ] Emits Socket.io event with `type: 'reminder_1hour'`
   - [ ] Updates `booking.reminders.sent1HourBefore = true`
   - [ ] Logs to console: `[ReminderScheduler] 1-hour reminder sent...`

3. **processDayOfReminders()**
   - [ ] Finds bookings with startTime today
   - [ ] Checks `prefs.remindersEnabled` is true
   - [ ] Checks `prefs.reminderDayOf` is true
   - [ ] Gets `prefs.dayOfReminderTime` (default: "09:00")
   - [ ] Fires only when current time >= reminderTime AND < slot start time
   - [ ] Checks `prefs.notificationMethods.pushNotification` (NOT `.includes('push')`)
   - [ ] Sends push if enabled
   - [ ] Emits Socket.io event with `type: 'reminder_dayof'`
   - [ ] Updates `booking.reminders.sentDayOf = true`
   - [ ] Logs to console: `[ReminderScheduler] Day-of reminder sent...`

4. **startReminderScheduler()**
   - [ ] Sets up interval every 5 minutes (300000ms, NOT 60000ms)
   - [ ] Calls all reminder processors in sequence
   - [ ] Runs immediately on startup
   - [ ] Logs initial message: `[ReminderScheduler] Started - checking reminders every 5 minutes`

5. **startReminderSchedulerWithIo(io)**
   - [ ] Accepts Socket.io instance reference
   - [ ] Stores as `ioRef` for event emission
   - [ ] Calls `startReminderScheduler()`

**Test in Node Console:**
```javascript
// Check scheduler is running
node> process.stdout.write('[ReminderScheduler]')
// Should see logs when time matches reminder windows
```

---

## 📡 API Endpoints Verification

### ✅ GET /reminders/preferences
**Expected Behavior:**
- [ ] Requires authentication (Bearer token)
- [ ] Returns user's preferences or creates default if not exists
- [ ] Converts `notificationMethods` object to array: `["push", "email", "sms"]`
- [ ] Returns status 200 on success

**Response Structure:**
```json
{
  "success": true,
  "remindersEnabled": boolean,
  "reminder24HoursBefore": boolean,
  "reminder1HourBefore": boolean,
  "reminderDayOf": boolean,
  "dayOfReminderTime": "HH:MM",
  "notificationMethods": ["push", "email"],
  "quietHoursEnabled": boolean,
  "quietHoursStart": "HH:MM",
  "quietHoursEnd": "HH:MM",
  "includeSlotDetails": boolean,
  "includeFacultyDetails": boolean,
  "customReminderMessage": string,
  "timezone": string
}
```

**Test Command:**
```bash
curl -X GET http://localhost:5000/api/reminders/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ✅ PUT /reminders/preferences
**Expected Behavior:**
- [ ] Requires authentication (Bearer token)
- [ ] Accepts array format for `notificationMethods`
- [ ] Converts `notificationMethods` array to object format before saving
- [ ] Updates only provided fields (partial updates supported)
- [ ] Converts `customReminderMessage` to `customMessage` before saving
- [ ] Returns 200 with updated preferences

**Notes:**
- Accepts: `{"notificationMethods": ["push", "email"]}`
- Saves as: `{notificationMethods: {pushNotification: true, email: true, sms: false}}`

**Test Command:**
```bash
curl -X PUT http://localhost:5000/api/reminders/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reminder24HoursBefore": false,
    "dayOfReminderTime": "10:00",
    "notificationMethods": ["push", "sms"]
  }'
```

---

### ✅ GET /reminders/upcoming
**Expected Behavior:**
- [ ] Requires authentication
- [ ] Returns bookings in next 24 hours with `status: "approved"`
- [ ] Includes faculty name, email, slot time, location
- [ ] Shows reminder delivery status for each booking
- [ ] Returns count of upcoming reminders

**Response Structure:**
```json
{
  "success": true,
  "upcomingReminders": [
    {
      "bookingId": "...",
      "facultyName": "...",
      "facultyEmail": "...",
      "slotTime": "2026-03-17T14:00:00Z",
      "location": "Room 101",
      "reminders": {
        "sent24HoursBefore": false,
        "sent1HourBefore": false,
        "sentDayOf": false
      }
    }
  ],
  "count": 3
}
```

---

### ✅ POST /reminders/test
**Expected Behavior:**
- [ ] Requires authentication
- [ ] Accepts `bookingId` in body
- [ ] Verifies booking exists and belongs to user
- [ ] Returns test notification data
- [ ] Status 404 if booking not found
- [ ] Status 403 if booking doesn't belong to user

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/reminders/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "YOUR_BOOKING_ID"}'
```

---

### ✅ PUT /reminders/toggle
**Expected Behavior:**
- [ ] Requires authentication
- [ ] Accepts `{enabled: boolean}` in body
- [ ] Sets `remindersEnabled` on user's preferences
- [ ] Creates default preferences if not exists
- [ ] Returns updated status

**Test Commands:**
```bash
# Disable all reminders
curl -X PUT http://localhost:5000/api/reminders/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Enable all reminders
curl -X PUT http://localhost:5000/api/reminders/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

## 🔌 Socket.io Integration

### ✅ Server-Side Event Emission
- [ ] Server imports `reminderScheduler`
- [ ] Calls `startReminderSchedulerWithIo(io)` with Socket.io instance
- [ ] Scheduler has reference to `ioRef`
- [ ] Emits events to specific student: `io.to(studentId).emit('reminder', {...})`

**Event Structure:**
```javascript
{
  type: 'reminder_24hour' | 'reminder_1hour' | 'reminder_dayof',
  bookingId: "...",
  title: "...",
  body: "...",
  slotTime: "2026-03-17T14:00:00Z"
}
```

### ✅ Client-Side Event Listening
- [ ] Mobile app listens for 'reminder' events
- [ ] Handles event in SocketContext or custom listener
- [ ] Displays notification to user
- [ ] Updates UI in real-time

---

## 📱 Mobile Components Verification

### ✅ ReminderSettingsScreen
- [ ] Fetches preferences on mount via `api.get('/reminders/preferences')`
- [ ] Displays all preference toggles and settings
- [ ] Time picker for day-of reminder (format: HH:MM)
- [ ] Notification method selector (push, email, SMS checkboxes)
- [ ] Quiet hours configuration with time pickers
- [ ] Save button calls `api.put('/reminders/preferences', {...})`
- [ ] Shows success/error alerts
- [ ] Data persists after refresh (fetches fresh data)

**Test Steps:**
1. Open ReminderSettingsScreen
2. Toggle "Enable Reminders" ON/OFF
3. Change day-of reminder time
4. Select/deselect notification methods
5. Enable quiet hours
6. Tap "Save Settings"
7. Verify success alert appears
8. Refresh/reopen screen
9. Verify all changes persisted

### ✅ CountdownTimer Component
- [ ] Updates every 1 second
- [ ] Displays time remaining in multiple formats:
  - `'full'`: "2d 3h 45m" or "3h 30m 25s"
  - `'compact'`: "2d" or "3h"
  - `'hms'`: "03:45:12"
- [ ] Shows "Started" when time <= 0
- [ ] Calls `onExpired()` callback when time expires
- [ ] Handles timezone differences correctly

**Test Component:**
```javascript
<CountdownTimer 
  targetTime="2026-03-17T14:30:00Z"
  format="hms"
  onExpired={() => console.log('Appointment started')}
/>
```

### ✅ useReminders Hook
- [ ] Exports all required functions:
  - [ ] `fetchPreferences()` - GET preferences
  - [ ] `updatePreferences(updates)` - PUT preferences
  - [ ] `fetchUpcomingReminders()` - GET upcoming
  - [ ] `toggleReminders(enabled)` - PUT toggle
  - [ ] `sendTestReminder(bookingId)` - POST test
- [ ] State management:
  - [ ] `reminderPreferences` state
  - [ ] `upcomingReminders` state
  - [ ] `loading` state
  - [ ] `error` state
- [ ] Error handling with try-catch
- [ ] Console logging for debugging

---

## 🧪 End-to-End Integration Tests

### Test Scenario 1: 24-Hour Reminder
1. [ ] Create a booking with slot 24 hours in future
2. [ ] Set user preferences: `reminder24HoursBefore: true`
3. [ ] Wait for scheduler to run (every 5 minutes)
4. [ ] Check backend console for "[ReminderScheduler] 24-hour reminder sent..."
5. [ ] Verify booking `reminders.sent24HoursBefore = true` in DB
6. [ ] Verify mobile app receives Socket.io event
7. [ ] Verify notification appears if app is open

### Test Scenario 2: 1-Hour Reminder
1. [ ] Create a booking with slot 1 hour in future
2. [ ] Set user preferences: `reminder1HourBefore: true`
3. [ ] Wait for scheduler to run (every 5 minutes)
4. [ ] Check backend console for "[ReminderScheduler] 1-hour reminder sent..."
5. [ ] Verify booking `reminders.sent1HourBefore = true` in DB

### Test Scenario 3: Day-Of Reminder
1. [ ] Create a booking with slot today at 3:00 PM
2. [ ] Set user preferences: `reminderDayOf: true`, `dayOfReminderTime: "09:00"`
3. [ ] Wait until after 9:00 AM but before appointment
4. [ ] Check backend console for "[ReminderScheduler] Day-of reminder sent..."
5. [ ] Verify booking `reminders.sentDayOf = true` in DB

### Test Scenario 4: Quiet Hours
1. [ ] Set current time to 11:00 PM
2. [ ] Enable quiet hours: 10 PM - 6 AM
3. [ ] Create booking in quiet hours window
4. [ ] Verify reminder queue (not yet sent)
5. [ ] Wait for 6 AM
6. [ ] Verify reminder is delivered

### Test Scenario 5: Duplicate Prevention
1. [ ] Create booking at slot time T
2. [ ] 24-hour reminder fires at T-24h
3. [ ] Verify `sent24HoursBefore = true`
4. [ ] Scheduler runs again at T-23h 59m
5. [ ] Verify reminder NOT sent again (check booking still has `sent24HoursBefore = true`)

---

## 🐛 Debugging Commands

### Check Scheduler Logs
```bash
# In a terminal running the backend
grep -i "reminderScheduler" server.log
# Should show: [ReminderScheduler] Started - checking reminders every 5 minutes
# And periodic: [ReminderScheduler] 24-hour reminder sent...
```

### Check Database
```javascript
// In MongoDB compass or mongosh

// View reminder preferences
db.reminderpreferences.find().pretty()

// Check specific user's preferences
db.reminderpreferences.findOne({user: ObjectId("USER_ID")})

// View reminder status for bookings
db.bookings.find({status: "approved"}, {reminders: 1}).pretty()

// Find bookings with pending reminders
db.bookings.find({"reminders.sent24HoursBefore": false, status: "approved"})
```

### Check Socket.io Events
```javascript
// In browser console (if app is open)
socket.on('reminder', (data) => {
  console.log('Reminder received:', data);
});
```

### Monitor API Calls
```bash
# Check network tab in browser DevTools
# Look for: GET /api/reminders/preferences
# Look for: PUT /api/reminders/preferences
```

---

## 📊 Validation Checklist

- [ ] All database fields exist with correct types
- [ ] All scheduler functions use correct field structure
- [ ] API endpoints return correct response format
- [ ] Mobile components handle data correctly
- [ ] Socket.io events are emitted and received
- [ ] Reminders fire at correct intervals (24h, 1h, day-of)
- [ ] Duplicate reminders are prevented
- [ ] Quiet hours are respected
- [ ] User preferences persist in database
- [ ] Mobile UI displays correctly with fetched data
- [ ] Countdown timers update in real-time
- [ ] No console errors in backend or mobile
- [ ] All error cases handled gracefully
- [ ] Timezone handling is correct
- [ ] Test reminders work as expected

---

## ✅ Final Sign-Off

Once all checks are complete:
- [ ] System is production-ready
- [ ] All reminders deliver as expected
- [ ] No duplicate or missed reminders
- [ ] User can customize all settings
- [ ] Mobile UI is responsive
- [ ] Database is properly optimized
- [ ] Performance impact is minimal
- [ ] Error handling is robust

**Tested Date:** _______________
**Tested By:** _______________
**Status:** ✓ PASSED / ✗ FAILED
