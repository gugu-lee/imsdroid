package com.github.freeims.ngn_stack.database;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.imsclient2.ChatDatabaseHelper;

/**
 * 统一的数据库操作模块
 * 提供Java端数据库操作的React Native接口
 * 避免ChatDatabaseHelper和DatabaseService.js的功能重复
 */
public class UnifiedDatabaseModule extends ReactContextBaseJavaModule {
    private static final String TAG = "UnifiedDatabaseModule";
    private final ReactApplicationContext reactContext;
    private ChatDatabaseHelper dbHelper;

    public UnifiedDatabaseModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UnifiedDatabaseModule";
    }

    /**
     * 获取数据库助手实例
     */
    private ChatDatabaseHelper getDbHelper() {
        if (dbHelper == null) {
            dbHelper = new ChatDatabaseHelper(reactContext);
        }
        return dbHelper;
    }

    /**
     * React Native方法：添加或更新聊天记录
     * 这样Java端和RN端都可以使用相同的数据库操作
     */
    @ReactMethod
    public void addOrUpdateChat(String fromUser, String messageText, String timestamp, String sipAddress, Promise promise) {
        try {
            Log.d(TAG, "添加或更新聊天记录: " + fromUser + " -> " + messageText);
            
            ChatDatabaseHelper helper = getDbHelper();
            long chatId = helper.addOrUpdateChat(fromUser, messageText, timestamp, sipAddress);
            
            if (chatId != -1) {
                WritableMap result = Arguments.createMap();
                result.putDouble("chatId", chatId);
                result.putString("fromUser", fromUser);
                result.putString("message", messageText);
                result.putString("timestamp", timestamp);
                result.putString("sipAddress", sipAddress != null ? sipAddress : "");
                
                Log.d(TAG, "聊天记录操作成功，chatId: " + chatId);
                promise.resolve(result);
            } else {
                Log.e(TAG, "聊天记录操作失败");
                promise.reject("DATABASE_ERROR", "添加或更新聊天记录失败");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "addOrUpdateChat失败: " + e.getMessage(), e);
            promise.reject("DATABASE_ERROR", e.getMessage(), e);
        }
    }

    /**
     * React Native方法：测试数据库连接
     */
    @ReactMethod
    public void testDatabaseConnection(Promise promise) {
        try {
            ChatDatabaseHelper helper = getDbHelper();
            // 简单的测试操作
            String testUser = "测试用户_" + System.currentTimeMillis();
            String testMessage = "数据库连接测试消息";
            String testTimestamp = String.valueOf(System.currentTimeMillis());
            
            long result = helper.addOrUpdateChat(testUser, testMessage, testTimestamp);
            
            if (result != -1) {
                WritableMap response = Arguments.createMap();
                response.putBoolean("success", true);
                response.putString("message", "数据库连接正常");
                response.putDouble("testChatId", result);
                promise.resolve(response);
            } else {
                promise.reject("TEST_FAILED", "数据库连接测试失败");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "数据库连接测试失败: " + e.getMessage(), e);
            promise.reject("TEST_FAILED", e.getMessage(), e);
        }
    }

    /**
     * 静态方法：供Java端直接调用
     * 这样MyDynamicReceiver可以继续使用，同时避免重复
     */
    public static long addChatFromNative(Context context, String fromUser, String messageText, String timestamp, String sipAddress) {
        try {
            ChatDatabaseHelper helper = new ChatDatabaseHelper(context);
            long result = helper.addOrUpdateChat(fromUser, messageText, timestamp, sipAddress);
            Log.d(TAG, "Native端添加聊天记录，chatId: " + result);
            return result;
        } catch (Exception e) {
            Log.e(TAG, "Native端添加聊天记录失败: " + e.getMessage(), e);
            return -1;
        }
    }

    /**
     * React Native方法：获取数据库统计信息
     */
    @ReactMethod
    public void getDatabaseStats(Promise promise) {
        try {
            WritableMap stats = Arguments.createMap();
            stats.putString("databaseName", "ChatDB.db");
            stats.putInt("databaseVersion", 2);
            stats.putString("helperClass", "ChatDatabaseHelper");
            stats.putBoolean("isConnected", dbHelper != null);
            stats.putString("lastOperation", "getDatabaseStats");
            stats.putDouble("timestamp", System.currentTimeMillis());
            
            promise.resolve(stats);
        } catch (Exception e) {
            promise.reject("STATS_ERROR", e.getMessage(), e);
        }
    }
}
