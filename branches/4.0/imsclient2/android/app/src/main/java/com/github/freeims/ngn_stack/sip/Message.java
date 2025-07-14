package com.github.freeims.ngn_stack.sip;

public class Message
{
    private static final String TAG = Message.class.getCanonicalName();
    private String msgId;

    private String from;
    private String to;
    private String contentType;
    private byte[] payload;
public String getMsgId() {
    return msgId;
}
    public Message(String from, String to, String contentType, byte[] payload) {
        this.msgId = java.util.UUID.randomUUID().toString(); // Generate a unique message ID
        this.from = from;
        this.to = to;
        this.contentType = contentType;
        this.payload = payload;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getPayload() {
        return payload;
    }
}
