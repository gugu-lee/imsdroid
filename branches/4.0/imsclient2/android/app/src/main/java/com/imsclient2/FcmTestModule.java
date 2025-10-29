package com.imsclient2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import android.util.Log;
import android.content.SharedPreferences;
import android.content.Context;
import org.json.JSONObject;

/**
 * FCM测试模块 - 提供FCM相关的测试和调试功能
 * 用于React Native端调用原生FCM功能
 */
public class FcmTestModule extends ReactContextBaseJavaModule {

    private static final String TAG = "FcmTestModule";
    private final ReactApplicationContext reactContext;

    public FcmTestModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "FcmTestModule";
    }

    /**
     * 获取当前保存的FCM Token
     */
    @ReactMethod
    public void getCurrentToken(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("imsclient2_prefs", Context.MODE_PRIVATE);
            String savedToken = prefs.getString("fcm_token", null);
            
            if (savedToken != null) {
                Log.d(TAG, "从本地存储获取FCM Token: " + savedToken);
                promise.resolve(savedToken);
            } else {
                Log.d(TAG, "本地存储中没有FCM Token，尝试从Firebase获取...");
                fetchTokenFromFirebase(promise);
            }
        } catch (Exception e) {
            Log.e(TAG, "获取FCM Token失败: " + e.getMessage(), e);
            promise.reject("GET_TOKEN_ERROR", e.getMessage());
        }
    }

    /**
     * 从Firebase直接获取Token
     */
    @ReactMethod
    public void fetchTokenFromFirebase(Promise promise) {
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(new com.google.android.gms.tasks.OnCompleteListener<String>() {
                    @Override
                    public void onComplete(com.google.android.gms.tasks.Task<String> task) {
                        if (!task.isSuccessful()) {
                            Log.w(TAG, "获取FCM token失败", task.getException());
                            String errorMsg = task.getException() != null ? 
                                task.getException().getMessage() : "未知错误";
                            promise.reject("FETCH_TOKEN_ERROR", errorMsg);
                            return;
                        }

                        String token = task.getResult();
                        Log.d(TAG, "从Firebase获取FCM Token成功: " + token);
                        
                        // 保存到本地存储
                        SharedPreferences prefs = reactContext.getSharedPreferences("imsclient2_prefs", Context.MODE_PRIVATE);
                        prefs.edit().putString("fcm_token", token).apply();
                        
                        promise.resolve(token);
                    }
                });
        } catch (Exception e) {
            Log.e(TAG, "从Firebase获取Token异常: " + e.getMessage(), e);
            promise.reject("FETCH_TOKEN_EXCEPTION", e.getMessage());
        }
    }

    /**
     * 强制刷新FCM Token
     */
    @ReactMethod
    public void refreshToken(Promise promise) {
        try {
            Log.d(TAG, "开始刷新FCM Token...");
            
            com.google.firebase.messaging.FirebaseMessaging.getInstance().deleteToken()
                .addOnCompleteListener(new com.google.android.gms.tasks.OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(com.google.android.gms.tasks.Task<Void> task) {
                        if (task.isSuccessful()) {
                            Log.d(TAG, "旧Token删除成功，获取新Token...");
                            fetchTokenFromFirebase(promise);
                        } else {
                            Log.w(TAG, "删除旧Token失败", task.getException());
                            // 即使删除失败，也尝试获取新Token
                            fetchTokenFromFirebase(promise);
                        }
                    }
                });
        } catch (Exception e) {
            Log.e(TAG, "刷新FCM Token异常: " + e.getMessage(), e);
            promise.reject("REFRESH_TOKEN_EXCEPTION", e.getMessage());
        }
    }

    /**
     * 检查FCM服务可用性
     */
    @ReactMethod
    public void checkFcmAvailability(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            
            // 检查Google Play Services
            com.google.android.gms.common.GoogleApiAvailability apiAvailability = 
                com.google.android.gms.common.GoogleApiAvailability.getInstance();
            int resultCode = apiAvailability.isGooglePlayServicesAvailable(reactContext);
            
            boolean isPlayServicesAvailable = (resultCode == com.google.android.gms.common.ConnectionResult.SUCCESS);
            result.putBoolean("playServicesAvailable", isPlayServicesAvailable);
            result.putInt("playServicesResultCode", resultCode);
            
            if (!isPlayServicesAvailable) {
                String errorMsg = apiAvailability.getErrorString(resultCode);
                result.putString("playServicesError", errorMsg);
                Log.w(TAG, "Google Play Services 不可用: " + errorMsg);
            }

            // 检查Firebase初始化状态
            try {
                com.google.firebase.FirebaseApp defaultApp = com.google.firebase.FirebaseApp.getInstance();
                result.putBoolean("firebaseInitialized", defaultApp != null);
                if (defaultApp != null) {
                    result.putString("firebaseAppName", defaultApp.getName());
                    Log.d(TAG, "Firebase已初始化: " + defaultApp.getName());
                }
            } catch (Exception e) {
                result.putBoolean("firebaseInitialized", false);
                result.putString("firebaseError", e.getMessage());
                Log.w(TAG, "Firebase未初始化: " + e.getMessage());
            }

            // 尝试获取Instance ID
            try {
                String instanceId = com.google.firebase.installations.FirebaseInstallations.getInstance().getId().toString();
                result.putString("instanceId", instanceId);
                Log.d(TAG, "Firebase Instance ID: " + instanceId);
            } catch (Exception e) {
                result.putString("instanceIdError", e.getMessage());
                Log.w(TAG, "获取Instance ID失败: " + e.getMessage());
            }

            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "检查FCM可用性异常: " + e.getMessage(), e);
            promise.reject("CHECK_AVAILABILITY_ERROR", e.getMessage());
        }
    }

    /**
     * 获取FCM调试信息
     */
    @ReactMethod
    public void getDebugInfo(Promise promise) {
        try {
            WritableMap debugInfo = Arguments.createMap();
            
            // 基本信息
            debugInfo.putString("moduleName", getName());
            debugInfo.putString("packageName", reactContext.getPackageName());
            debugInfo.putLong("timestamp", System.currentTimeMillis());
            
            // Token信息
            SharedPreferences prefs = reactContext.getSharedPreferences("imsclient2_prefs", Context.MODE_PRIVATE);
            String savedToken = prefs.getString("fcm_token", null);
            debugInfo.putString("savedToken", savedToken != null ? savedToken : "未保存");
            debugInfo.putBoolean("hasToken", savedToken != null);
            
            // 应用状态
            debugInfo.putString("applicationState", reactContext.getLifecycleState().toString());
            debugInfo.putBoolean("hasReactInstance", reactContext.hasActiveReactInstance());
            
            Log.d(TAG, "FCM调试信息: " + debugInfo.toString());
            promise.resolve(debugInfo);
            
        } catch (Exception e) {
            Log.e(TAG, "获取调试信息失败: " + e.getMessage(), e);
            promise.reject("DEBUG_INFO_ERROR", e.getMessage());
        }
    }

    /**
     * 测试发送消息到ExternalMessageManager
     */
    @ReactMethod
    public void testMessageHandling(String title, String body, Promise promise) {
        try {
            Log.d(TAG, "测试消息处理: " + title + " - " + body);
            
            // 创建测试消息数据
            java.util.Map<String, String> testData = new java.util.HashMap<>();
            testData.put("type", "fcm_test");
            testData.put("title", title);
            testData.put("body", body);
            testData.put("sender", "FcmTestModule");
            testData.put("timestamp", String.valueOf(System.currentTimeMillis()));
            
            // 将Map转换为JSON字符串
            String dataJson = new org.json.JSONObject(testData).toString();
            
            // 创建ExternalMessage对象
            String messageId = "fcm_test_" + System.currentTimeMillis();
            ExternalMessage externalMessage = new ExternalMessage(
                messageId,
                "fcm_test",
                title,
                body,
                "FcmTestModule",
                System.currentTimeMillis(),
                dataJson,
                "FcmTestModule"
            );
            
            // 通过ExternalMessageManager处理消息
            ExternalMessageManager.getInstance(reactContext).handleIncomingMessage(externalMessage);
            
            WritableMap result = Arguments.createMap();
            result.putString("status", "success");
            result.putString("message", "测试消息已发送到ExternalMessageManager");
            result.putString("messageId", messageId);
            result.putLong("timestamp", System.currentTimeMillis());
            
            promise.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "测试消息处理失败: " + e.getMessage(), e);
            promise.reject("TEST_MESSAGE_ERROR", e.getMessage());
        }
    }

    /**
     * 清除保存的FCM Token
     */
    @ReactMethod
    public void clearSavedToken(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("imsclient2_prefs", Context.MODE_PRIVATE);
            prefs.edit().remove("fcm_token").apply();
            
            Log.d(TAG, "已清除保存的FCM Token");
            promise.resolve("FCM Token已清除");
            
        } catch (Exception e) {
            Log.e(TAG, "清除FCM Token失败: " + e.getMessage(), e);
            promise.reject("CLEAR_TOKEN_ERROR", e.getMessage());
        }
    }
}