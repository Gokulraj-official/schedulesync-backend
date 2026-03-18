const io = require('socket.io-client');

// Simulate the Socket URL extraction from SocketContext
const baseUrl = 'http://localhost:5000/api';
const socketUrl = baseUrl.replace(/\/?api\/?$/, '');

console.log('Base URL:', baseUrl);
console.log('Socket URL:', socketUrl);
console.log('Expected Socket URL: http://localhost:5000');

// Connect to Socket.io
const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('✅ Socket.io connected! ID:', socket.id);
  
  // Try joining a room
  const userId = '6789abc123def456ghi789jk';
  socket.emit('join', userId);
  console.log(`📍 Joined room as user: ${userId}`);
  
  // Listen for messages
  socket.on('direct_message', (data) => {
    console.log('💬 Received message:', data);
  });
  
  socket.on('new_message', (data) => {
    console.log('💬 Received chat message:', data);
  });
  
  socket.on('booking_updated', (data) => {
    console.log('📅 Booking updated:', data);
  });
  
  // Keep connection alive for 10 seconds
  setTimeout(() => {
    console.log('⏱️ Test duration reached. Closing connection...');
    socket.disconnect();
    process.exit(0);
  }, 10000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from Socket.io');
});
