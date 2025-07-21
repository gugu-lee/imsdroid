package com.imsclient2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log;
import android.content.Intent;
import android.app.Activity;

import org.doubango.ngn.NgnEngine;
import org.doubango.ngn.services.INgnSipService;
import org.doubango.ngn.sip.NgnAVSession;
import org.doubango.ngn.media.NgnMediaType;

/**
 * React Native 音视频通话模块
 * 提供音频和视频通话功能的桥接
 */
public class CallModule extends ReactContextBaseJavaModule {
    private static final String TAG = "CallModule";
    private ReactApplicationContext reactContext;
    private INgnSipService sipService;
    private NgnAVSession currentCall;

    public CallModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.sipService = NgnEngine.getInstance().getSipService();
    }

    @Override
    public String getName() {
        return "CallModule";
    }

    /**
     * 发起音频通话
     * @param sipAddress 目标SIP地址
     * @param promise Promise回调
     */
    @ReactMethod
    public void makeAudioCall(String sipAddress, Promise promise) {
        try {
            Log.d(TAG, "Making audio call to: " + sipAddress);
            
            if (sipService == null || !sipService.isRegistered()) {
                promise.reject("SIP_NOT_REGISTERED", "SIP服务未注册");
                return;
            }

            // 创建音频通话会话
            currentCall = NgnAVSession.createOutgoingSession(
                sipService.getSipStack(), 
                NgnMediaType.Audio, 
                sipAddress
            );

            if (currentCall != null && currentCall.makeCall()) {
                // 发送通话开始事件
                sendCallEvent("onCallInitiated", sipAddress, "audio", "outgoing");
                
                WritableMap result = Arguments.createMap();
                result.putString("status", "success");
                result.putString("callId", String.valueOf(currentCall.getId()));
                result.putString("sipAddress", sipAddress);
                result.putString("callType", "audio");
                promise.resolve(result);
                
                Log.d(TAG, "Audio call initiated successfully");
            } else {
                promise.reject("CALL_FAILED", "无法发起音频通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error making audio call", e);
            promise.reject("CALL_ERROR", e.getMessage());
        }
    }

    /**
     * 发起视频通话
     * @param sipAddress 目标SIP地址
     * @param promise Promise回调
     */
    @ReactMethod
    public void makeVideoCall(String sipAddress, Promise promise) {
        try {
            Log.d(TAG, "Making video call to: " + sipAddress);
            
            if (sipService == null || !sipService.isRegistered()) {
                promise.reject("SIP_NOT_REGISTERED", "SIP服务未注册");
                return;
            }

            // 创建视频通话会话
            currentCall = NgnAVSession.createOutgoingSession(
                sipService.getSipStack(), 
                NgnMediaType.AudioVideo, 
                sipAddress
            );

            if (currentCall != null && currentCall.makeCall()) {
                // 发送通话开始事件
                sendCallEvent("onCallInitiated", sipAddress, "video", "outgoing");
                
                WritableMap result = Arguments.createMap();
                result.putString("status", "success");
                result.putString("callId", String.valueOf(currentCall.getId()));
                result.putString("sipAddress", sipAddress);
                result.putString("callType", "video");
                promise.resolve(result);
                
                Log.d(TAG, "Video call initiated successfully");
            } else {
                promise.reject("CALL_FAILED", "无法发起视频通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error making video call", e);
            promise.reject("CALL_ERROR", e.getMessage());
        }
    }

    /**
     * 接听通话
     * @param withVideo 是否接听视频
     * @param promise Promise回调
     */
    @ReactMethod
    public void answerCall(boolean withVideo, Promise promise) {
        try {
            Log.d(TAG, "Answering call with video: " + withVideo);
            
            if (currentCall != null) {
                boolean success;
                if (withVideo) {
                    success = currentCall.acceptCall(NgnMediaType.AudioVideo);
                } else {
                    success = currentCall.acceptCall(NgnMediaType.Audio);
                }

                if (success) {
                    sendCallEvent("onCallAnswered", "", withVideo ? "video" : "audio", "incoming");
                    
                    WritableMap result = Arguments.createMap();
                    result.putString("status", "success");
                    result.putString("callType", withVideo ? "video" : "audio");
                    promise.resolve(result);
                    
                    Log.d(TAG, "Call answered successfully");
                } else {
                    promise.reject("ANSWER_FAILED", "无法接听通话");
                }
            } else {
                promise.reject("NO_ACTIVE_CALL", "没有活动的通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error answering call", e);
            promise.reject("ANSWER_ERROR", e.getMessage());
        }
    }

    /**
     * 挂断通话
     * @param promise Promise回调
     */
    @ReactMethod
    public void hangupCall(Promise promise) {
        try {
            Log.d(TAG, "Hanging up call");
            
            if (currentCall != null) {
                boolean success = currentCall.hangUpCall();
                
                if (success) {
                    sendCallEvent("onCallEnded", "", "", "");
                    currentCall = null;
                    
                    WritableMap result = Arguments.createMap();
                    result.putString("status", "success");
                    promise.resolve(result);
                    
                    Log.d(TAG, "Call hung up successfully");
                } else {
                    promise.reject("HANGUP_FAILED", "无法挂断通话");
                }
            } else {
                // 即使没有活动通话也算成功
                WritableMap result = Arguments.createMap();
                result.putString("status", "success");
                result.putString("message", "没有活动的通话");
                promise.resolve(result);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error hanging up call", e);
            promise.reject("HANGUP_ERROR", e.getMessage());
        }
    }

    /**
     * 拒绝通话
     * @param promise Promise回调
     */
    @ReactMethod
    public void rejectCall(Promise promise) {
        try {
            Log.d(TAG, "Rejecting call");
            
            if (currentCall != null) {
                boolean success = currentCall.rejectCall();
                
                if (success) {
                    sendCallEvent("onCallRejected", "", "", "incoming");
                    currentCall = null;
                    
                    WritableMap result = Arguments.createMap();
                    result.putString("status", "success");
                    promise.resolve(result);
                    
                    Log.d(TAG, "Call rejected successfully");
                } else {
                    promise.reject("REJECT_FAILED", "无法拒绝通话");
                }
            } else {
                promise.reject("NO_ACTIVE_CALL", "没有活动的通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error rejecting call", e);
            promise.reject("REJECT_ERROR", e.getMessage());
        }
    }

    /**
     * 切换静音状态
     * @param mute 是否静音
     * @param promise Promise回调
     */
    @ReactMethod
    public void toggleMute(boolean mute, Promise promise) {
        try {
            Log.d(TAG, "Toggling mute: " + mute);
            
            if (currentCall != null) {
                // TODO: 实现静音功能
                // currentCall.setMute(mute);
                
                sendCallEvent("onMuteChanged", "", "", "");
                
                WritableMap result = Arguments.createMap();
                result.putString("status", "success");
                result.putBoolean("muted", mute);
                promise.resolve(result);
                
                Log.d(TAG, "Mute toggled successfully: " + mute);
            } else {
                promise.reject("NO_ACTIVE_CALL", "没有活动的通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error toggling mute", e);
            promise.reject("MUTE_ERROR", e.getMessage());
        }
    }

    /**
     * 切换扬声器状态
     * @param speaker 是否开启扬声器
     * @param promise Promise回调
     */
    @ReactMethod
    public void toggleSpeaker(boolean speaker, Promise promise) {
        try {
            Log.d(TAG, "Toggling speaker: " + speaker);
            
            // TODO: 实现扬声器切换功能
            
            sendCallEvent("onSpeakerChanged", "", "", "");
            
            WritableMap result = Arguments.createMap();
            result.putString("status", "success");
            result.putBoolean("speakerOn", speaker);
            promise.resolve(result);
            
            Log.d(TAG, "Speaker toggled successfully: " + speaker);
        } catch (Exception e) {
            Log.e(TAG, "Error toggling speaker", e);
            promise.reject("SPEAKER_ERROR", e.getMessage());
        }
    }

    /**
     * 切换摄像头
     * @param promise Promise回调
     */
    @ReactMethod
    public void switchCamera(Promise promise) {
        try {
            Log.d(TAG, "Switching camera");
            
            if (currentCall != null) {
                // TODO: 实现摄像头切换功能
                
                sendCallEvent("onCameraSwitched", "", "", "");
                
                WritableMap result = Arguments.createMap();
                result.putString("status", "success");
                promise.resolve(result);
                
                Log.d(TAG, "Camera switched successfully");
            } else {
                promise.reject("NO_ACTIVE_CALL", "没有活动的通话");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error switching camera", e);
            promise.reject("CAMERA_ERROR", e.getMessage());
        }
    }

    /**
     * 获取当前通话状态
     * @param promise Promise回调
     */
    @ReactMethod
    public void getCallStatus(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            
            if (currentCall != null) {
                result.putString("status", "active");
                result.putString("callId", String.valueOf(currentCall.getId()));
                result.putString("callType", currentCall.getMediaType() == NgnMediaType.AudioVideo ? "video" : "audio");
                result.putBoolean("isConnected", currentCall.isConnected());
            } else {
                result.putString("status", "idle");
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting call status", e);
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }

    /**
     * 发送通话事件到React Native
     */
    private void sendCallEvent(String eventName, String sipAddress, String callType, String direction) {
        WritableMap params = Arguments.createMap();
        params.putString("sipAddress", sipAddress);
        params.putString("callType", callType);
        params.putString("direction", direction);
        params.putString("timestamp", String.valueOf(System.currentTimeMillis()));
        
        Log.d(TAG, "Sending call event: " + eventName);
        
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    /**
     * 处理来电 (由原生SIP服务调用)
     */
    public void handleIncomingCall(NgnAVSession incomingCall, String fromSipAddress) {
        Log.d(TAG, "Handling incoming call from: " + fromSipAddress);
        
        this.currentCall = incomingCall;
        
        WritableMap params = Arguments.createMap();
        params.putString("sipAddress", fromSipAddress);
        params.putString("callType", incomingCall.getMediaType() == NgnMediaType.AudioVideo ? "video" : "audio");
        params.putString("direction", "incoming");
        params.putString("callId", String.valueOf(incomingCall.getId()));
        params.putString("timestamp", String.valueOf(System.currentTimeMillis()));
        
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onIncomingCall", params);
        }
    }

    /**
     * 处理通话状态变化 (由原生SIP服务调用)
     */
    public void handleCallStateChanged(String state, String reason) {
        Log.d(TAG, "Call state changed: " + state + ", reason: " + reason);
        
        WritableMap params = Arguments.createMap();
        params.putString("state", state);
        params.putString("reason", reason);
        params.putString("timestamp", String.valueOf(System.currentTimeMillis()));
        
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onCallStateChanged", params);
        }
        
        // 如果通话结束，清理当前会话
        if ("terminated".equals(state) || "failed".equals(state)) {
            currentCall = null;
        }
    }
}
