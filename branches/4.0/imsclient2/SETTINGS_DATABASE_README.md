# 用户设置数据库功能说明

## 概述

已为设置功能添加了完整的数据库读取和存储实现，包括：

### 1. 数据库表结构

#### user_settings 表
```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. 新增服务类

#### SettingsService.js
- **功能**: 统一管理用户设置的读取、保存、更新
- **位置**: `src/services/SettingsService.js`
- **主要方法**:
  - `getProfileSettings()` - 获取个人信息
  - `saveProfileSettings(profile)` - 保存个人信息
  - `getAccountSettings()` - 获取账号设置
  - `saveAccountSettings(account)` - 保存账号设置
  - `getServerSettings()` - 获取服务器设置
  - `saveServerSettings(server)` - 保存服务器设置
  - `getAllSettings()` - 获取所有设置
  - `resetAllSettings()` - 重置所有设置

### 3. 设置分类

#### 个人信息设置 (profile.*)
- `profile.nickname` - 昵称
- `profile.signature` - 个性签名
- `profile.avatar` - 头像URL
- `profile.gender` - 性别
- `profile.region` - 地区

#### 账号设置 (account.*)
- `account.sipAddress` - SIP地址
- `account.password` - 登录密码（仅在选择记住密码时保存）
- `account.autoLogin` - 自动登录
- `account.rememberPassword` - 记住密码
- `account.showOnlineStatus` - 显示在线状态

#### 服务器设置 (server.*)
- `server.pcscfAddress` - PCSCF服务器地址
- `server.port` - 端口号
- `server.useSSL` - 使用SSL加密
- `server.registrationTimeout` - 注册超时时间
- `server.keepAliveInterval` - 心跳间隔
- `server.preset` - 预设配置类型

#### 应用设置 (app.*)
- `app.language` - 界面语言
- `app.theme` - 主题模式
- `app.fontSize` - 字体大小
- `app.autoDownloadImages` - 自动下载图片
- `app.soundEnabled` - 声音提醒
- `app.vibrationEnabled` - 振动提醒
- `app.showTimestamp` - 显示时间戳

### 4. 使用示例

#### 在组件中使用设置服务

```javascript
import settingsService from '../services/SettingsService';

// 读取用户昵称
const nickname = await settingsService.getSetting('profile.nickname', '默认昵称');

// 保存用户信息
await settingsService.saveProfileSettings({
  nickname: '新昵称',
  signature: '新签名'
});

// 获取完整的个人信息
const profile = await settingsService.getProfileSettings();

// 获取账号设置
const account = await settingsService.getAccountSettings();
```

#### 在工具函数中使用

```javascript
import { getUserProfile, updateUserProfile } from '../utils/DatabaseUtils';

// 获取用户信息
const profile = await getUserProfile();

// 更新用户信息
await updateUserProfile({
  nickname: '新昵称',
  avatar: 'new_avatar_url'
});
```

### 5. 预设配置

#### 服务器预设
- `custom` - 自定义配置
- `ims_test` - IMS测试服务器
- `secure_ims` - 安全IMS服务器
- `local_test` - 本地测试服务器

#### 应用预设配置
```javascript
const presets = settingsService.getServerPresets();
await settingsService.applyServerPreset('ims_test');
```

### 6. 数据持久化

#### 自动初始化
- 应用启动时自动创建数据表
- 自动插入默认设置值
- 支持数据库结构升级

#### 数据导入导出
```javascript
// 导出设置
const settingsJson = await settingsService.exportSettings();

// 导入设置
await settingsService.importSettings(settingsJson);
```

### 7. 错误处理

所有数据库操作都包含完整的错误处理：
- 自动重试机制
- 详细的错误日志
- 用户友好的错误提示
- 优雅的降级处理

### 8. 性能优化

- 使用事务确保数据一致性
- 批量操作减少数据库访问
- 智能缓存减少重复查询
- 异步操作避免界面阻塞

### 9. 安全考虑

- 密码只在用户选择时才保存
- 敏感信息加密存储
- SQL注入防护
- 数据验证和清理

### 10. 升级和维护

- 版本控制和数据迁移
- 向后兼容性保证
- 设置重置和恢复功能
- 完整的单元测试覆盖

## 使用流程

1. **应用启动** → 数据库初始化 → 创建表结构 → 插入默认设置
2. **用户操作** → 读取当前设置 → 显示在界面上
3. **用户修改** → 验证输入 → 保存到数据库 → 更新界面
4. **应用退出** → 自动保存 → 关闭数据库连接

现在您的应用已经具备了完整的用户设置数据库功能！
