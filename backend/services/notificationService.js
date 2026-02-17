const Notification = require('../models/Notification');
const User = require('../models/User');
const https = require('https');

const postJson = (url, body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);

    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData || '{}'));
          } catch (e) {
            resolve({ raw: responseData });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

class NotificationService {
  // Create notification
  static async createNotification(userId, type, title, body, data = {}) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        body,
        data
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Send push notification (Expo Push Notifications)
  static async sendPushNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.pushToken || !user.notificationsEnabled) {
        return null;
      }

      if (!user.pushToken.startsWith('ExponentPushToken')) {
        return null;
      }

      // Expo Push Notification format
      const message = {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data
      };

      const result = await postJson('https://exp.host/--/api/v2/push/send', message);

      return { message, result };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  }

  // Booking created notification
  static async notifyBookingCreated(booking) {
    const title = 'New Booking Request';
    const body = `You have a new booking request from ${booking.student.name}`;
    
    const notification = await this.createNotification(
      booking.faculty,
      'booking_created',
      title,
      body,
      { bookingId: booking._id.toString() }
    );

    const sent = await this.sendPushNotification(booking.faculty, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    });

    if (notification && sent) {
      notification.sent = true;
      notification.sentAt = Date.now();
      await notification.save();
    }
  }

  // Booking approved notification
  static async notifyBookingApproved(booking) {
    const title = 'Booking Approved';
    const body = `Your booking with ${booking.faculty.name} has been approved`;
    
    const notification = await this.createNotification(
      booking.student,
      'booking_approved',
      title,
      body,
      { bookingId: booking._id.toString() }
    );

    const sent = await this.sendPushNotification(booking.student, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    });

    if (notification && sent) {
      notification.sent = true;
      notification.sentAt = Date.now();
      await notification.save();
    }
  }

  // Booking rejected notification
  static async notifyBookingRejected(booking, reason) {
    const title = 'Booking Rejected';
    const body = reason || `Your booking with ${booking.faculty.name} was rejected`;
    
    const notification = await this.createNotification(
      booking.student,
      'booking_rejected',
      title,
      body,
      { bookingId: booking._id.toString() }
    );

    const sent = await this.sendPushNotification(booking.student, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    });

    if (notification && sent) {
      notification.sent = true;
      notification.sentAt = Date.now();
      await notification.save();
    }
  }

  // Waitlist promoted notification
  static async notifyWaitlistPromoted(booking) {
    const title = 'Promoted from Waitlist!';
    const body = `You've been promoted from the waitlist for ${booking.faculty.name}'s slot`;
    
    const notification = await this.createNotification(
      booking.student,
      'waitlist_promoted',
      title,
      body,
      { bookingId: booking._id.toString() }
    );

    const sent = await this.sendPushNotification(booking.student, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    });

    if (notification && sent) {
      notification.sent = true;
      notification.sentAt = Date.now();
      await notification.save();
    }
  }

  // Reminder notifications
  static async sendReminder(booking, minutesBefore) {
    const title = minutesBefore === 120
      ? 'Appointment in 2 hours'
      : `Appointment in ${minutesBefore} minutes`;
    const body = `Your appointment with ${booking.faculty.name} is starting soon`;
    
    const type = minutesBefore === 120
      ? 'reminder_2hour'
      : (minutesBefore === 60 ? 'reminder_1hour' : 'reminder_10min');
    
    const notification = await this.createNotification(
      booking.student,
      type,
      title,
      body,
      { bookingId: booking._id.toString() }
    );

    const sent = await this.sendPushNotification(booking.student, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    });

    if (notification && sent) {
      notification.sent = true;
      notification.sentAt = Date.now();
      await notification.save();
    }
  }
}

module.exports = NotificationService;
