const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getFacultyBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookingById
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), createBooking);
router.get('/my-bookings', protect, authorize('student'), getMyBookings);
router.get('/faculty-bookings', protect, authorize('faculty'), getFacultyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/approve', protect, authorize('faculty'), approveBooking);
router.put('/:id/reject', protect, authorize('faculty'), rejectBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
