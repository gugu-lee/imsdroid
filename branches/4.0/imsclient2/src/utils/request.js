/**
 * RESTful API请求工具类
 * 使用fetch实现GET和POST方法
 * 
 * 数据格式约定：
 * 所有JSON格式的返回数据统一为：
 * {
 *   code: 0,        // 0表示成功，非0表示错误
 *   message: '',    // 消息描述
 *   payload: any    // 实际数据载荷
 * }
 * 
 * 错误码约定：
 * 0: 成功
 * -1: 通用网络错误
 * -1001: 请求超时
 * -1002: HTTP状态错误
 * -1003: 网络连接失败
 */

// 默认配置
const DEFAULT_CONFIG = {
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// 基础URL配置（可根据环境变量或配置文件设置）
let BASE_URL = __DEV__
  ? 'http://192.168.10.6:7090/api/v1' // 开发环境
  : 'https://api.yourapp.com/api/v1'; // 生产环境

/**
 * 创建带超时的fetch请求
 * @param {string} url - 请求URL
 * @param {object} options - fetch选项
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise} fetch Promise
 */
const fetchWithTimeout = (url, options = {}, timeout = DEFAULT_CONFIG.timeout) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);
    }),
  ]);
};

/**
 * 处理响应数据
 * @param {Response} response - fetch响应对象
 * @returns {Promise} 处理后的数据
 */
const handleResponse = async (response) => {
  try {
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    // 获取Content-Type
    const contentType = response.headers.get('content-type');
    
    // 根据Content-Type解析数据
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      
      // 检查是否符合约定的格式 {code, message, payload}
      if (jsonData && typeof jsonData === 'object' && 'code' in jsonData) {
        return jsonData;
      } else {
        // 如果不符合约定格式，包装成约定格式
        return {
          code: 0,
          message: 'success',
          payload: jsonData,
        };
      }
    } else if (contentType && contentType.includes('text/')) {
      const textData = await response.text();
      return {
        code: 0,
        message: 'success',
        payload: textData,
      };
    } else {
      // 其他类型返回blob，包装成约定格式
      const blobData = await response.blob();
      return {
        code: 0,
        message: 'success',
        payload: blobData,
      };
    }
  } catch (error) {
    console.error('Response handling error:', error);
    throw error;
  }
};

/**
 * 处理请求错误
 * @param {Error} error - 错误对象
 * @returns {object} 标准化的错误对象
 */
const handleError = (error) => {
  console.error('Request error:', error);
  
  let errorMessage = '网络请求失败';
  let errorCode = -1; // 使用数字错误码
  
  if (error.message === 'Request timeout') {
    errorMessage = '请求超时，请检查网络连接';
    errorCode = -1001;
  } else if (error.message.includes('HTTP')) {
    errorMessage = error.message;
    errorCode = -1002;
  } else if (error.name === 'TypeError') {
    errorMessage = '网络连接失败，请检查网络设置';
    errorCode = -1003;
  }
  
  return {
    code: errorCode,
    message: errorMessage,
    payload: {
      originalError: error.message,
      errorType: error.name,
    },
  };
};

