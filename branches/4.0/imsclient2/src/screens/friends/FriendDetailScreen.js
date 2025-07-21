import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FriendService from '../../services/FriendService';
import callService from '../../services/CallService';

const FriendDetailScreen = ({ route, navigation }) => {
  const { friendId } = route.params;
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendDetail();
  }, [friendId]);

  const loadFriendDetail = async () => {
    try {
      setLoading(true);
      const friendData = await FriendService.getFriendById(friendId);
      if (friendData) {
        setFriend(friendData);
      } else {
        Alert.alert('错误', '好友不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('加载好友详情失败:', error);
      Alert.alert('错误', '加载好友详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioCall = async () => {
    try {
      await callService.makeAudioCall(friend.sipAddress);
      // 导航到通话界面
      navigation.navigate('InCall', {
        callType: 'audio',
        contactName: friend.displayName || friend.nickname,
        sipAddress: friend.sipAddress,
        friendId: friend.id,
        direction: 'outgoing'
      });
    } catch (error) {
      console.error('发起音频通话失败:', error);
      Alert.alert('错误', '无法发起音频通话: ' + error.message);
    }
  };

  const handleVideoCall = async () => {
    try {
      await callService.makeVideoCall(friend.sipAddress);
      // 导航到通话界面
      navigation.navigate('InCall', {
        callType: 'video',
        contactName: friend.displayName || friend.nickname,
        sipAddress: friend.sipAddress,
        friendId: friend.id,
        direction: 'outgoing'
      });
    } catch (error) {
      console.error('发起视频通话失败:', error);
      Alert.alert('错误', '无法发起视频通话: ' + error.message);
    }
  };

  const handleChat = async () => {
    try {
      // 通过SIP地址查找或创建聊天记录
      const databaseService = require('../../services/DatabaseService').default;

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

  const handleEdit = () => {
    navigation.navigate('EditFriend', { friendId: friend.id });
  };

  const handleDelete = () => {
    Alert.alert(
      '删除好友',
      `确定要删除好友 "${friend.displayName || friend.nickname}" 吗？\n删除后将同时删除与该好友的所有聊天记录。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await FriendService.deleteFriend(friend.id);
              Alert.alert('成功', '好友已删除', [
                { text: '确定', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('删除好友失败:', error);
              Alert.alert('错误', '删除好友失败');
            }
          },
        },
      ]
    );
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

  const formatDate = (dateString) => {
    if (!dateString) {return '未知';}
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载好友信息...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>好友信息不存在</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像和基本信息 */}
        <View style={styles.profileSection}>
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

          <Text style={styles.displayName}>
            {friend.displayName || friend.nickname}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(friend.onlineStatus) }]} />
            <Text style={styles.statusText}>
              {getStatusText(friend.onlineStatus)}
              {friend.statusMessage && ` - ${friend.statusMessage}`}
            </Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionSection}>
          {/* 主要操作按钮 */}
          <View style={styles.primaryActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
              <Text style={styles.primaryButtonText}>💬 发送消息</Text>
            </TouchableOpacity>
          </View>
          
          {/* 通话按钮 */}
          <View style={styles.callActions}>
            <TouchableOpacity style={styles.callButton} onPress={handleAudioCall}>
              <Text style={styles.callButtonText}>📞 语音通话</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton} onPress={handleVideoCall}>
              <Text style={styles.callButtonText}>📹 视频通话</Text>
            </TouchableOpacity>
          </View>

          {/* 次要操作按钮 */}
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEdit}>
              <Text style={styles.secondaryButtonText}>✏️ 编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, styles.deleteButton]} onPress={handleDelete}>
              <Text style={[styles.secondaryButtonText, styles.deleteButtonText]}>🗑️ 删除</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 详细信息 */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>详细信息</Text>

          {[
            { label: 'SIP地址', value: friend.sipAddress, icon: '📧' },
            { label: '昵称', value: friend.nickname || '未设置', icon: '👤' },
            { label: '备注', value: friend.remark || '无', icon: '📝' },
            { label: '分组', value: friend.groupName === 'default' ? '我的好友' : friend.groupName, icon: '📁' },
            { label: '手机号', value: friend.phone || '未设置', icon: '📱' },
            { label: '邮箱', value: friend.email || '未设置', icon: '✉️' },
            { label: '添加时间', value: formatDate(friend.addTime), icon: '🕒' },
          ].map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <View style={styles.detailLabel}>
                <Text style={styles.detailIcon}>{item.icon}</Text>
                <Text style={styles.detailLabelText}>{item.label}</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryActions: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  detailSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailLabelText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
});

export default FriendDetailScreen;
