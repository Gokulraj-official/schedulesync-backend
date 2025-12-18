# 🚀 Deploy SchedulSync Backend to Render

Follow these steps to deploy your backend to Render so your mobile app works independently.

---

## 📋 Prerequisites

1. **GitHub Account** - Create one at https://github.com if you don't have it
2. **Render Account** - Sign up at https://render.com (free tier available)
3. **MongoDB Atlas** - Already set up ✅

---

## 🔧 Step 1: Push Backend to GitHub

### 1.1 Initialize Git in Backend Folder

```powershell
cd "D:\My Projects\Windsurf\SchedulSync\backend"
git init
```

### 1.2 Create .gitignore (if not exists)

Create a file named `.gitignore` in the backend folder with:

```
node_modules/
.env
.DS_Store
*.log
```

### 1.3 Commit Your Code

```powershell
git add .
git commit -m "Initial backend commit for Render deployment"
```

### 1.4 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `schedulesync-backend`
3. Make it **Public** or **Private** (your choice)
4. Click **"Create repository"**

### 1.5 Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/schedulesync-backend.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Render

### 2.1 Sign Up / Login to Render

1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select your `schedulesync-backend` repository
4. Click **"Connect"**

### 2.3 Configure the Service

Fill in these settings:

- **Name**: `schedulesync-api` (or any name you prefer)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://smartyjames_db_user:smarty123@cluster0.to6wnsx.mongodb.net/schedulesync?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `schedulesync_super_secret_jwt_key_2024_change_in_production` |
| `JWT_EXPIRE` | `7d` |
| `PORT` | `5000` |

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://schedulesync-api.onrender.com`

---

## ✅ Step 3: Test Your Deployed Backend

Once deployed, test it:

```
https://schedulesync-api.onrender.com
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

## 📱 Step 4: Update Mobile App

### 4.1 Update API URL

Edit `mobile/src/config/api.js`:

```javascript
const API_URL = 'https://schedulesync-api.onrender.com/api';
```

Replace `schedulesync-api` with your actual Render service name.

### 4.2 Commit Changes

```powershell
cd "D:\My Projects\Windsurf\SchedulSync\mobile"
git add src/config/api.js
git commit -m "Update API URL to Render backend"
```

### 4.3 Rebuild APK

```powershell
eas build -p android --profile preview
```

---

## 🎉 Done!

Your app now works **anywhere, anytime** without your computer running!

---

## ⚠️ Important Notes

### Free Tier Limitations

Render free tier:
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds

### Keep Backend Active (Optional)

To prevent spin-down, use a service like:
- **UptimeRobot** (https://uptimerobot.com) - Free
- **Cron-job.org** (https://cron-job.org) - Free

Set it to ping your backend URL every 10 minutes.

---

## 🔧 Troubleshooting

### Build Fails on Render

Check logs in Render dashboard. Common issues:
- Missing dependencies → Check `package.json`
- MongoDB connection → Verify `MONGODB_URI` is correct

### App Can't Connect

1. Check Render service is running (green status)
2. Verify API URL in `mobile/src/config/api.js`
3. Test backend URL in browser first

### 401 Errors

- Check `JWT_SECRET` is set correctly in Render
- Make sure environment variables are saved

---

## 📞 Support

If you encounter issues:
1. Check Render logs (Dashboard → Your Service → Logs)
2. Test backend endpoints with Postman
3. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

**Your Render Backend URL**: `https://schedulesync-api.onrender.com`

(Replace with your actual URL after deployment)
