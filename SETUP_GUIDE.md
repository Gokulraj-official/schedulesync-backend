# 🚀 SchedulSync - Complete Setup Guide

This guide will walk you through setting up SchedulSync from scratch.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Git** (optional) - For version control
- **iOS Simulator** (Mac only) or **Android Emulator** or **Physical Device**

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click "Create Cluster"
5. Wait for cluster to be created (2-3 minutes)

### 1.3 Create Database User
1. Go to **Database Access** in left sidebar
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Set username: `schedulesync_user`
5. Set a strong password (save it!)
6. Set role to **Read and write to any database**
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to **Network Access** in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to **Database** in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Save this connection string for later

---

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator
- multer
- cloudinary
- node-cron
- moment

### 2.3 Create Environment File
```bash
cp .env.example .env
```

### 2.4 Configure Environment Variables

Open `.env` file and update:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://schedulesync_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/schedulesync?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Base URL (for public links)
BASE_URL=http://localhost:5000
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your MongoDB user password
- Generate a strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Cloudinary is optional for now (for profile photo uploads)

### 2.5 Start Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster0-xxxxx.mongodb.net
```

### 2.6 Test Backend API

Open browser or Postman and visit:
```
http://localhost:5000
```

You should see:
```json
{
  "success": true,
  "message": "SchedulSync API is running",
  "version": "1.0.0"
}
```

---

## 📱 Step 3: Mobile App Setup

### 3.1 Navigate to Mobile Directory
```bash
cd ../mobile
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- expo
- react-native
- react-navigation
- axios
- async-storage
- expo-notifications
- expo-image-picker
- react-native-calendars
- moment
- and more...

### 3.3 Configure API URL

**Find Your IP Address:**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

**Update API Configuration:**

Open `src/config/api.js` and update:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'; // Replace with YOUR IP
```

**Important:** 
- Don't use `localhost` or `127.0.0.1` - it won't work on physical devices
- Use your actual local network IP address
- Ensure your phone and computer are on the same WiFi network

### 3.4 Start Expo Development Server
```bash
npm start
```

or

```bash
expo start
```

This will open Expo DevTools in your browser.

### 3.5 Run on Device

**Option 1: Physical Device (Recommended)**
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal/browser
3. App will load on your device

**Option 2: iOS Simulator (Mac only)**
1. Press `i` in terminal
2. Simulator will open automatically

**Option 3: Android Emulator**
1. Start Android Emulator first
2. Press `a` in terminal

---

## 🧪 Step 4: Testing the Application

### 4.1 Create Test Accounts

**Faculty Account:**
1. Open app
2. Click "Get Started"
3. Select "Faculty"
4. Click "Sign Up"
5. Fill in details:
   - Name: Dr. John Smith
   - Email: john@university.edu
   - Department: Computer Science
   - Password: password123
6. Click "Sign Up"

**Student Account:**
1. Logout (if logged in)
2. Select "Student"
3. Click "Sign Up"
4. Fill in details:
   - Name: Alice Johnson
   - Email: alice@university.edu
   - Department: Computer Science
   - Password: password123
5. Click "Sign Up"

### 4.2 Test Faculty Features

1. **Create a Slot:**
   - Go to "Slots" tab
   - Click "+" button
   - Set date/time, location, capacity
   - Click "Create Slot"

2. **Manage Profile:**
   - Go to "Profile" tab
   - Click "Edit Profile"
   - Add bio and qualifications
   - Save changes

3. **Toggle Online Status:**
   - On Home screen
   - Toggle the "Online Status" switch

### 4.3 Test Student Features

1. **Discover Faculty:**
   - Go to "Discover" tab
   - Search or filter faculty
   - Click on a faculty member

2. **Book Appointment:**
   - View faculty details
   - Click "View Available Slots"
   - Select a slot
   - Enter purpose
   - Submit booking

3. **Add to Favorites:**
   - On faculty detail page
   - Click heart icon
   - Go to "Favorites" tab to verify

### 4.4 Test Booking Workflow

1. **As Student:** Book an appointment
2. **As Faculty:** 
   - Go to "Bookings" tab
   - See pending booking
   - Approve or reject
3. **As Student:** Check booking status

---

## 🎨 Step 5: Customization (Optional)

### 5.1 Change App Name
Edit `mobile/app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### 5.2 Change App Icon
1. Create 1024x1024 PNG image
2. Save as `mobile/assets/icon.png`
3. Restart Expo

### 5.3 Change Theme Colors
Edit `mobile/src/context/ThemeContext.js`:
```javascript
const lightColors = {
  primary: '#6366f1', // Change this
  secondary: '#8b5cf6', // And this
  // ...
};
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: MongoDB connection failed**
```
Solution:
1. Check internet connection
2. Verify MongoDB connection string
3. Ensure IP is whitelisted in MongoDB Atlas
4. Check username/password
```

**Issue: Port 5000 already in use**
```
Solution:
1. Change PORT in .env to 5001
2. Update API_URL in mobile app
3. Restart backend server
```

### Mobile App Issues

**Issue: Cannot connect to backend**
```
Solution:
1. Verify backend is running (http://localhost:5000)
2. Check API_URL uses your IP address, not localhost
3. Ensure phone and computer on same WiFi
4. Check firewall settings
```

**Issue: Expo app crashes on startup**
```
Solution:
1. Clear cache: expo start -c
2. Delete node_modules: rm -rf node_modules
3. Reinstall: npm install
4. Restart: npm start
```

**Issue: QR code not scanning**
```
Solution:
1. Use tunnel mode: expo start --tunnel
2. Or manually enter URL in Expo Go app
```

---

## 📊 Verify Installation

### Backend Checklist
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Backend dependencies installed
- [ ] .env file configured
- [ ] Server starts without errors
- [ ] API responds at http://localhost:5000

### Mobile App Checklist
- [ ] Mobile dependencies installed
- [ ] API_URL configured with IP address
- [ ] Expo starts without errors
- [ ] App loads on device/simulator
- [ ] Can create faculty account
- [ ] Can create student account
- [ ] Can create and view slots
- [ ] Can book appointments

---

## 🎯 Next Steps

1. **Explore Features:**
   - Try all faculty features
   - Try all student features
   - Test dark mode
   - Test favorites

2. **Add Sample Data:**
   - Create multiple faculty accounts
   - Create multiple slots
   - Make several bookings

3. **Customize:**
   - Update app name and icon
   - Modify theme colors
   - Add your institution's branding

4. **Deploy (Optional):**
   - Deploy backend to Heroku/Railway
   - Build mobile app for production
   - Publish to App Store/Play Store

---

## 📞 Need Help?

If you encounter any issues:

1. Check this guide again
2. Review error messages carefully
3. Check console logs (backend and mobile)
4. Verify all environment variables
5. Ensure all services are running

---

## 🎉 Success!

If you've completed all steps, you now have:
- ✅ Fully functional backend API
- ✅ Working mobile application
- ✅ Connected to MongoDB database
- ✅ Ready to use and customize

**Happy Scheduling! 📅**
