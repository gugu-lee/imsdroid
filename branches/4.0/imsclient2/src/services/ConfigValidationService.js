import SettingsService from './SettingsService';

/**
 * 配置验证服务
 * 用于检查SIP配置是否完整
 */
class ConfigValidationService {

  /**
   * 检查基本SIP配置是否完整
   * @returns {Promise<{isComplete: boolean, missingFields: string[], data: Object}>}
   */
  async checkBasicConfig() {
    try {
      const sipAddress = await SettingsService.getSetting('account.sipAddress', '');
      const password = await SettingsService.getSetting('account.password', '');
      const serverAddress = await SettingsService.getSetting('server.pcscfAddress', '');
      const port = await SettingsService.getSetting('server.port', '');

      const config = {
        sipAddress: sipAddress.trim(),
        password: password.trim(),
        serverAddress: serverAddress.trim(),
        port: port.trim(),
      };

      const missingFields = [];

      // 检查SIP地址
      if (!config.sipAddress) {
        missingFields.push('SIP地址');
      } else if (!config.sipAddress.includes('@')) {
        missingFields.push('SIP地址格式');
      }

      // 检查密码
      if (!config.password) {
        missingFields.push('密码');
      }

      // 检查服务器地址
      if (!config.serverAddress) {
        missingFields.push('服务器地址');
      }

      // 检查端口号
      if (!config.port) {
        missingFields.push('端口号');
      } else {
        const portNum = parseInt(config.port);
        if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
          missingFields.push('端口号格式');
        }
      }

      const isComplete = missingFields.length === 0;

      return {
        isComplete,
        missingFields,
        data: config,
      };

    } catch (error) {
      console.error('检查配置失败:', error);
      return {
        isComplete: false,
        missingFields: ['配置检查失败'],
        data: {},
      };
    }
  }

  /**
   * 获取配置建议
   * @param {Object} currentConfig - 当前配置
   * @returns {Object} 配置建议
   */
  getConfigSuggestions(currentConfig = {}) {
    const suggestions = {};

    // SIP地址建议
    if (!currentConfig.sipAddress || !currentConfig.sipAddress.includes('@')) {
      suggestions.sipAddress = 'user@ims.freeims.net';
    }

    // 服务器地址建议
    if (!currentConfig.serverAddress) {
      suggestions.serverAddress = 'pcscf.freeims.net';
    }

    // 端口号建议
    if (!currentConfig.port || isNaN(parseInt(currentConfig.port))) {
      suggestions.port = '4060';
    }

    return suggestions;
  }

  /**
   * 验证单个配置项
   * @param {string} field - 字段名
   * @param {string} value - 值
   * @returns {Object} 验证结果
   */
  validateField(field, value) {
    const result = {
      isValid: true,
      error: null,
      suggestion: null,
    };

    switch (field) {
      case 'sipAddress':
        if (!value || !value.trim()) {
          result.isValid = false;
          result.error = 'SIP地址不能为空';
          result.suggestion = 'user@ims.freeims.net';
        } else if (!value.includes('@')) {
          result.isValid = false;
          result.error = 'SIP地址必须包含@符号';
          result.suggestion = `${value}@ims.freeims.net`;
        }
        break;

      case 'password':
        if (!value || !value.trim()) {
          result.isValid = false;
          result.error = '密码不能为空';
        } else if (value.length < 3) {
          result.isValid = false;
          result.error = '密码长度至少3位';
        }
        break;

      case 'serverAddress':
        if (!value || !value.trim()) {
          result.isValid = false;
          result.error = '服务器地址不能为空';
          result.suggestion = 'pcscf.freeims.net';
        }
        break;

      case 'port':
        const portNum = parseInt(value);
        if (!value || isNaN(portNum)) {
          result.isValid = false;
          result.error = '端口号必须是数字';
          result.suggestion = '4060';
        } else if (portNum <= 0 || portNum > 65535) {
          result.isValid = false;
          result.error = '端口号必须在1-65535之间';
          result.suggestion = '4060';
        }
        break;

      default:
        result.error = '未知的配置项';
    }

    return result;
  }

  /**
   * 检查是否启用自动登录
   * @returns {Promise<boolean>}
   */
  async isAutoLoginEnabled() {
    try {
      const autoLogin = await SettingsService.getSetting('account.autoLogin', false);
      return autoLogin === true || autoLogin === 'true';
    } catch (error) {
      console.error('检查自动登录失败:', error);
      return false;
    }
  }

  /**
   * 获取完整的启动配置检查结果
   * @returns {Promise<Object>}
   */
  async getStartupConfigStatus() {
    try {
      const configCheck = await this.checkBasicConfig();
      const autoLoginEnabled = await this.isAutoLoginEnabled();

      return {
        configComplete: configCheck.isComplete,
        autoLoginEnabled,
        shouldShowLogin: !configCheck.isComplete || !autoLoginEnabled,
        missingFields: configCheck.missingFields,
        currentConfig: configCheck.data,
        suggestions: this.getConfigSuggestions(configCheck.data),
      };

    } catch (error) {
      console.error('获取启动配置状态失败:', error);
      return {
        configComplete: false,
        autoLoginEnabled: false,
        shouldShowLogin: true,
        missingFields: ['配置检查失败'],
        currentConfig: {},
        suggestions: this.getConfigSuggestions(),
      };
    }
  }
}

export default new ConfigValidationService();
