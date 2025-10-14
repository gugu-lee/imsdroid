package com.imsclient2;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 外部消息管理器 - 统一处理各种外部消息（FCM、WebSocket、HTTP推送等）
 */
public class ExternalMessageManager {
    private static final String TAG = "ExternalMessageManager";
    private static final String PREFS_NAME = "external_message_prefs";
    private static final String CHANNEL_ID_FCM = "fcm_channel";
    private static final String CHANNEL_ID_WEBSOCKET = "websocket_channel";
    private static final String CHANNEL_ID_HTTP = "http_push_channel";
    private static final String CHANNEL_ID_OTHER = "other_channel";

    private static volatile ExternalMessageManager INSTANCE;

    private Context context;
    private NotificationManager notificationManager;
    private SharedPreferences sharedPrefs;

    // 消息处理器映射
    private ConcurrentHashMap<String, MessageHandler> messageHandlers = new ConcurrentHashMap<>();

    // 消息监听器列表
    private List<ExternalMessageListener> messageListeners = new ArrayList<>();

    private int notificationIdCounter = 2000;
    private ExternalMessageDao messageDao;

    private ExternalMessageManager(Context context) {
        this.context = context.getApplicationContext();
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        this.sharedPrefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        this.messageDao = new ExternalMessageDao(context);

        createNotificationChannels();
        registerDefaultHandlers();
    }

