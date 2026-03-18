import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  getBotResponse, 
  createChatMessage, 
  getQuickReplies 
} from '../../services/chatbotService';

const ChatBotScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  // Initialize chatbot
  useEffect(() => {
    const welcomeMessage = createChatMessage(
      `👋 Hi ${user?.firstName || 'there'}! I'm your Booking Support Bot. I can help you with:\n\n• Booking slots\n• Finding available faculty\n• Managing your appointments\n• Account help\n\nWhat would you like to know?`,
      'bot'
    );
    setMessages([welcomeMessage]);
    setQuickReplies(getQuickReplies('general'));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMsg = createChatMessage(messageText, 'user');
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Simulate bot thinking time
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
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.surface} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isBot
              ? { backgroundColor: colors.grey, marginRight: '15%' }
              : { backgroundColor: colors.primary, marginLeft: '15%' },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isBot ? colors.text : colors.surface,
              },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {
                color: isBot ? colors.secondaryText : 'rgba(255,255,255,0.7)',
              },
            ]}
          >
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.surface }]}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.surface} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.headerText, { color: colors.surface }]}>
            Booking Support
          </Text>
          <Text style={[styles.headerSubtext, { color: 'rgba(255,255,255,0.8)' }]}>
            Always here to help
          </Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Bot is typing...
          </Text>
        </View>
      )}

      {/* Quick Replies */}
      {messages.length <= 1 && quickReplies.length > 0 && (
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
              <Text style={[styles.quickReplyText, { color: colors.primary }]}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { borderTopColor: colors.grey }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.grey,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.secondaryText}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxHeight={100}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSendMessage(inputText)}
          disabled={loading || !inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={colors.surface}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  quickRepliesContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 50,
  },
  quickReplyButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBotScreen;
