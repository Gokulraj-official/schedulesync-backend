const express = require('express');
const router = express.Router();
const {
  createSlot,
  getMySlots,
  getTodaySlots,
  updateSlot,
  cancelSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotById
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('faculty'), createSlot);
router.get('/my-slots', protect, authorize('faculty'), getMySlots);
router.get('/today', protect, authorize('faculty'), getTodaySlots);
router.get('/available', protect, getAvailableSlots);
router.get('/debug/all-slots', protect, async (req, res) => {
  // Debug endpoint to see all slots (including past ones)
  const Slot = require('../models/Slot');
  try {
    const slots = await Slot.find()
      .populate('faculty', 'name email department')
      .sort({ startTime: -1 })
      .limit(20);
    res.status(200).json({
      success: true,
      message: 'All slots (last 20, including past)',
      count: slots.length,
      slots: slots.map(s => ({
        _id: s._id,
        faculty: s.faculty?.name,
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location,
        status: s.status,
        isAvailable: s.isAvailable,
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        isFuture: new Date(s.startTime) > new Date()
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/:id', protect, getSlotById);
router.put('/:id', protect, authorize('faculty'), updateSlot);
router.put('/:id/cancel', protect, authorize('faculty'), cancelSlot);
router.delete('/:id', protect, authorize('faculty'), deleteSlot);

module.exports = router;
