import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';

const AboutSettingsScreen = ({ navigation }) => {
  const handleOpenUrl = (url) => {
    Linking.openURL(url).catch(err => console.error('无法打开链接:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>关于</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 应用信息 */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Image
              source={{ uri: 'https://picsum.photos/80/80?random=app' }}
              style={styles.appIcon}
            />
            <Text style={styles.appName}>IMS Chat</Text>
            <Text style={styles.appVersion}>版本 1.0.0</Text>
            <Text style={styles.buildNumber}>Build 2024.01.15</Text>
          </View>
        </View>

        {/* 应用描述 */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用介绍</Text>
          <Text style={styles.description}>
            IMS Chat 是一款基于 IMS (IP Multimedia Subsystem) 技术的即时通讯应用。
            支持 SIP 协议的实时消息传输，为用户提供稳定、安全的通讯体验。
          </Text>
        </View> */}

        {/* 功能特性 */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要功能</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• 基于 SIP 协议的即时消息</Text>
            <Text style={styles.featureItem}>• 支持文本、表情符号</Text>
            <Text style={styles.featureItem}>• 离线消息存储</Text>
            <Text style={styles.featureItem}>• 多设备同步</Text>
            <Text style={styles.featureItem}>• 端到端加密</Text>
          </View>
        </View> */}

        {/* 技术信息 */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>技术信息</Text>
          <View style={styles.techInfo}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>框架</Text>
              <Text style={styles.techValue}>React Native 0.79.2</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>SIP 协议</Text>
              <Text style={styles.techValue}>RFC 3261</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>数据库</Text>
              <Text style={styles.techValue}>SQLite</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>平台</Text>
              <Text style={styles.techValue}>Android / iOS</Text>
            </View>
          </View>
        </View> */}

        {/* 链接 */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>相关链接</Text>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenUrl('https://github.com/example/ims-chat')}
          >
            <Text style={styles.linkIcon}>🔗</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>GitHub 项目</Text>
              <Text style={styles.linkUrl}>github.com/example/ims-chat</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenUrl('https://example.com/privacy')}
          >
            <Text style={styles.linkIcon}>🔒</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>隐私政策</Text>
              <Text style={styles.linkUrl}>example.com/privacy</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenUrl('https://example.com/terms')}
          >
            <Text style={styles.linkIcon}>📋</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>用户协议</Text>
              <Text style={styles.linkUrl}>example.com/terms</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity> */}
        </View>

        {/* 开发信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开发信息</Text>
          <View style={styles.developerInfo}>
            <Text style={styles.developerText}>开发者: IMS Chat Team</Text>
            <Text style={styles.developerText}>联系邮箱: support@example.com</Text>
            <Text style={styles.developerText}>技术支持: tech@example.com</Text>
          </View>
        </View>

        {/* 版权信息 */}
        <View style={styles.section}>
          <Text style={styles.copyright}>
            © 2024 IMS Chat Team. All rights reserved.
          </Text>
          <Text style={styles.license}>
            Licensed under MIT License
          </Text>
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
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  buildNumber: {
    fontSize: 12,
    color: '#999999',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 24,
  },
  techInfo: {
    marginTop: 8,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  techLabel: {
    fontSize: 14,
    color: '#666666',
  },
  techValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: '#007AFF',
  },
  arrow: {
    fontSize: 20,
    color: '#c0c0c0',
  },
  developerInfo: {
    marginTop: 8,
  },
  developerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 8,
  },
  license: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AboutSettingsScreen;
