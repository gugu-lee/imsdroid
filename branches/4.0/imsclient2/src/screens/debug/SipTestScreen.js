import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeModules } from 'react-native';
import { DatabaseService } from '../../services/DatabaseService';
import { SettingsService } from '../../services/SettingsService';

const { LoginModule, SettingsDbModule } = NativeModules;

const SipTestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [sipStatus, setSipStatus] = useState('未连接');
  const [testSettings, setTestSettings] = useState({
    sipAddress: 'sip:test@example.com',
    password: 'testpass',
    pcscfAddress: 'sip.example.com',
    port: '5060',
    useSSL: false,
  });

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const settings = await SettingsService.getSipSettings();
      if (settings.sipAddress) {
        setTestSettings(settings);
      }
    } catch (error) {
      console.error('加载当前设置失败:', error);
    }
  };

  const testDatabaseReading = async () => {
    try {
      setLoading(true);

      // 测试Java端读取数据库
      const javaSipSettings = await SettingsDbModule.getSipSettings();
      console.log('Java端SIP设置:', javaSipSettings);

      // 测试JavaScript端读取数据库
      const jsSipSettings = await SettingsService.getSipSettings();
      console.log('JavaScript端SIP设置:', jsSipSettings);

      // 比较两端结果
      const comparison = {
        java: javaSipSettings,
        javascript: jsSipSettings,
        match: JSON.stringify(javaSipSettings) === JSON.stringify(jsSipSettings),
      };

      Alert.alert(
        '数据库读取测试',
        `Java端设置:\n${JSON.stringify(javaSipSettings, null, 2)}\n\n` +
        `JS端设置:\n${JSON.stringify(jsSipSettings, null, 2)}\n\n` +
        `数据一致性: ${comparison.match ? '✅ 一致' : '❌ 不一致'}`,
        [{ text: '确定' }]
      );

    } catch (error) {
      console.error('数据库读取测试失败:', error);
      Alert.alert('测试失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTestSettings = async () => {
    try {
      setLoading(true);

      // 保存到数据库
      await SettingsService.saveSipSettings(testSettings);

      Alert.alert('保存成功', '测试设置已保存到数据库');

    } catch (error) {
      console.error('保存测试设置失败:', error);
      Alert.alert('保存失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSipRegistration = async () => {
    try {
      setLoading(true);
      setSipStatus('连接中...');

      // 先保存当前测试设置
      await saveTestSettings();

      // 等待一下让数据库操作完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 尝试SIP注册
      const result = await LoginModule.loginWithDatabaseSettings();
      console.log('SIP注册结果:', result);

      if (result.success) {
        setSipStatus('已连接');
        Alert.alert('注册成功', result.message || 'SIP注册成功');
      } else {
        setSipStatus('连接失败');
        Alert.alert('注册失败', result.message || 'SIP注册失败');
      }

    } catch (error) {
      console.error('SIP注册测试失败:', error);
      setSipStatus('连接失败');
      Alert.alert('测试失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      setLoading(true);

      const result = await LoginModule.logout();
      console.log('SIP注销结果:', result);

      setSipStatus('已断开');
      Alert.alert('注销成功', 'SIP连接已断开');

    } catch (error) {
      console.error('SIP注销失败:', error);
      Alert.alert('注销失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (sipStatus) {
      case '已连接': return '#4CAF50';
      case '连接中...': return '#FF9800';
      case '连接失败': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIP测试</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* SIP状态 */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>SIP状态</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {sipStatus}
            </Text>
          </View>
        </View>

        {/* 测试设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测试设置</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SIP地址</Text>
            <TextInput
              style={styles.textInput}
              value={testSettings.sipAddress}
              onChangeText={(text) => setTestSettings({...testSettings, sipAddress: text})}
              placeholder="sip:user@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>密码</Text>
            <TextInput
              style={styles.textInput}
              value={testSettings.password}
              onChangeText={(text) => setTestSettings({...testSettings, password: text})}
              placeholder="输入密码"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PCSCF地址</Text>
            <TextInput
              style={styles.textInput}
              value={testSettings.pcscfAddress}
              onChangeText={(text) => setTestSettings({...testSettings, pcscfAddress: text})}
              placeholder="sip.example.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>端口</Text>
            <TextInput
              style={styles.textInput}
              value={testSettings.port}
              onChangeText={(text) => setTestSettings({...testSettings, port: text})}
              placeholder="5060"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTestSettings({...testSettings, useSSL: !testSettings.useSSL})}
          >
            <View style={[styles.checkbox, testSettings.useSSL && styles.checkboxChecked]}>
              {testSettings.useSSL && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>使用SSL</Text>
          </TouchableOpacity>
        </View>

        {/* 测试按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.testButton, styles.primaryButton]}
            onPress={testDatabaseReading}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '测试中...' : '测试数据库读取'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={saveTestSettings}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              保存测试设置
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.successButton]}
            onPress={testSipRegistration}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '连接中...' : '测试SIP注册'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.dangerButton]}
            onPress={testLogout}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              SIP注销
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>处理中...</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonSection: {
    marginTop: 10,
  },
  testButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default SipTestScreen;
