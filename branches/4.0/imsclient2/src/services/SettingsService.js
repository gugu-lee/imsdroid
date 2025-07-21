import databaseService from './DatabaseService';

/**
 * 用户设置服务类
 * 提供用户设置的读取、保存、更新等功能
 */
class SettingsService {

  // ================== 个人信息设置 ==================

  /**
   * 获取用户个人信息
   */
  async getProfileSettings() {
    try {
      const profile = {
        nickname: await databaseService.getSetting('profile.nickname', '用户名称'),
        signature: await databaseService.getSetting('profile.signature', '这个人很懒，什么都没留下'),
        avatar: await databaseService.getSetting('profile.avatar', 'https://via.placeholder.com/60'),
        gender: await databaseService.getSetting('profile.gender', '未设置'),
        region: await databaseService.getSetting('profile.region', '未设置'),
      };
      return profile;
    } catch (error) {
      console.error('获取个人信息失败:', error);
      throw error;
    }
  }

  /**
   * 保存用户个人信息
   */
  async saveProfileSettings(profile) {
    const keyMapping = {
      nickname: 'profile.nickname',
      signature: 'profile.signature',
      avatar: 'profile.avatar',
      gender: 'profile.gender',
      region: 'profile.region',
    };

    return await this._saveSettingsHelper(profile, keyMapping, '个人信息');
  }

  // ================== 账号设置 ==================

