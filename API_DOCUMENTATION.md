# 📚 SchedulSync API Documentation

Complete API reference for SchedulSync backend services.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "faculty",
  "department": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "faculty",
    "department": "Computer Science",
    "profilePhoto": ""
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "faculty",
    "department": "Computer Science",
    "bio": "Professor of Computer Science",
    "qualifications": ["Ph.D. in CS", "10+ years experience"],
    "profilePhoto": "",
    "isOnline": true,
    "statusMessage": "Available for consultations",
    "lastSeen": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📅 Slots (Faculty Only)

### Create Slot
**POST** `/slots`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "startTime": "2024-01-20T10:00:00.000Z",
  "endTime": "2024-01-20T11:00:00.000Z",
  "location": "Room 101, Building A",
  "notes": "Bring your project proposal",
  "capacity": 5
}
```

**Response:**
```json
{
  "success": true,
  "slot": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "faculty": {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Computer Science"
    },
    "startTime": "2024-01-20T10:00:00.000Z",
    "endTime": "2024-01-20T11:00:00.000Z",
    "location": "Room 101, Building A",
    "notes": "Bring your project proposal",
    "capacity": 5,
    "bookedCount": 0,
    "status": "active",
    "isAvailable": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get My Slots
**GET** `/slots/my-slots`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): `active`, `cancelled`, `completed`
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "count": 5,
  "slots": [...]
}
```

### Get Today's Slots
**GET** `/slots/today`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "slots": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T11:00:00.000Z",
      "location": "Room 101",
      "bookings": [
        {
          "student": {
            "name": "Alice Johnson",
            "email": "alice@example.com"
          },
          "purpose": "Project discussion"
        }
      ]
    }
  ]
}
```

### Get Available Slots
**GET** `/slots/available`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `facultyId` (optional): Filter by faculty
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "count": 10,
  "slots": [...]
}
```

### Update Slot
**PUT** `/slots/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "startTime": "2024-01-20T11:00:00.000Z",
  "endTime": "2024-01-20T12:00:00.000Z",
  "location": "Room 102",
  "notes": "Updated notes",
  "capacity": 3
}
```

**Response:**
```json
{
  "success": true,
  "slot": {...}
}
```

### Cancel Slot
**PUT** `/slots/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Slot cancelled successfully",
  "slot": {...}
}
```

### Delete Slot
**DELETE** `/slots/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Slot deleted successfully"
}
```

---

## 📝 Bookings

### Create Booking (Student)
**POST** `/bookings`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "slotId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "purpose": "Need help with my final year project"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "slot": {...},
    "student": {...},
    "faculty": {...},
    "purpose": "Need help with my final year project",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get My Bookings (Student)
**GET** `/bookings/my-bookings`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`, `cancelled`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "bookings": [...]
}
```

### Get Faculty Bookings (Faculty)
**GET** `/bookings/faculty-bookings`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`, `cancelled`

**Response:**
```json
{
  "success": true,
  "count": 8,
  "bookings": [...]
}
```

### Approve Booking (Faculty)
**PUT** `/bookings/:id/approve`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Booking approved successfully",
  "booking": {...}
}
```

### Reject Booking (Faculty)
**PUT** `/bookings/:id/reject`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Slot no longer available"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking rejected successfully",
  "booking": {...}
}
```

### Cancel Booking
**PUT** `/bookings/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {...}
}
```

---

## 👤 Users

### Update Profile
**PUT** `/users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "department": "Computer Science",
  "bio": "Professor with 15 years of experience",
  "qualifications": ["Ph.D. in CS", "Published researcher"],
  "statusMessage": "Available after 3 PM"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Update Profile Photo
**PUT** `/users/profile-photo`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profilePhoto": "https://cloudinary.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Toggle Online Status
**PUT** `/users/online-status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isOnline": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Get All Faculty
**GET** `/users/faculty`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `department` (optional): Filter by department
- `search` (optional): Search by name

**Response:**
```json
{
  "success": true,
  "count": 15,
  "faculty": [...]
}
```

### Get Faculty by ID
**GET** `/users/faculty/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "faculty": {...}
}
```

### Get Statistics
**GET** `/users/statistics`

**Headers:** `Authorization: Bearer <token>`

**Response (Faculty):**
```json
{
  "success": true,
  "statistics": {
    "totalSlots": 25,
    "activeSlots": 15,
    "availableSlots": 10,
    "bookedSlots": 5,
    "pendingBookings": 3,
    "approvedBookings": 12
  }
}
```

**Response (Student):**
```json
{
  "success": true,
  "statistics": {
    "totalBookings": 10,
    "pendingBookings": 2,
    "approvedBookings": 5,
    "rejectedBookings": 2,
    "cancelledBookings": 1
  }
}
```

### Add to Favorites (Student)
**POST** `/users/favorites`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "facultyId": "64f5a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Faculty added to favorites",
  "favorites": [...]
}
```

### Remove from Favorites (Student)
**DELETE** `/users/favorites/:facultyId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Faculty removed from favorites",
  "favorites": [...]
}
```

### Get Favorites (Student)
**GET** `/users/favorites`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "favorites": [...]
}
```

### Generate Public Schedule Link (Faculty)
**GET** `/users/public-schedule-link`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "publicUrl": "http://localhost:5000/api/users/public/schedule/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

### Get Public Schedule
**GET** `/users/public/schedule/:token`

**No authentication required**

**Response:**
```json
{
  "success": true,
  "faculty": {
    "name": "Dr. John Smith",
    "department": "Computer Science",
    "bio": "Professor with 15 years of experience",
    "qualifications": ["Ph.D. in CS"],
    "profilePhoto": ""
  },
  "slots": [...]
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Authorization Error:**
```json
{
  "success": false,
  "message": "User role student is not authorized to access this route"
}
```

**Not Found Error:**
```json
{
  "success": false,
  "message": "Slot not found"
}
```

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['faculty', 'student']),
  department: String,
  bio: String,
  qualifications: [String],
  profilePhoto: String,
  isOnline: Boolean,
  statusMessage: String,
  lastSeen: Date,
  favorites: [ObjectId],
  publicScheduleToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Slot Model
```javascript
{
  _id: ObjectId,
  faculty: ObjectId (ref: User),
  startTime: Date,
  endTime: Date,
  location: String,
  notes: String,
  capacity: Number,
  bookedCount: Number,
  status: String (enum: ['active', 'cancelled', 'completed']),
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  slot: ObjectId (ref: Slot),
  student: ObjectId (ref: User),
  faculty: ObjectId (ref: User),
  purpose: String,
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  rejectionReason: String,
  cancellationReason: String,
  approvedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- Role-based access control on all routes
- Input validation on all endpoints
- MongoDB injection protection
- CORS enabled for cross-origin requests

---

## 📝 Notes

- All dates should be in ISO 8601 format
- Timestamps are in UTC
- Pagination not implemented (future enhancement)
- File uploads use Cloudinary (optional)
- Real-time features planned for future versions

---

**Last Updated:** January 2024
