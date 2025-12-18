# 📱 SchedulSync - Phase 2

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**Smart Faculty-Student Appointment Scheduling System**

*A production-ready mobile application for educational institutions to streamline faculty-student appointment management*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Deployment](#-deployment) • [API Docs](#-api-documentation)

</div>

---

## 🎯 Overview

SchedulSync is a comprehensive full-stack mobile application that revolutionizes how educational institutions manage faculty-student appointments. Built with React Native and deployed on cloud infrastructure, it provides a seamless experience for both faculty and students.

### 🌟 Why SchedulSync?

- ✅ **Real-time Updates** - Auto-refresh on navigation for instant data sync
- ✅ **Cloud-Deployed** - Backend hosted on Render, accessible anywhere
- ✅ **Production-Ready** - JWT authentication with 1-year expiration
- ✅ **Cross-Platform** - Works on Android (iOS support ready)
- ✅ **Smart UI/UX** - Dark mode, intuitive navigation, conflict detection
- ✅ **Scalable Architecture** - RESTful API, MongoDB Atlas, modular design

---

## ✨ Features

### 🔐 Authentication & Security
- Secure JWT-based authentication (365-day token expiration)
- Role-based access control (Faculty/Student)
- Password encryption with bcrypt
- Protected routes and API endpoints
- Persistent login with AsyncStorage

### 👨‍🏫 Faculty Features

#### 📅 Slot Management
- **Create slots** with date, time, location, capacity, and notes
- **Two-step date/time picker** (Android-optimized, no crashes)
- **Edit/Delete/Cancel** slots with confirmation dialogs
- **Auto-refresh** - Slots update immediately after create/edit
- **Calendar view** - Visualize all slots in calendar format
- **Filter by status** - Available, Booked, Cancelled

#### 📋 Booking Management  
- **View all bookings** with student details
- **Approve/Reject** pending requests with optional reason
- **Auto-refresh** - Bookings update instantly after actions
- **Filter by status** - Pending, Approved, Rejected, Cancelled
- **Booking details** - Full student info, purpose, timestamps

#### 👤 Profile & Dashboard
- **Statistics dashboard** - Total slots, bookings, acceptance rate
- **Online/Offline toggle** - Control visibility to students
- **Edit profile** - Bio, qualifications, department
- **Today's schedule** - Quick view of today's slots
- **Pending requests** - Instant access to pending bookings

### 🎓 Student Features

#### 🔍 Faculty Discovery
- **Browse all faculty** with search and filters
- **Department filter** - Find faculty by department
- **Online status** - See who's currently available
- **Faculty profiles** - Bio, qualifications, contact info
- **Favorites system** - Save frequently contacted faculty

#### 📆 Slot Booking
- **View available slots** grouped by date
- **Conflict detection** - Prevents double-booking
- **Purpose field** - Explain appointment reason
- **Instant booking** - Real-time slot availability check
- **Booking confirmation** - Clear success/error messages

#### 📱 My Bookings
- **Track all appointments** with status updates
- **Filter by status** - All, Pending, Approved, Rejected, Cancelled
- **Auto-refresh** - Updates after cancellation
- **Booking details** - Faculty info, slot time, purpose, status
- **Cancel bookings** - Cancel pending/approved appointments

#### ⭐ Favorites & Profile
- **Favorite faculty** - Quick access to preferred faculty
- **Remove favorites** - Manage favorite list
- **Profile statistics** - Total bookings, upcoming appointments
- **Edit profile** - Update name, department, bio

### 🎨 UI/UX Features
- **Dark Mode** - System-wide theme toggle
- **Auto-refresh navigation** - Data syncs on screen focus
- **Loading states** - Clear feedback for server cold starts
- **Error handling** - User-friendly error messages
- **Responsive design** - Optimized for all screen sizes
- **Smooth animations** - Native feel with React Navigation
- Last seen timestamp

#### Additional Features
- Today's Schedule Widget
- Public schedule sharing with QR code
- Calendar view with monthly overview

### 👨‍🎓 Student Features

#### Faculty Discovery
- Browse all faculty members
- Search by name
- Filter by department
- View real-time online/offline status

#### Booking Management
- View available slots
- Book appointment slots
- Add appointment notes
- Track booking status in real time
- Cancel active bookings
- View complete booking history

#### Favorites
- Mark faculty as favorite
- Quick access to frequently booked faculty

#### Profile Management
- Edit personal bio
- View booking statistics
- Manage all bookings

### 🌟 Smart Features

- **Smart Notifications**: Appointment reminders and booking alerts
- **Appointment Countdown Timer**: Displays remaining time for upcoming appointments
- **Slot Conflict Detection**: Prevents overlapping bookings with warnings
- **Dark Mode Support**: Light & dark theme toggle
- **Network Status Indicator**: Shows online/offline internet status

### 📊 Data Visualization
- Monthly calendar view
- Slot availability indicators
- Status badges
- Today's date highlight
- Statistics dashboard

---

## 🛠️ Technology Stack

### Frontend (Mobile)
- React Native (Expo)
- React Navigation
- Axios
- Expo Notifications
- Expo Image Picker
- React Native Calendars
- Moment.js

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Bcrypt.js

### Database
- MongoDB Atlas
- Mongoose ODM

---

## 📁 Project Structure

```
SchedulSync/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── slotController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Slot.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── slotRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── mobile/
    ├── src/
    │   ├── config/
    │   │   └── api.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── navigation/
    │   │   ├── AuthNavigator.js
    │   │   ├── FacultyNavigator.js
    │   │   └── StudentNavigator.js
    │   └── screens/
    │       ├── auth/
    │       ├── faculty/
    │       └── student/
    ├── App.js
    ├── app.json
    ├── babel.config.js
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

5. Start the server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/config/api.js`:
```javascript
const API_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

4. Start Expo:
```bash
npm start
```

5. Run on device:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

---

## 📱 App Screenshots & Features

### Authentication Flow
- Welcome Screen
- Role Selection (Faculty/Student)
- Login & Signup

### Faculty Dashboard
- Home with statistics
- Today's schedule
- Pending approvals
- Quick actions

### Student Dashboard
- Home with booking stats
- Upcoming appointments
- Countdown timers
- Quick access to favorites

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Slots (Faculty)
- `POST /api/slots` - Create slot
- `GET /api/slots/my-slots` - Get faculty slots
- `GET /api/slots/today` - Get today's slots
- `GET /api/slots/available` - Get available slots
- `PUT /api/slots/:id` - Update slot
- `PUT /api/slots/:id/cancel` - Cancel slot
- `DELETE /api/slots/:id` - Delete slot

### Bookings
- `POST /api/bookings` - Create booking (Student)
- `GET /api/bookings/my-bookings` - Get student bookings
- `GET /api/bookings/faculty-bookings` - Get faculty bookings
- `PUT /api/bookings/:id/approve` - Approve booking (Faculty)
- `PUT /api/bookings/:id/reject` - Reject booking (Faculty)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/online-status` - Toggle online status
- `GET /api/users/faculty` - Get all faculty
- `GET /api/users/statistics` - Get user statistics
- `POST /api/users/favorites` - Add to favorites (Student)
- `DELETE /api/users/favorites/:id` - Remove from favorites
- `GET /api/users/public-schedule-link` - Generate public link (Faculty)

---

## 🎨 Design Features

- **Modern UI/UX**: Clean and intuitive interface
- **Dark Mode**: Automatic theme switching
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Enhanced user experience
- **Color-coded Status**: Visual feedback for all states

---

## 🔮 Future Enhancements

- WebSocket-based real-time updates
- Chat between faculty and students
- Google Meet / Zoom integration
- Calendar synchronization
- Analytics & reports
- Ratings and reviews
- Bulk slot creation
- Offline mode support
- Push notifications
- Email notifications

---

## 🧪 Testing

### Manual Testing Checklist
- ✅ Authentication flow
- ✅ Slot lifecycle (create, edit, cancel, delete)
- ✅ Booking approval workflow
- ✅ Profile management
- ✅ Availability status
- ✅ Public schedule access
- ✅ Favorites functionality
- ✅ Conflict detection

---

## 📊 System Architecture

```
┌─────────────────────┐
│  React Native App   │
│   (Expo)            │
└──────────┬──────────┘
           │
           │ REST APIs
           │
┌──────────▼──────────┐
│  Node.js + Express  │
│  (Backend Server)   │
└──────────┬──────────┘
           │
           │ Mongoose
           │
┌──────────▼──────────┐
│   MongoDB Atlas     │
│   (Database)        │
└─────────────────────┘
```

---

## 👥 User Roles & Permissions

### Faculty
- Create, edit, delete, cancel slots
- Approve/reject/cancel bookings
- Manage profile and availability
- Generate public schedule links
- View statistics and analytics

### Student
- Browse and search faculty
- Book available slots
- Track booking status
- Manage favorites
- View booking history

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- Error handling

---

## 📝 License

This project is developed as a Final Year Project for educational purposes.

---

## 👨‍💻 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Mobile:**
```bash
cd mobile
npm start
```

### Building for Production

**Backend:**
```bash
npm start
```

**Mobile:**
```bash
expo build:android
expo build:ios
```

---

## 🐛 Known Issues & Troubleshooting

### Common Issues

1. **Cannot connect to backend**
   - Ensure backend server is running
   - Update API_URL in `mobile/src/config/api.js` with your IP address
   - Check firewall settings

2. **MongoDB connection error**
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas
   - Ensure IP address is whitelisted

3. **Expo app not loading**
   - Clear Expo cache: `expo start -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📞 Support

For issues and questions, please create an issue in the project repository.

---

## 🎓 Project Highlights (For Viva)

✅ **Real-world Problem Solving**: Addresses actual scheduling challenges in educational institutions

✅ **Complete Booking Lifecycle**: From slot creation to approval/rejection

✅ **Role-based Access Control**: Separate workflows for faculty and students

✅ **Mobile-first Solution**: Native mobile experience with React Native

✅ **Scalable Architecture**: RESTful API design with MongoDB

✅ **Industry-relevant Features**: Real-time status, notifications, conflict detection

✅ **Modern Tech Stack**: React Native, Node.js, MongoDB - highly demanded skills

✅ **User Experience Focus**: Dark mode, smooth animations, intuitive navigation

---

**Built with ❤️ for educational institutions**
