# API请求日志查看指南

## 📊 日志功能说明

在开发环境中，所有的API请求都会输出详细的日志信息，包括：

### 🚀 GET请求日志
```
🌐 [GET Request] ================================
📍 [URL]: http://10.0.2.2:7090/api/v1/sessions
📋 [Headers]: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
🔧 [Params]: {}
⏱️  [Timeout]: 10000ms
===============================================
```

### 📥 GET响应日志
```
📥 [GET Response] =============================
📍 [URL]: http://10.0.2.2:7090/api/v1/sessions
📊 [Status]: 200 OK
⏱️  [Duration]: 1250ms
📦 [Raw Response Data]:
{
  "code": 0,
  "message": "success",
  "payload": [
    {
      "session_id": "uuid-123",
      "session_name": "股价预测模型V1",
      "model_type": "LSTM",
      "status": "completed",
      "created_at": "2024-10-29T10:30:00Z"
    }
  ]
}
===============================================
```

### 🚀 POST请求日志
```
🌐 [POST Request] ===============================
📍 [URL]: http://10.0.2.2:7090/api/v1/sessions/uuid-123
📋 [Headers]: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
📦 [Request Data]: {
  "action": "delete"
}
🔧 [Content-Type]: application/json
⏱️  [Timeout]: 10000ms
================================================
```

## 🔍 如何查看日志

### 1. React Native开发者工具
- 打开Chrome开发者工具（Chrome DevTools）
- 在Metro服务器中查看日志输出

### 2. VS Code终端
- 在运行 `npm run android` 的终端中查看
- 所有请求日志会实时显示在控制台

### 3. Android Studio Logcat
- 打开Android Studio
- 选择View → Tool Windows → Logcat
- 过滤标签：ReactNativeJS

### 4. 模拟器/设备日志
```bash
# 使用ADB查看日志
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## 📝 日志内容说明

### 请求日志包含：
- **URL**: 完整的请求地址
- **Headers**: 请求头信息
- **Params/Data**: 请求参数或请求体数据
- **Timeout**: 超时设置
- **Content-Type**: 内容类型

### 响应日志包含：
- **Status**: HTTP状态码和状态文本
- **Duration**: 请求耗时（毫秒）
- **Raw Response Data**: 服务器返回的原始数据
- **Data Processing**: 数据处理信息（标准化、包装等）

### 错误日志包含：
- **Endpoint**: 出错的API端点
- **Request Data**: 请求时发送的数据
- **Error Message**: 详细错误信息

## 🛠️ 调试技巧

### 1. 快速定位问题
- 查看URL是否正确
- 检查请求参数格式
- 确认服务器状态码

### 2. 性能分析
- 观察Duration时间
- 识别慢请求
- 优化网络配置

### 3. 数据验证
- 对比发送和接收的数据
- 检查数据转换是否正确
- 验证API响应格式

## ⚙️ 自定义日志级别

如果需要控制日志输出，可以在 `request.js` 中添加配置：

```javascript
// 在request.js顶部添加
const LOG_LEVEL = __DEV__ ? 'verbose' : 'none';

// 在日志输出前添加检查
if (LOG_LEVEL === 'verbose') {
  console.log('🌐 [GET Request] ...');
}
```

## 🚨 生产环境注意

- 日志功能仅在开发环境(`__DEV__ = true`)启用
- 生产构建时自动移除所有调试日志
- 不会影响生产环境性能

## 📱 TrainingSessionList API示例

当访问训练会话列表时，您将看到：

```javascript
// 请求: GET /sessions
🌐 [GET Request] ================================
📍 [URL]: http://10.0.2.2:7090/api/v1/sessions
...

// 响应: 服务器返回训练会话数组
📥 [GET Response] =============================
📦 [Raw Response Data]:
{
  "code": 0,
  "message": "success", 
  "payload": [
    {
      "session_id": "uuid-123",
      "session_name": "股价预测模型V1",
      "model_type": "LSTM",
      "training_start_time": "2024-10-29T10:30:00Z",
      "training_end_time": "2024-10-29T12:45:30Z",
      "status": "completed",
      "created_at": "2024-10-29T10:30:00Z",
      "updated_at": "2024-10-29T12:45:30Z"
    }
  ]
}
```

这样您就能完全了解API的请求和响应过程了！