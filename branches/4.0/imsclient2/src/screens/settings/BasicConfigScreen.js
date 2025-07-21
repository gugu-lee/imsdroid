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
import SettingsService from '../../services/SettingsService';

const BasicConfigScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    // SIP账号配置
    sipAddress: '',
    password: '',
    autoLogin: false,

    // 服务器配置
    pcscfAddress: '',
    port: '4060',

    // 高级选项
    showAdvanced: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadBasicConfig();
  }, []);

  const loadBasicConfig = async () => {
    try {
      setLoading(true);

      // 并行加载账号和服务器设置
      const [accountSettings, serverSettings] = await Promise.all([
        SettingsService.getAccountSettings(),
        SettingsService.getServerSettings(),
      ]);

      setSettings({
        // SIP账号配置
        sipAddress: accountSettings.sipAddress || '',
        password: accountSettings.password || '',
        autoLogin: accountSettings.autoLogin || false,

        // 服务器配置
        pcscfAddress: serverSettings.pcscfAddress || '',
        port: serverSettings.port || '5060',

        // 界面状态
        showAdvanced: false,
      });
    } catch (error) {
      console.error('加载基本配置失败:', error);
      Alert.alert('错误', '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 验证必填字段
      if (!validateBasicConfig()) {
        return;
      }

      // 格式化和保存设置
      const formattedSettings = formatSettingsForSave();

      // 分别保存账号和服务器设置
      await Promise.all([
        SettingsService.saveAccountSettings({
          sipAddress: formattedSettings.sipAddress,
          password: formattedSettings.password,
          autoLogin: formattedSettings.autoLogin,
        }),
        SettingsService.saveServerSettings({
          pcscfAddress: formattedSettings.pcscfAddress,
          port: formattedSettings.port,
        }),
      ]);

      Alert.alert('成功', '基本配置保存成功', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('保存基本配置失败:', error);
      Alert.alert('错误', '保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const validateBasicConfig = () => {
    // 验证SIP地址
    const sipAddress = settings.sipAddress.trim();
    if (!sipAddress) {
      Alert.alert('错误', '请输入SIP地址');
      return false;
    }

    if (!isValidSipAddress(sipAddress)) {
      Alert.alert('错误', '请输入有效的SIP地址格式 (例如: user@domain.com)');
      return false;
    }

    // 验证密码
    if (!settings.password.trim()) {
      Alert.alert('错误', '请输入密码');
      return false;
    }

    // 验证服务器地址
    const pcscfAddress = settings.pcscfAddress.trim();
    if (!pcscfAddress) {
      Alert.alert('错误', '请输入服务器地址');
      return false;
    }

    if (!isValidServerAddress(pcscfAddress)) {
      Alert.alert('错误', '请输入有效的服务器地址');
      return false;
    }

    // 验证端口号
    const port = settings.port.trim();
    if (!port || isNaN(port) || parseInt(port) <= 0 || parseInt(port) > 65535) {
      Alert.alert('错误', '请输入有效的端口号 (1-65535)');
      return false;
    }

    return true;
  };

  const formatSettingsForSave = () => {
    return {
      sipAddress: formatSipAddress(settings.sipAddress),
      password: settings.password.trim(),
      autoLogin: settings.autoLogin,
      pcscfAddress: settings.pcscfAddress.trim().toLowerCase(),
      port: settings.port.trim(),
    };
  };

  const isValidSipAddress = (sipAddress) => {
    if (!sipAddress || typeof sipAddress !== 'string') {
      return false;
    }

    let address = sipAddress.toLowerCase();
    if (address.startsWith('sip:')) {
      address = address.substring(4);
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(address);
  };

  const isValidServerAddress = (serverAddress) => {
    if (!serverAddress || typeof serverAddress !== 'string') {
      return false;
    }

    // 域名格式验证
    const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // IP地址格式验证
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return domainPattern.test(serverAddress) || ipPattern.test(serverAddress);
  };

  const formatSipAddress = (sipAddress) => {
    if (!sipAddress) {
      return '';
    }

    let address = sipAddress.trim().toLowerCase();
    if (address.startsWith('sip:')) {
      address = address.substring(4);
    }

    return address;
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);

      // 首先验证配置
      if (!validateBasicConfig()) {
        return;
      }

      // 这里可以调用原生模块测试连接
      Alert.alert('提示', '连接测试功能开发中...');

    } catch (error) {
      console.error('测试连接失败:', error);
      Alert.alert('测试失败', error.message || '连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderInput = (label, value, onChangeText, placeholder, options = {}) => {
    const {
      secureTextEntry = false,
      keyboardType = 'default',
      editable = true,
      required = false,
    } = options;

    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.inputLabel}>{label}</Text>
          {required && <Text style={styles.requiredStar}>*</Text>}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, !editable && styles.disabledInput]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
            editable={editable}
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
          <Text style={styles.headerTitle}>基本配置</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载配置中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* SIP账号配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIP账号配置</Text>

          {renderInput(
            'SIP地址',
            settings.sipAddress,
            (text) => updateSetting('sipAddress', text),
            '例如: user@domain.com',
            { keyboardType: 'email-address', required: true }
          )}

          {renderInput(
            '密码',
            settings.password,
            (text) => updateSetting('password', text),
            '请输入登录密码',
            { secureTextEntry: true, required: true }
          )}

          {renderSwitchItem(
            '自动登录',
            '应用启动时自动尝试SIP注册',
            settings.autoLogin,
            (value) => updateSetting('autoLogin', value)
          )}
        </View>

        {/* 服务器配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服务器配置</Text>

          {renderInput(
            '服务器地址',
            settings.pcscfAddress,
            (text) => updateSetting('pcscfAddress', text),
            '例如: pcscf.example.com',
            { keyboardType: 'url', required: true }
          )}

          {renderInput(
            '端口号',
            settings.port,
            (text) => updateSetting('port', text),
            '5060',
            { keyboardType: 'numeric', required: true }
          )}
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.testButtonText}>测试连接</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => navigation.navigate('AdvancedSettings')}
          >
            <Text style={styles.advancedButtonText}>高级设置</Text>
          </TouchableOpacity>
        </View>

        {/* 配置提示 */}
        <View style={styles.hintSection}>
          <Text style={styles.hintTitle}>配置说明</Text>
          <Text style={styles.hintText}>
            • SIP地址：您的SIP账号，格式如 user@domain.com{'\n'}
            • 密码：SIP账号的登录密码{'\n'}
            • 服务器地址：PCSCF服务器的域名或IP地址{'\n'}
            • 端口号：服务器监听端口，通常为5060或5061{'\n'}
            • 自动登录：开启后应用启动时会自动尝试登录
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
            <Text style={styles.saveButtonMainText}>保存基本配置</Text>
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  requiredStar: {
    fontSize: 14,
    color: '#ff3b30',
    marginLeft: 2,
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
  disabledInput: {
    backgroundColor: '#f8f8f8',
    color: '#999999',
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
  buttonSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  advancedButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#666666',
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

export default BasicConfigScreen;
