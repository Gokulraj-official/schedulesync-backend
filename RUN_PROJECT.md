# 🚀 How to Run SchedulSync Project

Complete step-by-step guide to run your SchedulSync application.

---

## 📋 Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ npm or yarn package manager
- ✅ Expo CLI installed globally
- ✅ Android Emulator or iOS Simulator (or physical device with Expo Go app)

---

## 🗄️ Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd "d:\My Projects\Windsurf\SchedulSync\backend"
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Create .env File

Create a new file named `.env` in the backend directory with this content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://smartyjames_db_user:smarty123@cluster0.to6wnsx.mongodb.net/schedulesync?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=schedulesync_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Optional - for profile photo uploads (can skip for now)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**To create .env file:**

**Option 1 - Using Command Line:**
```bash
copy .env.example .env
```
Then edit `.env` file and paste the content above.

**Option 2 - Manual:**
1. Right-click in backend folder
2. New → Text Document
3. Name it `.env` (remove .txt extension)
4. Open and paste the content above
5. Save

### 1.4 Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: cluster0.to6wnsx.mongodb.net
```

✅ **Backend is now running on http://localhost:5000**

**Keep this terminal window open!**

---

## 📱 Step 2: Mobile App Setup

### 2.1 Open New Terminal

Open a **NEW** terminal window (keep backend running in the first one)

### 2.2 Navigate to Mobile Directory
```bash
cd "d:\My Projects\Windsurf\SchedulSync\mobile"
```

### 2.3 Install Dependencies
```bash
npm install
```

This will take 2-3 minutes to install all React Native packages.

### 2.4 Update API Configuration

**Your WiFi IP Address:** `192.168.1.10`

Open this file: `mobile\src\config\api.js`

Update line 3 to:
```javascript
const API_URL = 'http://192.168.1.10:5000/api';
```

**Save the file!**

### 2.5 Start Expo Development Server
```bash
npm start
```

or

```bash
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 📲 Step 3: Run on Device

### Option 1: Physical Device (Recommended)

**Android:**
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Scan the QR code from terminal
4. App will load on your phone

**iOS:**
1. Install **Expo Go** from App Store
2. Open Expo Go app
3. Scan the QR code from terminal
4. App will load on your phone

**Important:** Ensure your phone and computer are on the **same WiFi network** (192.168.1.x)

### Option 2: Android Emulator

1. Start Android Emulator first
2. In Expo terminal, press `a`
3. App will open in emulator

### Option 3: iOS Simulator (Mac only)

1. In Expo terminal, press `i`
2. Simulator will open automatically

---

## 🧪 Step 4: Test the Application

### 4.1 Create Faculty Account

1. App opens → Click **"Get Started"**
2. Select **"Faculty"** role
3. Click **"Sign Up"**
4. Fill in:
   - Name: `Dr. John Smith`
   - Email: `john@university.edu`
   - Password: `password123`
   - Department: `Computer Science`
5. Click **"Sign Up"**

✅ You're now logged in as Faculty!

### 4.2 Create a Slot (Faculty)

1. Go to **"Slots"** tab (bottom navigation)
2. Click **"+"** button (bottom right)
3. Fill in:
   - Start Time: Select tomorrow, 10:00 AM
   - End Time: Select tomorrow, 11:00 AM
   - Location: `Room 101, CS Building`
   - Capacity: `5`
   - Notes: `Bring your project proposal`
4. Click **"Create Slot"**

✅ Slot created successfully!

### 4.3 Create Student Account

1. Click **Profile** tab → **Logout**
2. Select **"Student"** role
3. Click **"Sign Up"**
4. Fill in:
   - Name: `Alice Johnson`
   - Email: `alice@university.edu`
   - Password: `password123`
   - Department: `Computer Science`
5. Click **"Sign Up"**

✅ You're now logged in as Student!

### 4.4 Book an Appointment (Student)

1. Go to **"Discover"** tab
2. Click on **Dr. John Smith**
3. Click **"View Available Slots"**
4. Click on the slot you created
5. Enter purpose: `Need help with my project`
6. Click **"Submit Booking Request"**

