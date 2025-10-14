package com.imsclient2;

import android.content.Context;
import java.util.List;

/**
 * 外部消息数据访问对象
 */
public class ExternalMessageDao {
    private ExternalMessageDbHelper dbHelper;

    public ExternalMessageDao(Context context) {
        this.dbHelper = new ExternalMessageDbHelper(context);
    }

    public long saveMessage(ExternalMessage message) {
        return dbHelper.insertMessage(message);
    }

    public List<ExternalMessage> getMessages(int limit, int offset, String source, String type, boolean unreadOnly) {
        return dbHelper.getMessages(limit, offset, source, type, unreadOnly);
    }

    public List<ExternalMessage> getMessages() {
        return getMessages(50, 0, null, null, false);
    }

    public ExternalMessage getMessageById(String messageId) {
        return dbHelper.getMessageById(messageId);
    }

    public boolean markAsRead(String messageId) {
        return dbHelper.markAsRead(messageId);
    }

    public int markAllAsRead(String source) {
        return dbHelper.markAllAsRead(source);
    }

    public int markAllAsRead() {
        return dbHelper.markAllAsRead(null);
    }

    public boolean deleteMessage(String messageId) {
        return dbHelper.deleteMessage(messageId);
    }

    public int getUnreadCount(String source) {
        return dbHelper.getUnreadCount(source);
    }

    public int getUnreadCount() {
        return dbHelper.getUnreadCount(null);
    }

    public int cleanOldMessages(int daysToKeep) {
        return dbHelper.cleanOldMessages(daysToKeep);
    }

    public int cleanOldMessages() {
        return cleanOldMessages(30);
    }
}