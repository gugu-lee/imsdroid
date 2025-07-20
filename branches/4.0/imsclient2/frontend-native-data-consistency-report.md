# 前端与原生代码数据一致性协调报告

## 修改概述

为了确保前端 React Native 应用与 Android 原生 SIP 服务之间的数据读取一致性，我们进行了以下协调工作：

## 数据流向和处理逻辑

### 1. 前端数据保存流程

#### SIP设置保存 (SipSettingsScreen.js)
```javascript
// 用户输入 SIP 地址格式验证
const isValidSipAddress = (sipAddress) => {
  // 移除sip:前缀，验证 user@domain 格式
  let address = sipAddress.toLowerCase();
  if (address.startsWith('sip:')) {
    address = address.substring(4);
  }
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address);
};

// SIP地址格式化存储
const formatSipAddress = (sipAddress) => {
  // 移除sip:前缀，统一存储为 user@domain 格式
  let address = sipAddress.trim().toLowerCase();
  if (address.startsWith('sip:')) {
    address = address.substring(4);
  }
  return address;
};
```

#### 数据存储格式 (SettingsService.js)
```javascript
// 账号设置数据库键值对应
const accountKeys = {
  sipAddress: 'account.sipAddress',     // 存储格式: "user@domain.com" (无sip:前缀)
  password: 'account.password',         // 明文密码
  autoLogin: 'account.autoLogin',       // boolean
  rememberPassword: 'account.rememberPassword',
  showOnlineStatus: 'account.showOnlineStatus'
};

// 服务器设置数据库键值对应
const serverKeys = {
  pcscfAddress: 'server.pcscfAddress',  // PCSCF服务器地址
  port: 'server.port',                  // 字符串格式端口号
  useSSL: 'server.useSSL',              // boolean
  registrationTimeout: 'server.registrationTimeout',
  keepAliveInterval: 'server.keepAliveInterval',
  preset: 'server.preset'               // 预设配置标识
};
```

### 2. 原生代码读取流程

#### NgnSettingsDbHelper.java 数据转换
```java
// 从数据库读取并转换为SIP标准格式
public String getRealm() {
    String sipAddress = getSetting("account.sipAddress", "");
    if (!sipAddress.isEmpty() && sipAddress.contains("@")) {
        String domain = sipAddress.split("@")[1];
        return domain.startsWith("sip:") ? domain : "sip:" + domain;
    }
    return "sip:ims.freeims.net";
}

public String getIMPI() {
    String sipAddress = getSetting("account.sipAddress", "");
    if (!sipAddress.isEmpty() && sipAddress.contains("@")) {
        String userPart = sipAddress.split("@")[0];
        if (userPart.startsWith("sip:")) {
            userPart = userPart.substring(4);
        }
        return userPart;
    }
    return "user";
}

public String getIMPU() {
    String sipAddress = getSetting("account.sipAddress", "");
    if (!sipAddress.isEmpty()) {
        if (!sipAddress.startsWith("sip:")) {
            sipAddress = "sip:" + sipAddress;
        }
        return sipAddress;
    }
    return "sip:user@ims.freeims.net";
}
```

#### NgnSipService.java 智能IMPI提取
```java
// 添加了从IMPU自动提取IMPI的逻辑
private String extractIMPIFromIMPU(String impu) {
    if (impu == null || impu.isEmpty()) {
        return "user";
    }
    
    try {
        String address = impu;
        if (address.startsWith("sip:")) {
            address = address.substring(4);
        }
        
        if (address.contains("@")) {
            return address.split("@")[0];
        }
        
        return address;
    } catch (Exception e) {
        Log.w(TAG, "Failed to extract IMPI from IMPU: " + impu, e);
        return "user";
    }
}
```

## 关键改进点

### 1. IMPI 自动提取
- **问题**: 原先需要单独配置 IMPI
- **解决方案**: IMPI 直接从 IMPU/sipAddress 中分析得出
- **实现**: 
  - 前端不再需要单独输入 IMPI
  - 原生代码自动从 sipAddress 提取用户名部分作为 IMPI

