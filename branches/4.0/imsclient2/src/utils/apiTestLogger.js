/**
 * API请求测试脚本
 * 用于测试网络日志功能
 */

import request from '../utils/request';

/**
 * 测试GET请求日志
 */
export const testGetRequestLogs = async () => {
  console.log('🧪 [Test] 开始测试GET请求日志...');
  
  try {
    // 测试获取训练会话列表
    const response = await request.get('/sessions');
    
    console.log('🧪 [Test] GET请求测试完成');
    console.log('🧪 [Test] 响应结果:', response);
    
    return response;
  } catch (error) {
    console.error('🧪 [Test] GET请求测试失败:', error);
    throw error;
  }
};

/**
 * 测试POST请求日志
 */
export const testPostRequestLogs = async () => {
  console.log('🧪 [Test] 开始测试POST请求日志...');
  
  try {
    // 测试创建新的训练会话
    const testSessionData = {
      session_name: '测试训练会话',
      model_type: 'LSTM',
      description: '这是一个用于测试API日志的训练会话',
      data_start_date: '2024-01-01',
      data_end_date: '2024-10-31'
    };
    
    const response = await request.post('/sessions', testSessionData);
    
    console.log('🧪 [Test] POST请求测试完成');
    console.log('🧪 [Test] 响应结果:', response);
    
    return response;
  } catch (error) {
    console.error('🧪 [Test] POST请求测试失败:', error);
    throw error;
  }
};

/**
 * 测试错误请求日志
 */
export const testErrorRequestLogs = async () => {
  console.log('🧪 [Test] 开始测试错误请求日志...');
  
  try {
    // 测试访问不存在的端点
    const response = await request.get('/nonexistent-endpoint');
    
    console.log('🧪 [Test] 错误请求测试完成');
    console.log('🧪 [Test] 响应结果:', response);
    
    return response;
  } catch (error) {
    console.error('🧪 [Test] 错误请求测试完成(预期错误):', error);
    return { error: error.message };
  }
};

/**
 * 运行所有测试
 */
export const runAllTests = async () => {
  console.log('🧪 [Test Suite] ================================');
  console.log('🧪 [Test Suite] 开始API日志功能测试...');
  console.log('🧪 [Test Suite] ================================');
  
  const results = {
    get: null,
    post: null,
    error: null
  };
  
  // 测试GET请求
  try {
    results.get = await testGetRequestLogs();
  } catch (error) {
    results.get = { error: error.message };
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试POST请求
  try {
    results.post = await testPostRequestLogs();
  } catch (error) {
    results.post = { error: error.message };
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试错误请求
  try {
    results.error = await testErrorRequestLogs();
  } catch (error) {
    results.error = { error: error.message };
  }
  
  console.log('🧪 [Test Suite] ================================');
  console.log('🧪 [Test Suite] 所有测试完成!');
  console.log('🧪 [Test Suite] 测试结果汇总:');
  console.log('🧪 [GET Test]:', results.get ? '✅ 完成' : '❌ 失败');
  console.log('🧪 [POST Test]:', results.post ? '✅ 完成' : '❌ 失败');
  console.log('🧪 [Error Test]:', results.error ? '✅ 完成' : '❌ 失败');
  console.log('🧪 [Test Suite] ================================');
  
  return results;
};

/**
 * 在开发环境中自动运行测试（可选）
 */
if (__DEV__) {
  // 可以取消注释下面的行来自动运行测试
  // setTimeout(runAllTests, 5000); // 应用启动5秒后运行测试
}

export default {
  testGetRequestLogs,
  testPostRequestLogs,
  testErrorRequestLogs,
  runAllTests
};