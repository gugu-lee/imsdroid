package com.imsclient2;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import org.doubango.ngn.events.NgnMessagingEventArgs;

public class MyBroadcastService extends Service {
    private static final String TAG = "MyBroadcastService";
    private static final String CHANNEL_ID = "service_channel";
    private static final int NOTIFICATION_ID = 1;
    private BroadcastReceiver receiver;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service created");

        // 初始化广播接收器
        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                Log.i(TAG,action);
                if ("com.example.MY_CUSTOM_ACTION".equals(action)) {
                    String data = intent.getStringExtra("message");
                    Log.d(TAG, "Received broadcast: " + data);
                }
            }
        };

        // 动态注册广播（兼容 Android 12+）
        registerReceiverWithRuntimeCheck();
    }

    private void registerReceiverWithRuntimeCheck() {
        IntentFilter filter = new IntentFilter();
        //filter.addAction(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT); // 自定义广播
        //filter.addAction(Intent.ACTION_AIRPLANE_MODE_CHANGED); // 系统广播（需要 RECEIVER_EXPORTED）

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+：显式指定导出行为
            registerReceiver(receiver, filter, 
                Context.RECEIVER_NOT_EXPORTED); // 私有接收器（仅限应用内广播）
            
            // 如果是系统广播（如 ACTION_AIRPLANE_MODE_CHANGED），需改为：
            // registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            // 旧版本直接注册
            registerReceiver(receiver, filter);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG,"onStartCommand");
        startForeground(NOTIFICATION_ID, createNotification());

        // 其他逻辑（如注册广播接收器）
        //registerReceiver();
        return START_STICKY;
    }

    private Notification createNotification() {
        createNotificationChannel();
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("后台服务运行中")
            .setContentText("正在监听广播...")
            //.setSmallIcon(com.github.freeims.ngn_stack.R.drawable.icon)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "后台服务",
                NotificationManager.IMPORTANCE_LOW
            );
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (receiver != null) {
            unregisterReceiver(receiver); // 必须取消注册
        }
        Log.d(TAG, "Service destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}