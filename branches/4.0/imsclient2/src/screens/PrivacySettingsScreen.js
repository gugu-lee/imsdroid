import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import SettingsService from '../services/SettingsService';

const PrivacySettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    readReceipts: true,
    typingIndicator: true,
    lastSeenVisible: true,
    profilePhotoVisible: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const privacySettings = await SettingsService.getPrivacySettings();
      setSettings(privacySettings);
    } catch (error) {
      console.error('加载隐私设置失败:', error);
      Alert.alert('错误', '加载隐私设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await SettingsService.savePrivacySettings(settings);
      Alert.alert('成功', '隐私设置保存成功');
    } catch (error) {
      console.error('保存隐私设置失败:', error);
      Alert.alert('错误', '保存隐私设置失败');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSwitchItem = (title, subtitle, value, onValueChange, warning = null) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        {warning && <Text style={styles.settingWarning}>{warning}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#007AFF' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoIcon}>
        <Text style={styles.infoIconText}>🔒</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>隐私保护</Text>
        <Text style={styles.infoText}>
          这些设置控制其他用户可以看到您的哪些信息。关闭某些功能可能会影响您的使用体验。
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 信息提示 */}
        {renderInfoSection()}

        {/* 消息隐私 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>消息隐私</Text>
          
          {renderSwitchItem(
            '已读回执',
            '让发送者知道您已阅读他们的消息',
            settings.readReceipts,
            (value) => updateSetting('readReceipts', value),
            !settings.readReceipts ? '关闭后您也无法看到他人的已读状态' : null
          )}
          
          {renderSwitchItem(
            '正在输入指示器',
            '让对方知道您正在输入消息',
            settings.typingIndicator,
            (value) => updateSetting('typingIndicator', value)
          )}
        </View>

        {/* 状态隐私 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>状态隐私</Text>
          
          {renderSwitchItem(
            '最后在线时间',
            '让联系人看到您最后在线的时间',
            settings.lastSeenVisible,
            (value) => updateSetting('lastSeenVisible', value),
            !settings.lastSeenVisible ? '关闭后您也无法看到他人的在线时间' : null
          )}
        </View>

        {/* 个人资料隐私 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人资料隐私</Text>
          
          {renderSwitchItem(
            '头像可见性',
            '允许联系人查看您的头像',
            settings.profilePhotoVisible,
            (value) => updateSetting('profilePhotoVisible', value)
          )}
        </View>

        {/* 隐私级别预设 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速设置</Text>
          
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => {
              setSettings({
                readReceipts: true,
                typingIndicator: true,
                lastSeenVisible: true,
                profilePhotoVisible: true,
              });
            }}
          >
            <View style={styles.presetContent}>
              <Text style={styles.presetTitle}>开放模式</Text>
              <Text style={styles.presetSubtitle}>最大化社交体验，所有信息可见</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => {
              setSettings({
                readReceipts: true,
                typingIndicator: false,
                lastSeenVisible: false,
                profilePhotoVisible: true,
              });
            }}
          >
            <View style={styles.presetContent}>
              <Text style={styles.presetTitle}>平衡模式</Text>
              <Text style={styles.presetSubtitle}>保持基本功能，隐藏状态信息</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => {
              setSettings({
                readReceipts: false,
                typingIndicator: false,
                lastSeenVisible: false,
                profilePhotoVisible: false,
              });
            }}
          >
            <View style={styles.presetContent}>
              <Text style={styles.presetTitle}>隐私模式</Text>
              <Text style={styles.presetSubtitle}>最大化隐私保护，最小信息暴露</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存设置</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  settingContent: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  settingWarning: {
    fontSize: 12,
    color: '#ff9500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  presetContent: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  presetSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  arrow: {
    fontSize: 20,
    color: '#999999',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacySettingsScreen;
