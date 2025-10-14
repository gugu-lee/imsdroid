package com.imsclient2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
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
        return TAG;
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

    // 发送打开聊天事件
    public void sendOpenChatEvent(String fromUser) {
        WritableMap params = Arguments.createMap();
        params.putString("fromUser", fromUser);

        Log.d(TAG, "Sending open chat event to JS: " + fromUser);

        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onOpenChat", params);
        }
    }

    // 设置通知启用状态
    @ReactMethod
    public void setNotificationEnabled(boolean enabled, Promise promise) {
        try {
            MessageNotificationManager notificationManager = MessageNotificationManager.getInstance(reactContext);
            notificationManager.setNotificationEnabled(enabled);

            Log.d(TAG, "通知状态已设置为: " + enabled);
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "设置通知状态失败: " + e.getMessage(), e);
            promise.reject("SET_NOTIFICATION_ERROR", e.getMessage());
        }
    }

    // 获取通知启用状态
    @ReactMethod
    public void getNotificationEnabled(Promise promise) {
        try {
            MessageNotificationManager notificationManager = MessageNotificationManager.getInstance(reactContext);
            boolean enabled = notificationManager.isNotificationEnabled();

            Log.d(TAG, "当前通知状态: " + enabled);
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "获取通知状态失败: " + e.getMessage(), e);
            promise.reject("GET_NOTIFICATION_ERROR", e.getMessage());
        }
    }

    // 检查系统通知权限
    @ReactMethod
    public void hasNotificationPermission(Promise promise) {
        try {
            MessageNotificationManager notificationManager = MessageNotificationManager.getInstance(reactContext);
            boolean hasPermission = notificationManager.hasNotificationPermission();

            Log.d(TAG, "通知权限状态: " + hasPermission);
            promise.resolve(hasPermission);
        } catch (Exception e) {
            Log.e(TAG, "检查通知权限失败: " + e.getMessage(), e);
            promise.reject("CHECK_NOTIFICATION_PERMISSION_ERROR", e.getMessage());
        }
    }

    // 显示测试通知
    @ReactMethod
    public void showTestNotification(String title, String content) {
        try {
            MessageNotificationManager notificationManager = MessageNotificationManager.getInstance(reactContext);
            notificationManager.showSimpleNotification(title, content);

            Log.d(TAG, "测试通知已显示");
        } catch (Exception e) {
            Log.e(TAG, "显示测试通知失败: " + e.getMessage(), e);
        }
    }

    // 取消所有通知
    @ReactMethod
    public void cancelAllNotifications() {
        try {
            MessageNotificationManager notificationManager = MessageNotificationManager.getInstance(reactContext);
            notificationManager.cancelAllNotifications();

            Log.d(TAG, "所有通知已取消");
        } catch (Exception e) {
            Log.e(TAG, "取消通知失败: " + e.getMessage(), e);
        }
    }

    // FCM Token 相关方法
    @ReactMethod
    public void getFCMToken(Promise promise) {
        try {
            // 使用 Firebase Messaging 获取当前 token
            com.google.firebase.messaging.FirebaseMessaging.getInstance().getToken()
                    .addOnCompleteListener(task -> {
                        if (!task.isSuccessful()) {
                            Log.w(TAG, "获取FCM token失败", task.getException());
                            promise.reject("GET_FCM_TOKEN_ERROR", "获取FCM token失败: " +
                                    (task.getException() != null ? task.getException().getMessage() : "未知错误"));
                            return;
                        }

                        String token = task.getResult();
                        Log.d(TAG, "FCM Token: " + token);
                        promise.resolve(token);
                    });
        } catch (Exception e) {
            Log.e(TAG, "获取FCM token异常: " + e.getMessage(), e);
            promise.reject("GET_FCM_TOKEN_EXCEPTION", e.getMessage());
        }
    }

    // 发送 FCM Token 更新事件到 JS
    public void sendFcmTokenUpdate(String token) {
        WritableMap params = Arguments.createMap();
        params.putString("token", token);
        params.putLong("timestamp", System.currentTimeMillis());

        Log.d(TAG, "发送FCM Token更新事件到JS: " + token);

        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onFcmTokenUpdate", params);
        }
    }

    // 外部消息管理方法
    @ReactMethod
    public void setExternalMessagesEnabled(boolean enabled, Promise promise) {
        try {
            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(reactContext);
            messageManager.setExternalMessagesEnabled(enabled);

            Log.d(TAG, "外部消息状态已设置为: " + enabled);
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "设置外部消息状态失败: " + e.getMessage(), e);
            promise.reject("SET_EXTERNAL_MESSAGES_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getExternalMessagesEnabled(Promise promise) {
        try {
            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(reactContext);
            boolean enabled = messageManager.isExternalMessagesEnabled();

            Log.d(TAG, "外部消息状态: " + enabled);
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "获取外部消息状态失败: " + e.getMessage(), e);
            promise.reject("GET_EXTERNAL_MESSAGES_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getExternalMessageHistory(int limit, Promise promise) {
        try {
            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(reactContext);
            java.util.List<ExternalMessage> messages = messageManager.getMessageHistory(limit, 0, null, null, false);

            WritableArray messageArray = Arguments.createArray();
            for (ExternalMessage message : messages) {
                WritableMap messageMap = Arguments.createMap();
                messageMap.putString("id", message.getId());
                messageMap.putString("type", message.getType());
                messageMap.putString("title", message.getTitle());
                messageMap.putString("body", message.getBody());
                messageMap.putString("sender", message.getSender());
                messageMap.putDouble("timestamp", message.getTimestamp());
                messageMap.putString("source", message.getSource());
                messageArray.pushMap(messageMap);
            }

            Log.d(TAG, "获取外部消息历史: " + messages.size() + " 条消息");
            promise.resolve(messageArray);
        } catch (Exception e) {
            Log.e(TAG, "获取外部消息历史失败: " + e.getMessage(), e);
            promise.reject("GET_EXTERNAL_MESSAGE_HISTORY_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void clearExternalNotifications() {
        try {
            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(reactContext);
            messageManager.clearAllNotifications();

            Log.d(TAG, "外部消息通知已清除");
        } catch (Exception e) {
            Log.e(TAG, "清除外部消息通知失败: " + e.getMessage(), e);
        }
    }

    // 发送外部消息事件到 React Native
    public void sendExternalMessageToJS(ExternalMessage message) {
        WritableMap params = Arguments.createMap();
        params.putString("id", message.getId());
        params.putString("type", message.getType());
        params.putString("title", message.getTitle());
        params.putString("body", message.getBody());
        params.putString("sender", message.getSender());
        params.putDouble("timestamp", message.getTimestamp());
        params.putString("data", message.getData());
        params.putString("source", message.getSource());

        Log.d(TAG, "发送外部消息事件到JS: " + message.getType());

        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onExternalMessage", params);
        }
    }

    // 模拟发送外部消息（用于测试）
    @ReactMethod
    public void sendTestExternalMessage(String type, String title, String body, String source) {
        try {
            ExternalMessage testMessage = new ExternalMessage(
                    "test_" + System.currentTimeMillis(),
                    type,
                    title,
                    body,
                    "测试发送者",
                    System.currentTimeMillis(),
                    "{}",
                    source);

            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(reactContext);
            messageManager.handleIncomingMessage(testMessage);

            Log.d(TAG, "测试外部消息已发送");
        } catch (Exception e) {
            Log.e(TAG, "发送测试外部消息失败: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void initialize() {
        Log.d(TAG, "MessageModule initialized");
        setInstance(this);
    }
}