  /**
   * 获取账号设置
   */
  async getAccountSettings() {
    try {
      const account = {
        sipAddress: await databaseService.getSetting('account.sipAddress', ''),
        password: await databaseService.getSetting('account.password', ''),
        autoLogin: await databaseService.getSetting('account.autoLogin', false),
        rememberPassword: await databaseService.getSetting('account.rememberPassword', false),
        showOnlineStatus: await databaseService.getSetting('account.showOnlineStatus', true),
      };
      return account;
    } catch (error) {
      console.error('获取账号设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存账号设置（支持部分更新）
   */
  async saveAccountSettings(account) {
    try {
      // 先获取现有设置，然后只更新提供的字段
      const existingSettings = await this.getAccountSettings();
      const updatedSettings = { ...existingSettings, ...account };

      const keyMapping = {
        sipAddress: 'account.sipAddress',
        password: 'account.password',
        autoLogin: 'account.autoLogin',
        rememberPassword: 'account.rememberPassword',
        showOnlineStatus: 'account.showOnlineStatus',
      };

      return await this._saveSettingsHelper(updatedSettings, keyMapping, '账号设置');
    } catch (error) {
      console.error('保存账号设置失败:', error);
      throw error;
    }
  }

  // ================== SIP设置 ==================

  /**
   * 获取SIP设置（包含账号和服务器设置）
   */
  async getSipSettings() {
    try {
      // 复用现有方法，避免重复代码
      const accountSettings = await this.getAccountSettings();
      const serverSettings = await this.getServerSettings();

      // 合并账号和服务器设置
      const sipSettings = {
        // 账号信息
        sipAddress: accountSettings.sipAddress,
        password: accountSettings.password,
        autoLogin: accountSettings.autoLogin,
        rememberPassword: accountSettings.rememberPassword,
        showOnlineStatus: accountSettings.showOnlineStatus,

        // 服务器配置
        pcscfAddress: serverSettings.pcscfAddress,
        port: serverSettings.port,
        useSSL: serverSettings.useSSL,
        registrationTimeout: serverSettings.registrationTimeout,
        keepAliveInterval: serverSettings.keepAliveInterval,
        preset: serverSettings.preset,
      };

      return sipSettings;
    } catch (error) {
      console.error('获取SIP设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存SIP设置（同时保存账号和服务器设置）
   */
  async saveSipSettings(sipSettings) {
    try {
      // 分离账号和服务器设置
      const accountSettings = {};
      const serverSettings = {};

      // 账号相关设置
      if (sipSettings.sipAddress !== undefined) {accountSettings.sipAddress = sipSettings.sipAddress;}
      if (sipSettings.password !== undefined) {accountSettings.password = sipSettings.password;}
      if (sipSettings.autoLogin !== undefined) {accountSettings.autoLogin = sipSettings.autoLogin;}
      if (sipSettings.rememberPassword !== undefined) {accountSettings.rememberPassword = sipSettings.rememberPassword;}
      if (sipSettings.showOnlineStatus !== undefined) {accountSettings.showOnlineStatus = sipSettings.showOnlineStatus;}

      // 服务器相关设置
      if (sipSettings.pcscfAddress !== undefined) {serverSettings.pcscfAddress = sipSettings.pcscfAddress;}
      if (sipSettings.port !== undefined) {serverSettings.port = sipSettings.port;}
      if (sipSettings.useSSL !== undefined) {serverSettings.useSSL = sipSettings.useSSL;}
      if (sipSettings.registrationTimeout !== undefined) {serverSettings.registrationTimeout = sipSettings.registrationTimeout;}
      if (sipSettings.keepAliveInterval !== undefined) {serverSettings.keepAliveInterval = sipSettings.keepAliveInterval;}
      if (sipSettings.preset !== undefined) {serverSettings.preset = sipSettings.preset;}

      // 使用现有方法保存，避免重复代码
      const savePromises = [];

      if (Object.keys(accountSettings).length > 0) {
        savePromises.push(this.saveAccountSettings(accountSettings));
      }

      if (Object.keys(serverSettings).length > 0) {
        savePromises.push(this.saveServerSettings(serverSettings));
      }

      // 并行保存所有设置
      await Promise.all(savePromises);

      console.log('SIP设置保存成功');
      return true;
    } catch (error) {
      console.error('保存SIP设置失败:', error);
      throw error;
    }
  }

  // ================== 服务器设置 ==================

  /**
   * 获取服务器设置
   */
  async getServerSettings() {
    try {
      const server = {
        pcscfAddress: await databaseService.getSetting('server.pcscfAddress', ''),
        port: await databaseService.getSetting('server.port', '5060'),
        useSSL: await databaseService.getSetting('server.useSSL', false),
        registrationTimeout: await databaseService.getSetting('server.registrationTimeout', '3600'),
        keepAliveInterval: await databaseService.getSetting('server.keepAliveInterval', '30'),
        preset: await databaseService.getSetting('server.preset', 'custom'),
      };
      return server;
    } catch (error) {
      console.error('获取服务器设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存服务器设置（支持部分更新）
   */
  async saveServerSettings(server) {
    try {
      // 先获取现有设置，然后只更新提供的字段
      const existingSettings = await this.getServerSettings();
      const updatedSettings = { ...existingSettings, ...server };

      const keyMapping = {
        pcscfAddress: 'server.pcscfAddress',
        port: 'server.port',
        useSSL: 'server.useSSL',
        registrationTimeout: 'server.registrationTimeout',
        keepAliveInterval: 'server.keepAliveInterval',
        preset: 'server.preset',
      };

      return await this._saveSettingsHelper(updatedSettings, keyMapping, '服务器设置');
    } catch (error) {
      console.error('保存服务器设置失败:', error);
      throw error;
    }
  }

  // ================== 应用设置 ==================

  /**
   * 获取应用设置
   */
  async getAppSettings() {
    try {
      const app = {
        language: await databaseService.getSetting('app.language', 'zh-CN'),
        theme: await databaseService.getSetting('app.theme', 'light'),
        fontSize: await databaseService.getSetting('app.fontSize', 'medium'),
        autoDownloadImages: await databaseService.getSetting('app.autoDownloadImages', true),
        soundEnabled: await databaseService.getSetting('app.soundEnabled', true),
        vibrationEnabled: await databaseService.getSetting('app.vibrationEnabled', true),
        showTimestamp: await databaseService.getSetting('app.showTimestamp', true),
      };
      return app;
    } catch (error) {
      console.error('获取应用设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存应用设置
   */
  async saveAppSettings(app) {
    const keyMapping = {
      language: 'app.language',
      theme: 'app.theme',
      fontSize: 'app.fontSize',
      autoDownloadImages: 'app.autoDownloadImages',
      soundEnabled: 'app.soundEnabled',
      vibrationEnabled: 'app.vibrationEnabled',
      showTimestamp: 'app.showTimestamp',
    };

    return await this._saveSettingsHelper(app, keyMapping, '应用设置');
  }

  // ================== 隐私设置 ==================

  /**
   * 获取隐私设置
   */
  async getPrivacySettings() {
    try {
      const privacy = {
        readReceipts: await databaseService.getSetting('privacy.readReceipts', true),
        typingIndicator: await databaseService.getSetting('privacy.typingIndicator', true),
        lastSeenVisible: await databaseService.getSetting('privacy.lastSeenVisible', true),
        profilePhotoVisible: await databaseService.getSetting('privacy.profilePhotoVisible', true),
      };
      return privacy;
    } catch (error) {
      console.error('获取隐私设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存隐私设置
   */
  async savePrivacySettings(privacy) {
    const keyMapping = {
      readReceipts: 'privacy.readReceipts',
      typingIndicator: 'privacy.typingIndicator',
      lastSeenVisible: 'privacy.lastSeenVisible',
      profilePhotoVisible: 'privacy.profilePhotoVisible',
    };

    return await this._saveSettingsHelper(privacy, keyMapping, '隐私设置');
  }

  // ================== 通用方法 ==================

  /**
   * 通用设置保存辅助方法
   * @param {Object} sourceObject - 源对象
   * @param {Object} keyMapping - 键映射 {sourceKey: dbKey}
   * @param {string} logPrefix - 日志前缀
   */
  async _saveSettingsHelper(sourceObject, keyMapping, logPrefix) {
    try {
      const settings = {};

      for (const [sourceKey, dbKey] of Object.entries(keyMapping)) {
        if (sourceObject[sourceKey] !== undefined) {
          settings[dbKey] = sourceObject[sourceKey];
        }
      }

      if (Object.keys(settings).length > 0) {
        await databaseService.saveMultipleSettings(settings);
        console.log(`${logPrefix}保存成功`);
      }

      return true;
    } catch (error) {
      console.error(`${logPrefix}保存失败:`, error);
      throw error;
    }
  }

  /**
   * 直接保存多个设置项
   * @param {Object} settings - 键值对对象，键为设置项名称，值为设置值
   */
  async saveMultipleSettings(settings) {
    try {
      if (!settings || typeof settings !== 'object') {
        throw new Error('设置数据必须是一个对象');
      }

      if (Object.keys(settings).length === 0) {
        console.log('没有设置需要保存');
        return true;
      }

      await databaseService.saveMultipleSettings(settings);
      console.log('批量设置保存成功:', Object.keys(settings));
      return true;
    } catch (error) {
      console.error('批量保存设置失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有设置
   */
  async getAllSettings() {
    try {
      return await databaseService.getAllSettings();
    } catch (error) {
      console.error('获取所有设置失败:', error);
      throw error;
    }
  }

  /**
   * 重置所有设置到默认值
   */
  async resetAllSettings() {
    try {
      // 删除所有现有设置
      await databaseService.database.executeSql('DELETE FROM user_settings');

      // 重新初始化默认设置
      await databaseService.initializeDefaultSettings();

      console.log('所有设置已重置');
      return true;
    } catch (error) {
      console.error('重置设置失败:', error);
      throw error;
    }
  }

  /**
   * 导出设置为JSON
   */
  async exportSettings() {
    try {
      const settings = await this.getAllSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('导出设置失败:', error);
      throw error;
    }
  }

  /**
   * 从JSON导入设置
   */
  async importSettings(jsonData) {
    try {
      const settings = JSON.parse(jsonData);
      await databaseService.saveMultipleSettings(settings);
      console.log('设置导入成功');
      return true;
    } catch (error) {
      console.error('导入设置失败:', error);
      throw error;
    }
  }

  // ================== 预设配置 ==================

  /**
   * 获取服务器预设配置
   */
  getServerPresets() {
    return {
      custom: {
        name: '自定义',
        pcscfAddress: '',
        port: '5060',
        useSSL: false,
      },
      ims_test: {
        name: 'IMS测试服务器',
        pcscfAddress: 'ims.test.com',
        port: '5060',
        useSSL: false,
      },
      secure_ims: {
        name: '安全IMS服务器',
        pcscfAddress: 'secure.ims.com',
        port: '5061',
        useSSL: true,
      },
      local_test: {
        name: '本地测试',
        pcscfAddress: '192.168.1.100',
        port: '5060',
        useSSL: false,
      },
    };
  }

  /**
   * 应用服务器预设配置
   */
  async applyServerPreset(presetKey) {
    try {
      const presets = this.getServerPresets();
      const preset = presets[presetKey];

      if (!preset) {
        throw new Error(`未找到预设配置: ${presetKey}`);
      }

      const serverSettings = {
        pcscfAddress: preset.pcscfAddress,
        port: preset.port,
        useSSL: preset.useSSL,
        preset: presetKey,
      };

      await this.saveServerSettings(serverSettings);
      console.log(`应用预设配置成功: ${preset.name}`);
      return true;
    } catch (error) {
      console.error('应用预设配置失败:', error);
      throw error;
    }
  }
  /**
   * 通用设置获取方法
   */
  async getSetting(key, defaultValue = null) {
    try {
      return await databaseService.getSetting(key, defaultValue);
    } catch (error) {
      console.error(`获取设置 ${key} 失败:`, error);
      return defaultValue;
    }
  }

  /**
   * 通用设置保存方法
   */
  async saveSetting(key, value, type = 'string') {
    try {
      return await databaseService.saveSetting(key, value, type);
    } catch (error) {
      console.error(`保存设置 ${key} 失败:`, error);
      throw error;
    }
  }
}

// 创建单例实例
const settingsService = new SettingsService();

export default settingsService;
export { settingsService as SettingsService };
