# 🔧 SchedulSync - Signup/Login Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Network Error" or "Cannot connect to server"

**Symptoms:**
- App shows "Network Error" or "Request failed"
- Signup/Login buttons don't respond
- Loading spinner appears but nothing happens

**Solutions:**

1. **Check Backend is Running:**
```bash
cd "d:\My Projects\Windsurf\SchedulSync\backend"
npm run dev
```
Should show:
```
Server running on port 5000
MongoDB Connected: ac-sd4l2mc-shard-00-00.to6wnsx.mongodb.net
```

2. **Verify API URL in Mobile App:**
Open: `mobile\src\config\api.js`
Should be:
```javascript
const API_URL = 'http://192.168.1.10:5000/api';
```
**IMPORTANT:** Replace `192.168.1.10` with YOUR computer's IP address!

To find your IP:
```bash
ipconfig
```
Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"

3. **Ensure Phone and Computer on Same WiFi:**
- Both devices must be on the same network
- Check WiFi name on both devices

4. **Check Firewall:**
- Windows Firewall might be blocking port 5000
- Temporarily disable firewall to test

---

### Issue 2: "Invalid credentials" or "User already exists"

**Symptoms:**
- Signup shows "Email already exists"
- Login shows "Invalid credentials"

**Solutions:**

1. **For "Email already exists":**
   - Use a different email address
   - Or delete the user from MongoDB Atlas

2. **For "Invalid credentials":**
   - Double-check email and password
   - Passwords are case-sensitive
   - Make sure you signed up first

---

### Issue 3: App Crashes or Freezes

**Symptoms:**
- App closes unexpectedly
- Screen freezes on signup/login

**Solutions:**

1. **Clear Expo Cache:**
```bash
cd "d:\My Projects\Windsurf\SchedulSync\mobile"
npx expo start --clear
```

2. **Reload App:**
- In Expo terminal, press `r` to reload
- Or shake device and select "Reload"

3. **Check Expo Logs:**
- Look at terminal for error messages
- Common errors:
  - "Cannot read property 'data' of undefined" → Backend not responding
  - "Network request failed" → Wrong API URL or backend not running

---

### Issue 4: "JWT Secret Not Defined" or Authentication Errors

**Symptoms:**
- Backend logs show JWT errors
- Token generation fails

**Solutions:**

1. **Check .env file exists:**
```bash
cd "d:\My Projects\Windsurf\SchedulSync\backend"
dir .env
```

2. **Verify .env content:**
Should contain:
```env
PORT=5000
MONGODB_URI=mongodb+srv://smartyjames_db_user:smarty123@cluster0.to6wnsx.mongodb.net/schedulesync?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=schedulesync_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. **Restart Backend:**
```bash
npm run dev
```

---

### Issue 5: MongoDB Connection Failed

**Symptoms:**
- Backend shows "MongoDB connection failed"
- Cannot save users to database

**Solutions:**

1. **Check Internet Connection:**
- MongoDB Atlas requires internet

2. **Verify MongoDB URI:**
- Check .env file has correct MONGODB_URI
- Test connection by restarting backend

3. **Check MongoDB Atlas:**
- Login to MongoDB Atlas
- Ensure cluster is running
- Check Network Access allows your IP

---

## Step-by-Step Testing Procedure

### Test 1: Backend API Test

1. **Start Backend:**
```bash
cd "d:\My Projects\Windsurf\SchedulSync\backend"
npm run dev
```

2. **Open Browser:**
Visit: `http://localhost:5000`

Should see:
```json
{
  "success": true,
  "message": "SchedulSync API is running",
  "version": "1.0.0"
}
```

### Test 2: Mobile App Connection Test

1. **Check API URL:**
Open: `mobile\src\config\api.js`
Verify IP address matches your computer's IP

2. **Start Mobile App:**
```bash
cd "d:\My Projects\Windsurf\SchedulSync\mobile"
npm start
```

3. **Scan QR Code:**
- Open Expo Go on phone
- Scan QR code
- Wait for app to load

### Test 3: Signup Test

1. **Open App:**
- Click "Get Started"
- Select "Student" or "Faculty"
- Click "Sign Up"

2. **Fill Form:**
- Name: Test User
- Email: test123@example.com
- Password: password123
- Confirm Password: password123
- Department: Computer Science

3. **Submit:**
- Click "Sign Up"
- Should see loading spinner
- Should navigate to home screen

**If it fails:**
- Check Expo terminal for errors
- Check backend terminal for logs
- Note the exact error message

### Test 4: Login Test

1. **Logout:**
- Go to Profile tab
- Click Logout

2. **Login:**
- Select role
- Click "Login"
- Enter email: test123@example.com
- Enter password: password123
- Click "Login"

**If it fails:**
- Verify you signed up first
- Check email/password are correct
- Check backend logs

---

## Quick Fixes Checklist

Before asking for help, try these:

- [ ] Backend is running (port 5000)
- [ ] MongoDB connected (check backend logs)
- [ ] .env file exists and configured
- [ ] API_URL in mobile app has correct IP
- [ ] Phone and computer on same WiFi
- [ ] Expo app is running and loaded
- [ ] Tried clearing Expo cache
- [ ] Tried reloading app (press 'r')
- [ ] Checked both terminals for errors

---

## Common Error Messages

### "Network Error"
→ Backend not running or wrong API URL

### "Request failed with status code 400"
→ Missing required fields or validation error

### "Request failed with status code 500"
→ Backend error, check backend terminal

### "Email already exists"
→ User already registered, use different email or login

### "Invalid credentials"
→ Wrong email/password or user doesn't exist

### "Cannot read property 'data' of undefined"
→ Backend not responding, check if running

---

## Still Not Working?

Provide these details:

1. **Exact error message** (from app or terminal)
2. **Backend terminal output**
3. **Expo terminal output**
4. **What happens when you click signup/login**
5. **Your computer's IP address** (from ipconfig)
6. **Phone and computer WiFi network name**

---

## Contact Information

Check the main README.md for more setup instructions.
