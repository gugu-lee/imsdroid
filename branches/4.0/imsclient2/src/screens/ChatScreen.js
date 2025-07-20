import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import databaseService from '../services/DatabaseService';

const { MessageModule } = NativeModules;

const ChatScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初始化数据库并加载聊天列表
  useEffect(() => {
    initializeDatabase();
    setupMessageListeners();
    
    return () => {
      // 清理事件监听器
      DeviceEventEmitter.removeAllListeners('onNewMessage');
      DeviceEventEmitter.removeAllListeners('onChatListUpdate');
    };
  }, []);

  // 设置消息事件监听器
  const setupMessageListeners = () => {
    try {
      if (MessageModule) {
        // 初始化原生模块
        MessageModule.initialize();
        
        // 使用 DeviceEventEmitter 监听事件
        DeviceEventEmitter.addListener('onNewMessage', (messageData) => {
          console.log('收到新消息:', messageData);
          handleNewMessage(messageData);
        });
        
        DeviceEventEmitter.addListener('onChatListUpdate', () => {
          console.log('聊天列表需要更新');
          loadChatList();
        });
      } else {
        console.warn('MessageModule 不可用');
      }
    } catch (error) {
      console.error('设置消息监听器失败:', error);
    }
  };

  // 处理新消息
  const handleNewMessage = (messageData) => {
    const { fromUser, messageText, timestamp } = messageData;
    
    console.log(`收到来自 ${fromUser} 的新消息: ${messageText}`);
    
    // 直接刷新聊天列表，不显示弹窗提示
    loadChatList();
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await databaseService.initDB();
      await loadChatList();
    } catch (error) {
      console.error('数据库初始化失败:', error);
      Alert.alert('错误', '数据库初始化失败');
    } finally {
      setLoading(false);
    }
  };

  const loadChatList = async () => {
    try {
      const chats = await databaseService.getChatList();
      setChatData(chats);
    } catch (error) {
      console.error('加载聊天列表失败:', error);
      Alert.alert('错误', '加载聊天列表失败');
    }
  };

  // 搜索聊天
  const searchChats = async (text) => {
    setSearchText(text);
    try {
      if (text.trim()) {
        const searchResults = await databaseService.searchChats(text);
        setChatData(searchResults);
      } else {
        await loadChatList();
      }
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 删除聊天记录
  const deleteChat = async (chatId, chatName) => {
    Alert.alert(
      '删除聊天',
      `确定要删除与"${chatName}"的聊天记录吗？此操作不可撤销。`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteChat(chatId);
              await loadChatList(); // 重新加载列表
              Alert.alert('成功', '聊天记录已删除');
            } catch (error) {
              console.error('删除聊天失败:', error);
              Alert.alert('错误', '删除聊天记录失败');
            }
          },
        },
      ]
    );
  };

  // 清空聊天消息
  const clearChatMessages = async (chatId, chatName) => {
    Alert.alert(
      '清空聊天记录',
      `确定要清空与"${chatName}"的聊天记录吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.clearChatMessages(chatId);
              await loadChatList();
              Alert.alert('成功', '聊天记录已清空');
            } catch (error) {
              console.error('清空聊天失败:', error);
              Alert.alert('错误', '清空聊天记录失败');
            }
          },
        },
      ]
    );
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      activeOpacity={0.7}
      onPress={() => navigation?.navigate('ChatDetail', { 
        chatName: item.name,
        chatId: item.id 
      })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // 渲染滑动后的隐藏按钮
  const renderHiddenItem = ({ item }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => clearChatMessages(item.id, item.name)}
      >
        <Text style={styles.hiddenButtonText}>清空</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteChat(item.id, item.name)}
      >
        <Text style={styles.hiddenButtonText}>删除</Text>
      </TouchableOpacity>
    </View>
  );

  // 准备SwipeListView的数据格式
  const swipeListData = chatData.map(item => ({ key: item.id, ...item }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>微信</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索"
            value={searchText}
            onChangeText={searchChats}
            placeholderTextColor="#999999"
          />
        </View>
      </View>

      {/* 聊天列表 */}
      <SwipeListView
        data={swipeListData}
        renderItem={renderChatItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={loading}
        onRefresh={loadChatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  chatList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#07c160',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#ff4d4f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#f0f0f0',
    marginLeft: 78,
  },
  // 滑动删除相关样式
  hiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingRight: 16,
  },
  clearButton: {
    backgroundColor: '#ffa500',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  hiddenButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
