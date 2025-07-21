# 音视频通话功能现代化方案

## 📊 当前架构分析

### 原有实现架构
1. **底层媒体引擎**: 基于 Doubango/TinyWRAP 的 SIP 协议栈
   - `NgnProxyVideoProducer.java` - 视频采集
   - `NgnProxyVideoConsumer.java` - 视频渲染
   - `NgnProxyAudioProducer.java` - 音频采集
   - `NgnProxyAudioConsumer.java` - 音频播放

2. **通话管理**:
   - `NgnHistoryAVCallEvent.java` - 音视频通话历史记录
   - `ScreenInterceptCall.java` - 通话拦截界面

3. **当前问题**:
   - 基于传统的 Camera API (已废弃)
   - 使用 SurfaceView 进行视频渲染 (性能受限)
   - 缺乏现代化的权限管理
   - 没有 React Native 桥接

## 🎯 现代化目标

### 技术栈升级
1. **视频处理**: Camera2 API → CameraX
2. **视频渲染**: SurfaceView → TextureView/SurfaceView
3. **音频处理**: AudioRecord/AudioTrack → AAudio
4. **UI框架**: 原生Android → React Native
5. **权限管理**: 现代化权限请求机制

### 用户体验改进
1. **通话界面**: 微信风格的现代化UI
2. **操作流程**: 简化的拨打/接听流程
3. **多媒体控制**: 静音、摄像头切换、扬声器等
4. **网络适配**: 自动网络质量调整

## 🏗️ 实施方案

### Phase 1: React Native 桥接模块 (1-2周)

#### 1.1 创建音视频通话模块
```java
// CallModule.java - 主要通话管理模块
public class CallModule extends ReactContextBaseJavaModule {
    // 发起音频通话
    @ReactMethod
    public void makeAudioCall(String sipAddress, Promise promise);
    
    // 发起视频通话
    @ReactMethod
    public void makeVideoCall(String sipAddress, Promise promise);
    
    // 接听通话
    @ReactMethod
    public void answerCall(boolean withVideo, Promise promise);
    
    // 挂断通话
    @ReactMethod
    public void hangupCall(Promise promise);
    
    // 切换摄像头
    @ReactMethod
    public void switchCamera(Promise promise);
    
    // 静音/取消静音
    @ReactMethod
    public void toggleMute(boolean mute, Promise promise);
    
    // 开启/关闭扬声器
    @ReactMethod
    public void toggleSpeaker(boolean speaker, Promise promise);
}
```

#### 1.2 React Native 服务层
```javascript
// CallService.js
class CallService {
  async makeAudioCall(sipAddress) {
    return CallModule.makeAudioCall(sipAddress);
  }
  
  async makeVideoCall(sipAddress) {
    return CallModule.makeVideoCall(sipAddress);
  }
  
  // 事件监听
  setupCallListeners() {
    DeviceEventEmitter.addListener('onIncomingCall', this.handleIncomingCall);
    DeviceEventEmitter.addListener('onCallStateChanged', this.handleCallStateChanged);
    DeviceEventEmitter.addListener('onCallEnded', this.handleCallEnded);
  }
}
```

### Phase 2: 现代化视频处理 (2-3周)

#### 2.1 升级视频采集 (CameraX)
```java
// ModernVideoProducer.java
public class ModernVideoProducer {
    private CameraX camera;
    private Preview preview;
    private ImageCapture imageCapture;
    private VideoCapture videoCapture;
    
    public void startCamera() {
        // 使用 CameraX 初始化摄像头
        preview = new Preview.Builder().build();
        imageCapture = new ImageCapture.Builder().build();
        videoCapture = new VideoCapture.Builder().build();
        
        CameraX.bindToLifecycle((LifecycleOwner) this, 
            CameraSelector.DEFAULT_BACK_CAMERA, 
            preview, imageCapture, videoCapture);
    }
}
```

#### 2.2 视频渲染组件
```javascript
// VideoCallView.js - React Native 视频通话组件
import { requireNativeComponent } from 'react-native';

const NativeVideoView = requireNativeComponent('VideoCallView');

export const VideoCallView = ({ remoteVideoEnabled, localVideoEnabled, ...props }) => {
  return (
    <View style={styles.container}>
      {/* 远程视频 */}
      <NativeVideoView
        style={styles.remoteVideo}
        videoType="remote"
        {...props}
      />
      
      {/* 本地视频 */}
      {localVideoEnabled && (
        <NativeVideoView
          style={styles.localVideo}
          videoType="local"
          {...props}
        />
      )}
    </View>
  );
};
```

### Phase 3: 音频处理优化 (1-2周)

#### 3.1 现代化音频引擎
```java
// ModernAudioEngine.java
public class ModernAudioEngine {
    private AAudioStream inputStream;
    private AAudioStream outputStream;
    
    public void startAudioCapture() {
        // 使用 AAudio 进行音频采集
        AAudioStreamBuilder builder = AAudio.createStreamBuilder()
            .setDirection(AAudioDirection.INPUT)
            .setSampleRate(48000)
            .setChannelCount(1)
            .setFormat(AAudioFormat.PCM_I16);
            
        inputStream = builder.openStream();
        inputStream.startStream();
    }
}
```

### Phase 4: UI/UX 现代化 (2-3周)

