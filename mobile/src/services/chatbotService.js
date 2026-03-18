/**
 * Booking Support Chatbot Service
 * Provides intelligent responses for common booking and scheduling questions
 */

const CHATBOT_RESPONSES = {
  // Greeting intents
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'greetings'],
    replies: [
      "👋 Hello! I'm your Booking Support Bot. I can help you with questions about scheduling, slots, and bookings. How can I assist you today?",
    ],
  },

  // Booking questions
  create_booking: {
    keywords: ['book', 'booking', 'schedule', 'appointment', 'reserve', 'make an appointment', 'create booking'],
    replies: [
      "📅 To create a booking:\n1. Go to 'Browse Slots' to see available faculty slots\n2. Select a slot that fits your schedule\n3. Click 'Book Now' and confirm\n4. You'll receive a confirmation message\n\nNeed help finding a specific faculty member?",
    ],
  },

  // Slot finding
  find_slots: {
    keywords: ['find slot', 'search slot', 'available', 'view slots', 'find faculty', 'who is available'],
    replies: [
      "🔍 To find available slots:\n1. Go to 'Browse Slots' on your dashboard\n2. View all available faculty slots\n3. Filter by faculty name or department (if available)\n4. Check the time and location\n5. Click on any slot to book\n\nAll green slots are available!",
    ],
  },

  // Cancel/Reschedule
  cancel_booking: {
    keywords: ['cancel', 'reschedule', 'delete booking', 'change appointment', 'modify booking'],
    replies: [
      "❌ To cancel or reschedule a booking:\n1. Go to 'My Bookings'\n2. Select the booking you want to modify\n3. Click 'Cancel Booking' (cancellation only)\n4. For rescheduling: Cancel the current booking and create a new one\n\n⚠️ Check our cancellation policy before canceling!",
    ],
  },

  // View bookings
  view_bookings: {
    keywords: ['my booking', 'view booking', 'check booking', 'upcoming appointment', 'booking history'],
    replies: [
      "📋 To view your bookings:\n1. Tap 'My Bookings' from your student dashboard\n2. See all your upcoming and past bookings\n3. Click any booking for details\n4. Confirm attendance or reschedule from the details page\n\nYour confirmed bookings appear in green!",
    ],
  },

  // Faculty roles
  faculty_features: {
    keywords: ['faculty', 'instructor', 'professor', 'create slot', 'manage slot', 'my slots'],
    replies: [
      "👨‍🏫 Faculty Features:\n📝 Create Slots: Set your availability and office hours\n✏️ Edit/Delete Slots: Modify your schedule anytime\n📊 View Bookings: See all student bookings for your slots\n🔔 Notifications: Get alerts when students book your slots\n\nAs faculty, you control your own schedule!",
    ],
  },

  // Notifications
  notifications: {
    keywords: ['notification', 'alert', 'reminder', 'message', 'notify me'],
    replies: [
      "🔔 Notification System:\n✅ Booking confirmations - When a student books your slot\n⏰ Reminders - Before upcoming bookings\n🆕 Updates - Important changes to your bookings\n\nCheck your notification settings to customize preferences!",
    ],
  },

  // Technical issues
  technical_help: {
    keywords: ['error', 'bug', 'not working', 'crash', 'problem', 'issue', 'help', 'support', 'contact support'],
    replies: [
      "🛠️ Having technical issues?\nTry these steps:\n1. Refresh the app (pull down to refresh)\n2. Check your internet connection\n3. Force close and reopen the app\n4. Clear app cache\n\nIf the issue persists, please contact our support team through Settings > Help & Feedback.",
    ],
  },

  // Slot capacity
  slot_full: {
    keywords: ['slot full', 'capacity', 'no space', 'fully booked', 'max booking'],
    replies: [
      "📊 About Slot Capacity:\nEach slot has a maximum number of bookings. When a slot reaches capacity, no more students can book it.\n\n💡 Tips:\n✓ Book early for popular slots\n✓ Check multiple time slots\n✓ Try different faculty members\n✓ Set notifications for new slots",
    ],
  },

  // Attendees
  attendees: {
    keywords: ['attendees', 'who is attending', 'see students', 'booking list'],
    replies: [
      "👥 Attendees Information:\nFaculty members can see the list of students who booked their slots after a booking is confirmed.\n\nStudents can see:\n✓ Faculty member details\n✓ Slot time and location\n✓ Your booking status",
    ],
  },

  // Account help
  account_help: {
    keywords: ['login', 'password', 'reset password', 'forgot password', 'account', 'profile', 'sign up'],
    replies: [
      "👤 Account Help:\n📝 Sign Up: Select your role (Faculty/Student) and complete registration\n🔐 Login: Use your registered email and password\n🔑 Forgot Password: Tap 'Forgot Password' on login screen\n🔄 Profile: Update your profile from Settings\n\nNeed more help? Contact support!",
    ],
  },

  // Role selection
  role_help: {
    keywords: ['role', 'student', 'faculty', 'which role', 'student or faculty'],
    replies: [
      "👥 Choosing Your Role:\n🎓 Student: Book slots with faculty members\n👨‍🏫 Faculty: Create slots and manage student bookings\n\nChoose based on your primary use. You can contact support if you need to switch roles.",
    ],
  },

  // Favorites
  favorites: {
    keywords: ['favorite', 'star', 'bookmark', 'save faculty', 'save professor', 'add favorite'],
    replies: [
      "⭐ Favorites Feature:\n✨ Save Your Favorite Faculty:\n1. Go to Faculty Details\n2. Tap the star icon ⭐\n3. Faculty appears in your 'Favorites' tab\n4. Quickly access frequently booked professors\n\nManage favorites anytime from your profile!",
    ],
  },

  // Chat feature
  direct_chat: {
    keywords: ['message', 'chat', 'communicate', 'text faculty', 'talk to professor', 'dm', 'direct message'],
    replies: [
      "💬 Direct Chat Feature:\n📱 Message Faculty Directly:\n1. Go to 'Chats' from your dashboard\n2. Select a faculty member or start a new chat\n3. Send messages in real-time\n4. Exchange documents and notes\n\n✅ Both faculty and students have full chat history!",
    ],
  },

  // Verification status
  verification_status: {
    keywords: ['verification', 'verify', 'approved', 'status', 'pending', 'confirmed', 'badge'],
    replies: [
      "✅ Verification Status:\n🟢 Verified: Faculty has been approved by admin\n⏳ Pending: Awaiting verification from admin\n\nAdmin approval ensures quality faculty profiles. Verified professors have a checkmark badge ✓",
    ],
  },

  // Admin features
  admin_panel: {
    keywords: ['admin', 'admin panel', 'manage users', 'admin features', 'reports', 'audit'],
    replies: [
      "⚙️ Admin Panel Features:\n👥 User Management - Monitor faculty and students\n📊 Reports & Analytics - View booking statistics\n🔐 Verification - Approve faculty profiles\n📋 Audit Logs - Track system activity\n🔔 Announcements - Broadcast messages to all users\n⚡ System Settings - Configure app behavior\n\nAdmin access only!",
    ],
  },

  // Time zones and scheduling
  time_scheduling: {
    keywords: ['time', 'timezone', 'when', 'schedule timing', 'time format', 'gmt', 'ist', 'utc'],
    replies: [
      "⏰ Time & Scheduling:\n🕐 All times are displayed in your local timezone\n📅 24-hour format used for clarity\n⏱️ Slot duration is set by faculty (usually 30-60 mins)\n🌍 Check your device timezone for accuracy\n\nTip: Set multiple alarms for important bookings!",
    ],
  },

  // Cancellation policy
  cancellation_policy: {
    keywords: ['cancel policy', 'refund', 'cancellation', 'deadline', 'how to cancel', 'delete slot'],
    replies: [
      "🛑 Cancellation Policy:\n⏰ Cancel 24 hours before slot for full availability\n⚠️ Cannot cancel slots with active bookings\n📢 Faculty receive notifications when you cancel\n💡 Reschedule instead of cancel when possible\n\nBoth students and faculty can cancel their bookings anytime!",
    ],
  },

  // Ratings and feedback
  ratings_feedback: {
    keywords: ['rating', 'review', 'feedback', 'rate', 'star', 'comment', 'suggest'],
    replies: [
      "⭐ Ratings & Feedback:\n📝 Rate faculty after booking completion\n💬 Leave detailed reviews\n🎯 Help improve service quality\n✨ Top-rated faculty get featured\n\nYour feedback helps us maintain high standards!",
    ],
  },

  // Waiting list
  waiting_list: {
    keywords: ['waiting list', 'waitlist', 'queue', 'full slot', 'join queue', 'set waitlist'],
    replies: [
      "📋 Waiting List Feature:\n⏳ Join waiting list if slot is full\n🔔 Get notified when space becomes available\n✅ Auto-book next available slot\n💬 Communicate with faculty while waiting\n\nNever miss an opportunity!",
    ],
  },

  // Document sharing
  documents: {
    keywords: ['document', 'file', 'upload', 'attachment', 'pdf', 'share file', 'send document'],
    replies: [
      "📎 Document & File Sharing:\n📤 Share documents during booking\n📥 Faculty can send materials via chat\n📝 Attach notes and assignments\n✅ Secure file exchange\n\nUse chat feature to share files directly!",
    ],
  },

  // Announcements
  announcements: {
    keywords: ['announcement', 'news', 'update', 'notice', 'message all', 'broadcast'],
    replies: [
      "📢 Announcements:\n📰 Admin sends important notifications\n🔔 Receive alerts for system updates\n📌 Check announcement section regularly\n⭐ Important schedule changes announced here\n\nStay updated with latest news!",
    ],
  },

  // Department information
  departments: {
    keywords: ['department', 'dept', 'faculty department', 'which department', 'departments available', 'cse', 'ece', 'mechanical'],
    replies: [
      "🏢 Department Information:\nAvailable Departments:\n🖥️ Computer Science\n📱 Information Technology\n⚡ Electronics\n🔧 Mechanical\n🏗️ Civil\n⚡ Electrical\n📐 Mathematics\n🔬 Physics & Chemistry\n📊 Management\n\nFilter faculty by department!",
    ],
  },

  // How to contact support
  contact_support: {
    keywords: ['contact', 'support', 'help desk', 'customer service', 'report issue', 'email support'],
    replies: [
      "📞 Contact Support:\n📧 Email: support@schedulesync.com\n📱 In-App: Settings > Help & Feedback\n🔔 Report bugs immediately\n💬 Chat with our team real-time\n⏱️ Response time: Usually within 24 hours\n\nWe're here to help!",
    ],
  },

  // Public schedule
  public_schedule: {
    keywords: ['public schedule', 'share schedule', 'publish', 'public availability', 'view my public schedule'],
    replies: [
      "🌐 Public Schedule Feature:\n📤 Share your availability publicly\n🔗 Generate shareable link\n📅 Students can view your slots without login\n🔐 Control privacy settings\n✨ Increase booking visibility\n\nGreat for off-campus sharing!",
    ],
  },

  // Performance and statistics
  statistics: {
    keywords: ['stats', 'statistics', 'analytics', 'report', 'performance', 'booking history', 'how many bookings'],
    replies: [
      "📊 Statistics & Analytics:\n📈 View your booking stats\n📅 Track monthly performance\n👥 See total students booked\n💯 Get insights on peak hours\n🎯 Improve scheduling strategy\n\nAvailable on faculty dashboard!",
    ],
  },

  // Mobile app specific
  mobile_features: {
    keywords: ['app', 'mobile app', 'ios', 'android', 'phone', 'offline', 'push notification'],
    replies: [
      "📱 Mobile App Features:\n🔔 Push notifications for bookings\n💾 Works offline (limited features)\n🔄 Auto-sync when online\n⚡ Optimized for mobile\n🎯 Faster than web version\n\nDownload Expo Go for testing!",
    ],
  },

  // Default response
  default: {
    keywords: [],
    replies: [
      "😊 I'm not sure I understood that. Here are things I can help with:\n• Booking & scheduling\n• Finding faculty\n• Canceling/rescheduling\n• Account & login help\n• Technical support\n• Ratings & reviews\n• Chat & messaging\n• Documents & files\n\nFeel free to ask about any of these!",
    ],
  },
};

