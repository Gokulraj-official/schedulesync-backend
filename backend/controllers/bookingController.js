const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { slotId, purpose } = req.body;

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (!slot.checkAvailability()) {
      return res.status(400).json({
        success: false,
        message: 'Slot is not available'
      });
    }

    if (slot.startTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book past slots'
      });
    }

    const existingBooking = await Booking.findOne({
      slot: slotId,
      student: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this slot'
      });
    }

    const conflictingBooking = await Booking.findOne({
      student: req.user._id,
      status: 'approved'
    }).populate('slot');

    if (conflictingBooking) {
      const existingSlot = conflictingBooking.slot;
      if (
        existingSlot &&
        ((slot.startTime >= existingSlot.startTime && slot.startTime < existingSlot.endTime) ||
        (slot.endTime > existingSlot.startTime && slot.endTime <= existingSlot.endTime))
      ) {
        return res.status(400).json({
          success: false,
          message: 'You have a conflicting appointment at this time'
        });
      }
    }

    const booking = await Booking.create({
      slot: slotId,
      student: req.user._id,
      faculty: slot.faculty,
      purpose
    });

    slot.bookedCount += 1;
    await slot.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    res.status(201).json({
      success: true,
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { student: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('faculty', 'name email department profilePhoto isOnline statusMessage');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFacultyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { faculty: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('student', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be approved'
      });
    }

    booking.status = 'approved';
    booking.approvedAt = new Date();
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rejected'
      });
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason;
    booking.rejectedAt = new Date();
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isStudent = booking.student.toString() === req.user._id.toString();
    const isFaculty = booking.faculty.toString() === req.user._id.toString();

    if (!isStudent && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled or rejected'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isStudent = booking.student._id.toString() === req.user._id.toString();
    const isFaculty = booking.faculty._id.toString() === req.user._id.toString();

    if (!isStudent && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
