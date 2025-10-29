# Training Module

此目录包含所有与模型训练相关的页面组件。

## 文件结构

```
training/
├── index.js                       # 导出文件
├── TrainingTab.js                 # 训练主页面（Tab页面）
├── TrainingSessionListScreen.js   # 训练session列表页面（初始页面）
├── ModelConfigScreen.js           # 模型配置页面
├── TrainingProgressScreen.js      # 训练进度页面
├── TrainingResultScreen.js        # 训练结果页面
└── README.md                      # 本文件
```

## 页面说明

### TrainingTab.js
- **功能**: 训练模块的主页面，显示在Discovery的Tab中
- **特性**: 
  - 模型列表管理
  - 快速操作入口
  - 训练统计概览
  - 模型状态监控

### ModelConfigScreen.js
- **功能**: 模型配置和参数设置页面
- **特性**:
  - 模型类型选择（LSTM、GRU、Transformer等）
  - 超参数配置（学习率、批次大小等）
  - 训练设置（GPU加速、早停机制等）
  - 高级配置选项

### TrainingProgressScreen.js
- **功能**: 实时显示模型训练进度
- **特性**:
  - 训练进度条和状态显示
  - 实时损失和准确率监控
  - 损失变化曲线图表
  - 时间估算和性能监控

### TrainingResultScreen.js
- **功能**: 训练完成后的结果展示和操作
- **特性**:
  - 多标签页结果展示（概览、指标、性能、文件）
  - 模型导出功能
  - 结果分享功能
  - 快速跳转到回测和预测

## 导航流程

```
TrainingTab 
    ↓ (配置新模型)
ModelConfigScreen 
    ↓ (开始训练)
TrainingProgressScreen 
    ↓ (训练完成)
TrainingResultScreen
```

## 使用示例

```javascript
import { 
  TrainingTab, 
  ModelConfigScreen, 
  TrainingProgressScreen, 
  TrainingResultScreen 
} from './training';

// 在路由中使用
<Stack.Screen name="Training" component={TrainingTab} />
<Stack.Screen name="ModelConfig" component={ModelConfigScreen} />
<Stack.Screen name="TrainingProgress" component={TrainingProgressScreen} />
<Stack.Screen name="TrainingResult" component={TrainingResultScreen} />
```

## 数据接口

训练相关页面会使用 `src/utils/request.js` 中的API接口：

```javascript
import { get, post } from '../../utils/request';

// 获取训练模型列表
const models = await get('/models/training');

// 开始训练
const result = await post('/models/train', config);
```

## 注意事项

1. 所有API调用都遵循 `{code: 0, message: '', payload: any}` 格式约定
2. 页面间传递参数通过 `route.params` 进行
3. 训练状态使用统一的状态管理（preparing, training, completed, error）
4. 所有文件大小和时间格式都有统一的格式化函数