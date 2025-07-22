package com.imsclient2;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import org.doubango.ngn.sip.NgnAVSession;
import org.doubango.imsdroid.Screens.ScreenAV;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * 通话状态协调管理器
 * 解决原生UI与现代化UI的冲突问题
 */
public class CallStateCoordinator {
    private static final String TAG = "CallStateCoordinator";
    
    private static CallStateCoordinator instance;
    private final Map<Long, CallSessionInfo> activeSessions = new ConcurrentHashMap<>();
    private boolean nativeScreenActive = false;
    private boolean modernUIActive = false;
    
    // 通话会话信息
    private static class CallSessionInfo {
        public final NgnAVSession session;
        public final String uiType; // "native" or "modern"
        public final long startTime;
        
        public CallSessionInfo(NgnAVSession session, String uiType) {
            this.session = session;
            this.uiType = uiType;
            this.startTime = System.currentTimeMillis();
        }
    }
    
    private CallStateCoordinator() {
        Log.d(TAG, "CallStateCoordinator initialized");
    }
    
    public static synchronized CallStateCoordinator getInstance() {
        if (instance == null) {
            instance = new CallStateCoordinator();
        }
        return instance;
    }
    
    /**
     * 检查是否有原生通话界面正在运行
     */
    public boolean isNativeCallScreenActive() {
        return nativeScreenActive;
    }
    
    /**
     * 检查是否有现代化UI正在运行
     */
    public boolean isModernUIActive() {
        return modernUIActive;
    }
    
    /**
     * 设置原生界面状态
     */
    public void setNativeScreenActive(boolean active) {
        this.nativeScreenActive = active;
        Log.d(TAG, "Native screen active: " + active);
    }
    
    /**
     * 设置现代化UI状态
     */
    public void setModernUIActive(boolean active) {
        this.modernUIActive = active;
        Log.d(TAG, "Modern UI active: " + active);
    }
    
    /**
     * 注册通话会话
     */
    public boolean registerCallSession(NgnAVSession session, String uiType) {
        if (session == null) {
            Log.e(TAG, "Cannot register null session");
            return false;
        }
        
        long sessionId = session.getId();
        
        // 检查冲突
        if (hasConflict(uiType)) {
            Log.w(TAG, "Call UI conflict detected for session " + sessionId);
            return false;
        }
        
        CallSessionInfo info = new CallSessionInfo(session, uiType);
        activeSessions.put(sessionId, info);
        
        // 更新UI状态
        if ("native".equals(uiType)) {
            setNativeScreenActive(true);
        } else if ("modern".equals(uiType)) {
            setModernUIActive(true);
        }
        
        Log.d(TAG, "Registered call session " + sessionId + " with UI type: " + uiType);
        return true;
    }
    
    /**
     * 注销通话会话
     */
    public void unregisterCallSession(long sessionId) {
        CallSessionInfo info = activeSessions.remove(sessionId);
        if (info != null) {
            // 检查是否还有相同类型的UI活跃
            boolean hasNativeUI = activeSessions.values().stream()
                .anyMatch(s -> "native".equals(s.uiType));
            boolean hasModernUI = activeSessions.values().stream()
                .anyMatch(s -> "modern".equals(s.uiType));
            
            setNativeScreenActive(hasNativeUI);
            setModernUIActive(hasModernUI);
            
            Log.d(TAG, "Unregistered call session " + sessionId);
        }
    }
    
    /**
     * 检查是否有UI冲突
     */
    private boolean hasConflict(String requestedUIType) {
        // 如果是混合模式，允许并存
        if (CallConfiguration.MIGRATION_MODE_HYBRID.equals(
                CallConfiguration.getMigrationMode())) {
            return false;
        }
        
        // 检查是否已有不同类型的UI在运行
        if ("native".equals(requestedUIType) && modernUIActive) {
            return true;
        }
        if ("modern".equals(requestedUIType) && nativeScreenActive) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取推荐的UI类型
     */
    public String getRecommendedUIType() {
        if (CallConfiguration.shouldUseModernUI()) {
            return "modern";
        } else {
            return "native";
        }
    }
    
    /**
     * 强制切换到现代化UI
     */
    public void forceModernUI() {
        // 终止所有原生UI会话
        for (Map.Entry<Long, CallSessionInfo> entry : activeSessions.entrySet()) {
            if ("native".equals(entry.getValue().uiType)) {
                Log.d(TAG, "Force switching session " + entry.getKey() + " to modern UI");
                // 这里可以发送事件通知原生UI关闭
            }
        }
        
        setNativeScreenActive(false);
        CallConfiguration.setMigrationMode(CallConfiguration.MIGRATION_MODE_MODERN);
    }
    
    /**
     * 获取活跃会话数
     */
    public int getActiveSessionCount() {
        return activeSessions.size();
    }
    
    /**
     * 获取指定会话信息
     */
    public CallSessionInfo getSessionInfo(long sessionId) {
        return activeSessions.get(sessionId);
    }
    
    /**
     * 清理所有会话
     */
    public void clearAllSessions() {
        activeSessions.clear();
        setNativeScreenActive(false);
        setModernUIActive(false);
        Log.d(TAG, "Cleared all call sessions");
    }
}
