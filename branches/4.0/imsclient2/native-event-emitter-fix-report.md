# NativeEventEmitter 错误修复报告

## 错误描述
应用启动时出现以下错误：
```
'`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.'
'`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.'
```

## 问题分析

### 根本原因
`NativeEventEmitter` 要求传入的原生模块必须实现以下方法：
- `addListener(eventName, listener)`
- `removeListeners(count)`

但我们的 `MessageModule.java` 只是一个简单的 React Native 模块，没有实现这些方法。

### 错误代码
```javascript
// 错误的使用方式：
const emitter = new NativeEventEmitter(MessageModule);
```

## 解决方案

### 使用 DeviceEventEmitter 替代 NativeEventEmitter

`DeviceEventEmitter` 是 React Native 提供的全局事件发射器，适用于原生模块向 JavaScript 发送事件的场景。

### 修复内容

#### 1. ChatScreen.js 修复

##### 更新导入
```javascript
// 修改前：
import { NativeEventEmitter } from 'react-native';

// 修改后：
import { DeviceEventEmitter } from 'react-native';
```

##### 简化状态管理
```javascript
// 修改前：
const [messageEventEmitter, setMessageEventEmitter] = useState(null);

// 修改后：
// 移除了不必要的状态变量
```

##### 修改事件监听器设置
```javascript
// 修改前：
const setupMessageListeners = () => {
  const emitter = new NativeEventEmitter(MessageModule);
  setMessageEventEmitter(emitter);
  emitter.addListener('onNewMessage', handler);
};

// 修改后：
const setupMessageListeners = () => {
  DeviceEventEmitter.addListener('onNewMessage', handler);
  DeviceEventEmitter.addListener('onChatListUpdate', handler);
};
```

##### 修改清理逻辑
```javascript
// 修改前：
useEffect(() => {
  return () => {
    if (messageEventEmitter) {
      messageEventEmitter.removeAllListeners('onNewMessage');
    }
  };
}, [messageEventEmitter]);

// 修改后：
useEffect(() => {
  return () => {
    DeviceEventEmitter.removeAllListeners('onNewMessage');
    DeviceEventEmitter.removeAllListeners('onChatListUpdate');
  };
}, []);
```

#### 2. ChatDetailScreen.js 修复

应用了相同的修复模式：
- 使用 `DeviceEventEmitter` 替代 `NativeEventEmitter`
- 简化状态管理
- 直接使用全局事件监听器

### 原生模块保持不变

`MessageModule.java` 的实现保持不变，继续使用：
```java
reactContext
  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit("onNewMessage", params);
```

这种方式与 `DeviceEventEmitter` 完美兼容。

## 修复效果

### 解决的问题
- ✅ 消除了 `NativeEventEmitter` 初始化错误
- ✅ 简化了事件监听器的管理
- ✅ 减少了不必要的状态变量
- ✅ 避免了应用启动时的死循环

### 改进的方面
- **兼容性**：`DeviceEventEmitter` 与简单的原生模块完美兼容
- **简洁性**：代码更简洁，不需要管理 EventEmitter 实例
- **稳定性**：避免了原生模块缺少必需方法的问题
- **性能**：减少了不必要的状态更新和重渲染

## 技术说明

### DeviceEventEmitter vs NativeEventEmitter

| 特性 | DeviceEventEmitter | NativeEventEmitter |
|------|-------------------|-------------------|
| 使用场景 | 简单的事件发送 | 复杂的模块事件管理 |
| 原生要求 | 无特殊要求 | 需要实现 addListener/removeListeners |
| 管理方式 | 全局单例 | 每个模块一个实例 |
| 适用性 | 大多数场景 | 需要细粒度控制的场景 |

### 最佳实践
- 对于简单的原生到JS事件发送，优先使用 `DeviceEventEmitter`
- 只有在需要复杂事件管理时才使用 `NativeEventEmitter`
- 确保在组件卸载时正确清理事件监听器

## 验证结果

- ✅ 应用启动不再出现 `NativeEventEmitter` 错误
- ✅ 消息事件监听正常工作
- ✅ 聊天列表更新事件正常触发
- ✅ 组件卸载时正确清理监听器
- ✅ 不再进入数据库配置死循环

## 总结

通过将 `NativeEventEmitter` 替换为 `DeviceEventEmitter`，成功解决了原生模块缺少必需方法的问题。这个修复不仅解决了当前的错误，还简化了代码结构，提高了应用的稳定性和可维护性。
