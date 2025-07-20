import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import SettingsService from '../services/SettingsService';

const AdvancedSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    // 账号高级设置
    rememberPassword: false,
    showOnlineStatus: true,
    
    // 服务器高级设置
    useSSL: false,
    registrationTimeout: '3600',
    keepAliveInterval: '30',
    preset: 'custom',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdvancedSettings();
  }, []);

  const loadAdvancedSettings = async () => {
    try {
      setLoading(true);
      
      const [accountSettings, serverSettings] = await Promise.all([
        SettingsService.getAccountSettings(),
        SettingsService.getServerSettings()
      ]);
      
      setSettings({
        // 账号高级设置
        rememberPassword: accountSettings.rememberPassword || false,
        showOnlineStatus: accountSettings.showOnlineStatus !== false,
        
        // 服务器高级设置
        useSSL: serverSettings.useSSL || false,
        registrationTimeout: serverSettings.registrationTimeout || '3600',
        keepAliveInterval: serverSettings.keepAliveInterval || '30',
        preset: serverSettings.preset || 'custom',
      });
    } catch (error) {
      console.error('加载高级设置失败:', error);
      Alert.alert('错误', '加载高级设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 验证设置
      if (!validateAdvancedSettings()) {
        return;
      }

      // 保存设置
      await Promise.all([
        SettingsService.saveAccountSettings({
          rememberPassword: settings.rememberPassword,
          showOnlineStatus: settings.showOnlineStatus,
        }),
        SettingsService.saveServerSettings({
          useSSL: settings.useSSL,
          registrationTimeout: settings.registrationTimeout,
          keepAliveInterval: settings.keepAliveInterval,
          preset: settings.preset,
        })
      ]);

      Alert.alert('成功', '高级设置保存成功', [
        {
          text: '确定',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('保存高级设置失败:', error);
      Alert.alert('错误', '保存高级设置失败');
    } finally {
      setSaving(false);
    }
  };

  const validateAdvancedSettings = () => {
    // 验证注册超时时间
    const timeout = parseInt(settings.registrationTimeout);
    if (isNaN(timeout) || timeout < 60 || timeout > 7200) {
      Alert.alert('错误', '注册超时时间应在60-7200秒之间');
      return false;
    }
    
    // 验证保活间隔
    const interval = parseInt(settings.keepAliveInterval);
    if (isNaN(interval) || interval < 10 || interval > 300) {
      Alert.alert('错误', '保活间隔应在10-300秒之间');
      return false;
    }
    
    return true;
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderInput = (label, value, onChangeText, placeholder, options = {}) => {
    const {
      keyboardType = 'default',
      suffix = '',
      helpText = ''
    } = options;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
        </View>
        {helpText && <Text style={styles.helpText}>{helpText}</Text>}
      </View>
    );
  };

  const renderSwitchItem = (title, subtitle, value, onValueChange) => (
    <View style={styles.switchItem}>
      <View style={styles.switchContent}>
        <Text style={styles.switchTitle}>{title}</Text>
        {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#007AFF' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  const handleResetDefaults = () => {
    Alert.alert(
      '重置默认值',
      '确定要重置所有高级设置为默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            setSettings({
              rememberPassword: false,
              showOnlineStatus: true,
              useSSL: false,
              registrationTimeout: '3600',
              keepAliveInterval: '30',
              preset: 'custom',
            });
            Alert.alert('成功', '已重置为默认值');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>高级设置</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载设置中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 账号高级设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账号高级设置</Text>
          
          {renderSwitchItem(
            '记住密码',
            '下次启动时自动填入密码',
            settings.rememberPassword,
            (value) => updateSetting('rememberPassword', value)
          )}
          
          {renderSwitchItem(
            '显示在线状态',
            '让联系人看到您的在线状态',
            settings.showOnlineStatus,
            (value) => updateSetting('showOnlineStatus', value)
          )}
        </View>

        {/* 服务器高级设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服务器高级设置</Text>
          
          {renderSwitchItem(
            '使用SSL/TLS',
            '启用安全传输层协议',
            settings.useSSL,
            (value) => updateSetting('useSSL', value)
          )}
          
          {renderInput(
            '注册超时时间',
            settings.registrationTimeout,
            (text) => updateSetting('registrationTimeout', text),
            '3600',
            { 
              keyboardType: 'numeric',
              suffix: '秒',
              helpText: '建议值: 3600秒 (1小时)，范围: 60-7200秒'
            }
          )}
          
          {renderInput(
            '保活间隔',
            settings.keepAliveInterval,
            (text) => updateSetting('keepAliveInterval', text),
            '30',
            { 
              keyboardType: 'numeric',
              suffix: '秒',
              helpText: '网络保活心跳间隔，范围: 10-300秒'
            }
          )}
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetDefaults}
          >
            <Text style={styles.resetButtonText}>恢复默认设置</Text>
          </TouchableOpacity>
        </View>

        {/* 设置说明 */}
        <View style={styles.hintSection}>
          <Text style={styles.hintTitle}>设置说明</Text>
          <Text style={styles.hintText}>
            • 记住密码：保存密码到本地，下次启动自动填入{'\n'}
            • 显示在线状态：向其他用户展示您的在线状态{'\n'}
            • SSL/TLS：使用加密连接，端口通常为5061{'\n'}
            • 注册超时：SIP注册的有效期，过期后需重新注册{'\n'}
            • 保活间隔：发送心跳包的频率，保持连接活跃
          </Text>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity 
          style={styles.saveButtonMain} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonMainText}>保存高级设置</Text>
          )}
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputSuffix: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#666666',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    lineHeight: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchContent: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#ff9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hintSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  saveButtonMain: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    marginHorizontal: 16,
  },
  saveButtonMainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedSettingsScreen;
