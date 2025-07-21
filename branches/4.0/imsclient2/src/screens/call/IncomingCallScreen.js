import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import callService from '../../services/CallService';

const { width, height } = Dimensions.get('window');

const IncomingCallScreen = ({ route, navigation }) => {
  const {
    callerName = '未知来电',
    sipAddress,
    callType = 'audio',
    callId
  } = route.params || {};

  const [isRinging, setIsRinging] = useState(true);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // 设置状态栏
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');

    // 阻止返回按钮
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 来电时不允许返回
      return true;
    });

    // 设置通话事件监听
    setupCallListeners();

    // 开始脉冲动画
    startPulseAnimation();

    return () => {
      cleanupIncomingCall();
      backHandler.remove();
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
    };
  }, []);

  const setupCallListeners = () => {
    callService.addEventListener('callEnded', handleCallEnded);
    callService.addEventListener('callStateChanged', handleCallStateChanged);
  };

  const cleanupIncomingCall = () => {
    callService.removeEventListener('callEnded', handleCallEnded);
    callService.removeEventListener('callStateChanged', handleCallStateChanged);
    setIsRinging(false);
  };

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isRinging) {
          pulse();
        }
      });
    };
    pulse();
  };

  const handleCallEnded = () => {
    setIsRinging(false);
    navigation.goBack();
  };

  const handleCallStateChanged = (stateData) => {
    console.log('来电状态变化:', stateData);
    
    switch (stateData.state) {
      case 'terminated':
      case 'failed':
        setIsRinging(false);
        navigation.goBack();
        break;
    }
  };

  const handleAnswer = async () => {
    try {
      setIsRinging(false);
      
      // 接听通话
      await callService.answerCall(callType === 'video');
      
      // 导航到通话界面
      navigation.replace('InCall', {
        callType: callType,
        contactName: callerName,
        sipAddress: sipAddress,
        direction: 'incoming'
      });
    } catch (error) {
      console.error('接听通话失败:', error);
      Alert.alert('错误', '接听通话失败: ' + error.message);
      navigation.goBack();
    }
  };

  const handleReject = async () => {
    try {
      setIsRinging(false);
      await callService.rejectCall();
      navigation.goBack();
    } catch (error) {
      console.error('拒绝通话失败:', error);
      Alert.alert('错误', '拒绝通话失败: ' + error.message);
      navigation.goBack();
    }
  };

  const getCallTypeText = () => {
    return callType === 'video' ? '视频通话' : '语音通话';
  };

  const getCallTypeIcon = () => {
    return callType === 'video' ? 'videocam' : 'call';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 背景装饰 */}
      <View style={styles.backgroundDecoration}>
        <Animated.View 
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.pulseRing,
            styles.pulseRingDelay,
            { transform: [{ scale: pulseAnim }] }
          ]} 
        />
      </View>

      {/* 来电信息 */}
      <View style={styles.callerInfo}>
        <View style={styles.avatarContainer}>
          <Animated.View 
            style={[
              styles.avatar,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.avatarText}>
              {callerName.charAt(0).toUpperCase()}
            </Text>
          </Animated.View>
        </View>
        
        <Text style={styles.callerName}>{callerName}</Text>
        <View style={styles.callTypeContainer}>
          <Icon name={getCallTypeIcon()} size={20} color="#34C759" />
          <Text style={styles.callType}>{getCallTypeText()}</Text>
        </View>
        <Text style={styles.incomingText}>来电中...</Text>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionsContainer}>
        {/* 快捷操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="message" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="person-add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 主要操作 */}
        <View style={styles.mainActions}>
          {/* 拒绝按钮 */}
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={handleReject}
            activeOpacity={0.8}
          >
            <Icon name="call-end" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 接听按钮 */}
          <TouchableOpacity 
            style={styles.answerButton} 
            onPress={handleAnswer}
            activeOpacity={0.8}
          >
            <Icon name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  pulseRingDelay: {
    width: 400,
    height: 400,
    borderRadius: 200,
    borderColor: 'rgba(52, 199, 89, 0.2)',
    animationDelay: '0.5s',
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: 'rgba(52, 199, 89, 0.5)',
  },
  avatarText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  callType: {
    fontSize: 18,
    color: '#34C759',
    marginLeft: 8,
    fontWeight: '600',
  },
  incomingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 60,
  },
  quickActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rejectButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  answerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default IncomingCallScreen;
