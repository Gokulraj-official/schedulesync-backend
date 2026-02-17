const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const DirectChat = require('../models/DirectChat');
const Booking = require('../models/Booking');

const getDirectKey = (a, b) => {
  const one = a.toString();
  const two = b.toString();
  return [one, two].sort().join(':');
};

// @route   GET /api/chat/booking/:bookingId
// @desc    Get chat for a booking
// @access  Private
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is part of this booking
    if (booking.student.toString() !== req.user._id.toString() && 
        booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let chat = await Chat.findOne({ booking: req.params.bookingId })
      .populate('participants', 'name profilePhoto role')
      .populate('messages.sender', 'name profilePhoto role');

    if (!chat) {
      // Create chat if doesn't exist
      chat = await Chat.create({
        booking: req.params.bookingId,
        participants: [booking.student, booking.faculty],
        messages: []
      });
      
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name profilePhoto role')
        .populate('messages.sender', 'name profilePhoto role');
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/chat/booking/:bookingId/message
// @desc    Send a message in booking chat
// @access  Private
router.post('/booking/:bookingId/message', protect, async (req, res) => {
  try {
    const { message, attachment } = req.body;
    
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is part of this booking
    if (booking.student.toString() !== req.user._id.toString() && 
        booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let chat = await Chat.findOne({ booking: req.params.bookingId });

    if (!chat) {
      chat = await Chat.create({
        booking: req.params.bookingId,
        participants: [booking.student, booking.faculty],
        messages: []
      });
    }

    const newMessage = {
      sender: req.user._id,
      message,
      attachment,
      createdAt: Date.now()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = Date.now();
    await chat.save();

    await chat.populate('messages.sender', 'name profilePhoto role');

    // Send real-time notification via Socket.io
    const io = req.app.get('io');
    const recipientId = booking.student.toString() === req.user._id.toString() 
      ? booking.faculty.toString() 
      : booking.student.toString();
    
    io.to(recipientId).emit('new_message', {
      bookingId: req.params.bookingId,
      message: newMessage,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        profilePhoto: req.user.profilePhoto
      }
    });

    res.json({
      success: true,
      message: 'Message sent',
      chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark all messages as read by current user
    chat.messages.forEach(msg => {
      const alreadyRead = msg.readBy.some(r => r.user.toString() === req.user._id.toString());
      if (!alreadyRead && msg.sender.toString() !== req.user._id.toString()) {
        msg.readBy.push({
          user: req.user._id,
          readAt: Date.now()
        });
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/direct', protect, async (req, res) => {
  try {
    const chats = await DirectChat.find({
      participants: req.user._id,
      isActive: true,
    })
      .sort({ lastMessage: -1 })
      .populate('participants', 'name profilePhoto role department isOnline lastSeen')
      .slice('messages', -1);

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/direct/user/:userId', protect, async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (!otherId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    if (otherId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    const directKey = getDirectKey(req.user._id, otherId);

    let chat = await DirectChat.findOne({ directKey })
      .populate('participants', 'name profilePhoto role department isOnline lastSeen')
      .populate('messages.sender', 'name profilePhoto role');

    if (!chat) {
      chat = await DirectChat.create({
        directKey,
        participants: [req.user._id, otherId],
        messages: [],
      });

      chat = await DirectChat.findById(chat._id)
        .populate('participants', 'name profilePhoto role department isOnline lastSeen')
        .populate('messages.sender', 'name profilePhoto role');
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/direct/:chatId', protect, async (req, res) => {
  try {
    const chat = await DirectChat.findOne({ _id: req.params.chatId, participants: req.user._id })
      .populate('participants', 'name profilePhoto role department isOnline lastSeen')
      .populate('messages.sender', 'name profilePhoto role');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/direct/:chatId/message', protect, async (req, res) => {
  try {
    const { message, attachment } = req.body;
    const msg = (message || '').trim();
    if (!msg) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const chat = await DirectChat.findOne({ _id: req.params.chatId, participants: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const participantIds = (chat.participants || []).map((p) => (p._id || p).toString());

    const newMessage = {
      sender: req.user._id,
      message: msg,
      attachment,
      createdAt: Date.now(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = Date.now();
    await chat.save();

    await chat.populate('participants', 'name profilePhoto role department isOnline lastSeen');
    await chat.populate('messages.sender', 'name profilePhoto role');

    const io = req.app.get('io');
    if (io) {
      participantIds
        .filter((pid) => pid.toString() !== req.user._id.toString())
        .forEach((pid) => {
          io.to(pid.toString()).emit('direct_message', {
            chatId: chat._id,
            message: newMessage,
            sender: {
              _id: req.user._id,
              name: req.user.name,
              profilePhoto: req.user.profilePhoto,
            },
          });
        });
    }

    res.json({ success: true, message: 'Message sent', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