✅ Booking created!

### 4.5 Approve Booking (Faculty)

1. Logout → Login as Faculty (`john@university.edu`)
2. Go to **"Bookings"** tab
3. See the pending booking
4. Click on it → Click **"Approve"**

✅ Booking approved!

### 4.6 Check Booking Status (Student)

1. Logout → Login as Student (`alice@university.edu`)
2. Go to **"Bookings"** tab
3. See your approved booking with countdown timer!

---

## 🎨 Step 5: Explore Features

### Faculty Features to Try:
- ✅ Toggle online/offline status (Home screen)
- ✅ View today's schedule
- ✅ Edit/Cancel/Delete slots
- ✅ View calendar (Profile → Calendar View)
- ✅ Generate public schedule link
- ✅ Edit profile and add qualifications

### Student Features to Try:
- ✅ Search faculty by name
- ✅ Filter by department
- ✅ Add faculty to favorites
- ✅ View booking history
- ✅ Cancel bookings
- ✅ Try dark mode (Home screen toggle)

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: MongoDB connection failed**
```
Solution: Check your internet connection. The MongoDB URI is already configured correctly.
```

**Issue: Port 5000 already in use**
```
Solution:
1. Stop the process using port 5000
2. Or change PORT=5001 in .env file
3. Update mobile API_URL to use port 5001
```

### Mobile App Issues

**Issue: Cannot connect to backend**
```
Solution:
1. Verify backend is running (check terminal)
2. Ensure API_URL in mobile/src/config/api.js is: http://192.168.1.10:5000/api
3. Ensure phone and computer on same WiFi
4. Try restarting Expo: Ctrl+C, then npm start
```

**Issue: Expo won't start**
```
Solution:
1. Clear cache: npx expo start -c
2. Delete node_modules: rmdir /s node_modules
3. Reinstall: npm install
4. Start again: npm start
```

**Issue: App crashes on startup**
```
Solution:
1. Check if backend is running
2. Verify API_URL is correct
3. Clear Expo cache: npx expo start -c
4. Reload app: Press 'r' in Expo terminal
```

---

## 📊 Quick Command Reference

### Backend Commands
```bash
cd "d:\My Projects\Windsurf\SchedulSync\backend"
npm install                    # Install dependencies
npm run dev                    # Start development server
npm start                      # Start production server
```

### Mobile Commands
```bash
cd "d:\My Projects\Windsurf\SchedulSync\mobile"
npm install                    # Install dependencies
npm start                      # Start Expo
npx expo start                 # Alternative start command
npx expo start -c              # Start with cache cleared
npx expo start --tunnel        # Use tunnel (if local network issues)
```

### In Expo Terminal
- Press `a` - Open Android
- Press `i` - Open iOS
- Press `r` - Reload app
- Press `c` - Clear cache
- Press `?` - Show all commands

---

## ✅ Success Checklist

- [ ] Backend dependencies installed
- [ ] .env file created with MongoDB URI
- [ ] Backend server running (port 5000)
- [ ] Mobile dependencies installed
- [ ] API_URL updated with IP: 192.168.1.10
- [ ] Expo server running
- [ ] App loaded on device/emulator
- [ ] Faculty account created
- [ ] Student account created
- [ ] Slot created and booking tested

---

## 🎯 Test Accounts

**Faculty:**
- Email: `john@university.edu`
- Password: `password123`

**Student:**
- Email: `alice@university.edu`
- Password: `password123`

---

## 📞 Need Help?

If you encounter issues:
1. Check both terminals are running
2. Verify MongoDB connection in backend terminal
3. Check API_URL matches your IP address
4. Ensure phone and PC on same WiFi
5. Try clearing cache and restarting

---

## 🎉 You're All Set!

Your SchedulSync application is now running:
- ✅ Backend API: http://localhost:5000
- ✅ Mobile App: Running on your device
- ✅ MongoDB: Connected to cloud database

**Happy Scheduling! 📅**
