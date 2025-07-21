import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import FriendService from '../../services/FriendService';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set(['default']));
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    loadFriendsData();
  }, []);

  useEffect(() => {
    // 监听导航焦点，当返回此页面时刷新数据
    const unsubscribe = navigation.addListener('focus', () => {
      loadFriendsData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsList, groupsList] = await Promise.all([
        FriendService.getAllFriends(),
        FriendService.getFriendGroups(),
      ]);

      setFriends(friendsList);
      setGroups(groupsList);
    } catch (error) {
      console.error('加载好友数据失败:', error);
      Alert.alert('错误', '加载好友数据失败');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriendsData();
    setRefreshing(false);
  }, []);

  const handleSearch = async (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      try {
        const searchResults = await FriendService.searchFriends(keyword);
        setFriends(searchResults);
      } catch (error) {
        console.error('搜索好友失败:', error);
        Alert.alert('错误', '搜索好友失败');
      }
    } else {
      loadFriendsData();
    }
  };

  const toggleGroup = (groupName) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupName)) {
      newExpandedGroups.delete(groupName);
    } else {
      newExpandedGroups.add(groupName);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const handleFriendPress = (friend) => {
    navigation.navigate('FriendDetail', { friendId: friend.id });
  };

  const handleChatPress = async (friend) => {
    try {
      // 通过SIP地址查找或创建聊天记录
      const databaseService = require('../../services/DatabaseService').default;
      await databaseService.initDB();

      const chatId = await databaseService.getOrCreateChatBySipAddress(
        friend.sipAddress,
        friend.displayName || friend.nickname,
        friend.avatar
      );

      navigation.navigate('ChatDetail', {
        chatId: chatId,
        chatName: friend.displayName || friend.nickname,
        sipAddress: friend.sipAddress,
        friendId: friend.id,
      });
    } catch (error) {
      console.error('创建聊天失败:', error);
      Alert.alert('错误', '无法创建聊天会话');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FF9800';
      case 'busy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '在线';
      case 'away': return '离开';
      case 'busy': return '忙碌';
      default: return '离线';
    }
  };

  const renderFriendItem = (friend) => (
    <TouchableOpacity
      key={friend.id}
      style={styles.friendItem}
      onPress={() => handleFriendPress(friend)}
    >
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          {friend.avatar ? (
            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {(friend.displayName || friend.nickname || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(friend.onlineStatus) },
            ]}
          />
        </View>

        <View style={styles.friendDetails}>
          <Text style={styles.friendName} numberOfLines={1}>
            {friend.displayName || friend.nickname}
          </Text>
          {friend.remark && (
            <Text style={styles.friendRemark} numberOfLines={1}>
              {friend.remark}
            </Text>
          )}
          <Text style={styles.friendStatus} numberOfLines={1}>
            {getStatusText(friend.onlineStatus)}
            {friend.statusMessage && ` - ${friend.statusMessage}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleChatPress(friend)}
      >
        <Text style={styles.chatButtonText}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroupSection = (group) => {
    const groupFriends = friends.filter(f => f.groupName === group.groupName);
    const isExpanded = expandedGroups.has(group.groupName);

    return (
      <View key={group.groupName} style={styles.groupSection}>
        <TouchableOpacity
          style={styles.groupHeader}
          onPress={() => toggleGroup(group.groupName)}
        >
          <Text style={styles.groupHeaderText}>
            {group.groupName === 'default' ? '我的好友' : group.groupName}
            <Text style={styles.groupCount}> ({group.friendCount})</Text>
          </Text>
          <Text style={styles.groupToggle}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.groupContent}>
            {groupFriends.map(renderFriendItem)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载好友列表...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部工具栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>好友</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearchBar(!showSearchBar)}
          >
            <Text style={styles.headerButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Text style={styles.headerButtonText}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索栏 */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索好友..."
            value={searchKeyword}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          <TouchableOpacity
            style={styles.searchClearButton}
            onPress={() => {
              setSearchKeyword('');
              setShowSearchBar(false);
              loadFriendsData();
            }}
          >
            <Text style={styles.searchClearText}>取消</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 好友列表 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {searchKeyword ? (
          // 搜索结果
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>
              搜索结果 ({friends.length})
            </Text>
            {friends.length > 0 ? (
              friends.map(renderFriendItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>没有找到匹配的好友</Text>
              </View>
            )}
          </View>
        ) : (
          // 分组显示
          <View style={styles.groupsList}>
            {groups.length > 0 ? (
              groups.map(renderGroupSection)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>还没有好友</Text>
                <Text style={styles.emptySubtext}>点击右上角 ➕ 添加好友</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    fontSize: 16,
  },
  searchClearButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchClearText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  groupSection: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  groupHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  groupCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666666',
  },
  groupToggle: {
    fontSize: 12,
    color: '#999999',
  },
  groupContent: {
    backgroundColor: '#ffffff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  friendRemark: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 12,
    color: '#999999',
  },
  chatButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 20,
  },
  searchResults: {
    backgroundColor: '#ffffff',
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  groupsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
});

export default FriendsScreen;
