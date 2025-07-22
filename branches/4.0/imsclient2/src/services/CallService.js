import { NativeModules, DeviceEventEmitter } from 'react-native';
import { Alert } from 'react-native';

const { CallModule } = NativeModules;

/**
 * 音视频通话服务
 * 提供完整的通话功能管理
 */
class CallService {
  constructor() {
    this.currentCall = null;
    this.callListeners = new Map();
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 来电事件
    DeviceEventEmitter.addListener('onIncomingCall', this.handleIncomingCall.bind(this));
    
    // 通话状态变化
    DeviceEventEmitter.addListener('onCallStateChanged', this.handleCallStateChanged.bind(this));
    
    // 通话发起
    DeviceEventEmitter.addListener('onCallInitiated', this.handleCallInitiated.bind(this));
    
    // 通话接听
    DeviceEventEmitter.addListener('onCallAnswered', this.handleCallAnswered.bind(this));
    
    // 通话结束
    DeviceEventEmitter.addListener('onCallEnded', this.handleCallEnded.bind(this));
    
    // 通话拒绝
    DeviceEventEmitter.addListener('onCallRejected', this.handleCallRejected.bind(this));
    
    // 静音状态变化
    DeviceEventEmitter.addListener('onMuteChanged', this.handleMuteChanged.bind(this));
    
    // 扬声器状态变化
    DeviceEventEmitter.addListener('onSpeakerChanged', this.handleSpeakerChanged.bind(this));
    
    // 摄像头切换
    DeviceEventEmitter.addListener('onCameraSwitched', this.handleCameraSwitched.bind(this));
  }

  /**
   * 发起音频通话
   * @param {string} sipAddress - 目标SIP地址
   * @param {object} options - 通话选项
   * @returns {Promise}
   */
  async makeAudioCall(sipAddress, options = {}) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.makeAudioCall(sipAddress);
      
      this.currentCall = {
        callId: result.callId,
        sipAddress: result.sipAddress,
        callType: 'audio',
        direction: 'outgoing',
        startTime: new Date(),
        status: 'connecting'
      };

