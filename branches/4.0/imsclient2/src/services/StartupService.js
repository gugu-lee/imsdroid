import { Alert } from 'react-native';
import SettingsService from './SettingsService';
import ConfigValidationService from './ConfigValidationService';
import { NativeModules } from 'react-native';

const { LoginModule, SettingsDbModule } = NativeModules;

class StartupService {
  static navigationRef = null;

  // 设置导航引用
  static setNavigationRef(ref) {
    this.navigationRef = ref;
  }

  // 验证SIP配置是否完整
  static async validateSipConfiguration() {
    try {
      const sipSettings = await SettingsService.getSipSettings();

      // 检查必需的SIP参数
      const requiredFields = {
        sipAddress: sipSettings.sipAddress,
        password: sipSettings.password,
        pcscfAddress: sipSettings.pcscfAddress,
        port: sipSettings.port,
      };

      const missingFields = [];
      const emptyFields = [];

      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value === '') {
          missingFields.push(field);
        }
      }

      // 验证SIP地址格式
      if (sipSettings.sipAddress && !sipSettings.sipAddress.includes('@')) {
        emptyFields.push('sipAddress - 格式不正确');
      }

      // 验证端口号
      if (sipSettings.port && (isNaN(sipSettings.port) || parseInt(sipSettings.port) <= 0)) {
        emptyFields.push('port - 端口号无效');
      }

      return {
        isValid: missingFields.length === 0 && emptyFields.length === 0,
        missingFields,
        invalidFields: emptyFields,
        settings: sipSettings,
      };

    } catch (error) {
      console.error('验证SIP配置失败:', error);
      return {
        isValid: false,
        error: error.message,
        missingFields: ['所有配置'],
        invalidFields: [],
        settings: null,
      };
    }
  }

  // 尝试自动SIP注册
  static async attemptAutoRegistration() {
    try {
      console.log('开始自动SIP注册...');

      // 使用新的配置验证服务
      const configCheck = await ConfigValidationService.checkBasicConfig();

      if (!configCheck.isComplete) {
        console.log('SIP配置不完整:', configCheck.missingFields);
        return {
          success: false,
          reason: 'incomplete_config',
          message: `配置不完整: ${configCheck.missingFields.join(', ')}`,
          validation: configCheck,
        };
      }

      // 配置完整，尝试注册
      if (LoginModule && LoginModule.loginWithDatabaseSettings) {
        const result = await LoginModule.loginWithDatabaseSettings();
        console.log('SIP注册结果:', result);

        if (result.success) {
          return {
            success: true,
            message: result.message || 'SIP注册成功',
          };
        } else {
          return {
            success: false,
            reason: 'registration_failed',
            message: result.message || 'SIP注册失败',
            validation: configCheck,
          };
        }
      } else {
        return {
          success: false,
          reason: 'module_unavailable',
          message: 'SIP模块不可用',
        };
      }

    } catch (error) {
      console.error('自动SIP注册失败:', error);
      return {
        success: false,
        reason: 'error',
        message: error.message,
        error,
      };
    }
  }

  // 显示配置引导对话框
  static showConfigurationGuidance(registrationResult) {
    const { reason, validation, message } = registrationResult;

    let title = 'SIP配置';
    let messageText = '';
    let actions = [];

    switch (reason) {
      case 'incomplete_config':
        title = '配置不完整';
        const missingFieldsText = validation.missingFields.map(field => {
          switch (field) {
            case 'sipAddress': return '• SIP地址';
            case 'password': return '• 登录密码';
            case 'pcscfAddress': return '• 服务器地址';
            case 'port': return '• 服务器端口';
            default: return `• ${field}`;
          }
        }).join('\n');

        const invalidFieldsText = validation.invalidFields.length > 0
          ? '\n\n格式错误的字段:\n' + validation.invalidFields.map(field => `• ${field}`).join('\n')
          : '';

        messageText = `需要完成以下配置才能使用SIP功能:\n\n${missingFieldsText}${invalidFieldsText}`;

        actions = [
          {
            text: '稍后配置',
            style: 'cancel',
          },
          {
            text: '账号设置',
            onPress: () => this.navigateToSipSettings(),
          },
          {
            text: '服务器设置',
            onPress: () => this.navigateToServerSettings(),
          },
        ];
        break;

      case 'registration_failed':
        title = 'SIP注册失败';
        messageText = `配置已完整，但注册失败:\n\n${message}\n\n请检查网络连接和服务器设置。`;

        actions = [
          {
            text: '稍后重试',
            style: 'cancel',
          },
          {
            text: '检查服务器设置',
            onPress: () => this.navigateToServerSettings(),
          },
          {
            text: '重新配置账号',
            onPress: () => this.navigateToSipSettings(),
          },
        ];
        break;

      case 'module_unavailable':
        title = 'SIP模块不可用';
        messageText = 'SIP功能模块暂时不可用，请稍后重试或联系技术支持。';

        actions = [
          {
            text: '确定',
            style: 'cancel',
          },
        ];
        break;

      default:
        title = 'SIP连接失败';
        messageText = `连接失败: ${message}\n\n请检查配置和网络连接。`;

        actions = [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '重新配置',
            onPress: () => this.navigateToSipSettings(),
          },
        ];
        break;
    }

    Alert.alert(title, messageText, actions);
  }

  // 导航到SIP设置页面
  static navigateToSipSettings() {
    if (this.navigationRef && this.navigationRef.current) {
      this.navigationRef.current.navigate('SipSettings');
    }
  }

  // 导航到服务器设置页面
  static navigateToServerSettings() {
    if (this.navigationRef && this.navigationRef.current) {
      this.navigationRef.current.navigate('ServerSettings');
    }
  }

  // 显示成功注册提示
  static showSuccessMessage(message) {
    // 使用简单的控制台日志，避免打扰用户体验
    console.log('✅ SIP注册成功:', message);

    // 可选：显示轻量级的成功提示
    // Toast.show({
    //   text: 'SIP连接成功',
    //   buttonText: '确定',
    //   duration: 3000,
    //   type: 'success'
    // });
  }

  // 主要的启动检查和注册流程
  static async performStartupRegistration() {
    try {
      console.log('开始启动时SIP注册检查...');

      // 检查用户是否启用了自动登录
      const autoLogin = await SettingsService.getSetting('account.autoLogin', false);

      if (!autoLogin) {
        console.log('自动登录已禁用，跳过SIP注册');
        return;
      }

      // 尝试自动注册
      const result = await this.attemptAutoRegistration();

      if (result.success) {
        this.showSuccessMessage(result.message);
      } else {
        // 延迟显示配置引导，让应用完全加载
        setTimeout(() => {
          this.showConfigurationGuidance(result);
        }, 1000);
      }

    } catch (error) {
      console.error('启动时SIP注册检查失败:', error);
    }
  }
}

export { StartupService };
