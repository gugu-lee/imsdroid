/**
 * FCM Token获取工具 - React Native组件
 * 用于手动获取和显示FCM Token
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Clipboard,
} from 'react-native';
import { NativeModules } from 'react-native';
import FcmTestHelper from '../utils/FcmTestHelper';

const { FcmTestModule } = NativeModules;

export default function FcmTokenManager() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // 组件加载时自动获取Token
    handleGetToken();
  }, []);

  /**
   * 获取FCM Token
   */
  const handleGetToken = async () => {
    setLoading(true);
    try {
      console.log('开始获取FCM Token...');
      const fcmToken = await FcmTestHelper.getCurrentToken();
      setToken(fcmToken);
      console.log('FCM Token获取成功:', fcmToken);
      Alert.alert('成功', `Token获取成功\n长度: ${fcmToken.length} 字符`);
    } catch (error) {
      console.error('获取Token失败:', error);
      Alert.alert('失败', `获取Token失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新Token
   */
  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      console.log('开始刷新FCM Token...');
      const newToken = await FcmTestHelper.refreshToken();
      setToken(newToken);
      console.log('FCM Token刷新成功:', newToken);
      Alert.alert('成功', 'Token已刷新');
    } catch (error) {
      console.error('刷新Token失败:', error);
      Alert.alert('失败', `刷新Token失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 复制Token到剪贴板
   */
  const handleCopyToken = () => {
    if (token) {
      Clipboard.setString(token);
      Alert.alert('已复制', 'FCM Token已复制到剪贴板');
    } else {
      Alert.alert('提示', '请先获取Token');
    }
  };

  /**
   * 检查FCM服务状态
   */
  const handleCheckStatus = async () => {
    try {
      const availability = await FcmTestHelper.checkAvailability();
      const debug = await FcmTestHelper.getDebugInfo();
      setDebugInfo({ availability, debug });
      
      Alert.alert(
        'FCM服务状态',
        `Firebase初始化: ${availability.firebaseInitialized ? '✅' : '❌'}\n` +
        `Play Services: ${availability.playServicesAvailable ? '✅' : '❌'}\n` +
        `已保存Token: ${debug.hasToken ? '✅' : '❌'}`
      );
    } catch (error) {
      Alert.alert('检查失败', error.message);
    }
  };

  /**
   * 运行完整测试
   */
  const handleRunFullTest = async () => {
    setLoading(true);
    try {
      const result = await FcmTestHelper.runFullTest();
      console.log('完整测试结果:', result);
      
      if (result.success) {
        Alert.alert(
          '测试完成',
          '所有FCM功能测试通过\n请查看控制台日志获取详细信息'
        );
        if (result.results.token) {
          setToken(result.results.token);
        }
      } else {
        Alert.alert('测试失败', result.error);
      }
    } catch (error) {
      Alert.alert('测试异常', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>FCM Token管理器</Text>
      
      {/* Token显示区域 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前FCM Token:</Text>
        <TextInput
          style={styles.tokenInput}
          value={token}
          editable={false}
          multiline={true}
          placeholder="Token将在这里显示..."
        />
        <TouchableOpacity 
          style={styles.copyButton} 
          onPress={handleCopyToken}
          disabled={!token}
        >
          <Text style={styles.buttonText}>📋 复制Token</Text>
        </TouchableOpacity>
      </View>

      {/* 操作按钮 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作:</Text>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleGetToken}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ 获取中...' : '🔄 获取Token'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]} 
          onPress={handleRefreshToken}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🆕 刷新Token</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonInfo]} 
          onPress={handleCheckStatus}
        >
          <Text style={styles.buttonText}>🔍 检查状态</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonSuccess, loading && styles.buttonDisabled]} 
          onPress={handleRunFullTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🧪 完整测试</Text>
        </TouchableOpacity>
      </View>

      {/* 调试信息 */}
      {debugInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>调试信息:</Text>
          <Text style={styles.debugText}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>
        </View>
      )}

      {/* 使用说明 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用说明:</Text>
        <Text style={styles.helpText}>
          1. 点击"获取Token"按钮获取FCM Token{'\n'}
          2. 复制Token用于测试脚本或服务器配置{'\n'}
          3. 如果获取失败，检查网络和Google Play Services{'\n'}
          4. 使用"完整测试"验证所有FCM功能
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonSecondary: {
    backgroundColor: '#FF9500',
  },
  buttonInfo: {
    backgroundColor: '#5856D6',
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  copyButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});