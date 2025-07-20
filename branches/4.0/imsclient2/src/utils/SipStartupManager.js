import { NativeModules, Alert } from 'react-native';
import { SettingsService } from '../services/SettingsService';

const { LoginModule, SettingsDbModule } = NativeModules;

class SipStartupManager {
  static async initializeAndRegister(navigation) {
    try {
      console.log('SIP启动管理器开始初始化...');
      
      // 1. 检查数据库中的SIP配置
      const sipSettings = await SettingsService.getSipSettings();
      console.log('当前SIP设置:', sipSettings);
      
      // 2. 验证配置完整性
      const validation = this.validateSipSettings(sipSettings);
      
      if (!validation.isValid) {
        console.log('SIP配置不完整:', validation.missingFields);
        this.showConfigurationPrompt(navigation, validation.missingFields);
        return { success: false, reason: 'configuration_incomplete' };
      }
      
      // 3. 尝试SIP注册
      console.log('开始SIP注册...');
      
      if (!LoginModule || !LoginModule.loginWithDatabaseSettings) {
        console.error('LoginModule不可用');
        this.showErrorPrompt(navigation, 'SIP服务模块不可用', 'module_unavailable');
        return { success: false, reason: 'module_unavailable' };
      }
      
      const registrationResult = await LoginModule.loginWithDatabaseSettings();
      console.log('SIP注册结果:', registrationResult);
      
      if (registrationResult.success) {
        console.log('SIP注册成功');
        this.showSuccessNotification();
        return { success: true, result: registrationResult };
      } else {
        console.log('SIP注册失败:', registrationResult.message);
        this.showRegistrationFailedPrompt(navigation, registrationResult.message);
        return { success: false, reason: 'registration_failed', error: registrationResult.message };
      }
      
    } catch (error) {
      console.error('SIP初始化过程中发生错误:', error);
      this.showErrorPrompt(navigation, error.message, 'initialization_error');
      return { success: false, reason: 'initialization_error', error: error.message };
    }
  }
  
  static validateSipSettings(settings) {
    const requiredFields = [
      { key: 'sipAddress', name: 'SIP地址' },
      { key: 'password', name: '登录密码' },
      { key: 'pcscfAddress', name: 'PCSCF服务器地址' },
      { key: 'port', name: '服务器端口' }
    ];
    
    const missingFields = [];
    
    for (const field of requiredFields) {
      const value = settings[field.key];
      if (!value || value.toString().trim() === '') {
        missingFields.push(field.name);
      }
    }
    
    // 验证SIP地址格式
    if (settings.sipAddress) {
      const sipAddressPattern = /^sip:[^@]+@.+$/;
      if (!sipAddressPattern.test(settings.sipAddress)) {
        missingFields.push('SIP地址格式');
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
  
  static showConfigurationPrompt(navigation, missingFields) {
    const fieldsList = missingFields.join('、');
    
    Alert.alert(
      '配置不完整',
      `以下配置项尚未设置或格式不正确：\n\n${fieldsList}\n\n请完成配置后重新启动应用。`,
      [
        {
          text: '稍后配置',
          style: 'cancel'
        },
        {
          text: '去配置',
          onPress: () => {
            // 根据缺失字段智能跳转
            if (missingFields.includes('SIP地址') || missingFields.includes('登录密码')) {
              navigation.navigate('SipSettings');
            } else {
              navigation.navigate('ServerSettings');
            }
          }
        }
      ]
    );
  }
  
  static showRegistrationFailedPrompt(navigation, errorMessage) {
    Alert.alert(
      'SIP注册失败',
      `无法连接到SIP服务器：\n\n${errorMessage}\n\n请检查网络连接和服务器配置。`,
      [
        {
          text: '忽略',
          style: 'cancel'
        },
        {
          text: '检查配置',
          onPress: () => {
            // 跳转到服务器设置页面
            navigation.navigate('ServerSettings');
          }
        },
        {
          text: 'SIP测试',
          onPress: () => {
            // 跳转到SIP测试页面
            navigation.navigate('SipTestScreen');
          }
        }
      ]
    );
  }
  
  static showErrorPrompt(navigation, errorMessage, errorType) {
    let title = 'SIP服务错误';
    let message = errorMessage;
    let actions = [
      {
        text: '确定',
        style: 'cancel'
      }
    ];
    
    switch (errorType) {
      case 'module_unavailable':
        title = '服务模块不可用';
        message = 'SIP服务模块加载失败，部分功能可能不可用。';
        actions.push({
          text: '查看调试信息',
          onPress: () => navigation.navigate('DebugScreen')
        });
        break;
        
      case 'initialization_error':
        title = '初始化错误';
        message = `SIP服务初始化失败：\n\n${errorMessage}`;
        actions.push({
          text: '重试配置',
          onPress: () => navigation.navigate('Settings')
        });
        break;
    }
    
    Alert.alert(title, message, actions);
  }
  
  static showSuccessNotification() {
    // 可以使用Toast或其他轻量级通知
    console.log('SIP服务已就绪');
    // 这里可以添加Toast通知，但不使用Alert打断用户
  }
  
  // 静默重试注册（用于设置保存后）
  static async silentRetryRegistration() {
    try {
      if (!LoginModule || !LoginModule.loginWithDatabaseSettings) {
        return { success: false, reason: 'module_unavailable' };
      }
      
      const result = await LoginModule.loginWithDatabaseSettings();
      console.log('静默重试注册结果:', result);
      return result;
    } catch (error) {
      console.error('静默重试注册失败:', error);
      return { success: false, reason: 'retry_failed', error: error.message };
    }
  }
  
  // 检查当前SIP状态
  static async getSipStatus() {
    try {
      if (!LoginModule || !LoginModule.getStatus) {
        return { status: 'unknown', message: 'SIP模块不可用' };
      }
      
      const status = await LoginModule.getStatus();
      return status;
    } catch (error) {
      console.error('获取SIP状态失败:', error);
      return { status: 'error', message: error.message };
    }
  }
}

export default SipStartupManager;
