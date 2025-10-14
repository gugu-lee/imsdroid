package com.imsclient2;

/**
 * 外部消息监听器接口
 */
public interface ExternalMessageListener {
    void onMessageReceived(ExternalMessage message);
}