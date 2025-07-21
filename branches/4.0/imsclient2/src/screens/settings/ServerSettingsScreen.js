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
} from 'react-native';
import settingsService from '../../services/SettingsService';

const ServerSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    pcscfAddress: '',
    port: '5060',
    useSSL: false,
    registrationTimeout: '3600',
    keepAliveInterval: '30',
    preset: 'custom',
  });
  const [loading, setLoading] = useState(true);

  // 加载服务器设置
  useEffect(() => {
    loadServerSettings();
  }, []);

  const loadServerSettings = async () => {
    try {
      setLoading(true);
      const server = await settingsService.getServerSettings();
      setSettings(server);
    } catch (error) {
      console.error('加载服务器设置失败:', error);
      Alert.alert('错误', '加载服务器设置失败');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      if (!settings.pcscfAddress.trim()) {
        Alert.alert('错误', '请输入PCSCF地址');
        return;
      }
      if (!settings.port.trim() || isNaN(settings.port) || parseInt(settings.port) <= 0 || parseInt(settings.port) > 65535) {
        Alert.alert('错误', '请输入有效的端口号 (1-65535)');
        return;
      }

      const serverData = {
        pcscfAddress: settings.pcscfAddress.trim(),
        port: settings.port.trim(),
        useSSL: settings.useSSL,
        registrationTimeout: settings.registrationTimeout,
        keepAliveInterval: settings.keepAliveInterval,
        preset: settings.preset,
      };

      await settingsService.saveServerSettings(serverData);
      Alert.alert('保存成功', '服务器设置已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('保存服务器设置失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const handleTestConnection = () => {
    Alert.alert('连接测试', '正在测试服务器连接...');
    // 这里可以添加服务器连接测试逻辑
  };

  const handlePresetSelect = async (presetKey) => {
    try {
      await settingsService.applyServerPreset(presetKey);
      // 重新加载设置
      await loadServerSettings();
      Alert.alert('成功', '预设配置已应用');
    } catch (error) {
      console.error('应用预设配置失败:', error);
      Alert.alert('错误', '应用预设配置失败');
    }
  };

  const getPresetData = () => {
    return settingsService.getServerPresets();
  };

  const handleReset = () => {
    Alert.alert(
      '重置配置',
      '确定要重置为默认配置吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            setSettings({
              pcscfAddress: 'pcscf.freeims.net',
              port: '5060',
              useSSL: false,
              registrationTimeout: '3600',
              keepAliveInterval: '30',
              preset: 'custom',
            });
            Alert.alert('重置成功', '已恢复默认配置');
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>服务器配置</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PCSCF服务器设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PCSCF服务器</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>服务器地址</Text>
            <TextInput
              style={styles.textInput}
              value={settings.pcscfAddress}
              onChangeText={(text) => updateSetting('pcscfAddress', text)}
              placeholder="pcscf.example.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>端口号</Text>
            <TextInput
              style={styles.textInput}
              value={settings.port}
              onChangeText={(text) => updateSetting('port', text)}
              placeholder="5060"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={styles.switchItem}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>使用SSL/TLS</Text>
              <Text style={styles.switchSubtitle}>启用安全连接</Text>
            </View>
            <Switch
              value={settings.useSSL}
              onValueChange={(value) => updateSetting('useSSL', value)}
              trackColor={{ false: '#e5e5e5', true: '#07c160' }}
              thumbColor={settings.useSSL ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 注册设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>注册设置</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>注册过期时间 (秒)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.registrationTimeout}
              onChangeText={(text) => updateSetting('registrationTimeout', text)}
              placeholder="3600"
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>
              建议值: 3600 (1小时)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Keep-Alive间隔 (秒)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.keepAliveInterval}
              onChangeText={(text) => updateSetting('keepAliveInterval', text)}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 网络设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>网络设置</Text>

          <View style={styles.presetContainer}>
            <Text style={styles.presetTitle}>预设配置</Text>

            <TouchableOpacity style={styles.presetItem}>
              <Text style={styles.presetName}>FreeIMS (默认)</Text>
              <Text style={styles.presetDesc}>pcscf.freeims.net:5060</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.presetItem}>
              <Text style={styles.presetName}>本地测试</Text>
              <Text style={styles.presetDesc}>192.168.1.100:5060</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
            <Text style={styles.testButtonText}>测试连接</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>重置为默认</Text>
          </TouchableOpacity>
        </View>

        {/* 连接状态 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>连接状态</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>服务器状态</Text>
            <Text style={[styles.statusValue, styles.connected]}>已连接</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>延迟</Text>
            <Text style={styles.statusValue}>45ms</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>最后连接</Text>
            <Text style={styles.statusValue}>2024-01-15 10:30:45</Text>
          </View>
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
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchText: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  presetContainer: {
    marginTop: 8,
  },
  presetTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  presetItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 2,
  },
  presetDesc: {
    fontSize: 12,
    color: '#666666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ff9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statusValue: {
    fontSize: 16,
    color: '#000000',
  },
  connected: {
    color: '#07c160',
  },
});

export default ServerSettingsScreen;
