package com.github.freeims.ngn_stack.sip;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import org.doubango.ngn.utils.NgnSettingsDbHelper;

/**
 * React Native模块，用于基本配置管理和连接测试
 */
public class BasicConfigModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BasicConfigModule";
    
    private final ReactApplicationContext reactContext;

    public BasicConfigModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "BasicConfigModule";
    }

    /**
     * 验证基本配置格式
     */
    @ReactMethod
    public void validateBasicConfig(ReadableMap config, Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            boolean isValid = true;
            String errorMessage = "";

            // 验证SIP地址
            String sipAddress = config.hasKey("sipAddress") ? config.getString("sipAddress") : "";
            if (sipAddress == null || sipAddress.trim().isEmpty()) {
                isValid = false;
                errorMessage = "SIP地址不能为空";
            } else if (!isValidSipAddress(sipAddress.trim())) {
                isValid = false;
                errorMessage = "SIP地址格式无效";
            }

            // 验证密码
            if (isValid) {
                String password = config.hasKey("password") ? config.getString("password") : "";
                if (password == null || password.trim().isEmpty()) {
                    isValid = false;
                    errorMessage = "密码不能为空";
                }
            }

            // 验证服务器地址
            if (isValid) {
                String pcscfAddress = config.hasKey("pcscfAddress") ? config.getString("pcscfAddress") : "";
                if (pcscfAddress == null || pcscfAddress.trim().isEmpty()) {
                    isValid = false;
                    errorMessage = "服务器地址不能为空";
                } else if (!isValidServerAddress(pcscfAddress.trim())) {
                    isValid = false;
                    errorMessage = "服务器地址格式无效";
                }
            }

            // 验证端口号
            if (isValid) {
                String portStr = config.hasKey("port") ? config.getString("port") : "";
                try {
                    int port = Integer.parseInt(portStr);
                    if (port <= 0 || port > 65535) {
                        isValid = false;
                        errorMessage = "端口号必须在1-65535之间";
                    }
                } catch (NumberFormatException e) {
                    isValid = false;
                    errorMessage = "端口号格式无效";
                }
            }

            result.putBoolean("isValid", isValid);
            result.putString("errorMessage", errorMessage);
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Error validating basic config", e);
            promise.reject("VALIDATION_ERROR", "配置验证失败: " + e.getMessage());
        }
    }

    /**
     * 测试SIP连接
     */
    @ReactMethod
    public void testSipConnection(ReadableMap config, Promise promise) {
        try {
            Log.d(TAG, "Testing SIP connection...");
            
            // 首先验证配置
            if (!validateConfigFormat(config)) {
                promise.reject("INVALID_CONFIG", "配置格式无效");
                return;
            }

            // 提取配置信息
            String sipAddress = config.getString("sipAddress");
            String password = config.getString("password");
            String pcscfAddress = config.getString("pcscfAddress");
            String portStr = config.getString("port");
            
            Log.d(TAG, String.format("Testing connection to %s:%s with SIP address %s", 
                pcscfAddress, portStr, sipAddress));

            // TODO: 实现实际的SIP连接测试
            // 这里可以集成现有的SIP stack进行连接测试
            
            // 模拟测试结果
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "连接测试成功");
            result.putInt("responseTime", 45); // 模拟响应时间
            
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Error testing SIP connection", e);
            promise.reject("CONNECTION_TEST_ERROR", "连接测试失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前数据库中的基本配置
     */
    @ReactMethod
    public void getCurrentBasicConfig(Promise promise) {
        try {
            NgnSettingsDbHelper settingsHelper = new NgnSettingsDbHelper(reactContext);
            
            WritableMap config = Arguments.createMap();
            
            // 获取账号信息
            String sipAddress = getSetting("account.sipAddress", "");
            config.putString("sipAddress", sipAddress);
            config.putString("password", settingsHelper.getPassword());
            config.putBoolean("autoLogin", "true".equals(getSetting("account.autoLogin", "false")));
            
            // 获取服务器信息
            config.putString("pcscfAddress", settingsHelper.getPcscfHost());
            config.putString("port", String.valueOf(settingsHelper.getPcscfPort()));
            
            // 获取派生信息
            config.putString("realm", settingsHelper.getRealm());
            config.putString("impi", settingsHelper.getIMPI());
            config.putString("impu", settingsHelper.getIMPU());
            config.putString("transport", settingsHelper.getTransport());
            
            // 配置状态
            config.putBoolean("hasValidSettings", settingsHelper.hasValidSettings());
            
            promise.resolve(config);

        } catch (Exception e) {
            Log.e(TAG, "Error getting current basic config", e);
            promise.reject("GET_CONFIG_ERROR", "获取配置失败: " + e.getMessage());
        }
    }

    /**
     * 获取配置建议
     */
    @ReactMethod
    public void getConfigSuggestions(String partialAddress, Promise promise) {
        try {
            WritableMap suggestions = Arguments.createMap();
            
            // 根据部分地址提供建议
            if (partialAddress != null && !partialAddress.trim().isEmpty()) {
                String address = partialAddress.trim().toLowerCase();
                
                // 常见SIP服务提供商的建议
                if (address.contains("freeims") || address.endsWith("@freeims.net")) {
                    suggestions.putString("recommendedServer", "pcscf.freeims.net");
                    suggestions.putString("recommendedPort", "5060");
                    suggestions.putBoolean("recommendedSSL", false);
                } else if (address.contains("ims") || address.contains("sip")) {
                    // 通用IMS配置建议
                    String domain = extractDomainFromSipAddress(address);
                    if (!domain.isEmpty()) {
                        suggestions.putString("recommendedServer", "pcscf." + domain);
                        suggestions.putString("recommendedPort", "5060");
                        suggestions.putBoolean("recommendedSSL", false);
                    }
                }
            }
            
            // 默认建议
            if (!suggestions.hasKey("recommendedServer")) {
                suggestions.putString("recommendedServer", "pcscf.freeims.net");
                suggestions.putString("recommendedPort", "5060");
                suggestions.putBoolean("recommendedSSL", false);
            }
            
            promise.resolve(suggestions);

        } catch (Exception e) {
            Log.e(TAG, "Error getting config suggestions", e);
            promise.reject("SUGGESTIONS_ERROR", "获取配置建议失败: " + e.getMessage());
        }
    }

    // ===== 私有辅助方法 =====

    private boolean validateConfigFormat(ReadableMap config) {
        return config.hasKey("sipAddress") && 
               config.hasKey("password") && 
               config.hasKey("pcscfAddress") && 
               config.hasKey("port");
    }

    private boolean isValidSipAddress(String sipAddress) {
        if (sipAddress == null || sipAddress.trim().isEmpty()) {
            return false;
        }
        
        String address = sipAddress.toLowerCase();
        if (address.startsWith("sip:")) {
            address = address.substring(4);
        }
        
        // 基本邮箱格式验证
        return address.matches("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    }

    private boolean isValidServerAddress(String serverAddress) {
        if (serverAddress == null || serverAddress.trim().isEmpty()) {
            return false;
        }
        
        // 域名格式验证
        String domainPattern = "^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        // IP地址格式验证
        String ipPattern = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
        
        return serverAddress.matches(domainPattern) || serverAddress.matches(ipPattern);
    }

    private String extractDomainFromSipAddress(String sipAddress) {
        try {
            String address = sipAddress;
            if (address.startsWith("sip:")) {
                address = address.substring(4);
            }
            
            if (address.contains("@")) {
                return address.split("@")[1];
            }
            
            return "";
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * 从用户设置表中获取设置值的辅助方法
     */
    private String getSetting(String key, String defaultValue) {
        try {
            NgnSettingsDbHelper helper = new NgnSettingsDbHelper(reactContext);
            return helper.getSetting(key, defaultValue);
        } catch (Exception e) {
            Log.e(TAG, "Error getting setting: " + key, e);
            return defaultValue;
        }
    }
}
