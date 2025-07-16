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
            engine = (Engine) Engine.getInstance();
            sipService = (NgnSipService) engine.getSipService();
            
            if (!sipService.isRegistered()) {
                Log.i(TAG, "Starting SIP registration...");
                boolean registerResult = sipService.register(reactContext);
                if (registerResult) {
                    Log.i(TAG, "SIP registration initiated successfully");
                    promise.resolve("SIP registration initiated");
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
