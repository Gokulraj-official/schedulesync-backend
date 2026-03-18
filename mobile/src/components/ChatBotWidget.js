import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatBotWidget } from '../context/ChatBotWidgetContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  getBotResponse,
  createChatMessage,
  getQuickReplies,
} from '../services/chatbotService';

const { height, width } = Dimensions.get('window');

const ChatBotWidget = () => {
  const { isVisible, isMinimized, hideWidget, minimizeWidget, toggleWidget } = useChatBotWidget();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flatListRef = useRef(null);

  // Initialize panResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        const screenX = gestureState.moveX;
        const screenY = gestureState.moveY;

        // Snap to edges with margin
        let finalX = screenX > width / 2 ? width - 80 : 20;
        let finalY = Math.max(80, Math.min(screenY, height - 100));

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: finalX,
            useNativeDriver: false,
          }),
          Animated.spring(pan.y, {
            toValue: finalY,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  // Initialize chatbot
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = createChatMessage(
        'Hi! 👋 Need help with your bookings?',
        'bot'
      );
      setMessages([welcomeMessage]);
      setQuickReplies(getQuickReplies('general'));
    }
  }, []);

  // Update unread count
  useEffect(() => {
    const botMessages = messages.filter(m => m.sender === 'bot');
    const userMessages = messages.filter(m => m.sender === 'user');
    if (botMessages.length > userMessages.length && isMinimized) {
      setUnreadCount(botMessages.length - userMessages.length);
    }
  }, [messages, isMinimized]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = createChatMessage(messageText, 'user');
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMsg = createChatMessage(botResponse, 'bot');
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 600);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="chatbubble-ellipses" size={16} color={colors.surface} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isBot
              ? { backgroundColor: colors.grey, marginRight: '10%' }
              : { backgroundColor: colors.primary, marginLeft: '10%' },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isBot ? colors.text : colors.surface,
              },
            ]}
            numberOfLines={10}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (!isVisible) {
    return null;
  }

  // Minimized view
  if (isMinimized) {
    return (
      <Animated.View
        style={[
          styles.minimizedContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.minimizedButton, { backgroundColor: colors.primary }]}
          onPress={() => toggleWidget()}
        >
          <Ionicons name="chatbubble" size={24} color={colors.surface} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Expanded view
  return (
    <Animated.View
      style={[
        styles.expandedContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      <View style={[styles.widget, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={[styles.widgetHeader, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={[styles.widgetTitle, { color: colors.surface }]}>
              Support Bot
            </Text>
            <Text style={[styles.widgetStatus, { color: 'rgba(255,255,255,0.8)' }]}>
              Online
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => minimizeWidget()}>
              <Ionicons name="chevron-down" size={22} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => minimizeWidget()} style={{ marginLeft: 8 }}>
              <Ionicons name="close" size={22} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.widgetMessagesList}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        )}

        {/* Quick Replies */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.quickRepliesContainer, { borderTopColor: colors.grey }]}
          >
            {quickReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickReplyButton, { borderColor: colors.primary }]}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={[styles.quickReplyText, { color: colors.primary }]} numberOfLines={1}>
                  {reply}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[styles.widgetInputContainer, { borderTopColor: colors.grey }]}>
          <TextInput
            style={[
              styles.widgetInput,
              {
                backgroundColor: colors.grey,
                color: colors.text,
              },
            ]}
            placeholder="Type here..."
            placeholderTextColor={colors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={60}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSendMessage(inputText)}
            disabled={loading || !inputText.trim()}
          >
            <Ionicons name="send" size={18} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Minimized
  minimizedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  minimizedButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Expanded
  expandedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  widget: {
    width: 320,
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'column',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  widgetStatus: {
    fontSize: 11,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  widgetMessagesList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickRepliesContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxHeight: 40,
  },
  quickReplyButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 3,
  },
  quickReplyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  widgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  widgetInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxHeight: 60,
    fontSize: 13,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBotWidget;
