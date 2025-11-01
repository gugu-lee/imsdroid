/**
 * 开发环境网络配置文件
 * 用于在Android模拟器中配置正确的本机服务器访问地址
 */

// 导入request工具中的配置更新函数
import { updateBaseUrl } from './request';

/**
 * 网络配置常量
 */
export const NETWORK_CONFIG = {
  // Android Studio默认模拟器 - 10.0.2.2是模拟器访问宿主机的特殊IP
  ANDROID_EMULATOR: {
    type: 'android_emulator',
    host: '10.0.2.2',
    port: 7090,
    description: 'Android Studio模拟器',
  },
  
  // Genymotion模拟器 - 10.0.3.2是Genymotion访问宿主机的IP
  GENYMOTION: {
    type: 'genymotion', 
    host: '10.0.3.2',
    port: 7090,
    description: 'Genymotion模拟器',
  },
  
  // 真机调试 - 需要使用本机在局域网中的实际IP地址
  REAL_DEVICE: {
    type: 'real_device',
    host: '192.168.1.100', // 需要替换为您本机的实际IP
    port: 7090,
    description: '真机调试 (需要替换IP)',
  },
  
  // 局域网IP - 如果您知道确切的局域网IP
  LOCAL_NETWORK: {
    type: 'local_network',
    host: '192.168.10.6',
    port: 7090,
    description: '局域网IP',
  },
  
  // localhost - 仅在iOS模拟器或浏览器中使用
  LOCALHOST: {
    type: 'localhost',
    host: 'localhost',
    port: 7090,
    description: 'Localhost (仅iOS/Web)',
  },
};

/**
 * 快速配置网络环境
 * @param {string} configType - 配置类型，对应NETWORK_CONFIG中的key
 */
export const configureNetwork = (configType = 'ANDROID_EMULATOR') => {
  const config = NETWORK_CONFIG[configType];
  
  if (!config) {
    console.error(`[NetworkConfig] 无效的配置类型: ${configType}`);
    console.log('[NetworkConfig] 可用配置:', Object.keys(NETWORK_CONFIG));
    return;
  }
  
  console.log(`[NetworkConfig] 配置网络为: ${config.description}`);
  console.log(`[NetworkConfig] 服务器地址: ${config.host}:${config.port}`);
  
  // 更新request.js中的BASE_URL
  updateBaseUrl(config.type);
};

/**
 * 获取本机IP地址的辅助说明
 */
export const getLocalIPInstructions = () => {
  const instructions = `
获取本机IP地址的方法:

Windows:
1. 打开命令提示符(cmd)
2. 输入: ipconfig
3. 查找 "无线局域网适配器 WLAN" 或 "以太网适配器" 下的 "IPv4 地址"

macOS/Linux:
1. 打开终端
2. 输入: ifconfig | grep "inet " | grep -v 127.0.0.1
3. 或者输入: ip addr show | grep "inet " | grep -v 127.0.0.1

常见IP地址段:
- 192.168.1.x (家庭路由器)
- 192.168.0.x (家庭路由器)
- 10.0.x.x (公司网络)
- 172.16.x.x (公司网络)

注意: 
- 如果使用Android Studio模拟器，推荐使用 10.0.2.2
- 如果使用Genymotion，推荐使用 10.0.3.2
- 真机调试时，手机和电脑必须连接到同一个WiFi网络
`;
  
  console.log(instructions);
  return instructions;
};

/**
 * 测试网络连接
 * @param {string} configType - 要测试的配置类型
 */
export const testConnection = async (configType = 'ANDROID_EMULATOR') => {
  const config = NETWORK_CONFIG[configType];
  
  if (!config) {
    console.error(`[NetworkTest] 无效的配置类型: ${configType}`);
    return;
  }
  
  const testUrl = `http://${config.host}:${config.port}/api/v1/health`;
  
  console.log(`[NetworkTest] 测试连接: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      console.log(`✅ [NetworkTest] 连接成功: ${config.description}`);
      return true;
    } else {
      console.log(`❌ [NetworkTest] 连接失败: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ [NetworkTest] 连接错误: ${error.message}`);
    return false;
  }
};

// 开发环境自动配置 - 默认使用Android模拟器配置
if (__DEV__) {
  // 在应用启动时自动配置为Android模拟器
  configureNetwork('ANDROID_EMULATOR');
  
  // 显示配置信息
  console.log('[NetworkConfig] 开发环境已自动配置为Android模拟器模式');
  console.log('[NetworkConfig] 如需切换配置，请调用: configureNetwork("配置类型")');
  console.log('[NetworkConfig] 可用配置:', Object.keys(NETWORK_CONFIG));
}