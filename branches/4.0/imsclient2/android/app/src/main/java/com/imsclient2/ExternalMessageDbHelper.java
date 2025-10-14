package com.imsclient2;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;
import java.util.ArrayList;
import java.util.List;

/**
 * 外部消息数据库帮助类
 */
public class ExternalMessageDbHelper extends SQLiteOpenHelper {

    private static final String TAG = "ExternalMessageDbHelper";
    public static final String DATABASE_NAME = "external_messages.db";
    public static final int DATABASE_VERSION = 1;

    // 表名
    public static final String TABLE_EXTERNAL_MESSAGES = "external_messages";

    // 字段名
    public static final String COLUMN_ID = "id";
    public static final String COLUMN_MESSAGE_ID = "message_id";
    public static final String COLUMN_TYPE = "type";
    public static final String COLUMN_TITLE = "title";
    public static final String COLUMN_BODY = "body";
    public static final String COLUMN_SENDER = "sender";
    public static final String COLUMN_TIMESTAMP = "timestamp";
    public static final String COLUMN_DATA = "data";
    public static final String COLUMN_SOURCE = "source";
    public static final String COLUMN_READ = "is_read";
    public static final String COLUMN_CREATED_AT = "created_at";
    public static final String COLUMN_UPDATED_AT = "updated_at";

    // 创建表的 SQL 语句
    private static final String SQL_CREATE_EXTERNAL_MESSAGES = "CREATE TABLE " + TABLE_EXTERNAL_MESSAGES + " (" +
            COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
            COLUMN_MESSAGE_ID + " TEXT UNIQUE NOT NULL, " +
            COLUMN_TYPE + " TEXT NOT NULL, " +
            COLUMN_TITLE + " TEXT, " +
            COLUMN_BODY + " TEXT, " +
            COLUMN_SENDER + " TEXT, " +
            COLUMN_TIMESTAMP + " INTEGER, " +
            COLUMN_DATA + " TEXT, " +
            COLUMN_SOURCE + " TEXT, " +
            COLUMN_READ + " INTEGER DEFAULT 0, " +
            COLUMN_CREATED_AT + " INTEGER DEFAULT (strftime('%s','now')), " +
            COLUMN_UPDATED_AT + " INTEGER DEFAULT (strftime('%s','now'))" +
            ")";

    // 索引
    private static final String SQL_CREATE_INDEX_MESSAGE_ID = "CREATE INDEX idx_message_id ON "
            + TABLE_EXTERNAL_MESSAGES + "(" + COLUMN_MESSAGE_ID + ")";

    private static final String SQL_CREATE_INDEX_TIMESTAMP = "CREATE INDEX idx_timestamp ON " + TABLE_EXTERNAL_MESSAGES
            + "(" + COLUMN_TIMESTAMP + " DESC)";

    private static final String SQL_CREATE_INDEX_SOURCE = "CREATE INDEX idx_source ON " + TABLE_EXTERNAL_MESSAGES + "("
            + COLUMN_SOURCE + ")";

    public ExternalMessageDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        Log.d(TAG, "创建外部消息数据库");

        try {
            db.execSQL(SQL_CREATE_EXTERNAL_MESSAGES);
            db.execSQL(SQL_CREATE_INDEX_MESSAGE_ID);
            db.execSQL(SQL_CREATE_INDEX_TIMESTAMP);
            db.execSQL(SQL_CREATE_INDEX_SOURCE);

            Log.d(TAG, "外部消息数据库创建成功");
        } catch (Exception e) {
            Log.e(TAG, "创建外部消息数据库失败: " + e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.d(TAG, "升级外部消息数据库从版本 " + oldVersion + " 到 " + newVersion);

        // 未来版本升级时在这里添加升级逻辑
    }

    /**
     * 插入外部消息
     */
    public long insertMessage(ExternalMessage message) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_MESSAGE_ID, message.getId());
        values.put(COLUMN_TYPE, message.getType());
        values.put(COLUMN_TITLE, message.getTitle());
        values.put(COLUMN_BODY, message.getBody());
        values.put(COLUMN_SENDER, message.getSender());
        values.put(COLUMN_TIMESTAMP, message.getTimestamp());
        values.put(COLUMN_DATA, message.getData());
        values.put(COLUMN_SOURCE, message.getSource());
        values.put(COLUMN_READ, 0); // 默认未读

