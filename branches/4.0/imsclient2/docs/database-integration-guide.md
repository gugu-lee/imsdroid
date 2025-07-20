# 数据库集成与SIP测试指南

## 概述
本项目实现了React Native应用中的设置管理系统，包括前端JavaScript数据库操作和Java原生代码数据库读取，用于SIP注册参数的动态配置。

## 系统架构

### 1. 数据库层
- **SQLite数据库**: `ChatDB.db`
- **主要表**: `user_settings`
  - `setting_key`: 设置键名
  - `setting_value`: 设置值(JSON字符串格式)
  - `setting_type`: 数据类型标识

### 2. JavaScript层
- **DatabaseService.js**: 前端数据库服务
  - 使用`react-native-sqlite-storage`
  - 数据存储格式: `JSON.stringify()`
  - 提供设置的保存和读取功能

- **SettingsService.js**: 设置业务逻辑层
  - 封装各类设置的保存和读取
  - 提供类型安全的接口

### 3. Java原生层
- **SettingsDbModule.java**: React Native桥接模块
  - 读取SQLite数据库
  - 解析JSON格式数据
  - 提供类型安全的getter方法

- **NgnSipService.java**: SIP注册服务
  - 优先从数据库读取配置
  - 集成doubango SIP栈

## 核心设置参数

### SIP注册参数
```javascript
{
  "account.sipAddress": "sip:user@domain.com",    // SIP地址
  "account.password": "password",                  // 登录密码
  "server.pcscfAddress": "sip.domain.com",        // PCSCF服务器地址
  "server.port": "5060",                          // 服务器端口
  "server.useSSL": "false"                        // 是否使用SSL
}
```

### 数据流向
1. **保存设置**: 用户输入 → SettingsService → DatabaseService → SQLite
2. **读取设置**: SQLite → SettingsDbModule → NgnSipService → SIP注册

## 使用方法

### 1. 前端设置保存
```javascript
import { SettingsService } from '../services/SettingsService';

// 保存SIP设置
await SettingsService.saveSipSettings({
  sipAddress: 'sip:test@example.com',
  password: 'testpass',
  pcscfAddress: 'sip.example.com',
  port: '5060',
  useSSL: false
});
```

### 2. Java端读取设置
```java
// 在NgnSipService中
SettingsDbModule settingsDb = new SettingsDbModule();
Map<String, Object> sipSettings = settingsDb.getSipSettings();

String sipAddress = (String) sipSettings.get("sipAddress");
String password = (String) sipSettings.get("password");
// ... 使用设置进行SIP注册
```

### 3. React Native调用Java方法
```javascript
import { NativeModules } from 'react-native';
const { SettingsDbModule, LoginModule } = NativeModules;

// 获取Java端读取的设置
const sipSettings = await SettingsDbModule.getSipSettings();

// 执行SIP登录
const result = await LoginModule.loginWithDatabaseSettings();
```

## 测试功能

### 1. 数据库调试页面 (`DebugScreen.js`)
- 显示数据库状态信息
- 查看设置键值对
- 对比Java和JavaScript读取结果
- 测试数据库连接

### 2. SIP测试页面 (`SipTestScreen.js`)
- 配置测试SIP参数
- 测试数据库读写一致性
- 执行SIP注册测试
- 监控连接状态

### 3. 访问测试页面
导航路径: 我的 → 个人信息 → 开发者选项 → 数据库调试/SIP测试

## 数据格式协调

### JavaScript存储格式
```javascript
// DatabaseService.saveSetting()
await database.executeSql(
  'INSERT OR REPLACE INTO user_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)',
  [key, JSON.stringify(value), typeof value]
);
```

### Java读取格式
```java
// SettingsDbModule.getSetting()
String jsonValue = cursor.getString(cursor.getColumnIndex("setting_value"));
// 根据数据类型解析JSON值
if (jsonValue.startsWith("\"") && jsonValue.endsWith("\"")) {
    return jsonValue.substring(1, jsonValue.length() - 1); // 字符串
} else if ("true".equals(jsonValue) || "false".equals(jsonValue)) {
    return Boolean.parseBoolean(jsonValue); // 布尔值
}
```

## 错误处理

### 1. 数据库连接错误
- 检查SQLite数据库文件是否存在
- 验证表结构是否正确创建
- 确认权限设置

### 2. 数据格式错误
- 验证JSON序列化/反序列化
- 检查数据类型转换
- 处理空值和默认值

### 3. SIP注册错误
- 验证网络连接
- 检查服务器地址和端口
- 确认认证信息

## 最佳实践

### 1. 数据一致性
- 使用相同的JSON格式存储和读取
- 实现类型安全的getter方法
- 添加数据验证和错误处理

### 2. 性能优化
- 缓存常用设置
- 批量数据库操作
- 异步处理长时间操作

### 3. 调试和监控
- 添加详细的日志输出
- 实现调试页面和测试功能
- 监控数据库操作性能

## 故障排除

### 常见问题
1. **数据库文件不存在**: 检查初始化流程
2. **设置读取失败**: 验证键名拼写和数据类型
3. **SIP注册失败**: 检查网络和服务器配置
4. **数据不一致**: 对比前端和Java端读取结果

### 调试工具
- 使用DebugScreen查看数据库状态
- 使用SipTestScreen测试端到端流程
- 查看控制台日志输出
- 使用Android Studio调试Java代码

## 扩展功能

### 1. 设置备份和恢复
- 导出设置到文件
- 从文件导入设置
- 云端同步设置

### 2. 多用户支持
- 用户隔离的设置存储
- 切换用户账号
- 设置继承和覆盖

### 3. 高级SIP功能
- 多账号管理
- 自动重连机制
- 网络状态感知
