# SchedulSync Automated Reminders Guide

## Overview

The Automated Reminders feature helps students reduce no-shows by sending timely notifications about their upcoming appointments with faculty. The system supports multiple reminder intervals, customizable notification methods, and quiet hours for uninterrupted study time.

## Features

### Reminder Types

1. **24-Hour Reminder** 🕐
   - Sent exactly 24 hours before the scheduled slot
   - Allows students to plan their day
   - Default: Enabled

2. **1-Hour Reminder** ⏰
   - Sent 1 hour before the appointment
   - Last-minute reminder to prepare
   - Default: Enabled

3. **Day-Of Reminder** 📅
   - Sent on the day of appointment at a user-specified time
   - Default time: 9:00 AM
   - Customizable to any time during the day
   - Default: Enabled

### Notification Methods

Users can choose how they want to receive reminders:
- **Push Notifications** 📱 - In-app alerts (selected by default)
- **Email** 📧 - Email reminders (optional)
- **SMS** 💬 - Text message reminders (optional)

### Quiet Hours

Prevent reminders during study hours or sleep time:
- Enable/disable quiet hours globally
- Set custom start and end times (e.g., 10 PM to 8 AM)
- Reminders are held and re-delivered after quiet hours end

### Customization Options

- **Include Slot Details**: Display time location in notifications
- **Include Faculty Details**: Show faculty name and email
- **Custom Messages**: Personalize reminder text
- **Timezone Support**: Automatic timezone-aware scheduling

---

## Mobile App Setup

### Accessing Reminder Settings

1. Navigate to your **Profile/Settings**
2. Find and tap **Reminder Settings** or **Notifications**
3. Customize your preferences

### Settings Screen Layout

```
┌─────────────────────────────────┐
│    REMINDER SETTINGS            │
├─────────────────────────────────┤
│ ✓ Enable Reminders        [ON]  │
├─────────────────────────────────┤
│                                 │
│ REMINDER TYPES                  │
│ ✓ 24 Hours Before        [ON]   │
│ ✓ 1 Hour Before          [ON]   │
│ ✓ Day Of Appointment     [ON]   │
│   Preferred Time: [09:00]       │
│                                 │
│ NOTIFICATION METHODS            │
│ ✓ Push Notifications           │
│   Email                        │
│   SMS                          │
│                                 │
│ QUIET HOURS                     │
│   Enable Quiet Hours     [OFF]  │
│   From: [22:00] To: [08:00]    │
│                                 │
│ NOTIFICATION DETAILS            │
│ ✓ Include Slot Details   [ON]   │
│ ✓ Include Faculty Info   [ON]   │
│                                 │
│      [SAVE SETTINGS]            │
└─────────────────────────────────┘
```

### Using the Countdown Timer

In booking details, you'll see a real-time countdown:

```
Your Appointment: Today at 2:00 PM
⏱️  Time Remaining: 2h 30m 15s
```

The countdown updates every second and shows different formats:
- **Full Format**: `2d 3h 45m` (with days)
- **Compact Format**: `3h` (abbreviated)
- **HMS Format**: `03:45:12` (hours:minutes:seconds)

---

## Backend Configuration

### API Endpoints

#### Get Reminder Preferences
```
GET /api/reminders/preferences
Authorization: Bearer <token>

Response:
{
  success: true,
  remindersEnabled: true,
  reminder24HoursBefore: true,
  reminder1HourBefore: true,
  reminderDayOf: true,
  dayOfReminderTime: "09:00",
  notificationMethods: ["push", "email"],
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  includeSlotDetails: true,
  includeFacultyDetails: true,
  timezone: "Asia/Kolkata"
}
```

#### Update Reminder Preferences
```
PUT /api/reminders/preferences
Authorization: Bearer <token>

Request Body:
{
  remindersEnabled: boolean,
  reminder24HoursBefore: boolean,
  reminder1HourBefore: boolean,
  reminderDayOf: boolean,
  dayOfReminderTime: "HH:MM",
  notificationMethods: ["push", "email", "sms"],
  quietHoursEnabled: boolean,
  quietHoursStart: "HH:MM",
  quietHoursEnd: "HH:MM",
  includeSlotDetails: boolean,
  includeFacultyDetails: boolean
}
```

