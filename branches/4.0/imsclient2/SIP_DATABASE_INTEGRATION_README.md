# SIP注册数据库集成说明

## 概述

已成功将SIP注册功能与React Native数据库集成，现在SIP服务可以从用户设置数据库中读取配置参数。

## 修改的文件

### 1. NgnSipService.java
**位置**: `android/ngn-stack/src/main/java/org/doubango/ngn/services/impl/NgnSipService.java`

**主要修改**:
- 添加了 `NgnSettingsDbHelper` 导入
- 修改 `register()` 方法，优先从数据库读取SIP配置
- 支持fallback到配置文件（向后兼容）
- 添加详细的日志记录

**读取的参数**:
- `realm` - 从SIP地址的域名部分提取
- `impi` - 从SIP地址的用户名部分提取  
- `impu` - 完整的SIP地址
- `pcscfAddress` - PCSCF服务器地址
- `pcscfPort` - PCSCF端口号
- `password` - SIP登录密码
- `transport` - 传输协议（基于SSL设置）

### 2. NgnSettingsDbHelper.java (新建)
**位置**: `android/ngn-stack/src/main/java/org/doubango/ngn/utils/NgnSettingsDbHelper.java`

**功能**:
- 专门用于读取React Native SQLite数据库中的用户设置
- 提供SIP相关配置的获取方法
- 处理JSON格式的设置值
- 包含调试和验证功能

**主要方法**:
```java
public String getRealm()           // 获取SIP域
public String getIMPI()            // 获取私有身份
public String getIMPU()            // 获取公共身份
public String getPcscfHost()       // 获取PCSCF主机
public int getPcscfPort()          // 获取PCSCF端口
public String getPassword()        // 获取密码
public String getTransport()       // 获取传输协议
public boolean hasValidSettings()  // 检查设置有效性
public String getDebugInfo()       // 获取调试信息
```

### 3. SettingsDbModule.java (新建)
**位置**: `android/app/src/main/java/com/github/freeims/ngn_stack/sip/SettingsDbModule.java`

**功能**:
- React Native模块，供JS端调用
- 提供数据库设置的读取和调试功能
- 返回格式化的SIP配置信息

**React Native方法**:
```javascript
// 获取单个设置
SettingsDbModule.getSetting(key, defaultValue)

// 获取所有SIP设置
SettingsDbModule.getSipSettings()

// 检查是否有有效的SIP设置
SettingsDbModule.hasValidSipSettings()

// 获取调试信息
SettingsDbModule.getDebugInfo()
```

### 4. LoginPackage.java
**位置**: `android/app/src/main/java/com/github/freeims/ngn_stack/sip/LoginPackage.java`

**修改**:
- 添加了 `SettingsDbModule` 的注册

### 5. LoginModule.java  
**位置**: `android/app/src/main/java/com/github/freeims/ngn_stack/sip/LoginModule.java`

**修改**:
- 更新日志信息，表明使用数据库设置进行注册

## 工作流程

1. **应用启动** → React Native调用 `LoginModule.initializeAndRegister()`
2. **SIP注册** → `NgnSipService.register()` 被调用
3. **数据库检查** → `NgnSettingsDbHelper` 检查数据库中是否有有效的SIP设置
4. **参数读取** → 如果有效，从数据库读取所有SIP参数；否则使用配置文件
5. **SIP配置** → 使用读取的参数配置SIP栈
6. **注册执行** → 启动SIP注册过程

## 数据库映射

React Native数据库中的设置键值对应到SIP参数：

| 数据库键 | SIP参数 | 说明 |
|---------|---------|------|
| `account.sipAddress` | realm, impi, impu | SIP地址，用于提取域名和用户名 |
| `account.password` | password | SIP登录密码 |
| `server.pcscfAddress` | pcscfHost | PCSCF服务器地址 |
| `server.port` | pcscfPort | PCSCF端口号 |
| `server.useSSL` | transport | SSL设置决定传输协议(tls/udp) |

## 兼容性

- **向后兼容**: 如果数据库不存在或无有效设置，自动fallback到原有的配置文件方式
- **错误处理**: 包含完整的异常处理和日志记录
- **调试支持**: 提供详细的调试信息和状态检查

## 使用示例

### JavaScript端调用
```javascript
import { NativeModules } from 'react-native';
const { SettingsDbModule, LoginModule } = NativeModules;

// 检查数据库设置
const hasSettings = await SettingsDbModule.hasValidSipSettings();

// 获取SIP设置
const sipSettings = await SettingsDbModule.getSipSettings();

// 启动SIP注册（使用数据库设置）
const result = await LoginModule.initializeAndRegister();
```

### 调试信息获取
```javascript
const debugInfo = await SettingsDbModule.getDebugInfo();
console.log('Database Debug Info:', debugInfo);
```

现在SIP注册功能已完全集成数据库读取，用户在React Native应用中设置的SIP配置会自动应用到原生SIP服务中。
