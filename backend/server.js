const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { startReminderSchedulerWithIo } = require('./services/reminderScheduler');
const User = require('./models/User');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Track active users - Map<userId, Set<socketId>>
const activeUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('join', async (userId) => {
    try {
      socket.join(userId);
      
      // Add this socket to the user's active connections
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);
      
      // Update user online status in database (only on first connection)
      if (activeUsers.get(userId).size === 1) {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date()
        });
        console.log(`✅ User ${userId} is now ONLINE`);
      }
      
      // Broadcast to all connected clients that this user is online
      io.emit('user_online', { userId, isOnline: true });
    } catch (error) {
      console.error('Error marking user online:', error.message);
    }
  });

  socket.on('set_status', async (data) => {
    try {
      const { userId, statusMessage } = data;
      await User.findByIdAndUpdate(userId, {
        statusMessage: statusMessage || ''
      });
      io.emit('status_updated', { userId, statusMessage });
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  });

  socket.on('disconnect', async () => {
    console.log('🔴 Client disconnected:', socket.id);
    
    try {
      // Find which user disconnected
      let disconnectedUserId = null;
      for (const [userId, socketIds] of activeUsers.entries()) {
        if (socketIds.has(socket.id)) {
          disconnectedUserId = userId;
          socketIds.delete(socket.id);
          
          // If this was the user's last connection, mark them as offline
          if (socketIds.size === 0) {
            activeUsers.delete(userId);
            
            // Update user offline status in database only when last connection closes
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date()
            });

            console.log(`⛔ User ${disconnectedUserId} is now OFFLINE`);
            
            // Broadcast to all connected clients that this user is offline
            io.emit('user_offline', { userId: disconnectedUserId, isOnline: false });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error marking user offline:', error.message);
    }
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));

startReminderSchedulerWithIo(io);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ScheduleSync API is running',
    version: '2.0.0',
    features: ['Socket.io', 'Push Notifications', 'Chat', 'Waitlist', 'Admin Panel'],
    status: 'deployed',
    buildTime: new Date().toISOString()
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io enabled`);
});
