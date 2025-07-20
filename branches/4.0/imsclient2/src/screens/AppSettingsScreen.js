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
  Modal,
} from 'react-native';
import SettingsService from '../services/SettingsService';

const AppSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    language: 'zh-CN',
    theme: 'light',
    fontSize: 'medium',
    autoDownloadImages: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showTimestamp: true,
  });
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  // 配置选项
  const languageOptions = [
    { key: 'zh-CN', label: '中文简体' },
    { key: 'zh-TW', label: '中文繁體' },
    { key: 'en-US', label: 'English' },
    { key: 'ja-JP', label: '日本語' },
  ];

  const themeOptions = [
    { key: 'light', label: '浅色模式' },
    { key: 'dark', label: '深色模式' },
    { key: 'auto', label: '跟随系统' },
  ];

  const fontSizeOptions = [
    { key: 'small', label: '小' },
    { key: 'medium', label: '中' },
    { key: 'large', label: '大' },
    { key: 'extra-large', label: '超大' },
  ];

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      setLoading(true);
      const appSettings = await SettingsService.getAppSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('加载应用设置失败:', error);
      Alert.alert('错误', '加载应用设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await SettingsService.saveAppSettings(settings);
      Alert.alert('成功', '应用设置保存成功');
    } catch (error) {
      console.error('保存应用设置失败:', error);
      Alert.alert('错误', '保存应用设置失败');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderOptionModal = (visible, onClose, title, options, currentValue, onSelect) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  currentValue === option.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option.key);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  currentValue === option.key && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {currentValue === option.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSettingItem = (title, subtitle, onPress, rightComponent) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );

  const renderSwitchItem = (title, subtitle, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#007AFF' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
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
        {/* 显示设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>显示设置</Text>
          
          {renderSettingItem(
            '语言',
            languageOptions.find(opt => opt.key === settings.language)?.label,
            () => setShowLanguageModal(true),
            <Text style={styles.arrow}>›</Text>
          )}
          
          {renderSettingItem(
            '主题',
            themeOptions.find(opt => opt.key === settings.theme)?.label,
            () => setShowThemeModal(true),
            <Text style={styles.arrow}>›</Text>
          )}
          
          {renderSettingItem(
            '字体大小',
            fontSizeOptions.find(opt => opt.key === settings.fontSize)?.label,
            () => setShowFontSizeModal(true),
            <Text style={styles.arrow}>›</Text>
          )}
          
          {renderSwitchItem(
            '显示时间戳',
            '在消息中显示发送时间',
            settings.showTimestamp,
            (value) => updateSetting('showTimestamp', value)
          )}
        </View>

        {/* 媒体设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>媒体设置</Text>
          
          {renderSwitchItem(
            '自动下载图片',
            '使用WLAN时自动下载图片',
            settings.autoDownloadImages,
            (value) => updateSetting('autoDownloadImages', value)
          )}
        </View>

        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知设置</Text>
          
          {renderSwitchItem(
            '声音提醒',
            '接收消息时播放提示音',
            settings.soundEnabled,
            (value) => updateSetting('soundEnabled', value)
          )}
          
          {renderSwitchItem(
            '震动提醒',
            '接收消息时震动提醒',
            settings.vibrationEnabled,
            (value) => updateSetting('vibrationEnabled', value)
          )}
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存设置</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 选择模态框 */}
      {renderOptionModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        '选择语言',
        languageOptions,
        settings.language,
        (value) => updateSetting('language', value)
      )}

      {renderOptionModal(
        showThemeModal,
        () => setShowThemeModal(false),
        '选择主题',
        themeOptions,
        settings.theme,
        (value) => updateSetting('theme', value)
      )}

      {renderOptionModal(
        showFontSizeModal,
        () => setShowFontSizeModal(false),
        '选择字体大小',
        fontSizeOptions,
        settings.fontSize,
        (value) => updateSetting('fontSize', value)
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999999',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default AppSettingsScreen;
