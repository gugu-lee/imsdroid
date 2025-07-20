package com.imsclient2;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import org.doubango.ngn.events.NgnMessagingEventArgs;
import com.github.freeims.ngn_stack.database.UnifiedDatabaseModule;

public class MyDynamicReceiver extends BroadcastReceiver {
    private static final String TAG = "MyDynamicReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT)) {
            try {
                String dateString = intent.getStringExtra(NgnMessagingEventArgs.EXTRA_DATE);
                Log.d(TAG, "收到自定义广播，时间: " + dateString);
                
                NgnMessagingEventArgs args = intent.getParcelableExtra(NgnMessagingEventArgs.EXTRA_EMBEDDED);
                if (args != null) {
                    String messageText = new String(args.getPayload());
                    Log.d(TAG, "收到短信: " + messageText);
                    
                    // 从Intent中获取发送者信息
                    String fromUser = intent.getStringExtra(NgnMessagingEventArgs.EXTRA_REMOTE_PARTY);
                    if (fromUser == null || fromUser.isEmpty()) {
                        fromUser = "未知用户"; // 默认发送者
                    }
                    Log.d(TAG, "发送者: " + fromUser);
                    
                    // 生成或提取SIP地址（如果fromUser本身就是SIP地址格式，直接使用；否则生成）
                    String sipAddress = null;
                    if (fromUser.startsWith("sip:")) {
                        sipAddress = fromUser;
                        // 从SIP地址中提取用户名作为显示名称
                        String displayName = extractUserNameFromSip(fromUser);
                        if (displayName != null && !displayName.isEmpty()) {
                            fromUser = displayName;
                        }
                    }
                    
                    // 获取消息时间戳
                    String timestamp = dateString;
                    if (timestamp == null || timestamp.isEmpty()) {
                        // 如果没有时间戳信息，使用当前时间作为备用
                        timestamp = getCurrentTimeStamp();
                        Log.d(TAG, "使用当前时间作为时间戳: " + timestamp);
                    } else {
                        Log.d(TAG, "使用消息原始时间戳: " + timestamp);
                    }
                    
                    // 写入数据库，使用统一的数据库接口
                    long chatId = UnifiedDatabaseModule.addChatFromNative(context, fromUser, messageText, timestamp, sipAddress);
                    
                    if (chatId != -1) {
                        Log.d(TAG, "消息已保存到数据库，chatId: " + chatId);
                        
                        // 通知React Native更新UI
                        MessageModule messageModule = MessageModule.getInstance();
                        if (messageModule != null) {
                            messageModule.sendMessageToJS(fromUser, messageText, timestamp);
                            messageModule.sendChatListUpdate();
                            Log.d(TAG, "已通知React Native更新UI");
                        } else {
                            Log.w(TAG, "MessageModule实例为空，无法通知React Native");
                        }
                    } else {
                        Log.e(TAG, "保存消息到数据库失败");
                    }
                } else {
                    Log.w(TAG, "NgnMessagingEventArgs为空");
                }
            } catch (Exception e) {
                Log.e(TAG, "处理接收消息时发生错误: " + e.getMessage(), e);
            }
        }
    }
    
    // 从SIP地址中提取用户名
    private String extractUserNameFromSip(String sipAddress) {
        try {
            if (sipAddress != null && sipAddress.startsWith("sip:")) {
                // 提取 sip:username@domain 中的 username 部分
                String withoutSip = sipAddress.substring(4); // 去掉 "sip:"
                int atIndex = withoutSip.indexOf('@');
                if (atIndex > 0) {
                    return withoutSip.substring(0, atIndex);
                }
            }
            return null;
        } catch (Exception e) {
            Log.e(TAG, "提取SIP用户名失败: " + e.getMessage(), e);
            return null;
        }
    }
    
    // 获取当前时间戳
    private String getCurrentTimeStamp() {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return sdf.format(new Date());
    }

    // 在 Activity/Fragment/Service 中注册和注销
//    public static void register(Context context) {
//        Log.i(TAG,"register receiver");
//        MyDynamicReceiver receiver = new MyDynamicReceiver();
//        IntentFilter filter = new IntentFilter(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT);
//
//        // Android 12+ 需指定 RECEIVER_EXPORTED 或 RECEIVER_NOT_EXPORTED
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//            context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
//        } else {
//            context.registerReceiver(receiver, filter);
//        }
//    }

    public static void unregister(Context context, BroadcastReceiver receiver) {
        context.unregisterReceiver(receiver);
    }
}
