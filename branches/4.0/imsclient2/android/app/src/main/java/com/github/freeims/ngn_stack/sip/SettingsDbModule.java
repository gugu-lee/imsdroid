package com.github.freeims.ngn_stack.sip;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.io.File;

/**
 * React Native模块，用于从数据库读取用户设置
 */
public class SettingsDbModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SettingsDbModule";
    private static final String DB_NAME = "ChatDB.db";
    private static final String USER_SETTINGS_TABLE = "user_settings";
    
    private final ReactApplicationContext reactContext;

    public SettingsDbModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "SettingsDbModule";
    }

    /**
     * 获取数据库路径
     */
    private String getDatabasePath() {
        File databasesDir = new File(reactContext.getApplicationInfo().dataDir, "databases");
        return new File(databasesDir, DB_NAME).getAbsolutePath();
    }

    /**
     * 从用户设置表中获取设置值
     * 注意：前端使用JSON.stringify()保存数据，需要正确解析JSON格式
     */
    private String getSetting(String key, String defaultValue) {
        SQLiteDatabase db = null;
        Cursor cursor = null;
        try {
            String dbPath = getDatabasePath();
            File dbFile = new File(dbPath);
            
            if (!dbFile.exists()) {
                Log.w(TAG, "Database file does not exist: " + dbPath);
                return defaultValue;
            }
            
            db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY);
            
            // 检查表是否存在
            Cursor tableCheck = db.rawQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?", 
                new String[]{USER_SETTINGS_TABLE});
            if (!tableCheck.moveToFirst()) {
                Log.w(TAG, "Table " + USER_SETTINGS_TABLE + " does not exist");
                tableCheck.close();
                return defaultValue;
            }
            tableCheck.close();
            
            cursor = db.query(USER_SETTINGS_TABLE, 
                new String[]{"setting_value", "setting_type"}, 
                "setting_key = ?", 
                new String[]{key}, 
                null, null, null);
                
            if (cursor != null && cursor.moveToFirst()) {
                String value = cursor.getString(0);
                String type = cursor.getString(1);
                
                if (value == null) {
                    return defaultValue;
                }
                
                // 前端使用JSON.stringify保存数据，需要解析JSON格式
                try {
                    // 处理字符串类型的JSON值（带引号）
                    if (value.startsWith("\"") && value.endsWith("\"")) {
                        // 去除外层引号并处理转义字符
                        value = value.substring(1, value.length() - 1);
                        value = value.replace("\\\"", "\"").replace("\\\\", "\\");
                    }
                    // 处理布尔类型
                    else if ("boolean".equals(type)) {
                        // JSON格式的boolean值：true/false (不带引号)
                        return value; // 返回原始值用于后续处理
                    }
                    // 处理数字类型
                    else if ("number".equals(type)) {
                        return value; // 返回原始值
                    }
                    
                    return value;
                } catch (Exception parseError) {
                    Log.w(TAG, "Failed to parse JSON value for key: " + key + ", value: " + value, parseError);
                    return value; // 如果解析失败，返回原始值
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading setting: " + key, e);
        } finally {
            if (cursor != null) {
                cursor.close();
            }
            if (db != null) {
                db.close();
            }
        }
        return defaultValue;
    }
    
    /**
     * 获取布尔类型设置值
     */
    private boolean getBooleanSetting(String key, boolean defaultValue) {
        String value = getSetting(key, String.valueOf(defaultValue));
        if (value == null) {
            return defaultValue;
        }
        // 处理JSON格式的布尔值
        return "true".equals(value.toLowerCase());
    }
    
    /**
     * 获取整数类型设置值
     */
    private int getIntSetting(String key, int defaultValue) {
        String value = getSetting(key, String.valueOf(defaultValue));
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            Log.w(TAG, "Invalid integer value for key: " + key + ", value: " + value);
            return defaultValue;
        }
    }

    /**
     * React Native方法：获取单个设置值
     */
    @ReactMethod
    public void getSetting(String key, String defaultValue, Promise promise) {
        try {
            String value = getSetting(key, defaultValue);
            promise.resolve(value);
        } catch (Exception e) {
            Log.e(TAG, "Error getting setting: " + key, e);
            promise.reject("DB_ERROR", e.getMessage(), e);
        }
    }

    /**
     * React Native方法：获取所有SIP相关设置
     * 确保与前端DatabaseService.js的数据格式完全兼容
     */
    @ReactMethod
    public void getSipSettings(Promise promise) {
        try {
            WritableMap settings = Arguments.createMap();
            
            // 获取SIP相关设置 - 与前端SettingsService.js中的键名保持一致
            String sipAddress = getSetting("account.sipAddress", "");
            String password = getSetting("account.password", "");
            String pcscfHost = getSetting("server.pcscfAddress", "pcscf.freeims.net");
            String pcscfPort = getSetting("server.port", "5060");
            boolean useSSL = getBooleanSetting("server.useSSL", false);
            boolean autoLogin = getBooleanSetting("account.autoLogin", false);
            boolean rememberPassword = getBooleanSetting("account.rememberPassword", false);
            
            settings.putString("sipAddress", sipAddress);
            settings.putString("password", password);
            settings.putString("pcscfHost", pcscfHost);
            settings.putString("pcscfPort", pcscfPort);
            settings.putBoolean("useSSL", useSSL);
            settings.putBoolean("autoLogin", autoLogin);
            settings.putBoolean("rememberPassword", rememberPassword);
            
            // 从SIP地址解析realm, impi, impu
            if (!sipAddress.isEmpty() && sipAddress.contains("@")) {
                String[] parts = sipAddress.split("@");
                if (parts.length == 2) {
                    String userPart = parts[0];
                    if (userPart.startsWith("sip:")) {
                        userPart = userPart.substring(4);
                    }
                    String realm = parts[1];
                    
                    settings.putString("realm", realm);
                    settings.putString("impi", userPart);
                    settings.putString("impu", sipAddress.startsWith("sip:") ? sipAddress : "sip:" + sipAddress);
                } else {
                    // 无效的SIP地址格式，使用默认值
                    settings.putString("realm", "ims.freeims.net");
                    settings.putString("impi", "user");
                    settings.putString("impu", "sip:user@ims.freeims.net");
                }
            } else {
                // 没有SIP地址或格式不正确，使用默认值
                settings.putString("realm", "ims.freeims.net");
                settings.putString("impi", "user");
                settings.putString("impu", "sip:user@ims.freeims.net");
            }
            
            // 添加传输协议信息
            settings.putString("transport", useSSL ? "tls" : "udp");
            
            // 添加调试信息
            settings.putBoolean("hasValidConfig", !sipAddress.isEmpty() && sipAddress.contains("@"));
            
            Log.d(TAG, "Retrieved SIP settings: sipAddress=" + sipAddress + 
                      ", pcscfHost=" + pcscfHost + 
                      ", pcscfPort=" + pcscfPort + 
                      ", useSSL=" + useSSL + 
                      ", autoLogin=" + autoLogin);
            
            promise.resolve(settings);
        } catch (Exception e) {
            Log.e(TAG, "Error getting SIP settings", e);
            promise.reject("DB_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 同步获取SIP设置（供Java内部使用）
     */
    public WritableMap getSipSettingsSync() {
        try {
            WritableMap settings = Arguments.createMap();
            
            // 获取SIP相关设置 - 与前端SettingsService.js中的键名保持一致
            String sipAddress = getSetting("account.sipAddress", "");
            String password = getSetting("account.password", "");
            String pcscfHost = getSetting("server.pcscfAddress", "pcscf.freeims.net");
            String pcscfPort = getSetting("server.port", "5060");
            boolean useSSL = getBooleanSetting("server.useSSL", false);
            boolean autoLogin = getBooleanSetting("account.autoLogin", false);
            boolean rememberPassword = getBooleanSetting("account.rememberPassword", false);
            
            settings.putString("sipAddress", sipAddress);
            settings.putString("password", password);
            settings.putString("pcscfHost", pcscfHost);
            settings.putString("pcscfPort", pcscfPort);
            settings.putBoolean("useSSL", useSSL);
            settings.putBoolean("autoLogin", autoLogin);
            settings.putBoolean("rememberPassword", rememberPassword);
            
            // 从SIP地址解析realm, impi, impu
            if (!sipAddress.isEmpty() && sipAddress.contains("@")) {
                String[] parts = sipAddress.split("@");
                if (parts.length == 2) {
                    String userPart = parts[0];
                    if (userPart.startsWith("sip:")) {
                        userPart = userPart.substring(4);
                    }
                    String realm = parts[1];
                    
                    settings.putString("realm", realm);
                    settings.putString("impi", userPart);
                    settings.putString("impu", sipAddress.startsWith("sip:") ? sipAddress : "sip:" + sipAddress);
                } else {
                    // 无效的SIP地址格式，使用默认值
                    settings.putString("realm", "ims.freeims.net");
                    settings.putString("impi", "user");
                    settings.putString("impu", "sip:user@ims.freeims.net");
                }
            } else {
                // 没有SIP地址或格式不正确，使用默认值
                settings.putString("realm", "ims.freeims.net");
                settings.putString("impi", "user");
                settings.putString("impu", "sip:user@ims.freeims.net");
            }
            
            // 添加传输协议信息
            settings.putString("transport", useSSL ? "tls" : "udp");
            
            // 添加调试信息
            settings.putBoolean("hasValidConfig", !sipAddress.isEmpty() && sipAddress.contains("@"));
            
            Log.d(TAG, "同步获取SIP设置: sipAddress=" + sipAddress + 
                      ", pcscfHost=" + pcscfHost + 
                      ", pcscfPort=" + pcscfPort + 
                      ", useSSL=" + useSSL + 
                      ", autoLogin=" + autoLogin);
            
            return settings;
        } catch (Exception e) {
            Log.e(TAG, "同步获取SIP设置失败", e);
            return null;
        }
    }

    /**
     * React Native方法：检查数据库是否包含有效的SIP设置
     */
    @ReactMethod
    public void hasValidSipSettings(Promise promise) {
        try {
            String sipAddress = getSetting("account.sipAddress", "");
            boolean hasValid = !sipAddress.isEmpty() && sipAddress.contains("@");
            promise.resolve(hasValid);
        } catch (Exception e) {
            Log.e(TAG, "Error checking SIP settings validity", e);
            promise.reject("DB_ERROR", e.getMessage(), e);
        }
    }

    /**
     * React Native方法：获取数据库调试信息
     * 提供详细的数据库状态和设置值信息
     */
    @ReactMethod
    public void getDebugInfo(Promise promise) {
        try {
            WritableMap info = Arguments.createMap();
            
            String dbPath = getDatabasePath();
            File dbFile = new File(dbPath);
            
            // 基本数据库信息
            info.putString("databasePath", dbPath);
            info.putBoolean("databaseExists", dbFile.exists());
            info.putString("databaseSize", dbFile.exists() ? String.valueOf(dbFile.length()) + " bytes" : "0");
            
            if (dbFile.exists()) {
                // 检查表结构
                SQLiteDatabase db = null;
                Cursor cursor = null;
                try {
                    db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY);
                    
                    // 检查user_settings表是否存在
                    cursor = db.rawQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?", 
                        new String[]{USER_SETTINGS_TABLE});
                    boolean tableExists = cursor.moveToFirst();
                    info.putBoolean("userSettingsTableExists", tableExists);
                    cursor.close();
                    
                    if (tableExists) {
                        // 获取表中记录数
                        cursor = db.rawQuery("SELECT COUNT(*) FROM " + USER_SETTINGS_TABLE, null);
                        if (cursor.moveToFirst()) {
                            info.putInt("settingsCount", cursor.getInt(0));
                        }
                        cursor.close();
                        
                        // 获取所有设置键
                        cursor = db.query(USER_SETTINGS_TABLE, 
                            new String[]{"setting_key"}, 
                            null, null, null, null, "setting_key");
                        WritableMap keys = Arguments.createMap();
                        while (cursor.moveToNext()) {
                            String key = cursor.getString(0);
                            keys.putBoolean(key, true);
                        }
                        info.putMap("availableSettings", keys);
                        cursor.close();
                    }
                    
                } catch (Exception dbError) {
                    info.putString("databaseError", dbError.getMessage());
                } finally {
                    if (cursor != null) cursor.close();
                    if (db != null) db.close();
                }
            }
            
            // 尝试获取关键的SIP设置值
            WritableMap sipValues = Arguments.createMap();
            sipValues.putString("sipAddress", getSetting("account.sipAddress", ""));
            sipValues.putString("password", getSetting("account.password", "").isEmpty() ? "未设置" : "已设置");
            sipValues.putString("pcscfHost", getSetting("server.pcscfAddress", ""));
            sipValues.putString("pcscfPort", getSetting("server.port", ""));
            sipValues.putString("useSSL", getSetting("server.useSSL", "false"));
            sipValues.putString("autoLogin", getSetting("account.autoLogin", "false"));
            info.putMap("sipSettings", sipValues);
            
            // 验证设置完整性
            String sipAddress = getSetting("account.sipAddress", "");
            boolean hasValidSipAddress = !sipAddress.isEmpty() && sipAddress.contains("@");
            info.putBoolean("hasValidSipSettings", hasValidSipAddress);
            
            if (hasValidSipAddress) {
                String[] parts = sipAddress.split("@");
                if (parts.length == 2) {
                    info.putString("extractedRealm", parts[1]);
                    String userPart = parts[0].startsWith("sip:") ? parts[0].substring(4) : parts[0];
                    info.putString("extractedUser", userPart);
                }
            }
            
            promise.resolve(info);
        } catch (Exception e) {
            Log.e(TAG, "Error getting debug info", e);
            promise.reject("DB_ERROR", e.getMessage(), e);
        }
    }
}
