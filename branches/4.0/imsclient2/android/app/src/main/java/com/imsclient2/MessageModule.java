package com.imsclient2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Promise;
import android.util.Log;

public class MessageModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MessageModule";
    private ReactApplicationContext reactContext;

    public MessageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MessageModule";
    }

    // 发送事件到React Native
    public void sendMessageToJS(String fromUser, String messageText, String timestamp) {
        WritableMap params = Arguments.createMap();
        params.putString("fromUser", fromUser);
        params.putString("messageText", messageText);
        params.putString("timestamp", timestamp);
        params.putBoolean("isMyMessage", false);
        
        Log.d(TAG, "Sending message to JS: " + messageText);
        
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onNewMessage", params);
        }
    }

    // 发送聊天列表更新事件
    public void sendChatListUpdate() {
        Log.d(TAG, "Sending chat list update to JS");
        
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onChatListUpdate", null);
        }
    }

    // 静态方法供其他类调用
    private static MessageModule instance;
    
    public static void setInstance(MessageModule instance) {
        MessageModule.instance = instance;
    }
    
    public static MessageModule getInstance() {
        return instance;
    }

    @ReactMethod
    public void initialize() {
        Log.d(TAG, "MessageModule initialized");
        setInstance(this);
    }
}
