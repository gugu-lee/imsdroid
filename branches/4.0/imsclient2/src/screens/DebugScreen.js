import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeModules } from 'react-native';
import { DatabaseService } from '../services/DatabaseService';

const { SettingsDbModule } = NativeModules;

const DebugScreen = ({ navigation }) => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      console.log('Loading debug info...');
      
      // 获取Java端数据库信息
      const javaDebugInfo = await SettingsDbModule.getDebugInfo();
      console.log('Java debug info:', javaDebugInfo);
      
      // 获取JavaScript端数据库信息
      const jsDbInfo = await DatabaseService.getDebugInfo();
      console.log('JS debug info:', jsDbInfo);
      
      setDebugInfo({
        java: javaDebugInfo,
        javascript: jsDbInfo,
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
      Alert.alert('错误', `加载调试信息失败: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDebugInfo();
  };

  const testDatabaseConnection = async () => {
    try {
      // 测试写入和读取
      const testKey = 'debug.test';
      const testValue = `测试值 ${Date.now()}`;
      
      await DatabaseService.saveSetting(testKey, testValue);
      const retrievedValue = await DatabaseService.getSetting(testKey);
      
      if (retrievedValue === testValue) {
        Alert.alert('测试成功', '数据库连接正常，读写操作成功');
      } else {
        Alert.alert('测试失败', `写入值: ${testValue}\n读取值: ${retrievedValue}`);
      }
    } catch (error) {
      Alert.alert('测试失败', `数据库测试失败: ${error.message}`);
    }
  };

  const clearAllSettings = async () => {
    Alert.alert(
      '确认清空',
      '这将清空所有设置数据，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.clearAllSettings();
              Alert.alert('清空成功', '所有设置已清空');
              loadDebugInfo();
            } catch (error) {
              Alert.alert('清空失败', error.message);
            }
          },
        },
      ]
    );
  };

  const renderDebugSection = (title, data) => {
    if (!data) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.dataRow}>
            <Text style={styles.dataKey}>{key}:</Text>
            <Text style={styles.dataValue}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </Text>
          </View>
        ))}
      </View>
    );
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
        <Text style={styles.headerTitle}>数据库调试</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDebugInfo}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? '加载中...' : '刷新'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {debugInfo && (
          <>
            <Text style={styles.timestamp}>
              最后更新: {debugInfo.timestamp}
            </Text>

            {renderDebugSection('Java端数据库信息', debugInfo.java)}
            {renderDebugSection('JavaScript端数据库信息', debugInfo.javascript)}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={testDatabaseConnection}
              >
                <Text style={styles.buttonText}>测试数据库连接</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllSettings}
              >
                <Text style={styles.buttonText}>清空所有设置</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!debugInfo && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无调试信息</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDebugInfo}>
              <Text style={styles.buttonText}>重试</Text>
            </TouchableOpacity>
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
  refreshButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  dataRow: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  dataKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  actionButtons: {
    marginTop: 20,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default DebugScreen;
