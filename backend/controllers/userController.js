const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken, notificationsEnabled } = req.body;

    const update = {};
    if (pushToken) update.pushToken = pushToken;
    if (notificationsEnabled !== undefined) update.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getChatContacts = async (req, res) => {
  try {
    const { role, q, limit } = req.query;
    const lim = Math.min(Math.max(parseInt(limit || '100', 10), 1), 300);

    const query = {
      _id: { $ne: req.user._id },
      role: { $in: ['student', 'faculty'] }
    };

    if (role && (role === 'student' || role === 'faculty')) {
      query.role = role;
    }

    if (q && String(q).trim().length) {
      query.name = { $regex: String(q).trim(), $options: 'i' };
    }

    const users = await User.find(query)
      .select('name profilePhoto role department isOnline lastSeen')
      .sort({ name: 1 })
      .limit(lim);

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentPassword and newPassword'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, department, bio, qualifications, statusMessage } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (bio) updateData.bio = bio;
    if (qualifications) updateData.qualifications = qualifications;
    if (statusMessage !== undefined) updateData.statusMessage = statusMessage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const { profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isOnline,
        lastSeen: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllFaculty = async (req, res) => {
  try {
    const { department, search } = req.query;

    let query = { role: 'faculty'};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const faculty = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id).select('-password');

    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.status(200).json({
      success: true,
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    if (req.user.role === 'faculty') {
      const totalSlots = await Slot.countDocuments({ faculty: req.user._id });
      const activeSlots = await Slot.countDocuments({ 
        faculty: req.user._id, 
        status: 'active',
        startTime: { $gte: new Date() }
      });
      const availableSlots = await Slot.countDocuments({ 
        faculty: req.user._id, 
        status: 'active',
        isAvailable: true,
        startTime: { $gte: new Date() }
      });
      const bookedSlots = await Slot.countDocuments({ 
        faculty: req.user._id, 
        status: 'active',
        bookedCount: { $gt: 0 }
      });
      const pendingBookings = await Booking.countDocuments({
        faculty: req.user._id,
        status: 'pending'
      });
      const approvedBookings = await Booking.countDocuments({
        faculty: req.user._id,
        status: 'approved'
      });

      res.status(200).json({
        success: true,
        statistics: {
          totalSlots,
          activeSlots,
          availableSlots,
          bookedSlots,
          pendingBookings,
          approvedBookings
        }
      });
    } else {
      const totalBookings = await Booking.countDocuments({ student: req.user._id });
      const pendingBookings = await Booking.countDocuments({
        student: req.user._id,
        status: 'pending'
      });
      const approvedBookings = await Booking.countDocuments({
        student: req.user._id,
        status: 'approved'
      });
      const rejectedBookings = await Booking.countDocuments({
        student: req.user._id,
        status: 'rejected'
      });
      const cancelledBookings = await Booking.countDocuments({
        student: req.user._id,
        status: 'cancelled'
      });

      res.status(200).json({
        success: true,
        statistics: {
          totalBookings,
          pendingBookings,
          approvedBookings,
          rejectedBookings,
          cancelledBookings
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { facultyId } = req.body;

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.favorites.includes(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Faculty already in favorites'
      });
    }

    user.favorites.push(facultyId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Faculty added to favorites',
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(fav => fav.toString() !== facultyId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Faculty removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', '-password');

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.generatePublicScheduleLink = async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty can generate public schedule links'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.publicScheduleToken) {
      user.generatePublicToken();
      await user.save();
    }

    res.status(200).json({
      success: true,
      token: user.publicScheduleToken,
      publicUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/public/schedule/${user.publicScheduleToken}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPublicSchedule = async (req, res) => {
  try {
    const { token } = req.params;

    const faculty = await User.findOne({ publicScheduleToken: token }).select('-password');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired link'
      });
    }

    const slots = await Slot.find({
      faculty: faculty._id,
      status: 'active',
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      faculty: {
        name: faculty.name,
        department: faculty.department,
        bio: faculty.bio,
        qualifications: faculty.qualifications,
        profilePhoto: faculty.profilePhoto
      },
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly, page, limit } = req.query;

    const pageNum = Math.max(parseInt(page || '1', 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit || '50', 10), 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.user._id };
    if (unreadOnly === 'true' || unreadOnly === true) {
      query.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!n) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!n.read) {
      n.read = true;
      n.readAt = new Date();
      await n.save();
    }

    res.status(200).json({ success: true, notification: n });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true, readAt: now } }
    );

    res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
 };
