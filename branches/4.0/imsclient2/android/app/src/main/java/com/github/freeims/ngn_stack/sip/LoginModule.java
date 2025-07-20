package com.github.freeims.ngn_stack.sip;


import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.doubango.imsdroid.Engine;
import org.doubango.ngn.NgnApplication;
import org.doubango.ngn.events.NgnMessagingEventArgs;
import org.doubango.ngn.model.NgnHistoryEvent;
import org.doubango.ngn.services.impl.NgnSipService;
import org.doubango.ngn.sip.NgnMessagingSession;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


public class LoginModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LoginModule";
    private final ReactApplicationContext reactContext;

    private Engine engine;
    //private NgnApplication ngnApplication;
    private NgnSipService sipService;

    public LoginModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        //ngnApplication = new NgnApplication();
    }

    @NonNull
    @Override
    public String getName() {
        return "LoginModule";
    }
    @ReactMethod
    public void login(Promise promise) {

        try {
            engine = (Engine) Engine.getInstance();

            sipService=(NgnSipService) engine.getSipService();
            // 注释掉发送消息相关的业务逻辑
            /*
            boolean ret = false;
            final NgnMessagingSession imSession = NgnMessagingSession.createOutgoingSession(sipService.getSipStack(),
                    "sip:alice@freeims.net");
            if(!(ret = imSession.sendTextMessage("hello"))){
                //e.setStatus(NgnHistoryEvent.StatusType.Failed);
            }
            NgnMessagingSession.releaseSession(imSession);
            */
            
            // 简单的状态检查
            if (sipService.isRegistered()){
                Log.i(TAG, "SIP service is already registered");
            } else {
                Log.i(TAG, "SIP service is not registered");
            }
        }catch (ExceptionInInitializerError e){
            Log.e(TAG, "Engine initialization failed: " + e.getMessage(), e);
            promise.reject("Engine initialization failed", e);
            return;
        }
        catch (Exception e) {
            Log.e(TAG, e.getLocalizedMessage(), e);
        }

        // 这里可以调用你的登录逻辑
        //Toast.makeText(reactContext, "Login called from JS", Toast.LENGTH_SHORT).show();
        // 假设登录成功
        promise.resolve("登录成功");
        // 如果失败可以调用 promise.reject("错误信息");
    }

    // 应用启动时执行注册的方法
    @ReactMethod
    public void initializeAndRegister(Promise promise) {
        try {
            Log.i(TAG, "Initializing SIP service with database settings...");
            
            engine = (Engine) Engine.getInstance();
            sipService = (NgnSipService) engine.getSipService();
            
            if (!sipService.isRegistered()) {
                Log.i(TAG, "Starting SIP registration with database-sourced settings...");
                boolean registerResult = sipService.register(reactContext);
                if (registerResult) {
                    Log.i(TAG, "SIP registration initiated successfully");
                    promise.resolve("SIP registration initiated with database settings");
                } else {
                    Log.w(TAG, "SIP registration failed to initiate");
                    promise.reject("REGISTRATION_FAILED", "Failed to initiate SIP registration");
                }
            } else {
                Log.i(TAG, "SIP service is already registered");
                promise.resolve("Already registered");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize and register: " + e.getMessage(), e);
            promise.reject("INITIALIZATION_FAILED", e.getMessage(), e);
        }
    }

    // 使用数据库配置进行SIP登录注册
    @ReactMethod
    public void loginWithDatabaseSettings(Promise promise) {
        try {
            Log.i(TAG, "开始使用数据库配置进行SIP注册...");
            
            // 获取SettingsDbModule实例
            SettingsDbModule settingsDb = new SettingsDbModule(reactContext);
            
            // 从数据库获取SIP设置
            WritableMap sipSettings = settingsDb.getSipSettingsSync();
            
            if (sipSettings == null) {
                Log.w(TAG, "无法从数据库获取SIP设置");
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "无法从数据库获取SIP设置");
                result.putString("reason", "database_error");
                promise.resolve(result);
                return;
            }

            // 验证必需的配置参数
            String sipAddress = sipSettings.hasKey("sipAddress") ? sipSettings.getString("sipAddress") : "";
            String password = sipSettings.hasKey("password") ? sipSettings.getString("password") : "";
            String pcscfHost = sipSettings.hasKey("pcscfHost") ? sipSettings.getString("pcscfHost") : "";
            String pcscfPort = sipSettings.hasKey("pcscfPort") ? sipSettings.getString("pcscfPort") : "5060";

            if (sipAddress.isEmpty() || password.isEmpty() || pcscfHost.isEmpty()) {
                Log.w(TAG, "SIP配置不完整 - sipAddress: " + sipAddress + ", pcscfHost: " + pcscfHost);
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "SIP配置不完整，请检查账号和服务器设置");
                result.putString("reason", "incomplete_config");
                
                WritableMap missingFields = Arguments.createMap();
                missingFields.putBoolean("sipAddress", sipAddress.isEmpty());
                missingFields.putBoolean("password", password.isEmpty());
                missingFields.putBoolean("pcscfHost", pcscfHost.isEmpty());
                result.putMap("missingFields", missingFields);
                
                promise.resolve(result);
                return;
            }

            Log.i(TAG, "SIP配置验证通过 - 地址: " + sipAddress + ", 服务器: " + pcscfHost + ":" + pcscfPort);

            // 初始化引擎
            if (engine == null) {
                engine = (Engine) Engine.getInstance();
                if (engine == null) {
                    Log.e(TAG, "无法获取Engine实例");
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", false);
                    result.putString("message", "SIP引擎初始化失败");
                    result.putString("reason", "engine_error");
                    promise.resolve(result);
                    return;
                }
            }

            sipService = (NgnSipService) engine.getSipService();
            if (sipService == null) {
                Log.e(TAG, "无法获取SipService实例");
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "SIP服务初始化失败");
                result.putString("reason", "service_error");
                promise.resolve(result);
                return;
            }

            // 检查是否已经注册
            if (sipService.isRegistered()) {
                Log.i(TAG, "SIP服务已经注册");
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "SIP已连接");
                result.putString("status", "already_registered");
                promise.resolve(result);
                return;
            }

            // 尝试注册
            Log.i(TAG, "开始SIP注册...");
            boolean registrationResult = sipService.register(reactContext);
            
            if (registrationResult) {
                Log.i(TAG, "SIP注册请求已发送");
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "SIP注册成功");
                result.putString("status", "registered");
                promise.resolve(result);
            } else {
                Log.w(TAG, "SIP注册请求失败");
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "SIP注册失败，请检查网络连接和服务器设置");
                result.putString("reason", "registration_failed");
                promise.resolve(result);
            }

        } catch (Exception e) {
            Log.e(TAG, "使用数据库配置登录失败: " + e.getMessage(), e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "登录过程中发生错误: " + e.getMessage());
            result.putString("reason", "exception");
            result.putString("error", e.getMessage());
            promise.resolve(result);
        }
    }

    // SIP注销方法
    @ReactMethod
    public void logout(Promise promise) {
        try {
            Log.i(TAG, "开始SIP注销...");
            
            if (sipService == null) {
                sipService = (NgnSipService) engine.getSipService();
            }

            if (sipService != null && sipService.isRegistered()) {
                boolean result = sipService.unRegister();
                if (result) {
                    Log.i(TAG, "SIP注销成功");
                    WritableMap response = Arguments.createMap();
                    response.putBoolean("success", true);
                    response.putString("message", "SIP注销成功");
                    promise.resolve(response);
                } else {
                    Log.w(TAG, "SIP注销失败");
                    WritableMap response = Arguments.createMap();
                    response.putBoolean("success", false);
                    response.putString("message", "SIP注销失败");
                    promise.resolve(response);
                }
            } else {
                Log.i(TAG, "SIP服务未注册或不可用");
                WritableMap response = Arguments.createMap();
                response.putBoolean("success", true);
                response.putString("message", "SIP服务未注册");
                promise.resolve(response);
            }

        } catch (Exception e) {
            Log.e(TAG, "SIP注销过程中发生错误: " + e.getMessage(), e);
            WritableMap response = Arguments.createMap();
            response.putBoolean("success", false);
            response.putString("message", "注销过程中发生错误: " + e.getMessage());
            promise.resolve(response);
        }
    }

    // 发送文本消息的方法
    @ReactMethod
    public void sendTextMessage(String sipAddress, String messageText, Promise promise) {
        try {
            if (engine == null) {
                engine = (Engine) Engine.getInstance();
            }
            
            if (sipService == null) {
                sipService = (NgnSipService) engine.getSipService();
            }

            if (!sipService.isRegistered()) {
                Log.w(TAG, "SIP service is not registered, cannot send message");
                promise.reject("NOT_REGISTERED", "SIP service is not registered");
                return;
            }

            Log.i(TAG, "Sending message to: " + sipAddress + ", content: " + messageText);
            
            final NgnMessagingSession imSession = NgnMessagingSession.createOutgoingSession(
                sipService.getSipStack(), sipAddress);
            
            if (imSession == null) {
                Log.e(TAG, "Failed to create messaging session");
                promise.reject("SESSION_FAILED", "Failed to create messaging session");
                return;
            }

            boolean ret = imSession.sendTextMessage(messageText);
            NgnMessagingSession.releaseSession(imSession);
            
            if (ret) {
                Log.i(TAG, "Message sent successfully");
                promise.resolve("Message sent successfully");
            } else {
                Log.w(TAG, "Failed to send message");
                promise.reject("SEND_FAILED", "Failed to send message");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending message: " + e.getMessage(), e);
            promise.reject("SEND_ERROR", e.getMessage(), e);
        }
    }
}
