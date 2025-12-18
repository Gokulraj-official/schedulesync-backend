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
router.get('/:id', protect, getSlotById);
router.put('/:id', protect, authorize('faculty'), updateSlot);
router.put('/:id/cancel', protect, authorize('faculty'), cancelSlot);
router.delete('/:id', protect, authorize('faculty'), deleteSlot);

module.exports = router;
