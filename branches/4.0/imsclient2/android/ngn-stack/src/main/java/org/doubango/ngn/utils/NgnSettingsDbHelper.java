/* Copyright (C) 2010-2011, Mamadou Diop.
*  Copyright (C) 2011, Doubango Telecom.
*
* Contact: Mamadou Diop <diopmamadou(at)doubango(dot)org>
*	
* This file is part of imsdroid Project (http://code.google.com/p/imsdroid)
*
* imsdroid is free software: you can redistribute it and/or modify it under the terms of 
* the GNU General Public License as published by the Free Software Foundation, either version 3 
* of the License, or (at your option) any later version.
*	
* imsdroid is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
* without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
* See the GNU General Public License for more details.
*	
* You should have received a copy of the GNU General Public License along 
* with this program; if not, write to the Free Software Foundation, Inc., 
* 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
*/
package org.doubango.ngn.utils;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;
import java.io.File;

/**
 * 用户设置数据库读取工具类
 * 用于从React Native应用创建的SQLite数据库中读取用户设置
 */
public class NgnSettingsDbHelper {
    private static final String TAG = NgnSettingsDbHelper.class.getCanonicalName();
    
    private static final String DB_NAME = "ChatDB.db";
    private static final String USER_SETTINGS_TABLE = "user_settings";
    
    private final Context mContext;
    
    public NgnSettingsDbHelper(Context context) {
        mContext = context;
    }
    
    /**
     * 获取数据库路径
     */
    private String getDatabasePath() {
        File databasesDir = new File(mContext.getApplicationInfo().dataDir, "databases");
        return new File(databasesDir, DB_NAME).getAbsolutePath();
    }
    
    /**
     * 从用户设置表中获取设置值
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
            cursor = db.query(USER_SETTINGS_TABLE, 
                new String[]{"setting_value"}, 
                "setting_key = ?", 
                new String[]{key}, 
                null, null, null);
                
            if (cursor != null && cursor.moveToFirst()) {
                String value = cursor.getString(0);
                // 去除JSON字符串的引号
                if (value != null && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }
                return value != null ? value : defaultValue;
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
     * 获取SIP Realm
     * 从sipAddress中提取域名部分
     */
    public String getRealm() {
        String sipAddress = getSetting("account.sipAddress", "");
        if (!sipAddress.isEmpty() && sipAddress.contains("@")) {
            String domain = sipAddress.split("@")[1];
            // 确保realm格式为 sip:domain
            return domain.startsWith("sip:") ? domain : "sip:" + domain;
        }
        return "sip:ims.freeims.net";
    }
    
    /**
     * 获取IMPI (Identity Module Private Identity)
     * 从SIP地址中提取用户名部分作为IMPI
     */
    public String getIMPI() {
        String sipAddress = getSetting("account.sipAddress", "");
        if (!sipAddress.isEmpty()) {
            // 移除最前面的sip:前缀（如果存在）
            if (sipAddress.startsWith("sip:")) {
                sipAddress = sipAddress.substring(4);
            }
            
            // 提取@之前的用户名部分
            // if (sipAddress.contains("@")) {
            //     return sipAddress.split("@")[0];
            // }
            
            return sipAddress;
        }
        return "user";
    }
    
    /**
     * 获取IMPU (Identity Module Public Identity)
     * 确保SIP地址以sip:开头的标准格式
     */
    public String getIMPU() {
        String sipAddress = getSetting("account.sipAddress", "");
        if (!sipAddress.isEmpty()) {
            // 确保SIP地址以sip:开头
            if (!sipAddress.startsWith("sip:")) {
                sipAddress = "sip:" + sipAddress;
            }
            return sipAddress;
        }
        return "sip:user@ims.freeims.net";
    }
    
    /**
     * 获取PCSCF主机地址
     */
    public String getPcscfHost() {
        return getSetting("server.pcscfAddress", "pcscf.freeims.net");
    }
    
    /**
     * 获取PCSCF端口号
     */
    public int getPcscfPort() {
        String portStr = getSetting("server.port", "5060");
        try {
            return Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            Log.w(TAG, "Invalid port number: " + portStr + ", using default 5060");
            return 5060;
        }
    }
    
    /**
     * 获取SIP密码
     */
    public String getPassword() {
        return getSetting("account.password", "");
    }
    
