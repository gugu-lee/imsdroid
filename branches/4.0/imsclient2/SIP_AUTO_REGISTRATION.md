# SIP自动注册功能说明

## 功能概述

应用启动时会自动检查SIP配置并尝试注册，如果配置不完整或注册失败，会显示友好的引导界面帮助用户完成配置。

## 工作流程

### 1. 启动检查
- ✅ 初始化数据库
- ✅ 检查"自动登录"设置
- ✅ 如果启用自动登录，继续SIP注册流程

### 2. 配置验证
检查以下必需参数：
- `account.sipAddress` - SIP地址 (必需，格式: sip:user@domain)
- `account.password` - 登录密码 (必需)
- `server.pcscfAddress` - 服务器地址 (必需)
- `server.port` - 服务器端口 (必需，数字格式)

### 3. 自动注册
- ✅ 配置完整且有效 → 尝试SIP注册
- ⚙️ 配置不完整 → 显示配置引导界面
- ❌ 注册失败 → 显示错误处理界面

## 用户界面

### 启动引导界面 (StartupSplashScreen)

#### 连接中状态
- 🔄 显示连接图标和进度指示器
- 📝 提示文字："正在连接SIP服务"
- ⏱️ 自动状态，无需用户操作

#### 成功状态
- ✅ 显示成功图标
- 📝 提示文字："SIP连接成功"
- ⏱️ 2秒后自动关闭

#### 配置不完整状态
- ⚙️ 显示配置图标
- 📝 提示需要完成的配置项
- 🔘 "账号设置" 按钮 → 跳转到账号配置
- 🔘 "服务器设置" 按钮 → 跳转到服务器配置
- 🔘 "稍后处理" 按钮 → 关闭界面

#### 连接失败状态
- ❌ 显示错误图标
- 📝 显示具体错误信息
- 🔘 "重试" 按钮 → 重新尝试连接
- 🔘 "检查设置" 按钮 → 跳转到设置页面
- 🔘 "稍后处理" 按钮 → 关闭界面

## 技术实现

### 前端 (React Native)

#### StartupService.js
- `validateSipConfiguration()` - 验证SIP配置完整性
- `attemptAutoRegistration()` - 尝试自动注册
- `showConfigurationGuidance()` - 显示配置引导 (已废弃，使用界面组件)
- `performStartupRegistration()` - 主启动流程

#### App.js
- 集成StartupSplashScreen组件
- 管理启动状态和导航
- 处理用户交互

#### StartupSplashScreen.js
- 动画启动界面
- 多种状态显示
- 用户操作处理

### 后端 (Java)

#### LoginModule.java
- `loginWithDatabaseSettings()` - 使用数据库配置进行SIP注册
- `logout()` - SIP注销
- 返回结构化的结果信息

#### SettingsDbModule.java
- `getSipSettingsSync()` - 同步获取SIP设置供Java使用
- 数据格式转换和验证

## 配置选项

### 自动登录控制
在账号设置中控制：
```javascript
'account.autoLogin': boolean
```

### SIP配置参数
```javascript
{
  'account.sipAddress': 'sip:user@domain.com',
  'account.password': 'userpassword',
  'server.pcscfAddress': 'sip.server.com',
  'server.port': '5060',
  'server.useSSL': false
}
```

## 测试场景

### A. 完整配置测试
1. 配置完整的SIP参数
2. 启用自动登录
3. 重启应用
4. 期望：自动连接成功，显示成功提示

### B. 配置不完整测试
1. 清空某些必需参数（如SIP地址）
2. 启用自动登录
3. 重启应用
4. 期望：显示配置引导界面，提供设置入口

### C. 连接失败测试
1. 使用无效的服务器地址
2. 启用自动登录
3. 重启应用
4. 期望：显示错误信息，提供重试和设置选项

### D. 自动登录关闭测试
1. 关闭自动登录选项
2. 重启应用
3. 期望：跳过自动注册，正常启动

## 调试工具

### 数据库调试
路径：我的 → 个人信息 → 开发者选项 → 数据库调试
- 查看数据库状态
- 验证配置完整性
- 对比Java和JavaScript端数据

### SIP测试
路径：我的 → 个人信息 → 开发者选项 → SIP测试
- 手动配置测试参数
- 实时SIP状态监控
- 端到端连接测试

## 故障排除

### 常见问题

1. **自动注册不启动**
   - 检查"自动登录"是否启用
   - 查看控制台日志
   - 使用数据库调试工具验证配置

2. **配置验证失败**
   - 确认SIP地址格式正确 (包含@符号)
   - 确认端口号为数字格式
   - 确认所有必需字段已填写

3. **连接持续失败**
   - 检查网络连接
   - 验证服务器地址和端口
   - 使用SIP测试工具手动测试

### 日志查看
```bash
# Android日志
adb logcat | grep -E "(LoginModule|SettingsDb|StartupService)"

# React Native日志
npx react-native log-android
```

## 扩展说明

### 未来改进
- [ ] 添加网络状态检测
- [ ] 支持多服务器配置
- [ ] 添加连接质量监控
- [ ] 实现重连机制

### 配置迁移
如果需要从旧版本迁移配置，确保：
1. 数据库表结构兼容
2. 配置键名一致
3. 数据类型正确

---

*更新日期: 2025年7月*