/**
 * 构建完整的URL
 * @param {string} endpoint - API端点
 * @param {object} params - URL参数对象
 * @returns {string} 完整的URL
 */
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`);
  
  // 添加查询参数
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
};

/**
 * GET请求
 * @param {string} endpoint - API端点
 * @param {object} options - 请求选项
 * @param {object} options.params - URL查询参数
 * @param {object} options.headers - 自定义请求头
 * @param {number} options.timeout - 超时时间
 * @returns {Promise<object>} 请求结果
 */
export const get = async (endpoint, options = {}) => {
  try {
    const {
      params = {},
      headers = {},
      timeout = DEFAULT_CONFIG.timeout,
      ...otherOptions
    } = options;

    // 构建URL
    const url = buildUrl(endpoint, params);

    // 合并请求头
    const requestHeaders = {
      ...DEFAULT_CONFIG.headers,
      ...headers,
    };

    // 发送请求
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: requestHeaders,
      ...otherOptions,
    }, timeout);

    // 处理响应
    const responseData = await handleResponse(response);

    // 如果服务器返回的数据已经是约定格式，直接返回
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      return responseData;
    }

    // 否则包装成约定格式
    return {
      code: 0,
      message: 'success',
      payload: responseData,
    };

  } catch (error) {
    return handleError(error);
  }
};

/**
 * POST请求
 * @param {string} endpoint - API端点
 * @param {object} data - 请求体数据
 * @param {object} options - 请求选项
 * @param {object} options.headers - 自定义请求头
 * @param {number} options.timeout - 超时时间
 * @param {string} options.contentType - 内容类型
 * @returns {Promise<object>} 请求结果
 */
export const post = async (endpoint, data = {}, options = {}) => {
  try {
    const {
      headers = {},
      timeout = DEFAULT_CONFIG.timeout,
      contentType = 'application/json',
      ...otherOptions
    } = options;

    // 构建URL
    const url = buildUrl(endpoint);

    // 合并请求头
    const requestHeaders = {
      ...DEFAULT_CONFIG.headers,
      'Content-Type': contentType,
      ...headers,
    };

    // 处理请求体
    let body;
    if (contentType === 'application/json') {
      body = JSON.stringify(data);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      body = new URLSearchParams(data);
    } else if (data instanceof FormData) {
      body = data;
      // FormData会自动设置Content-Type，需要删除手动设置的
      delete requestHeaders['Content-Type'];
    } else {
      body = data;
    }

    // 发送请求
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: requestHeaders,
      body,
      ...otherOptions,
    }, timeout);

    // 处理响应
    const responseData = await handleResponse(response);

    // 如果服务器返回的数据已经是约定格式，直接返回
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      return responseData;
    }

    // 否则包装成约定格式
    return {
      code: 0,
      message: 'success',
      payload: responseData,
    };

  } catch (error) {
    return handleError(error);
  }
};

/**
 * 通用请求方法（可扩展其他HTTP方法时使用）
 * @param {string} method - HTTP方法
 * @param {string} endpoint - API端点
 * @param {object} data - 请求数据
 * @param {object} options - 请求选项
 * @returns {Promise<object>} 请求结果
 */
export const request = async (method, endpoint, data = {}, options = {}) => {
  const upperMethod = method.toUpperCase();
  
  if (upperMethod === 'GET') {
    return get(endpoint, { params: data, ...options });
  } else if (upperMethod === 'POST') {
    return post(endpoint, data, options);
  } else {
    throw new Error(`HTTP method ${method} is not supported yet`);
  }
};

/**
 * 设置基础URL
 * @param {string} baseUrl - 新的基础URL
 */
export const setBaseUrl = (baseUrl) => {
  BASE_URL = baseUrl;
};

/**
 * 获取当前基础URL
 * @returns {string} 当前基础URL
 */
export const getBaseUrl = () => {
  return BASE_URL;
};

/**
 * 检查响应是否成功
 * @param {object} response - API响应对象
 * @returns {boolean} 是否成功
 */
export const isSuccess = (response) => {
  return response && response.code === 0;
};

/**
 * 获取响应数据
 * @param {object} response - API响应对象
 * @returns {any} 响应数据
 */
export const getPayload = (response) => {
  return response && response.payload;
};

/**
 * 获取错误信息
 * @param {object} response - API响应对象
 * @returns {string} 错误信息
 */
export const getErrorMessage = (response) => {
  return response && response.message || '未知错误';
};

/**
 * 创建成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 消息
 * @returns {object} 标准响应格式
 */
export const createSuccessResponse = (data, message = 'success') => {
  return {
    code: 0,
    message,
    payload: data,
  };
};

/**
 * 创建错误响应
 * @param {number} code - 错误码
 * @param {string} message - 错误消息
 * @param {any} data - 错误数据
 * @returns {object} 标准响应格式
 */
export const createErrorResponse = (code, message, data = null) => {
  return {
    code,
    message,
    payload: data,
  };
};

/**
 * 默认导出对象，包含所有方法
 */
export default {
  get,
  post,
  request,
  setBaseUrl,
  getBaseUrl,
  isSuccess,
  getPayload,
  getErrorMessage,
  createSuccessResponse,
  createErrorResponse,
};
