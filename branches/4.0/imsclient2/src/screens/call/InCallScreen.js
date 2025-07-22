import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import callService from '../../services/CallService';

const { width, height } = Dimensions.get('window');

const InCallScreen = ({ route, navigation }) => {
  const {
    callType = 'audio',
    contactName = '未知联系人',
    sipAddress,
    friendId,
    direction = 'outgoing',
    sessionId, // 🎯 从原生重定向传来的会话ID
  } = route.params || {};

  const [callState, setCallState] = useState(direction === 'outgoing' ? 'connecting' : 'ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  useEffect(() => {
    // 设置状态栏
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');

    // 🎯 检查是否从原生重定向而来
    if (sessionId) {
      console.log('从原生界面重定向到现代化UI，会话ID:', sessionId);
      // 接管现有的通话会话
      takeoverNativeCall(sessionId);
    } else {
      // 设置正常的通话事件监听
      setupCallListeners();
    }

    // 阻止返回按钮
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 通话中不允许返回
      return true;
    });

    // 如果是视频通话，默认开启扬声器
    if (callType === 'video') {
      setIsSpeakerOn(true);
    }

    return () => {
      cleanupCall();
      backHandler.remove();
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
    };
  }, [sessionId]);

  const setupCallListeners = () => {
    callService.addEventListener('callStateChanged', handleCallStateChanged);
    callService.addEventListener('callAnswered', handleCallAnswered);
    callService.addEventListener('callEnded', handleCallEnded);
    callService.addEventListener('muteChanged', handleMuteChanged);
    callService.addEventListener('speakerChanged', handleSpeakerChanged);
  };

  /**
   * 🎯 接管原生通话会话
   */
  const takeoverNativeCall = async (nativeSessionId) => {
    try {
      console.log('接管原生通话会话:', nativeSessionId);
      
      // 设置事件监听
      setupCallListeners();
      
      // 通知CallService接管现有会话
      await callService.takeoverCall(nativeSessionId);
      
      // 根据传入的direction设置初始状态
      if (direction === 'incoming') {
        setCallState('ringing');
      } else {
        setCallState('connecting');
      }
      
      console.log('成功接管原生通话会话');
    } catch (error) {
      console.error('接管原生通话会话失败:', error);
      Alert.alert('错误', '无法接管通话会话');
      navigation.goBack();
    }
  };

  const cleanupCall = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    callService.removeEventListener('callStateChanged', handleCallStateChanged);
    callService.removeEventListener('callAnswered', handleCallAnswered);
    callService.removeEventListener('callEnded', handleCallEnded);
    callService.removeEventListener('muteChanged', handleMuteChanged);
    callService.removeEventListener('speakerChanged', handleSpeakerChanged);
  };

  const startCallTimer = () => {
    callStartTime.current = new Date();
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        const duration = Math.floor((new Date() - callStartTime.current) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  const handleCallStateChanged = (stateData) => {
    console.log('通话状态变化:', stateData);
    
    switch (stateData.state) {
      case 'connected':
        setCallState('active');
        startCallTimer();
        break;
      case 'terminated':
      case 'failed':
        setCallState('ended');
        navigation.goBack();
        break;
      default:
        setCallState(stateData.state);
    }
  };

  const handleCallAnswered = () => {
    setCallState('active');
    startCallTimer();
  };

  const handleCallEnded = () => {
    setCallState('ended');
    navigation.goBack();
  };

  const handleMuteChanged = (muteData) => {
    setIsMuted(muteData.muted);
  };

  const handleSpeakerChanged = (speakerData) => {
    setIsSpeakerOn(speakerData.speakerOn);
  };

  const handleHangup = async () => {
    try {
      await callService.hangupCall();
      setCallState('ended');
      navigation.goBack();
    } catch (error) {
      console.error('挂断通话失败:', error);
      Alert.alert('错误', '挂断通话失败');
    }
  };

  const toggleMute = async () => {
    try {
      const newMutedState = !isMuted;
      await callService.toggleMute(newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('切换静音失败:', error);
      Alert.alert('错误', '切换静音失败');
    }
  };

  const toggleSpeaker = async () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      await callService.toggleSpeaker(newSpeakerState);
      setIsSpeakerOn(newSpeakerState);
    } catch (error) {
      console.error('切换扬声器失败:', error);
      Alert.alert('错误', '切换扬声器失败');
    }
  };

  const switchCamera = async () => {
    try {
      await callService.switchCamera();
      setIsFrontCamera(!isFrontCamera);
    } catch (error) {
      console.error('切换摄像头失败:', error);
      Alert.alert('错误', '切换摄像头失败');
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // TODO: 实现视频开关功能
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callState) {
      case 'connecting':
        return '正在连接...';
      case 'ringing':
        return direction === 'outgoing' ? '正在呼叫...' : '来电中...';
      case 'active':
        return formatDuration(callDuration);
      case 'ended':
        return '通话结束';
      default:
        return callState;
    }
  };

  const getCallStateColor = () => {
    switch (callState) {
      case 'active':
        return '#34C759';
      case 'connecting':
      case 'ringing':
        return '#FF9500';
      case 'ended':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 视频区域 */}
      {isVideoEnabled && (
        <View style={styles.videoContainer}>
          {/* 这里将来会放置原生视频组件 */}
          <View style={styles.remoteVideo}>
            <Text style={styles.videoPlaceholder}>远程视频</Text>
          </View>
          
          <View style={styles.localVideo}>
            <Text style={styles.videoPlaceholder}>本地视频</Text>
          </View>
        </View>
      )}

      {/* 音频通话信息区域 */}
      {!isVideoEnabled && (
        <View style={styles.audioCallInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {contactName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.contactName}>{contactName}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getCallStateColor() }]} />
          <Text style={styles.callStatus}>{getCallStatusText()}</Text>
        </View>
      )}

      {/* 控制按钮区域 */}
      <View style={styles.controlsContainer}>
        <View style={styles.primaryControls}>
          {/* 静音按钮 */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.activeControlButton]}
            onPress={toggleMute}
          >
            <Icon 
              name={isMuted ? 'mic-off' : 'mic'} 
              size={24} 
              color={isMuted ? '#FF3B30' : '#FFFFFF'} 
            />
          </TouchableOpacity>

          {/* 挂断按钮 */}
          <TouchableOpacity style={styles.hangupButton} onPress={handleHangup}>
            <Icon name="call-end" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 扬声器按钮 */}
          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.activeControlButton]}
            onPress={toggleSpeaker}
          >
            <Icon 
              name={isSpeakerOn ? 'volume-up' : 'volume-down'} 
              size={24} 
              color={isSpeakerOn ? '#34C759' : '#FFFFFF'} 
            />
          </TouchableOpacity>
        </View>

        {/* 视频通话额外控制 */}
        {callType === 'video' && (
          <View style={styles.secondaryControls}>
            {/* 视频开关 */}
            <TouchableOpacity
              style={[styles.controlButton, !isVideoEnabled && styles.activeControlButton]}
              onPress={toggleVideo}
            >
              <Icon 
                name={isVideoEnabled ? 'videocam' : 'videocam-off'} 
                size={24} 
                color={isVideoEnabled ? '#FFFFFF' : '#FF3B30'} 
              />
            </TouchableOpacity>

            {/* 切换摄像头 */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={switchCamera}
              disabled={!isVideoEnabled}
            >
              <Icon 
                name="switch-camera" 
                size={24} 
                color={isVideoEnabled ? '#FFFFFF' : '#8E8E93'} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    color: '#8E8E93',
    fontSize: 14,
  },
  audioCallInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  controlsContainer: {
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeControlButton: {
    backgroundColor: '#3A3A3C',
  },
  hangupButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default InCallScreen;
