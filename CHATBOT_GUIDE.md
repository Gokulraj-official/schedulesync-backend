# 🤖 Booking Support Chatbot Implementation Guide

## Overview
Your SchedulSync app now includes an intelligent **rule-based Booking Support Chatbot** that helps users with questions about slot bookings, scheduling, and app features.

## Features

### ✅ What's Included
1. **Dedicated ChatBot Screen** - Full-screen chat interface for in-depth conversations
2. **Floating Widget** - Always-accessible chat button that appears in bottom-right corner
3. **Rule-Based Responses** - Intelligent keyword matching for common questions
4. **Quick Replies** - Suggested buttons for faster interaction
5. **Draggable Widget** - Users can move the floating widget around the screen
6. **Unread Badges** - Shows notification count when new messages arrive

### 📂 File Structure
```
mobile/
├── src/
│   ├── components/
│   │   └── ChatBotWidget.js          # Floating widget component
│   ├── context/
│   │   └── ChatBotWidgetContext.js   # State management for widget
│   ├── screens/shared/
│   │   └── ChatBotScreen.js          # Full-screen chat interface
│   ├── services/
│   │   └── chatbotService.js         # AI logic and responses
│   └── navigation/
│       ├── StudentNavigator.js       # Added ChatBot screen
│       └── FacultyNavigator.js       # Added ChatBot screen
└── App.js                             # Updated with providers
```

## 🚀 How to Access the Chatbot

### For Users
1. **Floating Widget**: Look for the chat bubble in the bottom-right corner of any screen
   - Tap to expand the full chat
   - Drag to reposition
   - Minimize or close when done

2. **Full Screen**: Navigate to "Support" from the home screen menu
   - More space for detailed conversations
   - Better for mobile phones

### For Students & Faculty
- Both user roles have access to the chatbot
- The chatbot provides context-aware help based on your role

## 💬 Chatbot Capabilities

The chatbot understands questions about:
- **Booking Management** - How to create, cancel, or reschedule bookings
- **Slot Finding** - How to search and filter available faculty slots
- **Account Help** - Login, password reset, profile management
- **Faculty Features** - Slot creation and management (for faculty users)
- **Technical Support** - App troubleshooting and error handling
- **General Questions** - FAQs and app features

## 🔧 Customizing Bot Responses

To add or modify bot responses, edit `mobile/src/services/chatbotService.js`:

```javascript
const CHATBOT_RESPONSES = {
  // Example intent
  my_topic: {
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    replies: [
      "Response to user's question",
    ],
  },
};
```

### Step-by-Step Customization

1. **Open** `mobile/src/services/chatbotService.js`
2. **Find** the `CHATBOT_RESPONSES` object
3. **Add** a new intent (or modify existing):
   ```javascript
   your_intent_name: {
     keywords: ['word1', 'word2', 'word3'],  // Words that trigger this response
     replies: [
       "Your response here",
       "Alternative response (optional)"
     ],
   }
   ```
4. **Save** and test in the app

### Response Tips
- Use **emoji** for visual appeal: 📅, 🔍, ❌, 👥, 🔔, etc.
- Use **line breaks** (`\n`) for readability
- Provide **actionable steps** when possible
- Include **multiple replies** for variety

## 📱 Widget Behavior

### Minimized State
- Appears as a circular button with unread count
- Draggable to any corner of the screen
- Shows badge when new bot messages arrive

### Expanded State
- Full chat interface (320px wide, 500px tall)
- Shows conversation history
- Input field for typing messages
- Quick reply buttons for common questions

### User Actions
- **Expand**: Tap minimized button
- **Minimize**: Tap chevron-down in header
- **Close**: Tap X button in header
- **Drag**: Click and hold the minimized button
- **Send**: Tap send button or press enter

## 🎨 Styling

The chatbot automatically uses your app's theme colors from `ThemeContext`:
- Primary color for bot avatar and send button
- Surface color for backgrounds
- Grey for message bubbles
- Text colors for readability

To customize colors, edit your theme settings - the chatbot will adapt automatically.

## 🔌 Architecture

### ChatBotWidgetContext
Manages the visibility and state of the floating widget:
- `isVisible` - Whether widget is shown
- `isMinimized` - Whether widget is collapsed
- `showWidget()` - Display the widget
- `hideWidget()` - Hide the widget
- `toggleWidget()` - Toggle expand/collapse

### chatbotService.js
Core chatbot logic:
- `getBotResponse(userMessage)` - Analyzes user input and returns response
- `createChatMessage(text, sender)` - Creates formatted message objects
- `getQuickReplies(context)` - Returns suggested replies

## 🔮 Future Enhancements

Consider these additions:
1. **AI Integration** - Connect to OpenAI or Claude APIs for smarter responses
2. **Chat History** - Save conversations to database
3. **Analytics** - Track common questions and user satisfaction
4. **Multilingual Support** - Support multiple languages
5. **Backend Integration** - Query database for real-time information
6. **Canned Responses** - Admin panel to manage bot responses
7. **Escalation** - Route complex questions to human support
8. **Learning** - Bot learns from user feedback

## 🐛 Troubleshooting

### Widget doesn't appear
- Check that `ChatBotWidgetProvider` wraps the entire app in `App.js`
- Verify `ChatBotWidget` is imported and rendered

### Messages not showing
- Clear app cache and reload
- Check `chatbotService.js` for syntax errors
- Verify keywords are lowercase (matching is case-insensitive)

### Styling issues
- Ensure `useTheme` hook is properly imported
- Check `ThemeContext` provides required color properties
- Verify screen dimensions work on different device sizes

## 📝 Code Examples

### Accessing Widget from Navigation
```javascript
const { showWidget } = useChatBotWidget();

// Open chatbot from any screen
const handleOpenSupport = () => {
  showWidget();
};
```

### Adding Custom Quick Replies
In `chatbotService.js`:
```javascript
export const getQuickReplies = (context = 'general') => {
  const quickReplies = {
    general: [
      'How to book a slot?',
      'How to find available faculty?',
      'Cancel my booking',
      'Technical support',
      'YOUR_NEW_REPLY', // Add here
    ],
  };
  return quickReplies[context] || quickReplies.general;
};
```

## ✅ Testing Checklist

- [ ] Floating widget appears on all screens
- [ ] Widget is draggable
- [ ] Messages send and receive responses
- [ ] Quick replies work correctly
- [ ] Theme colors apply correctly
- [ ] Widget minimizes/maximizes smoothly
- [ ] Text input handles multi-line messages
- [ ] Bot responds to all keyword categories
- [ ] Widget works on both portrait and landscape
- [ ] Performance is smooth (no lag)

## 📞 Support

For issues or questions about the chatbot:
1. Check the troubleshooting section above
2. Review the code in `chatbotService.js` for keyword patterns
3. Test responses with different keyword variations
4. Check browser/app console for errors

---

**Version:** 1.0  
**Last Updated:** March 2026
