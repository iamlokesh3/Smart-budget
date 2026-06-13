import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Send, Trash2, MessageSquare, Bot, Sparkles } from 'lucide-react-native';
import { generateResponse, SUGGESTED_PROMPTS } from '../utils/chatEngine';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Chatbot() {
  const { chatHistory, addChatMessage, clearChat, transactions, budgets, goals, user, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef(null);

  const context = { transactions, budgets, goals, user };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory, typing]);

  const messages = chatHistory.length === 0
    ? [{
        id: 'welcome',
        role: 'bot',
        text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your Smart Budget AI advisor. How can I help you today?`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]
    : chatHistory;

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(userMsg);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const botText = generateResponse(text, context);
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }, 800 + Math.random() * 400);
  };

  const renderMessageText = (text, textColor) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold text parser (**bold**)
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <Text key={i} style={[styles.messageLine, { color: textColor }]}>
          {parts.map((p, j) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <Text key={j} style={{ fontWeight: '800', color: textColor }}>{p.slice(2, -2)}</Text>;
            }
            return p;
          })}
        </Text>
      );
    });
  };

  const renderChatItem = ({ item }) => {
    const isBot = item.role === 'bot';
    
    return (
      <View style={[styles.chatMsgContainer, isBot ? styles.botAlign : styles.userAlign]}>
        {isBot && (
          <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
            <Bot size={13} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={[
            styles.bubble,
            isBot 
              ? [styles.botBubble, { backgroundColor: colors.input }] 
              : [styles.userBubble, { backgroundColor: colors.blue }]
          ]}>
            <View>
              {renderMessageText(item.text, isBot ? colors.textPrimary : '#ffffff')}
            </View>
          </View>
          <Text style={[styles.timeText, { color: colors.textMuted, textAlign: isBot ? 'left' : 'right' }]}>
            {item.time}
          </Text>
        </View>
        {!isBot && (
          <View style={[styles.avatar, styles.userAvatar, { backgroundColor: colors.textSecondary }]}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>You</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[themeStyles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <View style={themeStyles.flexRow}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Smart Budget AI</Text>
              <View style={themeStyles.flexRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.emerald }]} />
                <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>Always online</Text>
              </View>
            </View>
          </View>

          {chatHistory.length > 0 && (
            <TouchableOpacity onPress={clearChat} style={styles.trashBtn}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Message flatlist */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageScroll}
          ListFooterComponent={
            typing ? (
              <View style={[styles.chatMsgContainer, styles.botAlign]}>
                <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
                  <Bot size={13} color="#fff" />
                </View>
                <View style={[styles.bubble, styles.botBubble, { backgroundColor: colors.input, width: 60, paddingVertical: 10 }]}>
                  <ActivityIndicator size="small" color={colors.blue} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggested prompts list (only shown on empty history) */}
        {chatHistory.length === 0 && (
          <View style={styles.suggestions}>
            <Text style={[styles.suggestionLabel, { color: colors.textMuted }]}>SUGGESTED PROMPTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
              {SUGGESTED_PROMPTS.map(p => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.suggestBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleSend(p)}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat input footer */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[themeStyles.input, styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ask me about your finances..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.blue }]} 
            disabled={!input.trim()}
            onPress={() => handleSend(input)}
          >
            <Send size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  trashBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2'
  },
  messageScroll: {
    padding: 16,
    gap: 16
  },
  chatMsgContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%'
  },
  botAlign: {
    justifyContent: 'flex-start'
  },
  userAlign: {
    justifyContent: 'flex-end'
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  userAvatar: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '85%'
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start'
  },
  userBubble: {
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end'
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  messageLine: {
    fontSize: 14,
    lineHeight: 18
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    paddingHorizontal: 4
  },
  suggestions: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  suggestionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8
  },
  suggestionScroll: {
    gap: 6
  },
  suggestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1
  },
  inputBox: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingVertical: 8,
    paddingRight: 40
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  }
});
