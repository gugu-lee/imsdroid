# 数据库架构统一说明

## 🏗️ **架构概述**

我们的应用采用混合数据库架构，同时支持React Native前端和Java原生后端的数据库操作。

## 📋 **文件结构与职责**

### 1. **ChatDatabaseHelper.java** (核心数据库层)
```
位置: android/app/src/main/java/com/imsclient2/ChatDatabaseHelper.java
职责: SQLite数据库的创建、升级、基础CRUD操作
特点: 
- ✅ 使用 IF NOT EXISTS 避免重复字段问题
- ✅ 版本控制和迁移逻辑
- ✅ 原生Android SQLiteOpenHelper实现
```

### 2. **DatabaseService.js** (React Native数据库层)
```
位置: src/services/DatabaseService.js  
职责: React Native端的所有数据库操作
特点:
- ✅ react-native-sqlite-storage封装
- ✅ Promise-based异步操作
- ✅ JSON数据序列化/反序列化
- ✅ 设置管理和调试功能
```

### 3. **UnifiedDatabaseModule.java** (统一接口层)
```
位置: android/app/src/main/java/com/github/freeims/ngn_stack/database/UnifiedDatabaseModule.java
职责: 提供Java端和RN端的统一数据库接口
特点:
- ✅ React Native Bridge模块
- ✅ 静态方法供Java端直接调用
- ✅ 避免代码重复
- ✅ 统一错误处理
```

## 🔄 **数据流向**

### React Native → Database
```
React Native Component
    ↓
DatabaseService.js
    ↓
react-native-sqlite-storage
    ↓
SQLite Database
```

### Java Native → Database  
```
MyDynamicReceiver (SIP消息接收)
    ↓
UnifiedDatabaseModule.addChatFromNative()
    ↓
ChatDatabaseHelper
    ↓
SQLite Database
```

### Cross-Platform → Database
```
React Native Component
    ↓
UnifiedDatabaseModule (React Native Bridge)
    ↓
ChatDatabaseHelper
    ↓
SQLite Database
```

## 🛠️ **核心改进**

### 1. **SQLite兼容性问题解决**
```sql
-- ❌ 旧方式 (SQLite 3.35.0+ 才支持)
ALTER TABLE chat_list ADD COLUMN IF NOT EXISTS sip_address TEXT

-- ✅ 新方式 (兼容所有SQLite版本)
-- Java端: 使用 columnExists() 方法检查 + PRAGMA table_info
-- JS端: 使用 columnExists() 方法检查 + PRAGMA table_info
```

### 2. **统一数据库版本管理**
- **ChatDatabaseHelper.java**: 负责核心表(chat_list, messages)的版本控制和字段升级
- **DatabaseService.js**: 负责React Native前端特有字段(如UI主题、缓存设置等)
- **UnifiedDatabaseModule.java**: 提供桥接和统一接口

### 3. **避免功能重复**
- ✅ **职责分离**: Java端管理核心数据结构，RN端管理前端特有需求
- ✅ **消除重复**: 移除了DatabaseService.js中与Java端重复的字段添加
- ✅ **明确边界**: 通过注释明确各层职责，避免未来重复开发
- ✅ **SQLite兼容**: 使用标准SQL语法，兼容所有Android设备

## 📊 **职责划分**

### ChatDatabaseHelper.java 负责：
- ✅ 核心表结构 (chat_list, messages)
- ✅ SIP相关字段 (sip_address, message_status)
- ✅ 数据库版本控制和升级
- ✅ 性能敏感的数据库操作

### DatabaseService.js 负责：
- ✅ React Native前端特有字段 (ui_theme, description)
- ✅ 前端缓存和设置相关字段
- ✅ React Native层的数据操作接口
- ✅ 前端调试和开发辅助功能

### UnifiedDatabaseModule.java 负责：
- ✅ 跨平台数据同步
- ✅ 统一的错误处理和接口
- ✅ Java端和RN端的数据格式统一

## 📊 **使用场景**

### DatabaseService.js 适用于：
- ✅ React Native UI层的数据操作
- ✅ 前端特有设置 (UI主题、用户偏好)
- ✅ 聊天列表和消息显示逻辑
- ✅ 前端缓存和调试功能

### ChatDatabaseHelper.java 适用于：
- ✅ 核心数据结构维护 (chat_list, messages)
- ✅ SIP消息接收时的数据写入
- ✅ 后台服务的数据操作
- ✅ 数据库版本控制和升级

### UnifiedDatabaseModule.java 适用于：
- ✅ Java端和RN端的数据同步
- ✅ 跨平台统一接口
- ✅ 统一的错误处理和日志
- ✅ 性能优化的桥接方法

## 🚀 **最佳实践**

1. **数据库升级**: 始终使用 `IF NOT EXISTS` 
2. **错误处理**: 统一的try-catch和日志记录
3. **性能优化**: Java端用于高频操作，RN端用于UI操作
4. **数据一致性**: 通过UnifiedDatabaseModule保证数据格式统一

## 🔧 **开发指南**

### 添加新字段时：

**核心表字段 (chat_list, messages):**
```java
// ChatDatabaseHelper.java - onUpgrade方法负责
if (oldVersion < 4) {
    if (!columnExists(db, "chat_list", "new_core_field")) {
        db.execSQL("ALTER TABLE chat_list ADD COLUMN new_core_field TEXT");
    }
}
```

**前端特有字段 (user_settings, UI相关):**
```javascript
// DatabaseService.js - updateDatabaseSchema方法负责
if (!(await this.columnExists('user_settings', 'ui_preference'))) {
  await this.database.executeSql(`
    ALTER TABLE user_settings ADD COLUMN ui_preference TEXT
  `);
}
```

### 新增数据库操作时：
1. **核心数据操作**: 在ChatDatabaseHelper.java中实现
2. **统一接口**: 在UnifiedDatabaseModule.java中提供RN桥接
3. **前端封装**: 在DatabaseService.js中提供高级UI操作接口

### 避免重复的原则：
- 🎯 **Java端**: 负责核心数据结构和SIP相关字段
- 🎯 **RN端**: 负责前端特有功能和UI相关字段  
- 🎯 **统一层**: 提供跨平台接口，不重复实现相同逻辑
- 🎯 **兼容性**: 使用标准SQL语法，确保在所有Android设备上正常工作

这样的架构既保持了性能优势，又避免了代码重复，是混合应用的最佳实践！🎯
