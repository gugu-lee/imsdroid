# Android模拟器网络配置说明

## 📱 Android模拟器访问本机服务器配置

在React Native开发中，Android模拟器需要使用特殊的IP地址来访问运行在本机的服务器。

### 🔧 配置方法

#### 1. 自动配置（推荐）
项目已经自动配置了Android模拟器的网络环境，默认使用 `10.0.2.2:7090`。

#### 2. 手动切换配置
在应用中导入配置工具：

```javascript
import { configureNetwork, NETWORK_CONFIG } from '../utils/networkConfig';

// 切换到不同的网络配置
configureNetwork('ANDROID_EMULATOR');  // Android Studio模拟器
configureNetwork('GENYMOTION');        // Genymotion模拟器  
configureNetwork('REAL_DEVICE');       // 真机调试
configureNetwork('LOCAL_NETWORK');     // 局域网IP
```

#### 3. 测试网络连接
```javascript
import { testConnection } from '../utils/networkConfig';

// 测试当前配置的连接
await testConnection('ANDROID_EMULATOR');
```

### 🌐 不同环境的IP配置

| 环境 | IP地址 | 说明 |
|------|--------|------|
| Android Studio模拟器 | `10.0.2.2` | 模拟器访问宿主机的特殊IP |
| Genymotion模拟器 | `10.0.3.2` | Genymotion访问宿主机的IP |
| 真机调试 | `192.168.x.x` | 本机在局域网中的实际IP |
| iOS模拟器 | `localhost` | iOS可以直接使用localhost |

### 📋 获取本机IP地址

#### Windows:
```cmd
ipconfig
```
查找 "IPv4 地址"

#### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# 或者
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### ⚠️ 注意事项

1. **防火墙设置**: 确保Windows防火墙允许Node.js或您的开发服务器通过网络访问
2. **端口占用**: 确保目标端口(如7090)没有被其他程序占用
3. **网络环境**: 真机调试时，手机和电脑必须连接到同一WiFi网络
4. **服务器启动**: 确保本机的开发服务器已经启动并监听正确的端口

### 🚀 快速启动步骤

1. **启动本机服务器** (例如端口7090)
2. **启动React Native应用**:
   ```bash
   npm run android
   # 或
   npx react-native run-android
   ```
3. **验证连接**: 检查Metro日志中的网络配置信息

### 🔍 故障排查

如果无法连接服务器，请检查：

1. **服务器是否运行**: 在浏览器中访问 `http://localhost:7090`
2. **IP配置是否正确**: 使用 `configureNetwork()` 切换配置
3. **防火墙设置**: 临时关闭防火墙测试
4. **网络连通性**: 使用 `testConnection()` 测试连接
5. **端口是否正确**: 确认服务器监听的端口号

### 📝 开发调试技巧

```javascript
// 在应用启动时查看当前网络配置
import { getLocalIPInstructions } from '../utils/networkConfig';

// 显示获取IP的说明
getLocalIPInstructions();

// 查看所有可用的网络配置
console.log(NETWORK_CONFIG);
```