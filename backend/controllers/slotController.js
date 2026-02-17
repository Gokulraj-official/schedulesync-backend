const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const moment = require('moment');

exports.createSlot = async (req, res) => {
  try {
    const { startTime, endTime, location, notes, capacity } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const conflictingSlot = await Slot.findOne({
      faculty: req.user._id,
      status: 'active',
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflictingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Slot conflicts with existing slot'
      });
    }

    const slot = await Slot.create({
      faculty: req.user._id,
      startTime: start,
      endTime: end,
      location,
      notes,
      capacity: capacity || 1
    });

    const populatedSlot = await Slot.findById(slot._id).populate('faculty', 'name email department profilePhoto');

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', {
        action: 'created',
        slotId: populatedSlot._id.toString(),
        facultyId: (populatedSlot.faculty?._id || populatedSlot.faculty).toString(),
      });
    }

    res.status(201).json({
      success: true,
      slot: populatedSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMySlots = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = { faculty: req.user._id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const slots = await Slot.find(query)
      .sort({ startTime: 1 })
      .populate('faculty', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      count: slots.length,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTodaySlots = async (req, res) => {
  try {
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const slots = await Slot.find({
      faculty: req.user._id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'active'
    }).sort({ startTime: 1 });

    const slotIds = slots.map(slot => slot._id);
    const bookings = await Booking.find({
      slot: { $in: slotIds },
      status: 'approved'
    }).populate('student', 'name email profilePhoto');

    const slotsWithBookings = slots.map(slot => {
      const slotBookings = bookings.filter(b => b.slot.toString() === slot._id.toString());
      return {
        ...slot.toObject(),
        bookings: slotBookings
      };
    });

    res.status(200).json({
      success: true,
      count: slotsWithBookings.length,
      slots: slotsWithBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    let slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this slot'
      });
    }

    const { startTime, endTime, location, notes, capacity } = req.body;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    slot = await Slot.findByIdAndUpdate(
      req.params.id,
      { startTime, endTime, location, notes, capacity },
      { new: true, runValidators: true }
    ).populate('faculty', 'name email department profilePhoto');

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', {
        action: 'updated',
        slotId: slot._id.toString(),
        facultyId: (slot.faculty?._id || slot.faculty).toString(),
      });
    }

    res.status(200).json({
      success: true,
      slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this slot'
      });
    }

    slot.status = 'cancelled';
    slot.isAvailable = false;
    await slot.save();

    const affectedBookings = await Booking.find({
      slot: slot._id,
      status: { $in: ['pending', 'approved'] }
    }).select('_id student faculty status');

    await Booking.updateMany(
      { _id: { $in: affectedBookings.map((b) => b._id) } },
      { status: 'cancelled', cancellationReason: 'Slot cancelled by faculty', cancelledAt: new Date() }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', {
        action: 'cancelled',
        slotId: slot._id.toString(),
        facultyId: slot.faculty.toString(),
      });

      affectedBookings.forEach((b) => {
        io.to(b.student.toString()).emit('booking_updated', { bookingId: b._id, status: 'cancelled' });
        io.to(b.faculty.toString()).emit('booking_updated', { bookingId: b._id, status: 'cancelled' });
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot cancelled successfully',
      slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this slot'
      });
    }

    const hasBookings = await Booking.countDocuments({
      slot: slot._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (hasBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slot with active bookings. Please cancel the slot instead.'
      });
    }

    await Slot.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', {
        action: 'deleted',
        slotId: slot._id.toString(),
        facultyId: slot.faculty.toString(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { facultyId, startDate, endDate } = req.query;

    let query = {
      status: 'active',
      isAvailable: true,
      startTime: { $gte: new Date() }
    };

    if (facultyId) {
      query.faculty = facultyId;
    }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const slots = await Slot.find(query)
      .sort({ startTime: 1 })
      .populate('faculty', 'name email department profilePhoto isOnline statusMessage');

    res.status(200).json({
      success: true,
      count: slots.length,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate('faculty', 'name email department profilePhoto qualifications bio');

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    res.status(200).json({
      success: true,
      slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
