package com.imsclient2;

import android.content.SharedPreferences;
import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import org.json.JSONObject;
import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMessagingService";

    /**
     * FCM Token 刷新时调用
     */
    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "FCM Token 已更新: " + token);

        // 保存新的 token
        saveFcmToken(token);

        // 通知 React Native 层 token 已更新
        notifyTokenRefresh(token);

        // 发送 token 到服务器
        sendTokenToServer(token);
    }

    /**
     * 接收到 FCM 消息时调用
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "收到 FCM 消息: " + remoteMessage.getFrom());

        try {
            // 处理数据负载（Data Payload）
            if (!remoteMessage.getData().isEmpty()) {
                Log.d(TAG, "消息数据负载: " + remoteMessage.getData().toString());
                handleDataMessage(remoteMessage.getData());
            }

            // 处理通知负载（Notification Payload）
            RemoteMessage.Notification notification = remoteMessage.getNotification();
            if (notification != null) {
                Log.d(TAG, "消息通知负载: " + notification.getTitle() + " - " + notification.getBody());
                handleNotificationMessage(notification, remoteMessage.getData());
            }

        } catch (Exception e) {
            Log.e(TAG, "处理 FCM 消息时出错: " + e.getMessage(), e);
        }
    }

    /**
     * 处理数据消息（当应用在前台或后台时都会调用）
     */
    private void handleDataMessage(Map<String, String> data) {
        try {
            String messageType = data.getOrDefault("type", "unknown");
            String title = data.getOrDefault("title", "");
            String body = data.getOrDefault("body", "");
            String sender = data.getOrDefault("sender", "");
            String timestampStr = data.getOrDefault("timestamp", String.valueOf(System.currentTimeMillis()));
            String extra = data.getOrDefault("extra", "{}");

            Log.d(TAG, "处理数据消息 - 类型: " + messageType + ", 发送者: " + sender);

            long timestamp;
            try {
                timestamp = Long.parseLong(timestampStr);
            } catch (NumberFormatException e) {
                timestamp = System.currentTimeMillis();
            }

            // 创建外部消息对象
            ExternalMessage externalMessage = new ExternalMessage(
                    generateMessageId(),
                    messageType,
                    title,
                    body,
                    sender,
                    timestamp,
                    extra,
                    "FCM");

            // 通过外部消息管理器处理
            ExternalMessageManager messageManager = ExternalMessageManager.getInstance(this);
            messageManager.handleIncomingMessage(externalMessage);

        } catch (Exception e) {
            Log.e(TAG, "处理数据消息失败: " + e.getMessage(), e);
        }
    }

    /**
     * 处理通知消息
     */
    private void handleNotificationMessage(RemoteMessage.Notification notification, Map<String, String> data) {
        try {
            String title = notification.getTitle() != null ? notification.getTitle() : "新消息";
            String body = notification.getBody() != null ? notification.getBody() : "";
            String sender = data.getOrDefault("sender", "未知发送者");

            // 如果应用在前台，显示自定义通知
            // 如果应用在后台，系统会自动显示通知
            if (isAppInForeground()) {
                ExternalMessageManager messageManager = ExternalMessageManager.getInstance(this);
                messageManager.showNotification(title, body, sender, data);
            }

            // 保存通知到数据库
            saveNotificationToDatabase(title, body, sender, data);

        } catch (Exception e) {
            Log.e(TAG, "处理通知消息失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存 FCM Token
     */
    private void saveFcmToken(String token) {
        try {
            SharedPreferences sharedPrefs = getSharedPreferences("fcm_prefs", MODE_PRIVATE);
            sharedPrefs.edit()
                    .putString("fcm_token", token)
                    .putLong("token_updated_at", System.currentTimeMillis())
                    .apply();

            Log.d(TAG, "FCM Token 已保存");
        } catch (Exception e) {
            Log.e(TAG, "保存 FCM Token 失败: " + e.getMessage(), e);
        }
    }

    /**
     * 通知 React Native 层 Token 已刷新
     */
    private void notifyTokenRefresh(String token) {
        try {
            MessageModule messageModule = MessageModule.getInstance();
            if (messageModule != null) {
                messageModule.sendFcmTokenUpdate(token);
            }
        } catch (Exception e) {
            Log.e(TAG, "通知 Token 刷新失败: " + e.getMessage(), e);
        }
    }

    /**
     * 发送 Token 到服务器
     */
    private void sendTokenToServer(String token) {
        // TODO: 实现向服务器发送 Token 的逻辑
        // 这里可以调用您的 API 来注册设备 Token
        Log.d(TAG, "需要将 Token 发送到服务器: " + token);
    }

    /**
     * 生成消息 ID
     */
    private String generateMessageId() {
        return "fcm_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 1000);
    }

    /**
     * 检查应用是否在前台
     */
    private boolean isAppInForeground() {
        // TODO: 实现检查应用前台状态的逻辑
        return true; // 暂时返回 true
    }

    /**
     * 保存通知到数据库
     */
    private void saveNotificationToDatabase(String title, String body, String sender, Map<String, String> data) {
        try {
            // TODO: 实现保存到数据库的逻辑
            Log.d(TAG, "保存通知到数据库: " + title + " - " + body);
        } catch (Exception e) {
            Log.e(TAG, "保存通知到数据库失败: " + e.getMessage(), e);
        }
    }
}