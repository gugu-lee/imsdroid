/**
 * request.js 使用示例
 * 演示如何使用封装的GET和POST请求方法
 * 
 * 数据格式约定：
 * 所有响应数据格式为：{code: 0, message: '', payload: any}
 * code: 0表示成功，非0表示错误
 */

import { get, post, isSuccess, getPayload, getErrorMessage } from './request';

// 设置API基础URL（可选，如果需要动态修改）
// setBaseUrl('https://your-api-domain.com/api');

/**
 * 用户相关API示例
 */
export const UserAPI = {
  // GET请求示例 - 获取用户列表
  async getUserList(params = {}) {
    try {
      const result = await get('/users', {
        params: {
          page: 1,
          limit: 10,
          ...params,
        },
        timeout: 5000, // 自定义超时时间
      });

      // 使用新的数据格式约定
      if (result.code === 0) {
        console.log('获取用户列表成功:', result.payload);
        return result.payload;
      } else {
        console.error('获取用户列表失败:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('UserAPI.getUserList error:', error);
      throw error;
    }
  },

  // GET请求示例 - 获取单个用户信息
  async getUserById(userId) {
    try {
      const result = await get(`/users/${userId}`);
      
      if (result.code === 0) {
        return result.payload;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('UserAPI.getUserById error:', error);
      throw error;
    }
  },

  // POST请求示例 - 创建用户
  async createUser(userData) {
    try {
      const result = await post('/users', userData, {
        headers: {
          Authorization: 'Bearer your-token-here',
        },
      });

      if (result.code === 0) {
        console.log('创建用户成功:', result.payload);
        return result.payload;
      } else {
        console.error('创建用户失败:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('UserAPI.createUser error:', error);
      throw error;
    }
  },

  // POST请求示例 - 用户登录
  async login(credentials) {
    try {
      const result = await post('/auth/login', credentials);
      
      if (result.code === 0) {
        const { token, user } = result.payload;
        // 保存token到本地存储
        // AsyncStorage.setItem('userToken', token);
        return { token, user };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('UserAPI.login error:', error);
      throw error;
    }
  },
};

/**
 * 文件上传示例
 */
export const FileAPI = {
  // POST请求 - 上传文件 (FormData)
  async uploadFile(file, additionalData = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // 添加其他字段
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const result = await post('/upload', formData, {
        headers: {
          'Authorization': 'Bearer your-token-here',
        },
        // FormData会自动设置Content-Type，不需要手动设置
      });

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('FileAPI.uploadFile error:', error);
      throw error;
    }
  },
};

/**
 * 数据分析相关API示例（配合Discovery页面使用）
 */
export const AnalyticsAPI = {
  // 获取训练模型列表
  async getTrainingModels() {
    return await get('/models/training');
  },

  // 开始训练模型
  async startTraining(modelConfig) {
    return await post('/models/train', modelConfig);
  },

  // 获取回测结果
  async getBacktestResults(timeframe = '1M') {
    return await get('/backtest/results', {
      params: { timeframe },
    });
  },

  // 运行回测
  async runBacktest(backtestConfig) {
    return await post('/backtest/run', backtestConfig);
  },

  // 获取预测结果
  async getPredictions(symbol) {
    return await get('/predictions', {
      params: { symbol },
    });
  },

  // 运行预测
  async runPrediction(predictionConfig) {
    return await post('/predictions/run', predictionConfig);
  },
};

/**
 * 错误处理示例 - 根据新的数据格式约定
 */
export const handleApiError = (response) => {
  if (response.code === -1001) {
    // 处理超时错误
    console.warn('请求超时，请检查网络连接');
    return '网络超时，请重试';
  } else if (response.code === -1002) {
    // 处理HTTP错误
    console.warn('服务器错误:', response.message);
    return '服务器错误，请稍后重试';
  } else if (response.code === -1003) {
    // 处理连接错误
    console.warn('网络连接失败');
    return '网络连接失败，请检查网络设置';
  } else if (response.code !== 0) {
    // 处理业务错误
    console.warn('业务错误:', response.message);
    return response.message || '操作失败';
  } else {
    // 处理其他未知错误
    console.error('未知错误:', response);
    return '未知错误，请联系技术支持';
  }
};

/**
 * 批量请求示例
 */
export const batchRequests = async () => {
  try {
    const [usersResult, modelsResult, predictionsResult] = await Promise.all([
      get('/users'),
      get('/models'),
      get('/predictions'),
    ]);

    return {
      users: usersResult.success ? usersResult.data : [],
      models: modelsResult.success ? modelsResult.data : [],
      predictions: predictionsResult.success ? predictionsResult.data : [],
    };
  } catch (error) {
    console.error('Batch requests error:', error);
    throw error;
  }
};

/**
 * 请求拦截器示例（如果需要全局处理）
 */
export const createAuthenticatedRequest = (token) => {
  return {
    async get(endpoint, options = {}) {
      return await get(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
    },

    async post(endpoint, data, options = {}) {
      return await post(endpoint, data, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
    },
  };
};