      console.log('音频通话发起成功:', result);
      return result;
    } catch (error) {
      console.error('发起音频通话失败:', error);
      throw error;
    }
  }

  /**
   * 🎯 接管原生通话会话
   * @param {string} sessionId - 原生会话ID
   * @returns {Promise}
   */
  async takeoverCall(sessionId) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      console.log('正在接管原生会话:', sessionId);
      
      // 调用原生方法接管会话
      const result = await CallModule.takeoverCall(sessionId);
      
      this.currentCall = {
        callId: result.callId || sessionId,
        sipAddress: result.sipAddress || 'unknown',
        callType: result.callType || 'audio',
        direction: result.direction || 'unknown',
        startTime: new Date(),
        status: result.status || 'active',
        fromNative: true // 标记来自原生重定向
      };

      console.log('成功接管原生通话会话:', this.currentCall);
      return result;
    } catch (error) {
      console.error('接管原生通话会话失败:', error);
      throw error;
    }
  }

  /**
   * 发起视频通话
   * @param {string} sipAddress - 目标SIP地址
   * @param {object} options - 通话选项
   * @returns {Promise}
   */
  async makeVideoCall(sipAddress, options = {}) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.makeVideoCall(sipAddress);
      
      this.currentCall = {
        callId: result.callId,
        sipAddress: result.sipAddress,
        callType: 'video',
        direction: 'outgoing',
        startTime: new Date(),
        status: 'connecting'
      };

      console.log('视频通话发起成功:', result);
      return result;
    } catch (error) {
      console.error('发起视频通话失败:', error);
      throw error;
    }
  }

  /**
   * 接听通话
   * @param {boolean} withVideo - 是否接听视频
   * @returns {Promise}
   */
  async answerCall(withVideo = false) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.answerCall(withVideo);
      
      if (this.currentCall) {
        this.currentCall.status = 'active';
        this.currentCall.answerTime = new Date();
      }

      console.log('通话接听成功:', result);
      return result;
    } catch (error) {
      console.error('接听通话失败:', error);
      throw error;
    }
  }

  /**
   * 挂断通话
   * @returns {Promise}
   */
  async hangupCall() {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.hangupCall();
      
      if (this.currentCall) {
        this.currentCall.status = 'ended';
        this.currentCall.endTime = new Date();
        this.currentCall = null;
      }

      console.log('通话挂断成功:', result);
      return result;
    } catch (error) {
      console.error('挂断通话失败:', error);
      throw error;
    }
  }

  /**
   * 拒绝通话
   * @returns {Promise}
   */
  async rejectCall() {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.rejectCall();
      
      if (this.currentCall) {
        this.currentCall.status = 'rejected';
        this.currentCall.endTime = new Date();
        this.currentCall = null;
      }

      console.log('通话拒绝成功:', result);
      return result;
    } catch (error) {
      console.error('拒绝通话失败:', error);
      throw error;
    }
  }

  /**
   * 切换静音状态
   * @param {boolean} mute - 是否静音
   * @returns {Promise}
   */
  async toggleMute(mute) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.toggleMute(mute);
      console.log('静音状态切换成功:', result);
      return result;
    } catch (error) {
      console.error('切换静音状态失败:', error);
      throw error;
    }
  }

  /**
   * 切换扬声器状态
   * @param {boolean} speaker - 是否开启扬声器
   * @returns {Promise}
   */
  async toggleSpeaker(speaker) {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.toggleSpeaker(speaker);
      console.log('扬声器状态切换成功:', result);
      return result;
    } catch (error) {
      console.error('切换扬声器状态失败:', error);
      throw error;
    }
  }

  /**
   * 切换摄像头
   * @returns {Promise}
   */
  async switchCamera() {
    try {
      if (!CallModule) {
        throw new Error('CallModule 不可用');
      }

      const result = await CallModule.switchCamera();
      console.log('摄像头切换成功:', result);
      return result;
    } catch (error) {
      console.error('切换摄像头失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前通话状态
   * @returns {Promise}
   */
  async getCallStatus() {
    try {
      if (!CallModule) {
        return { status: 'idle' };
      }

      const result = await CallModule.getCallStatus();
      return result;
    } catch (error) {
      console.error('获取通话状态失败:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * 获取当前通话信息
   * @returns {object|null}
   */
  getCurrentCall() {
    return this.currentCall;
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {function} listener - 监听器函数
   */
  addEventListener(event, listener) {
    if (!this.callListeners.has(event)) {
      this.callListeners.set(event, new Set());
    }
    this.callListeners.get(event).add(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {function} listener - 监听器函数
   */
  removeEventListener(event, listener) {
    if (this.callListeners.has(event)) {
      this.callListeners.get(event).delete(listener);
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {any} data - 事件数据
   */
  emitEvent(event, data) {
    if (this.callListeners.has(event)) {
      this.callListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件监听器执行出错 (${event}):`, error);
        }
      });
    }
  }

  // 事件处理方法
  handleIncomingCall(callData) {
    console.log('收到来电:', callData);
    
    this.currentCall = {
      callId: callData.callId,
      sipAddress: callData.sipAddress,
      callType: callData.callType,
      direction: 'incoming',
      startTime: new Date(),
      status: 'ringing'
    };

    this.emitEvent('incomingCall', callData);
  }

  handleCallStateChanged(stateData) {
    console.log('通话状态变化:', stateData);
    
    if (this.currentCall) {
      this.currentCall.lastStateChange = new Date();
      
      // 根据状态更新通话信息
      switch (stateData.state) {
        case 'connected':
          this.currentCall.status = 'active';
          this.currentCall.connectTime = new Date();
          break;
        case 'terminated':
        case 'failed':
          this.currentCall.status = 'ended';
          this.currentCall.endTime = new Date();
          this.currentCall = null;
          break;
        default:
          this.currentCall.status = stateData.state;
      }
    }

    this.emitEvent('callStateChanged', stateData);
  }

  handleCallInitiated(callData) {
    console.log('通话发起:', callData);
    this.emitEvent('callInitiated', callData);
  }

  handleCallAnswered(callData) {
    console.log('通话接听:', callData);
    this.emitEvent('callAnswered', callData);
  }

  handleCallEnded(callData) {
    console.log('通话结束:', callData);
    this.currentCall = null;
    this.emitEvent('callEnded', callData);
  }

  handleCallRejected(callData) {
    console.log('通话拒绝:', callData);
    this.currentCall = null;
    this.emitEvent('callRejected', callData);
  }

  handleMuteChanged(muteData) {
    console.log('静音状态变化:', muteData);
    this.emitEvent('muteChanged', muteData);
  }

  handleSpeakerChanged(speakerData) {
    console.log('扬声器状态变化:', speakerData);
    this.emitEvent('speakerChanged', speakerData);
  }

  handleCameraSwitched(cameraData) {
    console.log('摄像头切换:', cameraData);
    this.emitEvent('cameraSwitched', cameraData);
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 移除所有事件监听器
    DeviceEventEmitter.removeAllListeners('onIncomingCall');
    DeviceEventEmitter.removeAllListeners('onCallStateChanged');
    DeviceEventEmitter.removeAllListeners('onCallInitiated');
    DeviceEventEmitter.removeAllListeners('onCallAnswered');
    DeviceEventEmitter.removeAllListeners('onCallEnded');
    DeviceEventEmitter.removeAllListeners('onCallRejected');
    DeviceEventEmitter.removeAllListeners('onMuteChanged');
    DeviceEventEmitter.removeAllListeners('onSpeakerChanged');
    DeviceEventEmitter.removeAllListeners('onCameraSwitched');
    
    // 清理监听器
    this.callListeners.clear();
    
    // 清理当前通话
    this.currentCall = null;
  }
}

// 创建单例实例
const callService = new CallService();

export default callService;
export { CallService };
