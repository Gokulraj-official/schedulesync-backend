const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateProfilePhoto,
  toggleOnlineStatus,
  getAllFaculty,
  getFacultyById,
  getStatistics,
  addFavorite,
  removeFavorite,
  getFavorites,
  generatePublicScheduleLink,
  getPublicSchedule
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, updateProfilePhoto);
router.put('/online-status', protect, toggleOnlineStatus);
router.get('/faculty', protect, getAllFaculty);
router.get('/faculty/:id', protect, getFacultyById);
router.get('/statistics', protect, getStatistics);
router.post('/favorites', protect, authorize('student'), addFavorite);
router.delete('/favorites/:facultyId', protect, authorize('student'), removeFavorite);
router.get('/favorites', protect, authorize('student'), getFavorites);
router.get('/public-schedule-link', protect, authorize('faculty'), generatePublicScheduleLink);
router.get('/public/schedule/:token', getPublicSchedule);

module.exports = router;