    public static ExternalMessageManager getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (ExternalMessageManager.class) {
                if (INSTANCE == null) {
                    INSTANCE = new ExternalMessageManager(context);
                }
            }
        }
        return INSTANCE;
    }

    /**
     * 创建通知渠道
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel fcmChannel = new NotificationChannel(
                    CHANNEL_ID_FCM,
                    "FCM消息",
                    NotificationManager.IMPORTANCE_DEFAULT);
            fcmChannel.setDescription("Firebase Cloud Messaging 推送消息");
            fcmChannel.enableVibration(true);
            fcmChannel.enableLights(true);

            NotificationChannel wsChannel = new NotificationChannel(
                    CHANNEL_ID_WEBSOCKET,
                    "WebSocket消息",
                    NotificationManager.IMPORTANCE_DEFAULT);
            wsChannel.setDescription("WebSocket 实时消息");
            wsChannel.enableVibration(true);

            NotificationChannel httpChannel = new NotificationChannel(
                    CHANNEL_ID_HTTP,
                    "HTTP推送",
                    NotificationManager.IMPORTANCE_DEFAULT);
            httpChannel.setDescription("HTTP 推送消息");

            NotificationChannel otherChannel = new NotificationChannel(
                    CHANNEL_ID_OTHER,
                    "其他消息",
                    NotificationManager.IMPORTANCE_LOW);
            otherChannel.setDescription("其他类型的外部消息");

            notificationManager.createNotificationChannel(fcmChannel);
            notificationManager.createNotificationChannel(wsChannel);
            notificationManager.createNotificationChannel(httpChannel);
            notificationManager.createNotificationChannel(otherChannel);

            Log.d(TAG, "通知渠道已创建");
        }
    }

    /**
     * 注册默认消息处理器
     */
    private void registerDefaultHandlers() {
        // FCM 消息处理器
        registerMessageHandler("FCM", new MessageHandler() {
            @Override
            public boolean canHandle(ExternalMessage message) {
                return "FCM".equals(message.getSource());
            }

            @Override
            public void handleMessage(ExternalMessage message) {
                handleFcmMessage(message);
            }
        });

        // WebSocket 消息处理器
        registerMessageHandler("WebSocket", new MessageHandler() {
            @Override
            public boolean canHandle(ExternalMessage message) {
                return "WebSocket".equals(message.getSource());
            }

            @Override
            public void handleMessage(ExternalMessage message) {
                handleWebSocketMessage(message);
            }
        });

        // HTTP 推送消息处理器
        registerMessageHandler("HTTP", new MessageHandler() {
            @Override
            public boolean canHandle(ExternalMessage message) {
                return "HTTP".equals(message.getSource());
            }

            @Override
            public void handleMessage(ExternalMessage message) {
                handleHttpPushMessage(message);
            }
        });
    }

    /**
     * 处理传入的外部消息
     */
    public void handleIncomingMessage(ExternalMessage message) {
        try {
            Log.d(TAG, "处理外部消息: " + message.getType() + " from " + message.getSource());

            // 保存消息到本地存储
            saveMessage(message);

            // 查找并使用合适的处理器
            MessageHandler handler = findHandler(message);
            if (handler != null) {
                handler.handleMessage(message);
            } else {
                Log.w(TAG, "未找到合适的消息处理器: " + message.getSource());
                handleGenericMessage(message);
            }

            // 通知所有监听器
            notifyListeners(message);

            // 通知 React Native 层
            notifyReactNative(message);

        } catch (Exception e) {
            Log.e(TAG, "处理外部消息失败: " + e.getMessage(), e);
        }
    }

    /**
     * 显示通知
     */
    public void showNotification(String title, String body, String sender, Map<String, String> data) {
        try {
            if (data == null) {
                data = new HashMap<>();
            }

            String channelId = determineChannelId(data.getOrDefault("source", "other"));

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            intent.putExtra("openExternalMessage", true);
            intent.putExtra("messageData", new JSONObject(data).toString());

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    notificationIdCounter,
                    intent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                            : PendingIntent.FLAG_UPDATE_CURRENT);

            NotificationCompat.Builder notification = new NotificationCompat.Builder(context, channelId)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setSubText("来自: " + sender)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(pendingIntent)
                    .setDefaults(NotificationCompat.DEFAULT_ALL);

            notificationManager.notify(notificationIdCounter++, notification.build());
            Log.d(TAG, "外部消息通知已显示: " + title);

        } catch (Exception e) {
            Log.e(TAG, "显示外部消息通知失败: " + e.getMessage(), e);
        }
    }

    /**
     * 注册消息处理器
     */
    public void registerMessageHandler(String name, MessageHandler handler) {
        messageHandlers.put(name, handler);
        Log.d(TAG, "消息处理器已注册: " + name);
    }

    /**
     * 添加消息监听器
     */
    public void addMessageListener(ExternalMessageListener listener) {
        synchronized (messageListeners) {
            messageListeners.add(listener);
        }
    }

    /**
     * 移除消息监听器
     */
    public void removeMessageListener(ExternalMessageListener listener) {
        synchronized (messageListeners) {
            messageListeners.remove(listener);
        }
    }

    /**
     * 获取消息历史
     */
    public List<ExternalMessage> getMessageHistory(int limit, int offset, String source, String type,
            boolean unreadOnly) {
        try {
            return messageDao.getMessages(limit, offset, source, type, unreadOnly);
        } catch (Exception e) {
            Log.e(TAG, "获取消息历史失败: " + e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<ExternalMessage> getMessageHistory() {
        return getMessageHistory(50, 0, null, null, false);
    }

    /**
     * 清除所有通知
     */
    public void clearAllNotifications() {
        notificationManager.cancelAll();
    }

    /**
     * 启用/禁用外部消息
     */
    public void setExternalMessagesEnabled(boolean enabled) {
        sharedPrefs.edit()
                .putBoolean("external_messages_enabled", enabled)
                .apply();
        Log.d(TAG, "外部消息已设置为: " + enabled);
    }

    /**
     * 检查外部消息是否启用
     */
    public boolean isExternalMessagesEnabled() {
        return sharedPrefs.getBoolean("external_messages_enabled", true);
    }

    // 私有方法

    private MessageHandler findHandler(ExternalMessage message) {
        for (MessageHandler handler : messageHandlers.values()) {
            if (handler.canHandle(message)) {
                return handler;
            }
        }
        return null;
    }

    private void handleFcmMessage(ExternalMessage message) {
        Log.d(TAG, "处理FCM消息: " + message.getType());

        // 根据消息类型执行不同的处理逻辑
        String type = message.getType();
        switch (type) {
            case "chat":
                handleChatMessage(message);
                break;
            case "notification":
                handleNotificationMessage(message);
                break;
            case "system":
                handleSystemMessage(message);
                break;
            default:
                handleGenericMessage(message);
                break;
        }
    }

    private void handleWebSocketMessage(ExternalMessage message) {
        Log.d(TAG, "处理WebSocket消息: " + message.getType());
        Map<String, String> data = new HashMap<>();
        data.put("source", message.getSource());
        data.put("type", message.getType());
        showNotification(message.getTitle(), message.getBody(), message.getSender(), data);
    }

    private void handleHttpPushMessage(ExternalMessage message) {
        Log.d(TAG, "处理HTTP推送消息: " + message.getType());
        Map<String, String> data = new HashMap<>();
        data.put("source", message.getSource());
        data.put("type", message.getType());
        showNotification(message.getTitle(), message.getBody(), message.getSender(), data);
    }

    private void handleChatMessage(ExternalMessage message) {
        Map<String, String> data = new HashMap<>();
        data.put("source", message.getSource());
        data.put("type", "chat");
        data.put("sender", message.getSender());
        showNotification("新聊天消息 - " + message.getSender(), message.getBody(), message.getSender(), data);
    }

    private void handleNotificationMessage(ExternalMessage message) {
        Map<String, String> data = new HashMap<>();
        data.put("source", message.getSource());
        data.put("type", "notification");
        showNotification(message.getTitle(), message.getBody(), message.getSender(), data);
    }

    private void handleSystemMessage(ExternalMessage message) {
        Log.d(TAG, "系统消息: " + message.getBody());
        // 系统消息可能不需要显示通知
    }

    private void handleGenericMessage(ExternalMessage message) {
        Map<String, String> data = new HashMap<>();
        data.put("source", message.getSource());
        data.put("type", message.getType());
        showNotification(message.getTitle(), message.getBody(), message.getSender(), data);
    }

    private String determineChannelId(String source) {
        switch (source.toLowerCase()) {
            case "fcm":
                return CHANNEL_ID_FCM;
            case "websocket":
                return CHANNEL_ID_WEBSOCKET;
            case "http":
                return CHANNEL_ID_HTTP;
            default:
                return CHANNEL_ID_OTHER;
        }
    }

    private void saveMessage(ExternalMessage message) {
        try {
            long id = messageDao.saveMessage(message);
            if (id > 0) {
                Log.d(TAG, "保存外部消息成功: " + message.getId() + ", 数据库ID: " + id);
            } else {
                Log.w(TAG, "保存外部消息失败: " + message.getId());
            }
        } catch (Exception e) {
            Log.e(TAG, "保存外部消息失败: " + e.getMessage(), e);
        }
    }

    private void notifyListeners(ExternalMessage message) {
        synchronized (messageListeners) {
            for (ExternalMessageListener listener : messageListeners) {
                try {
                    listener.onMessageReceived(message);
                } catch (Exception e) {
                    Log.e(TAG, "通知消息监听器失败: " + e.getMessage(), e);
                }
            }
        }
    }

    private void notifyReactNative(ExternalMessage message) {
        try {
            MessageModule messageModule = MessageModule.getInstance();
            if (messageModule != null) {
                messageModule.sendExternalMessageToJS(message);
            }
        } catch (Exception e) {
            Log.e(TAG, "通知React Native失败: " + e.getMessage(), e);
        }
    }
}