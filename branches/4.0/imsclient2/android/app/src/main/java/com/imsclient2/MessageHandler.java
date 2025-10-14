package com.imsclient2;

/**
 * 消息处理器接口
 */
public interface MessageHandler {
    boolean canHandle(ExternalMessage message);

    void handleMessage(ExternalMessage message);
}