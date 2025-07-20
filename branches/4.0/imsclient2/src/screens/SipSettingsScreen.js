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
  Modal,
} from 'react-native';
import SettingsService from '../services/SettingsService';

const SipSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    // 账号信息
    sipAddress: '',
    password: '',
    autoLogin: false,
    rememberPassword: false,
    showOnlineStatus: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadSipSettings();
  }, []);

  const loadSipSettings = async () => {
    try {
      setLoading(true);
      const sipSettings = await SettingsService.getSipSettings();
      setSettings(sipSettings);
    } catch (error) {
      console.error('加载SIP设置失败:', error);
      Alert.alert('错误', '加载SIP设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // 验证和格式化SIP地址
      const sipAddress = settings.sipAddress.trim();
      if (!sipAddress) {
        Alert.alert('错误', '请输入SIP地址');
        return;
      }
      
      // SIP地址格式验证
      if (!isValidSipAddress(sipAddress)) {
        Alert.alert('错误', '请输入有效的SIP地址格式 (例如: user@domain.com)');
        return;
      }
      
      if (!settings.password.trim()) {
        Alert.alert('错误', '请输入密码');
        return;
      }

      // 格式化SIP地址
      const formattedSettings = {
        ...settings,
        sipAddress: formatSipAddress(sipAddress)
      };

      await SettingsService.saveSipSettings(formattedSettings);
      Alert.alert('成功', 'SIP设置保存成功', [
        {
          text: '确定',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('保存SIP设置失败:', error);
      Alert.alert('错误', '保存SIP设置失败');
    }
  };

  const handleTestConnection = async () => {
    Alert.alert(
      '测试连接',
      '是否要测试当前SIP配置的连接？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '测试',
          onPress: async () => {
            try {
              // 这里可以调用SIP测试逻辑
              Alert.alert('提示', '连接测试功能暂未实现');
            } catch (error) {
              Alert.alert('测试失败', error.message);
            }
          }
        }
      ]
    );
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * 验证SIP地址格式
   * @param {string} sipAddress - SIP地址
   * @returns {boolean} - 是否有效
   */
  const isValidSipAddress = (sipAddress) => {
    if (!sipAddress || typeof sipAddress !== 'string') {
      return false;
    }
    
    // 移除可能的sip:前缀
    let address = sipAddress.toLowerCase();
    if (address.startsWith('sip:')) {
      address = address.substring(4);
    }
    
    // 基本格式检查: user@domain
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(address);
  };

  /**
   * 格式化SIP地址
   * 确保地址格式一致，不包含sip:前缀
   * @param {string} sipAddress - 原始SIP地址
   * @returns {string} - 格式化后的SIP地址
   */
  const formatSipAddress = (sipAddress) => {
    if (!sipAddress) {
      return '';
    }
    
    let address = sipAddress.trim().toLowerCase();
    
    // 移除sip:前缀（如果存在）
    if (address.startsWith('sip:')) {
      address = address.substring(4);
    }
    
    return address;
  };

  const renderInput = (label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? '隐藏' : '显示'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIP账号设置</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 账号信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账号信息</Text>
          
          {renderInput(
            'SIP地址',
            settings.sipAddress,
            (text) => updateSetting('sipAddress', text),
            '例如: user@domain.com',
            false,
            'email-address'
          )}
          
          {renderInput(
            '密码',
            settings.password,
            (text) => updateSetting('password', text),
            '请输入登录密码',
            true
          )}
          
          {renderSwitchItem(
            '记住密码',
            '下次启动时自动填入密码',
            settings.rememberPassword,
            (value) => updateSetting('rememberPassword', value)
          )}
          
          {renderSwitchItem(
            '自动登录',
            '应用启动时自动尝试SIP注册',
            settings.autoLogin,
            (value) => updateSetting('autoLogin', value)
          )}
          
          {renderSwitchItem(
            '显示在线状态',
            '让联系人看到您的在线状态',
            settings.showOnlineStatus,
            (value) => updateSetting('showOnlineStatus', value)
          )}
        </View>

        {/* 服务器设置链接 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服务器设置</Text>
          <TouchableOpacity 
            style={styles.serverSettingsLink}
            onPress={() => navigation.navigate('ServerSettings')}
          >
            <View style={styles.linkContent}>
              <Text style={styles.linkLabel}>服务器配置</Text>
              <Text style={styles.linkSubtitle}>点击配置SIP服务器参数</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
            <Text style={styles.testButtonText}>测试连接</Text>
          </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
    padding: 16,
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
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
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
  presetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
  },
  presetContent: {
    flex: 1,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  presetValue: {
    fontSize: 16,
    color: '#007AFF',
  },
  arrow: {
    fontSize: 20,
    color: '#999999',
    marginLeft: 8,
  },
  serverSettingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  linkContent: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  buttonSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  testButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SipSettingsScreen;
