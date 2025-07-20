import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const menuItems = [
    {
      id: 'profile',
      title: '个人信息',
      subtitle: '头像、昵称等',
      icon: '👤',
      screen: 'ProfileSettings'
    },
    {
      id: 'sip',
      title: 'SIP设置',
      subtitle: 'SIP账号、服务器配置、连接设置',
      icon: '📞',
      screen: 'SipSettings'
    },
    {
      id: 'server',
      title: '服务器配置',
      subtitle: 'PCSCF地址、端口号',
      icon: '🌐',
      screen: 'ServerSettings'
    },
    {
      id: 'app',
      title: '应用设置',
      subtitle: '主题、语言、通知等',
      icon: '⚙️',
      screen: 'AppSettings'
    },
    {
      id: 'privacy',
      title: '隐私设置',
      subtitle: '已读回执、在线状态等',
      icon: '🔒',
      screen: 'PrivacySettings'
    },
    {
      id: 'about',
      title: '关于',
      subtitle: '版本信息',
      icon: 'ℹ️',
      screen: 'AboutSettings'
    }
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigation?.navigate(item.screen)}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: 'https://picsum.photos/80/80?random=1' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>用户名</Text>
            <Text style={styles.userStatus}>在线</Text>
          </View>
        </View>

        {/* 设置菜单 */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 10,
    marginHorizontal: 16,
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#07c160',
  },
  menuSection: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  arrow: {
    fontSize: 20,
    color: '#c0c0c0',
  },
});

export default SettingsScreen;
