# FCM Token获取和配置完整指南

## 🎯 概述
FCM Token是设备与Firebase Cloud Messaging服务通信的唯一标识符，用于接收推送消息。

## 📋 所需参数和配置

### 1. Firebase项目配置
```
✅ google-services.json (已存在于 android/app/)
✅ Firebase项目已创建
✅ Android应用已注册到Firebase项目
```

### 2. 获取FCM Token的三种方法

#### 🔧 方法1: 使用FcmTokenManager组件 (推荐)
```javascript
// 在您的App.js或调试界面中添加
import FcmTokenManager from './src/components/FcmTokenManager';

// 在组件中使用
<FcmTokenManager />
```

#### 📱 方法2: 直接使用FcmTestHelper
```javascript
import FcmTestHelper from './src/utils/FcmTestHelper';

const getToken = async () => {
  try {
    const token = await FcmTestHelper.getCurrentToken();
    console.log('FCM Token:', token);
    // 复制这个token用于测试
    return token;
  } catch (error) {
    console.error('获取失败:', error);
  }
};
```

#### 🔍 方法3: 从Android日志获取
```bash
# 运行监控脚本
get_fcm_token_from_logs.bat

# 或手动执行
adb logcat | findstr "FCM.*Token"
```

### 3. 配置测试脚本

获取到Token后，编辑 `test_fcm_curl.bat`:

```batch
# 将获取到的Token填入这里
set DEVICE_TOKEN=您获取到的FCM_Token

# Server Key从Firebase控制台获取
set SERVER_KEY=您的Firebase服务器密钥
```

## 🚀 快速开始步骤

### Step 1: 启动应用并获取Token
```bash
# 启动React Native应用
npx react-native run-android

# 在应用中导入并使用FcmTokenManager组件
# 或在控制台执行获取Token的代码
```

### Step 2: 从日志中查找Token
```bash
# 运行日志监控
get_fcm_token_from_logs.bat

# 查找类似输出：
# MyFirebaseMessagingService: FCM Token 已更新: eXXXXXXXXXXXXXXXXXXX...
```

### Step 3: 配置测试脚本
```batch
# 编辑 test_fcm_curl.bat，替换以下行：
set DEVICE_TOKEN=eXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
set SERVER_KEY=AAAAxxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: 测试FCM推送
```bash
# 运行测试脚本
test_fcm_curl.bat

# 或使用PowerShell版本
test_fcm.ps1
```

## 🔧 Token获取代码示例

### 在React Native组件中获取Token:
```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import FcmTestHelper from '../utils/FcmTestHelper';

export default function TokenDisplay() {
  const [token, setToken] = useState('');

  useEffect(() => {
    getFcmToken();
  }, []);

  const getFcmToken = async () => {
    try {
      const fcmToken = await FcmTestHelper.getCurrentToken();
      setToken(fcmToken);
      console.log('=== FCM TOKEN ===');
      console.log(fcmToken);
      console.log('================');
    } catch (error) {
      console.error('获取Token失败:', error);
      Alert.alert('错误', '获取FCM Token失败: ' + error.message);
    }
  };

  const copyToken = () => {
    // 复制token到剪贴板的代码
    Alert.alert('Token', token);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>FCM Token:</Text>
      <Text style={{ 
        fontSize: 12, 
        fontFamily: 'monospace',
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginVertical: 10
      }}>
        {token || '获取中...'}
      </Text>
      <Button title="重新获取" onPress={getFcmToken} />
      <Button title="复制Token" onPress={copyToken} />
    </View>
  );
}
```

## 🐛 故障排查

### Token获取失败的常见原因：

1. **网络问题**
   ```
   错误：SERVICE_NOT_AVAILABLE
   解决：检查网络连接，尝试使用VPN
   ```

2. **Google Play Services未安装**
   ```
   错误：GoogleApiAvailability错误
   解决：安装/更新Google Play Services
   ```

3. **Firebase配置错误**
   ```
   错误：FirebaseApp未初始化
   解决：检查google-services.json文件
   ```

### 检查配置的命令：
```javascript
// 检查FCM服务可用性
const checkFcm = async () => {
  const status = await FcmTestHelper.checkAvailability();
  console.log('FCM状态:', status);
};

// 获取调试信息
const getDebug = async () => {
  const debug = await FcmTestHelper.getDebugInfo();
  console.log('调试信息:', debug);
};
```

## 📝 填写位置总结

| 参数 | 获取位置 | 填写位置 | 格式示例 |
|------|----------|----------|----------|
| FCM Token | 应用运行时获取 | test_fcm_curl.bat中的DEVICE_TOKEN | eXXXXXXXXXXXXX... |
| Server Key | Firebase控制台 | test_fcm_curl.bat中的SERVER_KEY | AAAAxxxxxxx:APA91b... |
| google-services.json | Firebase控制台下载 | android/app/google-services.json | JSON文件 |

现在您可以按照这个指南获取FCM Token并配置测试脚本了！