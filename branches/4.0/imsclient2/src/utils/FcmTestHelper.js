/**
 * FCM测试辅助工具 - JavaScript端
 * 提供便捷的FCM测试接口
 */

import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { FcmTestModule } = NativeModules;

class FcmTestHelper {
  constructor() {
    this.listeners = [];
    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // 监听FCM Token更新事件
    const tokenListener = DeviceEventEmitter.addListener('onFcmTokenUpdate', (event) => {
      console.log('FCM Token更新事件:', event);
      this.notifyListeners('tokenUpdate', event);
    });
    
    this.listeners.push(tokenListener);
  }

  /**
   * 添加事件监听器
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        try {
          listener(type, data);
        } catch (error) {
          console.error('FCM监听器执行失败:', error);
        }
      }
    });
  }

  /**
   * 获取当前FCM Token
   */
  async getCurrentToken() {
    try {
      if (!FcmTestModule) {
        throw new Error('FcmTestModule未找到，请确保原生模块已正确注册');
      }
      
      const token = await FcmTestModule.getCurrentToken();
      console.log('获取FCM Token成功:', token);
      return token;
    } catch (error) {
      console.error('获取FCM Token失败:', error);
      throw error;
    }
  }

  /**
   * 从Firebase刷新Token
   */
  async refreshToken() {
    try {
      if (!FcmTestModule) {
        throw new Error('FcmTestModule未找到');
      }
      
      console.log('开始刷新FCM Token...');
      const token = await FcmTestModule.refreshToken();
      console.log('FCM Token刷新成功:', token);
      return token;
    } catch (error) {
      console.error('刷新FCM Token失败:', error);
      throw error;
    }
  }

  /**
   * 检查FCM服务可用性
   */
  async checkAvailability() {
    try {
      if (!FcmTestModule) {
        return {
          available: false,
          error: 'FcmTestModule未找到'
        };
      }
      
      const result = await FcmTestModule.checkFcmAvailability();
      console.log('FCM可用性检查结果:', result);
      return result;
    } catch (error) {
      console.error('检查FCM可用性失败:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * 获取调试信息
   */
  async getDebugInfo() {
    try {
      if (!FcmTestModule) {
        return {
          error: 'FcmTestModule未找到',
          platform: Platform.OS,
          version: Platform.Version
        };
      }
      
      const debugInfo = await FcmTestModule.getDebugInfo();
      console.log('FCM调试信息:', debugInfo);
      return debugInfo;
    } catch (error) {
      console.error('获取FCM调试信息失败:', error);
      return {
        error: error.message,
        platform: Platform.OS,
        version: Platform.Version
      };
    }
  }

  /**
   * 测试消息处理
   */
  async testMessageHandling(title = '测试消息', body = '这是一条测试消息') {
    try {
      if (!FcmTestModule) {
        throw new Error('FcmTestModule未找到');
      }
      
      console.log(`测试消息处理: ${title} - ${body}`);
      const result = await FcmTestModule.testMessageHandling(title, body);
      console.log('消息处理测试结果:', result);
      return result;
    } catch (error) {
      console.error('测试消息处理失败:', error);
      throw error;
    }
  }

  /**
   * 清除保存的Token
   */
  async clearSavedToken() {
    try {
      if (!FcmTestModule) {
        throw new Error('FcmTestModule未找到');
      }
      
      const result = await FcmTestModule.clearSavedToken();
      console.log('清除FCM Token结果:', result);
      return result;
    } catch (error) {
      console.error('清除FCM Token失败:', error);
      throw error;
    }
  }

  /**
   * 完整的FCM功能测试
   */
  async runFullTest() {
    console.log('开始FCM完整功能测试...');
    const results = {};
    
    try {
      // 1. 检查可用性
      console.log('1. 检查FCM可用性...');
      results.availability = await this.checkAvailability();
      
      // 2. 获取调试信息
      console.log('2. 获取调试信息...');
      results.debugInfo = await this.getDebugInfo();
      
      // 3. 获取Token
      console.log('3. 获取FCM Token...');
      try {
        results.token = await this.getCurrentToken();
      } catch (tokenError) {
        console.log('获取当前Token失败，尝试刷新...');
        results.token = await this.refreshToken();
      }
      
      // 4. 测试消息处理
      console.log('4. 测试消息处理...');
      results.messageTest = await this.testMessageHandling(
        'FCM测试消息', 
        `测试时间: ${new Date().toLocaleString()}`
      );
      
      console.log('FCM完整功能测试完成:', results);
      return {
        success: true,
        results: results
      };
      
    } catch (error) {
      console.error('FCM功能测试失败:', error);
      return {
        success: false,
        error: error.message,
        partialResults: results
      };
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.listeners.forEach(listener => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    });
    this.listeners = [];
  }
}

// 导出单例实例
export default new FcmTestHelper();

// 也可以导出类，用于创建多个实例
export { FcmTestHelper };