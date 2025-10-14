package com.imsclient2;

/**
 * 外部消息数据类
 */
public class ExternalMessage {
    private String id;
    private String type;
    private String title;
    private String body;
    private String sender;
    private long timestamp;
    private String data;
    private String source;

    public ExternalMessage(String id, String type, String title, String body,
            String sender, long timestamp, String data, String source) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.body = body;
        this.sender = sender;
        this.timestamp = timestamp;
        this.data = data;
        this.source = source;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getSender() {
        return sender;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getData() {
        return data;
    }

    public String getSource() {
        return source;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public void setData(String data) {
        this.data = data;
    }

    public void setSource(String source) {
        this.source = source;
    }

    @Override
    public String toString() {
        return "ExternalMessage{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", title='" + title + '\'' +
                ", body='" + body + '\'' +
                ", sender='" + sender + '\'' +
                ", timestamp=" + timestamp +
                ", data='" + data + '\'' +
                ", source='" + source + '\'' +
                '}';
    }
}