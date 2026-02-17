const express = require('express');
const router = express.Router();
const {
  updatePushToken,
  updateProfile,
  updateProfilePhoto,
  changePassword,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getChatContacts,
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

router.put('/push-token', protect, updatePushToken);
router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, updateProfilePhoto);
router.put('/change-password', protect, changePassword);
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/chat-contacts', protect, getChatContacts);
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
