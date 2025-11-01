# Training Sessions API - POST方法说明

## 📋 API端点变更

### 获取训练会话列表 (原GET → 现POST)

**端点**: `POST /sessions`

**说明**: 改为POST方法是为了支持更复杂的查询条件，如分页、筛选、搜索等参数。

### 请求格式

```json
{
  "page": 1,
  "limit": 100,
  "status": "completed",  // 可选: "training", "completed", "pending", "failed", null(全部)
  "search": "股价预测"     // 可选: 搜索关键词, null表示不搜索
}
```

### 请求参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | number | 是 | 页码，从1开始 |
| `limit` | number | 是 | 每页记录数，建议100 |
| `status` | string/null | 否 | 筛选状态："training", "completed", "pending", "failed", null(全部) |
| `search` | string/null | 否 | 搜索关键词，匹配session_name和model_type，null表示不搜索 |

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "payload": [
    {
      "session_id": "uuid-123",
      "session_name": "股价预测模型V2",
      "model_type": "LSTM",
      "training_start_time": "2024-10-29T10:30:00Z",
      "training_end_time": "2024-10-29T12:45:30Z",
      "status": "completed",
      "model_file_path": "/path/to/model.pkl",
      "data_start_date": "2024-01-01T00:00:00Z",
      "data_end_date": "2024-10-31T23:59:59Z",
      "description": "使用LSTM模型预测股价走势",
      "created_at": "2024-10-29T10:30:00Z",
      "updated_at": "2024-10-29T12:45:30Z"
    }
  ]
}
```

### TrainingSession数据结构

根据Go结构体定义：

```go
type TrainingSession struct {
    SessionID         string     `json:"session_id" db:"session_id"`
    SessionName       string     `json:"session_name" db:"session_name"`
    ModelType         string     `json:"model_type" db:"model_type"`
    TrainingStartTime *time.Time `json:"training_start_time" db:"training_start_time"`
    TrainingEndTime   *time.Time `json:"training_end_time" db:"training_end_time"`
    Status            string     `json:"status" db:"status"`
    ModelFilePath     *string    `json:"model_file_path" db:"model_file_path"`
    DataStartDate     *time.Time `json:"data_start_date" db:"data_start_date"`
    DataEndDate       *time.Time `json:"data_end_date" db:"data_end_date"`
    Description       *string    `json:"description" db:"description"`
    CreatedAt         time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}
```

## 🔧 前端实现变更

### 1. 查询条件支持

现在支持以下查询功能：
- **分页**: 默认每页100条记录
- **状态筛选**: 训练中、已完成、待开始、失败
- **关键词搜索**: 搜索会话名称和模型类型
- **实时筛选**: 筛选条件变化时自动重新查询

### 2. 搜索优化

- **防抖处理**: 搜索输入延迟500ms后才发起请求
- **即时筛选**: 状态筛选立即生效
- **自动刷新**: 条件变化时自动更新列表

### 3. 请求日志

使用POST方法后，您会在控制台看到：

```
🌐 [POST Request] ===============================
📍 [URL]: http://10.0.2.2:7090/api/v1/sessions
📋 [Headers]: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
📦 [Request Data]: {
  "page": 1,
  "limit": 100,
  "status": "completed",
  "search": "股价预测"
}
🔧 [Content-Type]: application/json
⏱️  [Timeout]: 10000ms
================================================
```

## 🚀 使用示例

### 获取所有训练会话
```javascript
const response = await request.post('/sessions', {
  page: 1,
  limit: 100,
  status: null,
  search: null
});
```

### 筛选已完成的会话
```javascript
const response = await request.post('/sessions', {
  page: 1,
  limit: 100,
  status: 'completed',
  search: null
});
```

### 搜索包含"股价"的会话
```javascript
const response = await request.post('/sessions', {
  page: 1,
  limit: 100,
  status: null,
  search: '股价'
});
```

### 组合查询：搜索训练中的LSTM模型
```javascript
const response = await request.post('/sessions', {
  page: 1,
  limit: 100,
  status: 'training',
  search: 'LSTM'
});
```

## 🛠️ 服务器端实现建议

### 1. 查询逻辑
```sql
SELECT * FROM training_sessions 
WHERE 
  ($1::text IS NULL OR status = $1) 
  AND ($2::text IS NULL OR (
    session_name ILIKE '%' || $2 || '%' 
    OR model_type ILIKE '%' || $2 || '%'
  ))
ORDER BY created_at DESC 
LIMIT $3 OFFSET $4;
```

### 2. 参数验证
- `page`: 必须 >= 1
- `limit`: 建议 1-1000 之间
- `status`: 必须是预定义的状态值之一
- `search`: 可选的字符串，建议限制长度

### 3. 响应优化
- 添加总记录数信息
- 支持分页元数据
- 考虑缓存频繁查询

## 📱 移动端优势

使用POST方法的优势：
1. **参数灵活**: 支持复杂查询条件
2. **扩展性好**: 易于添加新的筛选参数
3. **安全性高**: 敏感参数不会出现在URL中
4. **数据量大**: 不受URL长度限制
5. **统一接口**: 查询和操作使用相同的HTTP方法规范

## ⚠️ 注意事项

1. **缓存处理**: POST请求不会被浏览器自动缓存
2. **幂等性**: 相同参数的查询应返回相同结果
3. **错误处理**: 参数错误时应返回明确的错误信息
4. **性能监控**: 复杂查询可能影响数据库性能
5. **日志记录**: 记录查询参数以便调试和优化