#### Get Upcoming Reminders
```
GET /api/reminders/upcoming
Authorization: Bearer <token>

Response:
{
  success: true,
  upcomingReminders: [
    {
      bookingId: "64f...",
      facultyName: "Dr. Smith",
      facultyEmail: "smith@example.com",
      slotTime: "2024-01-15T14:00:00Z",
      location: "Room 101",
      reminders: {
        sent24HoursBefore: false,
        sent1HourBefore: false,
        sentDayOf: false
      }
    }
  ],
  count: 3
}
```

#### Send Test Reminder
```
POST /api/reminders/test
Authorization: Bearer <token>

Request Body:
{
  bookingId: "64f..."
}

Response:
{
  success: true,
  message: "Test reminder notification would be sent",
  testData: {
    bookingId: "64f...",
    facultyName: "Dr. Smith",
    slotTime: "2024-01-15T14:00:00Z",
    notificationMethods: ["push"],
    customMessage: "Your appointment reminder..."
  }
}
```

#### Toggle All Reminders
```
PUT /api/reminders/toggle
Authorization: Bearer <token>

Request Body:
{
  enabled: boolean
}

Response:
{
  success: true,
  message: "Reminders enabled/disabled",
  remindersEnabled: boolean
}
```

---

## Technical Architecture

### Database Models

#### ReminderPreference Schema
```javascript
{
  user: ObjectId (unique),
  remindersEnabled: Boolean,
  reminder24HoursBefore: Boolean,
  reminder1HourBefore: Boolean,
  reminderDayOf: Boolean,
  dayOfReminderTime: String, // "HH:MM"
  notificationMethods: [String], // ["push", "email", "sms"]
  quietHoursEnabled: Boolean,
  quietHoursStart: String, // "HH:MM"
  quietHoursEnd: String, // "HH:MM"
  includeSlotDetails: Boolean,
  includeFacultyDetails: Boolean,
  customReminderMessage: String,
  timezone: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Booking.reminders Sub-document
```javascript
{
  reminderEnabled: Boolean,
  sent24HoursBefore: Boolean,
  sentAt24HoursBefore: Date,
  sent1HourBefore: Boolean,
  sentAt1HourBefore: Date,
  sentDayOf: Boolean,
  sentAtDayOf: Date,
  lastReminderSent: Date,
  reminderNotes: String
}
```

### Reminder Scheduler

The `reminderScheduler.js` service runs every 5 minutes and:

1. **Process 24-Hour Reminders**
   - Checks all approved bookings with slots 24 hours away
   - Verifies user preferences
   - Creates notifications
   - Emits Socket.io events for real-time delivery
   - Updates booking reminder status

2. **Process 1-Hour Reminders**
   - Similar logic for 1-hour window
   - Higher priority delivery
   - Ensures student is notified before arrival

3. **Process Day-Of Reminders**
   - Checks slots happening today
   - Respects user's preferred reminder time
   - Fires once per appointment

4. **Process Smart Reminders** (Legacy)
   - Maintains compatibility with existing smart reminder logic
   - Adaptive timing based on no-show history

5. **Process Faculty Load Suggestions**
   - Suggests additional slots to busy faculty
   - Helps with capacity planning

### Socket.io Events

Reminders are delivered in real-time via Socket.io:

```javascript
// Server emits to specific student:
io.to(studentId).emit('reminder', {
  type: 'reminder_24hour' | 'reminder_1hour' | 'reminder_dayof',
  bookingId: "64f...",
  title: "Reminder: Appointment Tomorrow",
  body: "Your booking with Dr. Smith is scheduled...",
  slotTime: "2024-01-15T14:00:00Z"
});
```

The mobile app listens for these events and displays notifications immediately.

---

## Integration with Mobile Components

### Using the useReminders Hook

```javascript
import { useReminders } from '../hooks/useReminders';

export default MyComponent = () => {
  const {
    reminderPreferences,
    upcomingReminders,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    fetchUpcomingReminders,
    toggleReminders,
    sendTestReminder
  } = useReminders();

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
    fetchUpcomingReminders();
  }, []);

  // Update a preference
  const handleUpdate = async () => {
    await updatePreferences({
      reminder1HourBefore: false,
      dayOfReminderTime: '10:00'
    });
  };

  return (
    <View>
      {/* Your component JSX */}
    </View>
  );
};
```

### Using CountdownTimer Component

```javascript
import CountdownTimer from '../components/CountdownTimer';

<CountdownTimer 
  targetTime={booking.slot.startTime}
  onExpired={() => console.log('Appointment started')}
  format="full" // Options: 'full', 'compact', 'hms'
/>