### 2. SIP地址格式统一
- **存储格式**: 数据库中统一存储为 `user@domain.com` (不含sip:前缀)
- **使用格式**: 原生SIP栈使用时自动添加 `sip:` 前缀
- **验证逻辑**: 前端保存前进行格式验证和清理

### 3. 数据类型一致性
```javascript
// 前端数据类型
{
  sipAddress: "string",      // user@domain.com
  password: "string",        // 明文密码
  autoLogin: boolean,        // 布尔值
  useSSL: boolean,          // 布尔值
  port: "string"            // 字符串格式端口号
}
```

```java
// 原生代码读取类型
public String getSipAddress()  // 返回: user@domain.com
public String getPassword()    // 返回: 明文密码
public String getRealm()       // 返回: sip:domain.com
public String getIMPI()        // 返回: user
public String getIMPU()        // 返回: sip:user@domain.com
public boolean getUseSSL()     // 解析为布尔值
public int getPcscfPort()      // 转换为整数
```

### 4. 传输协议映射
```java
public String getTransport() {
    String useSSL = getSetting("server.useSSL", "false");
    boolean sslEnabled = "true".equalsIgnoreCase(useSSL) || "1".equals(useSSL);
    return sslEnabled ? "tls" : "udp";
}
```

### 5. 配置验证机制
```java
public boolean hasValidSettings() {
    String sipAddress = getSetting("account.sipAddress", "");
    String password = getSetting("account.password", "");
    String pcscfAddress = getSetting("server.pcscfAddress", "");
    
    boolean validSipAddress = !sipAddress.isEmpty() && sipAddress.contains("@");
    boolean hasPassword = !password.isEmpty();
    boolean hasPcscfAddress = !pcscfAddress.isEmpty();
    
    return validSipAddress && hasPassword && hasPcscfAddress;
}
```

## 数据流程图

```
前端输入: user@domain.com
    ↓ (格式验证和清理)
数据库存储: account.sipAddress = "user@domain.com"
    ↓ (原生代码读取)
SIP配置:
    - REALM: "sip:domain.com"
    - IMPI: "user"
    - IMPU: "sip:user@domain.com"
```

## 兼容性处理

### 1. 后向兼容
- 支持从配置文件读取旧格式设置作为 fallback
- 如果 IMPI 为空或默认值，自动从 IMPU 提取

### 2. 错误处理
- 数据库不存在时使用默认配置
- SIP地址格式错误时提供清晰的错误提示
- 端口号格式错误时使用默认值 5060

### 3. 调试支持
```java
public String getDebugInfo() {
    // 提供详细的配置信息用于调试
    // 包括原始数据、转换后的值、验证结果等
}

public boolean validateSettingsFormat() {
    // 验证当前设置是否符合预期格式
    // 检查常见的格式问题
}
```

## 测试验证

### 1. 数据一致性测试
- 前端保存的数据能够被原生代码正确读取
- IMPI 自动提取功能正常工作
- 各种 SIP 地址格式都能正确处理

### 2. 边界情况测试
- 空数据库
- 格式错误的 SIP 地址
- 缺失的配置项
- SSL/非SSL 配置切换

### 3. 集成测试
- 完整的注册流程测试
- 配置更新后的重新注册
- 多种服务器预设配置测试

## 总结

通过这次协调工作，我们实现了：

1. **简化用户配置**: 用户只需输入 SIP 地址和密码，IMPI 自动生成
2. **数据格式统一**: 前端和原生代码使用一致的数据处理逻辑
3. **智能兼容性**: 支持多种输入格式，自动格式化和验证
4. **可靠性提升**: 完善的错误处理和调试支持
5. **维护性改善**: 清晰的数据流向和转换逻辑

这确保了 SIP 设置在整个应用中的一致性和可靠性。
