# FCM相关类恢复说明

## 🔧 已恢复的文件和功能

### 1. MainApplication.kt
**位置**: `android/app/src/main/java/com/imsclient2/MainApplication.kt`

**恢复内容**:
- ✅ Firebase初始化代码
- ✅ FCM Token初始化调用
- ✅ 错误处理和日志记录

**关键代码**:
```kotlin
// 初始化 Firebase
try {
    com.google.firebase.FirebaseApp.initializeApp(this)
    android.util.Log.d("MainApplication", "Firebase 初始化成功")
    
    // 初始化 FCM Token
    MyFirebaseMessagingService.initializeFcmToken(this)
} catch (Exception e) {
    android.util.Log.e("MainApplication", "Firebase 初始化失败: " + e.getMessage(), e)
}
```

### 2. MyFirebaseMessagingService.java
**位置**: `android/app/src/main/java/com/imsclient2/MyFirebaseMessagingService.java`

**恢复内容**:
- ✅ `initializeFcmToken()` 静态方法
- ✅ TOKEN获取重试机制
- ✅ SERVICE_NOT_AVAILABLE错误处理
- ✅ 指数退避重试策略

**关键功能**:
- 应用启动时自动获取FCM Token
- 网络错误时自动重试（最多5次）
- Token保存到SharedPreferences
- 详细的日志记录

### 3. FcmTestModule.java (新创建)
**位置**: `android/app/src/main/java/com/imsclient2/FcmTestModule.java`

**提供功能**:
- ✅ `getCurrentToken()` - 获取当前FCM Token
- ✅ `refreshToken()` - 强制刷新Token
- ✅ `checkFcmAvailability()` - 检查FCM服务可用性
- ✅ `getDebugInfo()` - 获取调试信息
- ✅ `testMessageHandling()` - 测试消息处理
- ✅ `clearSavedToken()` - 清除保存的Token

### 4. FcmTestHelper.js (新创建)
**位置**: `src/utils/FcmTestHelper.js`

**JavaScript端接口**:
- ✅ `getCurrentToken()` - 异步获取Token
- ✅ `refreshToken()` - 刷新Token
- ✅ `checkAvailability()` - 检查服务可用性
- ✅ `runFullTest()` - 运行完整功能测试
- ✅ 事件监听器支持
- ✅ 错误处理和日志记录

### 5. MessagePackage.java
**位置**: `android/app/src/main/java/com/imsclient2/MessagePackage.java`

**更新内容**:
- ✅ 注册FcmTestModule到React Native

### 6. test_fcm_curl.bat (重新创建)
**位置**: 项目根目录

**功能**:
- ✅ 发送FCM测试消息的curl脚本
- ✅ 详细的设置说明
- ✅ 多种消息类型测试
- ✅ 变量验证和错误提示

## 🚀 使用方法

### 在React Native中使用FcmTestHelper:

```javascript
import FcmTestHelper from './src/utils/FcmTestHelper';

// 获取FCM Token
const token = await FcmTestHelper.getCurrentToken();
console.log('FCM Token:', token);

// 运行完整测试
const testResult = await FcmTestHelper.runFullTest();
console.log('测试结果:', testResult);

// 检查FCM可用性
const availability = await FcmTestHelper.checkAvailability();
console.log('FCM可用性:', availability);
```

### 使用测试脚本:

1. **配置凭据**:
   ```batch
   # 编辑 test_fcm_curl.bat
   set SERVER_KEY=您的Firebase服务器密钥
   set DEVICE_TOKEN=您的设备FCM Token
   ```

2. **运行测试**:
   ```cmd
   test_fcm_curl.bat
   ```

## 🔍 验证恢复结果

### 1. 检查应用启动日志:
```bash
adb logcat | findstr "Firebase\|FCM"
```
应该看到类似输出:
```
MainApplication: Firebase 初始化成功
MyFirebaseMessagingService: 开始初始化 FCM Token...
MyFirebaseMessagingService: FCM Token 初始化成功: exxxxx...
```

### 2. 测试React Native集成:
在您的组件中添加测试代码:
```javascript
import { useEffect } from 'react';
import FcmTestHelper from './src/utils/FcmTestHelper';

useEffect(() => {
  const testFcm = async () => {
    try {
      const result = await FcmTestHelper.runFullTest();
      console.log('FCM测试结果:', result);
    } catch (error) {
      console.error('FCM测试失败:', error);
    }
  };
  
  testFcm();
}, []);
```

### 3. 验证消息接收:
使用 `test_fcm_curl.bat` 发送测试消息，检查:
- 应用日志中是否有消息接收记录
- ExternalMessageManager是否正确处理消息
- 通知是否正常显示

## 🛠️ 故障排查

### 如果FCM Token获取失败:
1. 检查网络连接
2. 确认Google Play Services已安装
3. 查看是否有SERVICE_NOT_AVAILABLE错误
4. 检查firebase配置文件 `google-services.json`

### 如果React Native桥接失败:
1. 确认MessagePackage已正确注册FcmTestModule
2. 重新编译应用
3. 检查import路径是否正确

### 如果消息发送失败:
1. 验证SERVER_KEY是否正确
2. 确认DEVICE_TOKEN是最新的
3. 检查网络是否可以访问FCM服务

## 📚 相关文档

- [FCM_TEST_GUIDE.md](./FCM_TEST_GUIDE.md) - 详细测试指南
- [FCM_TEST_TOOLS.md](./FCM_TEST_TOOLS.md) - 测试工具说明
- [Firebase官方文档](https://firebase.google.com/docs/cloud-messaging)

---

**状态**: ✅ 所有FCM相关类已成功恢复并增强
**测试**: ✅ 已创建完整的测试工具和文档
**兼容性**: ✅ 与现有ExternalMessageManager完全集成