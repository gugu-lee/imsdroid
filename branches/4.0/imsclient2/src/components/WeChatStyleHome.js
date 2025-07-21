import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatScreen from '../screens/chat/ChatScreen';
import settingsService from '../services/SettingsService';

const Tab = createBottomTabNavigator();

// 通讯录页面组件
const ContactsScreen = ({ navigation }) => (
  <SafeAreaView style={styles.screenContainer}>
    <View style={styles.friendsHeader}>
      <Text style={styles.header}>通讯录</Text>
      <TouchableOpacity
        style={styles.addFriendButton}
        onPress={() => navigation.navigate('AddFriend')}
      >
        <Icon name="person-add" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
    <View style={styles.content}>
      <TouchableOpacity
        style={styles.friendsMenuCard}
        onPress={() => navigation.navigate('Friends')}
      >
        <View style={styles.friendsIconContainer}>
          <Icon name="group" size={32} color="#ffffff" />
        </View>
        <View style={styles.friendsTextContainer}>
          <Text style={styles.friendsTitle}>我的好友</Text>
          <Text style={styles.friendsSubtitle}>查看和管理好友列表</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.friendsMenuCard}
        onPress={() => navigation.navigate('AddFriend')}
      >
        <View style={[styles.friendsIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Icon name="person-add" size={32} color="#ffffff" />
        </View>
        <View style={styles.friendsTextContainer}>
          <Text style={styles.friendsTitle}>添加好友</Text>
          <Text style={styles.friendsSubtitle}>通过SIP地址添加新好友</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// 发现页面组件
const DiscoverScreen = () => (
  <SafeAreaView style={styles.screenContainer}>
    <Text style={styles.header}>发现</Text>
    <View style={styles.content}>
      <Text style={styles.contentText}>这里是发现页面</Text>
    </View>
  </SafeAreaView>
);

// 我的页面组件
const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    nickname: '用户名称',
    signature: '个性签名',
    avatar: 'https://via.placeholder.com/60',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await settingsService.getProfileSettings();
      setUserProfile({
        nickname: profile.nickname,
        signature: profile.signature,
        avatar: profile.avatar,
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text style={styles.header}>我</Text>
      <View style={styles.content}>
        {/* 用户信息区域 */}
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigation.navigate('ProfileSettings')}
        >
          <Image
            source={{ uri: userProfile.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userProfile.nickname}</Text>
            <Text style={styles.userSignature}>{userProfile.signature}</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* 功能菜单 */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="settings" size={24} color="#007AFF" />
            </View>
            <Text style={styles.menuText}>设置</Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const WeChatStyleHome = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '聊天') {
            iconName = 'chat';
          } else if (route.name === '通讯录') {
            iconName = 'contacts';
          } else if (route.name === '发现') {
            iconName = 'explore';
          } else if (route.name === '我') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1AAD19',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="聊天"
        children={() => <ChatScreen navigation={navigation} />}
      />
      <Tab.Screen
        name="通讯录"
        children={() => <ContactsScreen navigation={navigation} />}
      />
      <Tab.Screen name="发现" component={DiscoverScreen} />
      <Tab.Screen
        name="我"
        children={() => <ProfileScreen navigation={navigation} />}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1,
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  // 用户信息样式
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 5,
  },
  userSignature: {
    fontSize: 14,
    color: '#666666',
  },
  // 菜单样式
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  // 好友页面样式
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1,
  },
  addFriendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  friendsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  friendsTextContainer: {
    flex: 1,
  },
  friendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  friendsSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
});

export default WeChatStyleHome;