    /**
     * 获取传输协议
     * 根据SSL设置返回对应的传输协议
     */
    public String getTransport() {
        String useSSL = getSetting("server.useSSL", "false");
        boolean sslEnabled = "true".equalsIgnoreCase(useSSL) || "1".equals(useSSL);
        return sslEnabled ? "tls" : "udp";
    }
    
    /**
     * 检查数据库是否存在且包含有效的SIP设置数据
     */
    public boolean hasValidSettings() {
        try {
            String sipAddress = getSetting("account.sipAddress", "");
            String password = getSetting("account.password", "");
            String pcscfAddress = getSetting("server.pcscfAddress", "");
            
            // 检查SIP地址格式
            boolean validSipAddress = !sipAddress.isEmpty() && sipAddress.contains("@");
            
            // 检查密码
            boolean hasPassword = !password.isEmpty();
            
            // 检查PCSCF地址
            boolean hasPcscfAddress = !pcscfAddress.isEmpty();
            
            Log.d(TAG, String.format("Settings validation: sipAddress=%s, password=%s, pcscfAddress=%s", 
                validSipAddress, hasPassword, hasPcscfAddress));
            
            return validSipAddress && hasPassword && hasPcscfAddress;
        } catch (Exception e) {
            Log.e(TAG, "Error validating settings", e);
            return false;
        }
    }
    
    /**
     * 获取所有SIP配置信息的调试字符串
     */
    public String getDebugInfo() {
        StringBuilder sb = new StringBuilder();
        sb.append("=== SIP Settings from Database ===\n");
        sb.append("Database Path: ").append(getDatabasePath()).append("\n");
        sb.append("Database Exists: ").append(new File(getDatabasePath()).exists()).append("\n");
        sb.append("Has Valid Settings: ").append(hasValidSettings()).append("\n");
        sb.append("\n--- Account Settings ---\n");
        sb.append("SIP Address: ").append(getSetting("account.sipAddress", "")).append("\n");
        sb.append("Password: ").append(!getPassword().isEmpty() ? "[SET]" : "[EMPTY]").append("\n");
        sb.append("Auto Login: ").append(getSetting("account.autoLogin", "false")).append("\n");
        sb.append("Remember Password: ").append(getSetting("account.rememberPassword", "false")).append("\n");
        sb.append("\n--- Derived SIP Values ---\n");
        sb.append("Realm: ").append(getRealm()).append("\n");
        sb.append("IMPI: ").append(getIMPI()).append("\n");
        sb.append("IMPU: ").append(getIMPU()).append("\n");
        sb.append("\n--- Server Settings ---\n");
        sb.append("PCSCF Host: ").append(getPcscfHost()).append("\n");
        sb.append("PCSCF Port: ").append(getPcscfPort()).append("\n");
        sb.append("Use SSL: ").append(getSetting("server.useSSL", "false")).append("\n");
        sb.append("Transport: ").append(getTransport()).append("\n");
        sb.append("Registration Timeout: ").append(getSetting("server.registrationTimeout", "3600")).append("\n");
        sb.append("Keep-Alive Interval: ").append(getSetting("server.keepAliveInterval", "30")).append("\n");
        sb.append("Preset: ").append(getSetting("server.preset", "custom")).append("\n");
        return sb.toString();
    }
    
    /**
     * 验证当前设置是否与预期格式一致
     */
    public boolean validateSettingsFormat() {
        try {
            String sipAddress = getSetting("account.sipAddress", "");
            
            // 验证SIP地址格式
            if (!sipAddress.isEmpty()) {
                // 不应该包含sip:前缀(因为前端存储时会移除)
                if (sipAddress.startsWith("sip:")) {
                    Log.w(TAG, "SIP address contains 'sip:' prefix, should be removed in frontend");
                    return false;
                }
                
                // 应该包含@符号
                if (!sipAddress.contains("@")) {
                    Log.w(TAG, "Invalid SIP address format: missing '@'");
                    return false;
                }
            }
            
            // 验证端口号格式
            String port = getSetting("server.port", "5060");
            try {
                int portNum = Integer.parseInt(port);
                if (portNum <= 0 || portNum > 65535) {
                    Log.w(TAG, "Invalid port number: " + port);
                    return false;
                }
            } catch (NumberFormatException e) {
                Log.w(TAG, "Invalid port format: " + port);
                return false;
            }
            
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error validating settings format", e);
            return false;
        }
    }
}
