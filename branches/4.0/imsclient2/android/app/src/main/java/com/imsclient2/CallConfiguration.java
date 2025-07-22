package com.imsclient2;

import org.doubango.ngn.NgnEngine;
import org.doubango.ngn.services.INgnConfigurationService;
import org.doubango.ngn.utils.NgnConfigurationEntry;
import android.util.Log;

/**
 * 通话配置管理类
 * 控制使用现代化UI还是原生UI
 */
public class CallConfiguration {
    private static final String TAG = "CallConfiguration";
    
    // 配置键名
    public static final String USE_MODERN_CALL_UI = "use_modern_call_ui";
    public static final String CALL_UI_MIGRATION_MODE = "call_ui_migration_mode";
    
    // 迁移模式
    public static final String MIGRATION_MODE_LEGACY = "legacy";      // 使用原生界面
    public static final String MIGRATION_MODE_MODERN = "modern";      // 使用现代化界面
    public static final String MIGRATION_MODE_HYBRID = "hybrid";      // 混合模式
    
    private static INgnConfigurationService configService;
    
    static {
        try {
            configService = NgnEngine.getInstance().getConfigurationService();
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize configuration service", e);
        }
    }
    
    /**
     * 是否使用现代化通话UI
     */
    public static boolean useModernCallUI() {
        if (configService == null) {
            return false; // 默认使用原生UI
        }
        
        return configService.getBoolean(USE_MODERN_CALL_UI, false);
    }
    
    /**
     * 设置是否使用现代化通话UI
     */
    public static void setUseModernCallUI(boolean useModern) {
        if (configService != null) {
            configService.putBoolean(USE_MODERN_CALL_UI, useModern);
            configService.commit();
            Log.d(TAG, "Set modern call UI: " + useModern);
        }
    }
    
    /**
     * 获取迁移模式
     */
    public static String getMigrationMode() {
        if (configService == null) {
            return MIGRATION_MODE_LEGACY;
        }
        
        return configService.getString(
            CALL_UI_MIGRATION_MODE, 
            MIGRATION_MODE_LEGACY
        );
    }
    
    /**
     * 设置迁移模式
     */
    public static void setMigrationMode(String mode) {
        if (configService != null) {
            configService.putString(CALL_UI_MIGRATION_MODE, mode);
            configService.commit();
            Log.d(TAG, "Set migration mode: " + mode);
        }
    }
    
    /**
     * 是否应该使用现代化UI处理通话
     */
    public static boolean shouldUseModernUI() {
        String mode = getMigrationMode();
        
        switch (mode) {
            case MIGRATION_MODE_MODERN:
                return true;
            case MIGRATION_MODE_HYBRID:
                return useModernCallUI();
            case MIGRATION_MODE_LEGACY:
            default:
                return false;
        }
    }
    
    /**
     * 是否允许原生UI启动
     */
    public static boolean allowNativeUILaunch() {
        String mode = getMigrationMode();
        return !MIGRATION_MODE_MODERN.equals(mode);
    }
}