/**
 * Analyze user message and return appropriate bot response
 */
export const getBotResponse = (userMessage) => {
  if (!userMessage || userMessage.trim().length === 0) {
    return "Please ask a question or type a message!";
  }

  const lowerMessage = userMessage.toLowerCase().trim();

  // Find matching intent
  for (const [intent, config] of Object.entries(CHATBOT_RESPONSES)) {
    if (intent === 'default') continue;
    
    for (const keyword of config.keywords) {
      if (lowerMessage.includes(keyword)) {
        const randomReply = config.replies[Math.floor(Math.random() * config.replies.length)];
        return randomReply;
      }
    }
  }

  // Return default response if no match found
  const defaultReply = CHATBOT_RESPONSES.default.replies[Math.floor(Math.random() * CHATBOT_RESPONSES.default.replies.length)];
  return defaultReply;
};

/**
 * Format chat message object
 */
export const createChatMessage = (text, sender = 'user', timestamp = new Date()) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    text,
    sender, // 'user' or 'bot'
    timestamp,
  };
};

/**
 * Get suggested quick replies based on context
 */
export const getQuickReplies = (context = 'general') => {
  const quickReplies = {
    general: [
      'How to book a slot?',
      'Find available faculty',
      'Cancel my booking',
      'Message faculty',
      'Check ratings',
      'Technical support',
    ],
    booking: [
      'Find available slots',
      'Reschedule booking',
      'Cancel booking',
      'View my bookings',
      'Share documents',
      'Rate faculty',
    ],
    faculty: [
      'Create a new slot',
      'View my bookings',
      'Manage my slots',
      'Update schedule',
      'Check statistics',
      'Verify status',
    ],
  };

  return quickReplies[context] || quickReplies.general;
};
