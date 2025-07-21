import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import SettingsService from '../../services/SettingsService';
import { NativeModules } from 'react-native';

const { BasicConfigModule } = NativeModules;

const LoginScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    sipAddress: 'sip:bob@freeims.net',
    password: 'bob',
    serverAddress: '10.0.2.2',
    port: '4060',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 如果有传入的初始数据，使用它们
    if (route?.params?.initialData) {
      setFormData(prev => ({
        ...prev,
        ...route.params.initialData,
      }));
    } else {
      // 尝试从设置中加载现有数据
      loadExistingSettings();
    }
  }, [route?.params?.initialData]);

  const loadExistingSettings = async () => {
    try {
      const sipAddress = await SettingsService.getSetting('account.sipAddress', 'sip:bob@freeims.net');
      const serverAddress = await SettingsService.getSetting('server.pcscfAddress', '10.0.2.2');
      const port = await SettingsService.getSetting('server.port', '4060');

      setFormData(prev => ({
        ...prev,
        sipAddress,
        serverAddress,
        port,
        // 不加载密码，让用户重新输入，但保持默认值
        password: 'bob',
      }));
    } catch (error) {
      console.error('加载现有设置失败:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 验证SIP地址
    if (!formData.sipAddress.trim()) {
      newErrors.sipAddress = 'SIP地址不能为空';
    } else if (!formData.sipAddress.includes('@')) {
      newErrors.sipAddress = 'SIP地址格式不正确，应包含@符号';
    }

    // 验证密码
    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空';
    }

    // 验证服务器地址
    if (!formData.serverAddress.trim()) {
      newErrors.serverAddress = '服务器地址不能为空';
    }

    // 验证端口号
    const port = parseInt(formData.port);
    if (!formData.port.trim() || isNaN(port) || port <= 0 || port > 65535) {
      newErrors.port = '端口号必须是1-65535之间的数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatSipAddress = (address) => {
    if (!address) {return '';}

    // 移除可能的sip:前缀
    let cleanAddress = address.replace(/^sip:/, '');

    // 确保包含@符号
    if (!cleanAddress.includes('@')) {
      // 如果只有用户名，添加默认域名
      cleanAddress = `${cleanAddress}@freeims.net`;
    }

    return cleanAddress;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 格式化SIP地址
      const formattedSipAddress = formatSipAddress(formData.sipAddress);

      // 准备设置数据
      const settingsToSave = {
        'account.sipAddress': formattedSipAddress,
        'account.password': formData.password,
        'server.pcscfAddress': formData.serverAddress.trim(),
        'server.port': formData.port.trim(),
        'account.autoLogin': true, // 登录成功后启用自动登录
        'account.rememberPassword': true,
      };

      // 保存设置
      await SettingsService.saveMultipleSettings(settingsToSave);

      // 使用原生模块测试连接
      if (BasicConfigModule && BasicConfigModule.testSipConnection) {
        try {
          const testResult = await BasicConfigModule.testSipConnection({
            sipAddress: formattedSipAddress,
            password: formData.password,
            pcscfAddress: formData.serverAddress.trim(),
            port: formData.port.trim(),
          });

          if (!testResult.success) {
            Alert.alert(
              '连接测试失败',
              testResult.message || '无法连接到SIP服务器，请检查配置信息',
              [
                {
                  text: '继续登录',
                  onPress: () => proceedToHome(),
                },
                {
                  text: '重新配置',
                  style: 'cancel',
                },
              ]
            );
            return;
          }
        } catch (testError) {
          console.warn('SIP连接测试失败:', testError);
          // 测试失败不阻止登录，只记录警告
          Alert.alert(
            '连接测试异常',
            '无法执行连接测试，但配置已保存。您可以稍后在设置中重新测试。',
            [
              {
                text: '继续',
                onPress: () => proceedToHome(),
              },
              {
                text: '重新配置',
                style: 'cancel',
              },
            ]
          );
          return;
        }
      } else {
        console.warn('BasicConfigModule不可用，跳过连接测试');
      }

      // 登录成功，导航到主界面
      proceedToHome();

    } catch (error) {
      console.error('登录失败:', error);
      Alert.alert(
        '登录失败',
        error.message || '登录过程中发生错误，请重试',
        [{ text: '确定' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToHome = () => {
    // 重置导航堆栈，确保不能返回登录界面
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleSkip = () => {
    Alert.alert(
      '跳过登录',
      '跳过登录将无法使用SIP功能，您可以稍后在设置中配置。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定跳过',
          onPress: () => proceedToHome(),
        },
      ]
    );
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>SIP账号登录</Text>
            <Text style={styles.subtitle}>
              请填写您的SIP账号信息以使用通讯功能
            </Text>
          </View>

          <View style={styles.form}>
            {/* SIP地址 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SIP地址 *</Text>
              <TextInput
                style={[styles.input, errors.sipAddress && styles.inputError]}
                placeholder="例如: sip:bob@freeims.net"
                placeholderTextColor="#999"
                value={formData.sipAddress}
                onChangeText={(value) => updateField('sipAddress', value)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              {errors.sipAddress && (
                <Text style={styles.errorText}>{errors.sipAddress}</Text>
              )}
            </View>

            {/* 密码 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码 *</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="请输入密码"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* 服务器地址 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>服务器地址 *</Text>
              <TextInput
                style={[styles.input, errors.serverAddress && styles.inputError]}
                placeholder="例如: 10.0.2.2"
                placeholderTextColor="#999"
                value={formData.serverAddress}
                onChangeText={(value) => updateField('serverAddress', value)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {errors.serverAddress && (
                <Text style={styles.errorText}>{errors.serverAddress}</Text>
              )}
            </View>

            {/* 端口号 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>端口号 *</Text>
              <TextInput
                style={[styles.input, errors.port && styles.inputError]}
                placeholder="4060"
                placeholderTextColor="#999"
                value={formData.port}
                onChangeText={(value) => updateField('port', value)}
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.port && (
                <Text style={styles.errorText}>{errors.port}</Text>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>跳过</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              提示：如果您没有SIP账号，可以使用免费的IMS服务
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;
