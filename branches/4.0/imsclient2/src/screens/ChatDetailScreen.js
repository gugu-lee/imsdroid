import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  NativeModules,
} from 'react-native';
import databaseService from '../services/DatabaseService';

const { LoginModule } = NativeModules;

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatName = '张三', chatId } = route?.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let targetChatId = currentChatId;
      
      // 如果没有chatId，通过chatName查找
      if (!targetChatId) {
        targetChatId = await databaseService.getChatIdByName(chatName);
        setCurrentChatId(targetChatId);
      }
      
      if (targetChatId) {
        const messageList = await databaseService.getMessagesByChatId(targetChatId);
        setMessages(messageList);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      Alert.alert('错误', '加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 滚动到最新消息
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() && currentChatId) {
      try {
        const messageText = message.trim();
        setMessage('');

        // 获取接收者的SIP地址
        const sipAddress = await databaseService.getSipAddressByName(chatName);
        if (!sipAddress) {
          console.warn('未找到用户的SIP地址:', chatName);
          Alert.alert('错误', '未找到用户的SIP地址');
          return;
        }

        // 添加到数据库
        await databaseService.addMessage(currentChatId, messageText, true);
        
        // 重新加载消息列表
        await loadMessages();

        // 通过SIP发送消息
        try {
          await LoginModule.sendTextMessage(sipAddress, messageText);
          console.log('SIP消息发送成功到:', sipAddress);
        } catch (sipError) {
          console.error('SIP发送失败:', sipError);
          Alert.alert('发送失败', '消息发送失败，请检查网络连接');
          // 即使SIP发送失败，消息仍保留在本地数据库中
        }

      } catch (error) {
        console.error('发送消息失败:', error);
        Alert.alert('错误', '发送消息失败');
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isMyMessage ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.messageTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chatName}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* 输入框 */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.voiceButton}>
            <Text style={styles.voiceButtonText}>🎤</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="请输入消息..."
            placeholderTextColor="#999999"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiButtonText}>😊</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          
          {message.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    color: '#000000',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: '#07c160',
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
    marginHorizontal: 4,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  voiceButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#ffffff',
  },
  emojiButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emojiButtonText: {
    fontSize: 20,
  },
  addButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  sendButton: {
    backgroundColor: '#07c160',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatDetailScreen;