// Output Examples:
// full: "2d 3h 45m" or "3h 30m 25s"
// compact: "2d" or "3h"
// hms: "03:45:12"
```

### Displaying Reminders in Booking Details

```javascript
// Add countdown timer
<CountdownTimer 
  targetTime={booking.slot.startTime}
  format="hms"
/>

// Show reminder status
<Text>
  24h Reminder: {booking.reminders?.sent24HoursBefore ? '✓ Sent' : '⏳ Pending'}
</Text>
<Text>
  1h Reminder: {booking.reminders?.sent1HourBefore ? '✓ Sent' : '⏳ Pending'}
</Text>

// Add test button
<Button 
  title="Send Test Reminder"
  onPress={() => sendTestReminder(booking._id)}
/>
```

---

## Troubleshooting

### Reminders Not Being Received

1. **Check if reminders are enabled globally**
   - Settings → Reminder Settings → Enable Reminders [ON]

2. **Verify notification methods**
   - Select at least one: Push, Email, or SMS
   - For push: Ensure app notifications are enabled in device settings

3. **Check quiet hours**
   - If quiet hours are enabled, reminders are held until after quiet hours end
   - Disable quiet hours to test immediate delivery

4. **Verify user preferences exist**
   - First time users get default preferences created automatically
   - Check database: `db.reminderpreferences.findOne({ user: userId })`

### Countdown Timer Not Updating

1. **Ensure targetTime is a valid ISO string**
   ```javascript
   // ✓ Correct
   <CountdownTimer targetTime="2024-01-15T14:00:00Z" />
   
   // ✗ Wrong
   <CountdownTimer targetTime="tomorrow at 2pm" />
   ```

2. **Component might be unmounting**
   - Verify the parent component stays mounted
   - Check for console errors

3. **Timezone issues**
   - Ensure slot start times are in UTC or properly converted
   - User's timezone preference doesn't affect countdown display (it's client-side)

### Reminders Marked as Sent but User Didn't Receive

1. Check notification service logs:
   ```bash
   # In server console
   [ReminderScheduler] 24-hour reminder sent for booking 64f... to student 65g...
   ```

2. Verify Socket.io connection status:
   ```javascript
   // In mobile app
   console.log('Socket connected:', socket.connected);
   console.log('Socket ID:', socket.id);
   ```

3. Check if student was online when reminder was sent:
   - Active Socket.io connection required for real-time delivery
   - Email/SMS fallback should still work

---

## Best Practices

### For Users
1. ✅ Enable push notifications for immediate alerts
2. ✅ Set day-of reminder time to when you're most likely to check your phone
3. ✅ Use quiet hours during sleep (e.g., 11 PM - 7 AM)
4. ✅ Include faculty details to know who you're meeting

### For Developers
1. ✅ Always check `ReminderPreference` exists before using preferences
2. ✅ Use Socket.io for real-time delivery (faster than polling)
3. ✅ Log reminder delivery for debugging no-show patterns
4. ✅ Test with `POST /api/reminders/test` before major changes

---

## Future Enhancements

- [ ] SMS gateway integration (Twilio/AWS SNS)
- [ ] Email template customization
- [ ] Recurring reminder patterns (e.g., "remind me every Monday")
- [ ] Reminder analytics (which reminders are most effective)
- [ ] Faculty-controlled reminder settings for their bookings
- [ ] In-app reminder history and statistics
- [ ] Snooze function for reminders
- [ ] Location-based reminders (notify when near venue)

---

## File Reference

**Backend Files:**
- `backend/services/reminderScheduler.js` - Scheduler logic (runs every 5 minutes)
- `backend/routes/reminderRoutes.js` - API endpoints
- `backend/models/ReminderPreference.js` - User preferences model
- `backend/models/Booking.js` - Booking with reminders sub-document

**Mobile Files:**
- `mobile/src/screens/shared/ReminderSettingsScreen.js` - Settings UI
- `mobile/src/components/CountdownTimer.js` - Countdown timer component
- `mobile/src/hooks/useReminders.js` - Custom hook for reminder operations
- `mobile/src/context/SocketContext.js` - Socket.io event listener

**Configuration:**
- `backend/server.js` - Includes reminder scheduler initialization

---

## Support

For issues or questions about the reminder system:
1. Check the troubleshooting section above
2. Review logs in both backend and mobile consoles
3. Verify Socket.io connection and user authentication
4. Test with sample bookings using the test endpoint