#### 4.1 通话界面设计
```javascript
// InCallScreen.js - 通话中界面
const InCallScreen = ({ route, navigation }) => {
  const { callType, contactName, sipAddress } = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  
  return (
    <SafeAreaView style={styles.container}>
      {/* 视频区域 */}
      {isVideoEnabled && (
        <VideoCallView
          remoteVideoEnabled={true}
          localVideoEnabled={true}
          style={styles.videoContainer}
        />
      )}
      
      {/* 通话信息 */}
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>{contactName}</Text>
        <Text style={styles.callStatus}>通话中</Text>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
      </View>
      
      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.activeControl]}
          onPress={toggleMute}
        >
          <Icon name={isMuted ? 'mic-off' : 'mic'} size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.hangupButton}
          onPress={handleHangup}
        >
          <Icon name="call-end" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, isSpeakerOn && styles.activeControl]}
          onPress={toggleSpeaker}
        >
          <Icon name="volume-up" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

#### 4.2 来电界面
```javascript
// IncomingCallScreen.js - 来电界面
const IncomingCallScreen = ({ route, navigation }) => {
  const { callerName, sipAddress, hasVideo } = route.params;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* 来电信息 */}
      <View style={styles.callerInfo}>
        <Image source={{ uri: callerAvatar }} style={styles.avatar} />
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callType}>
          {hasVideo ? '视频通话' : '语音通话'}
        </Text>
      </View>
      
      {/* 接听/拒绝按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Icon name="call-end" size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
          <Icon name="call" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

### Phase 5: 高级功能 (2-3周)

#### 5.1 网络自适应
```java
// NetworkQualityManager.java
public class NetworkQualityManager {
    public void adjustVideoQuality(NetworkQuality quality) {
        switch (quality) {
            case HIGH:
                setVideoResolution(1280, 720);
                setVideoBitrate(2000);
                break;
            case MEDIUM:
                setVideoResolution(640, 480);
                setVideoBitrate(1000);
                break;
            case LOW:
                setVideoResolution(320, 240);
                setVideoBitrate(500);
                break;
        }
    }
}
```

#### 5.2 通话记录集成
```javascript
// CallHistoryService.js
class CallHistoryService {
  async addCallRecord(callData) {
    const record = {
      sipAddress: callData.sipAddress,
      contactName: callData.contactName,
      callType: callData.callType, // 'audio' | 'video'
      direction: callData.direction, // 'incoming' | 'outgoing'
      duration: callData.duration,
      timestamp: new Date().toISOString(),
      status: callData.status // 'completed' | 'missed' | 'rejected'
    };
    
    await DatabaseService.addCallHistory(record);
  }
}
```

## 📱 用户界面流程

### 拨打通话流程
1. 好友详情页 → 点击"语音通话"/"视频通话"
2. 检查权限 → 请求必要权限
3. 发起通话 → 显示"呼叫中"界面
4. 对方应答 → 进入通话界面

### 接听通话流程
1. 收到来电 → 显示来电界面
2. 用户选择 → 接听/拒绝
3. 接听成功 → 进入通话界面

## 🛠️ 技术实施细节

### 权限管理
```javascript
// PermissionManager.js
class PermissionManager {
  async requestCallPermissions(includeCamera = false) {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
    ];
    
    if (includeCamera) {
      permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
    }
    
    const results = await PermissionsAndroid.requestMultiple(permissions);
    return this.checkPermissionResults(results);
  }
}
```

### 状态管理
```javascript
// callReducer.js
const callReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCOMING_CALL':
      return {
        ...state,
        currentCall: action.payload,
        callState: 'ringing'
      };
    case 'CALL_ANSWERED':
      return {
        ...state,
        callState: 'active'
      };
    case 'CALL_ENDED':
      return {
        ...state,
        currentCall: null,
        callState: 'idle'
      };
    default:
      return state;
  }
};
```

## 📅 实施时间表

| 阶段 | 功能 | 时间 | 优先级 |
|------|------|------|--------|
| Phase 1 | React Native 桥接 | 1-2周 | 高 |
| Phase 2 | 视频处理现代化 | 2-3周 | 高 |
| Phase 3 | 音频优化 | 1-2周 | 中 |
| Phase 4 | UI/UX 现代化 | 2-3周 | 高 |
| Phase 5 | 高级功能 | 2-3周 | 低 |

## 🔄 下一步行动

1. **立即开始**: 创建 CallModule React Native 桥接
2. **并行进行**: 设计现代化的通话UI界面
3. **逐步迁移**: 从原有的视频处理逐步迁移到 CameraX
4. **测试验证**: 每个阶段完成后进行功能测试

## 📋 测试计划

### 功能测试
- [ ] 音频通话拨打/接听
- [ ] 视频通话拨打/接听
- [ ] 通话中控制 (静音、扬声器、摄像头切换)
- [ ] 网络异常处理
- [ ] 权限管理

### 性能测试
- [ ] 视频渲染性能
- [ ] 音频延迟测试
- [ ] 内存使用监控
- [ ] 电池消耗测试

### 兼容性测试
- [ ] 不同Android版本
- [ ] 不同设备型号
- [ ] 不同网络环境

这个现代化方案将使音视频通话功能达到主流应用的水准，提供良好的用户体验和稳定的性能。
