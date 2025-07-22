package org.doubango.imsdroid.ReactNative;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.imsclient2.MainActivity;
import com.imsclient2.MainApplication;

import org.doubango.imsdroid.Engine;
import org.doubango.ngn.media.NgnMediaType;
import org.doubango.ngn.services.INgnConfigurationService;
import org.doubango.ngn.services.INgnSipService;
import org.doubango.ngn.sip.NgnAVSession;
import org.doubango.ngn.sip.NgnSipStack;
import org.doubango.ngn.utils.NgnConfigurationEntry;
import org.doubango.ngn.utils.NgnUriUtils;

/**
 * React Native 通话管理器
 * 用于替换原生ScreenAV的通话功能
 */
public class ReactNativeCallManager {
    private static final String TAG = "ReactNativeCallManager";

    /**
     * 接收来电 - 替换ScreenAV.receiveCall()
     * @param avSession 音视频会话
     * @return 是否成功启动
     */
    public static boolean receiveCall(NgnAVSession avSession) {
        try {
            Context context = MainApplication.getContext();
            Intent intent = new Intent(context, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("action", "incoming_call");
            intent.putExtra("sessionId", Long.toString(avSession.getId()));
            intent.putExtra("remoteUri", avSession.getRemotePartyUri());
            intent.putExtra("mediaType", avSession.getMediaType().toString());
            
            Log.d(TAG, "🎯 启动React Native来电界面 - sessionId: " + avSession.getId() + ", remoteUri: " + avSession.getRemotePartyUri());
            context.startActivity(intent);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "❌ 启动React Native来电界面失败", e);
            return false;
        }
    }

    /**
     * 发起通话 - 替换ScreenAV.makeCall()
     * @param remoteUri 目标URI
     * @param mediaType 媒体类型（音频/视频）
     * @return 是否成功发起
     */
    public static boolean makeCall(String remoteUri, NgnMediaType mediaType) {
        final Engine engine = (Engine)Engine.getInstance();
        final INgnSipService sipService = engine.getSipService();
        final INgnConfigurationService configurationService = engine.getConfigurationService();
        
        // 验证和规范化URI
        final String validUri = NgnUriUtils.makeValidSipUri(remoteUri);
        if(validUri == null) {
            Log.e(TAG, "failed to normalize sip uri '" + remoteUri + "'");
            return false;
        } else {
            remoteUri = validUri;
            if(remoteUri.startsWith("tel:")) {
                // E.164 number => use ENUM protocol
                final NgnSipStack sipStack = sipService.getSipStack();
                if(sipStack != null) {
                    String phoneNumber = NgnUriUtils.getValidPhoneNumber(remoteUri);
                    if(phoneNumber != null) {
                        String enumDomain = configurationService.getString(
                                NgnConfigurationEntry.GENERAL_ENUM_DOMAIN, 
                                NgnConfigurationEntry.DEFAULT_GENERAL_ENUM_DOMAIN);
                        String sipUri = sipStack.dnsENUM("E2U+SIP", phoneNumber, enumDomain);
                        if(sipUri != null) {
                            remoteUri = sipUri;
                        }
                    }
                }
            }
        }
        
        // 创建会话
        final NgnAVSession avSession = NgnAVSession.createOutgoingSession(sipService.getSipStack(), mediaType);
        avSession.setRemotePartyUri(remoteUri);
        
        // 启动React Native通话界面
        try {
            Context context = MainApplication.getContext();
            Intent intent = new Intent(context, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("action", "outgoing_call");
            intent.putExtra("sessionId", Long.toString(avSession.getId()));
            intent.putExtra("remoteUri", remoteUri);
            intent.putExtra("mediaType", mediaType.toString());
            
            Log.d(TAG, "🎯 启动React Native拨出界面 - sessionId: " + avSession.getId() + ", remoteUri: " + remoteUri);
            context.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "❌ 启动React Native拨出界面失败", e);
            return false;
        }
        
        // 保持其他活动通话
        final NgnAVSession activeCall = NgnAVSession.getFirstActiveCallAndNot(avSession.getId());
        if(activeCall != null) {
            activeCall.holdCall();
        }
        
        // 发起通话
        return avSession.makeCall(remoteUri);
    }

    /**
     * 发起音频通话
     * @param remoteUri 目标URI
     * @return 是否成功发起
     */
    public static boolean makeAudioCall(String remoteUri) {
        return makeCall(remoteUri, NgnMediaType.Audio);
    }

    /**
     * 发起视频通话
     * @param remoteUri 目标URI
     * @return 是否成功发起
     */
    public static boolean makeVideoCall(String remoteUri) {
        return makeCall(remoteUri, NgnMediaType.AudioVideo);
    }
}
