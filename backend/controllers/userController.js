const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

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

    let query = { role: 'faculty' };

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
