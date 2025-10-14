package com.imsclient2;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class MessageNotificationManager {
    private static final String TAG = "MessageNotificationManager";
    private static final String CHANNEL_ID = "message_channel";
    private static final String CHANNEL_NAME = "消息通知";
    private static final String CHANNEL_DESCRIPTION = "接收新消息的通知";
    private static final String PREFS_NAME = "message_notification_prefs";
    private static final String KEY_NOTIFICATION_ENABLED = "notification_enabled";

    private static MessageNotificationManager instance;
    private Context context;
    private NotificationManager notificationManager;
    private int notificationId = 1001;

    private MessageNotificationManager(Context context) {
        this.context = context.getApplicationContext();
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();
    }

    public static synchronized MessageNotificationManager getInstance(Context context) {
        if (instance == null) {
            instance = new MessageNotificationManager(context);
        }
        return instance;
    }

    /**
     * 创建通知渠道（Android 8.0+需要）
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription(CHANNEL_DESCRIPTION);
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setShowBadge(true);

            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "通知渠道已创建");
        }
    }

    /**
     * 显示新消息通知
     */
    public void showMessageNotification(String senderName, String messageContent, String fromUser) {
        if (!isNotificationEnabled()) {
            Log.d(TAG, "通知功能已禁用");
            return;
        }

        try {
            // 创建点击通知时的Intent
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            intent.putExtra("fromUser", fromUser);
            intent.putExtra("openChat", true);

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                            : PendingIntent.FLAG_UPDATE_CURRENT);

            // 构建通知
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification) // 需要添加通知图标
                    .setContentTitle("新消息 - " + senderName)
                    .setContentText(messageContent)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(pendingIntent)
                    .setDefaults(NotificationCompat.DEFAULT_ALL);

            // 如果有应用图标，设置大图标
            try {
                builder.setLargeIcon(BitmapFactory.decodeResource(context.getResources(), R.mipmap.ic_launcher));
            } catch (Exception e) {
                Log.w(TAG, "无法加载应用图标: " + e.getMessage());
            }

            // 显示通知
            NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(context);
            notificationManagerCompat.notify(notificationId++, builder.build());

            Log.d(TAG, "消息通知已显示 - 发送者: " + senderName);

        } catch (Exception e) {
            Log.e(TAG, "显示消息通知时出错: " + e.getMessage(), e);
        }
    }

    /**
     * 显示简单的文本通知
     */
    public void showSimpleNotification(String title, String content) {
        if (!isNotificationEnabled()) {
            return;
        }

        try {
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                            : PendingIntent.FLAG_UPDATE_CURRENT);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(pendingIntent);

            NotificationManagerCompat.from(context).notify(notificationId++, builder.build());

        } catch (Exception e) {
            Log.e(TAG, "显示简单通知时出错: " + e.getMessage(), e);
        }
    }

    /**
     * 取消所有通知
     */
    public void cancelAllNotifications() {
        notificationManager.cancelAll();
        Log.d(TAG, "所有通知已取消");
    }

    /**
     * 取消指定ID的通知
     */
    public void cancelNotification(int id) {
        notificationManager.cancel(id);
    }

    /**
     * 检查通知是否启用
     */
    public boolean isNotificationEnabled() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_NOTIFICATION_ENABLED, true); // 默认启用
    }

    /**
     * 设置通知启用状态
     */
    public void setNotificationEnabled(boolean enabled) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_NOTIFICATION_ENABLED, enabled).apply();
        Log.d(TAG, "通知状态已设置为: " + enabled);
    }

    /**
     * 检查系统通知权限
     */
    public boolean hasNotificationPermission() {
        NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(context);
        return notificationManagerCompat.areNotificationsEnabled();
    }

    /**
     * 请求通知权限（Android 13+）
     */
    public void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Log.i(TAG, "Android 13+ 需要在运行时请求通知权限");
            // 这里需要在Activity中处理权限请求
        }
    }
}