        try {
            long id = db.insertWithOnConflict(
                    TABLE_EXTERNAL_MESSAGES,
                    null,
                    values,
                    SQLiteDatabase.CONFLICT_REPLACE);
            Log.d(TAG, "插入外部消息成功: " + message.getId() + ", 数据库ID: " + id);
            return id;
        } catch (Exception e) {
            Log.e(TAG, "插入外部消息失败: " + e.getMessage(), e);
            return -1;
        } finally {
            db.close();
        }
    }

    /**
     * 获取消息列表
     */
    public List<ExternalMessage> getMessages(int limit, int offset, String source, String type, boolean unreadOnly) {
        List<ExternalMessage> messages = new ArrayList<>();
        SQLiteDatabase db = getReadableDatabase();

        StringBuilder selection = new StringBuilder();
        List<String> conditions = new ArrayList<>();
        List<String> selectionArgsList = new ArrayList<>();

        if (source != null) {
            conditions.add(COLUMN_SOURCE + " = ?");
            selectionArgsList.add(source);
        }
        if (type != null) {
            conditions.add(COLUMN_TYPE + " = ?");
            selectionArgsList.add(type);
        }
        if (unreadOnly) {
            conditions.add(COLUMN_READ + " = 0");
        }

        if (!conditions.isEmpty()) {
            selection.append(String.join(" AND ", conditions));
        }

        String[] selectionArgs = selectionArgsList.isEmpty() ? null : selectionArgsList.toArray(new String[0]);
        String selectionStr = selection.length() == 0 ? null : selection.toString();

        Cursor cursor = db.query(
                TABLE_EXTERNAL_MESSAGES,
                null,
                selectionStr,
                selectionArgs,
                null,
                null,
                COLUMN_TIMESTAMP + " DESC",
                offset + ", " + limit);

        try {
            while (cursor.moveToNext()) {
                messages.add(cursorToMessage(cursor));
            }
            Log.d(TAG, "获取到 " + messages.size() + " 条外部消息");
        } catch (Exception e) {
            Log.e(TAG, "获取外部消息失败: " + e.getMessage(), e);
        } finally {
            cursor.close();
            db.close();
        }

        return messages;
    }

    /**
     * 根据消息ID获取消息
     */
    public ExternalMessage getMessageById(String messageId) {
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.query(
                TABLE_EXTERNAL_MESSAGES,
                null,
                COLUMN_MESSAGE_ID + " = ?",
                new String[] { messageId },
                null,
                null,
                null);

        try {
            if (cursor.moveToFirst()) {
                return cursorToMessage(cursor);
            } else {
                return null;
            }
        } catch (Exception e) {
            Log.e(TAG, "根据ID获取外部消息失败: " + e.getMessage(), e);
            return null;
        } finally {
            cursor.close();
            db.close();
        }
    }

    /**
     * 标记消息为已读
     */
    public boolean markAsRead(String messageId) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_READ, 1);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis() / 1000);

        try {
            int rows = db.update(
                    TABLE_EXTERNAL_MESSAGES,
                    values,
                    COLUMN_MESSAGE_ID + " = ?",
                    new String[] { messageId });
            Log.d(TAG, "标记消息已读: " + messageId);
            return rows > 0;
        } catch (Exception e) {
            Log.e(TAG, "标记消息已读失败: " + e.getMessage(), e);
            return false;
        } finally {
            db.close();
        }
    }

    /**
     * 批量标记消息为已读
     */
    public int markAllAsRead(String source) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_READ, 1);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis() / 1000);

        String selection = source != null ? COLUMN_SOURCE + " = ?" : null;
        String[] selectionArgs = source != null ? new String[] { source } : null;

        try {
            int rows = db.update(
                    TABLE_EXTERNAL_MESSAGES,
                    values,
                    selection,
                    selectionArgs);
            Log.d(TAG, "批量标记 " + rows + " 条消息为已读");
            return rows;
        } catch (Exception e) {
            Log.e(TAG, "批量标记消息已读失败: " + e.getMessage(), e);
            return 0;
        } finally {
            db.close();
        }
    }

    /**
     * 删除消息
     */
    public boolean deleteMessage(String messageId) {
        SQLiteDatabase db = getWritableDatabase();

        try {
            int rows = db.delete(
                    TABLE_EXTERNAL_MESSAGES,
                    COLUMN_MESSAGE_ID + " = ?",
                    new String[] { messageId });
            Log.d(TAG, "删除消息: " + messageId);
            return rows > 0;
        } catch (Exception e) {
            Log.e(TAG, "删除消息失败: " + e.getMessage(), e);
            return false;
        } finally {
            db.close();
        }
    }

    /**
     * 清理过期消息
     */
    public int cleanOldMessages(int daysToKeep) {
        SQLiteDatabase db = getWritableDatabase();
        long cutoffTime = System.currentTimeMillis() - (daysToKeep * 24L * 60 * 60 * 1000);

        try {
            int rows = db.delete(
                    TABLE_EXTERNAL_MESSAGES,
                    COLUMN_TIMESTAMP + " < ?",
                    new String[] { String.valueOf(cutoffTime) });
            Log.d(TAG, "清理了 " + rows + " 条过期消息（超过 " + daysToKeep + " 天）");
            return rows;
        } catch (Exception e) {
            Log.e(TAG, "清理过期消息失败: " + e.getMessage(), e);
            return 0;
        } finally {
            db.close();
        }
    }

    /**
     * 获取未读消息数量
     */
    public int getUnreadCount(String source) {
        SQLiteDatabase db = getReadableDatabase();

        StringBuilder selection = new StringBuilder();
        selection.append(COLUMN_READ).append(" = 0");
        String[] selectionArgs = null;

        if (source != null) {
            selection.append(" AND ").append(COLUMN_SOURCE).append(" = ?");
            selectionArgs = new String[] { source };
        }

        Cursor cursor = db.query(
                TABLE_EXTERNAL_MESSAGES,
                new String[] { "COUNT(*)" },
                selection.toString(),
                selectionArgs,
                null,
                null,
                null);

        try {
            if (cursor.moveToFirst()) {
                return cursor.getInt(0);
            } else {
                return 0;
            }
        } catch (Exception e) {
            Log.e(TAG, "获取未读消息数量失败: " + e.getMessage(), e);
            return 0;
        } finally {
            cursor.close();
            db.close();
        }
    }

    /**
     * Cursor 转换为 ExternalMessage
     */
    private ExternalMessage cursorToMessage(Cursor cursor) {
        return new ExternalMessage(
                cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MESSAGE_ID)),
                cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TYPE)),
                getString(cursor, COLUMN_TITLE),
                getString(cursor, COLUMN_BODY),
                getString(cursor, COLUMN_SENDER),
                cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_TIMESTAMP)),
                getString(cursor, COLUMN_DATA, "{}"),
                cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_SOURCE)));
    }

    private String getString(Cursor cursor, String columnName) {
        return getString(cursor, columnName, "");
    }

    private String getString(Cursor cursor, String columnName, String defaultValue) {
        String value = cursor.getString(cursor.getColumnIndexOrThrow(columnName));
        return value != null ? value : defaultValue;
    }
}