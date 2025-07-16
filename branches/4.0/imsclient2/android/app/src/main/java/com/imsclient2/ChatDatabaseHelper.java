package com.imsclient2;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.Cursor;
import android.content.ContentValues;
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class ChatDatabaseHelper extends SQLiteOpenHelper {
    private static final String TAG = "ChatDatabaseHelper";
    private static final String DATABASE_NAME = "ChatDB.db";
    private static final int DATABASE_VERSION = 2;

    // 表名
    private static final String TABLE_CHAT_LIST = "chat_list";
    private static final String TABLE_MESSAGES = "messages";

    // 聊天列表表字段
    private static final String COLUMN_ID = "id";
    private static final String COLUMN_NAME = "name";
    private static final String COLUMN_LAST_MESSAGE = "last_message";
    private static final String COLUMN_LAST_MESSAGE_TIME = "last_message_time";
    private static final String COLUMN_UNREAD_COUNT = "unread_count";
    private static final String COLUMN_AVATAR_URL = "avatar_url";
    private static final String COLUMN_IS_ONLINE = "is_online";
    private static final String COLUMN_CHAT_TYPE = "chat_type";
    private static final String COLUMN_SIP_ADDRESS = "sip_address";
    private static final String COLUMN_CREATED_AT = "created_at";
    private static final String COLUMN_UPDATED_AT = "updated_at";

    // 消息表字段
    private static final String COLUMN_CHAT_ID = "chat_id";
    private static final String COLUMN_MESSAGE_TEXT = "message_text";
    private static final String COLUMN_MESSAGE_TYPE = "message_type";
    private static final String COLUMN_IS_MY_MESSAGE = "is_my_message";
    private static final String COLUMN_TIMESTAMP = "timestamp";

    public ChatDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // 创建聊天列表表
        String createChatListTable = "CREATE TABLE IF NOT EXISTS " + TABLE_CHAT_LIST + " (" +
                COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COLUMN_NAME + " TEXT NOT NULL, " +
                COLUMN_LAST_MESSAGE + " TEXT, " +
                COLUMN_LAST_MESSAGE_TIME + " TEXT, " +
                COLUMN_UNREAD_COUNT + " INTEGER DEFAULT 0, " +
                COLUMN_AVATAR_URL + " TEXT, " +
                COLUMN_IS_ONLINE + " INTEGER DEFAULT 0, " +
                COLUMN_CHAT_TYPE + " TEXT DEFAULT 'private', " +
                COLUMN_SIP_ADDRESS + " TEXT, " +
                COLUMN_CREATED_AT + " DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                COLUMN_UPDATED_AT + " DATETIME DEFAULT CURRENT_TIMESTAMP" +
                ")";

        // 创建消息表
        String createMessagesTable = "CREATE TABLE IF NOT EXISTS " + TABLE_MESSAGES + " (" +
                COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COLUMN_CHAT_ID + " INTEGER, " +
                COLUMN_MESSAGE_TEXT + " TEXT NOT NULL, " +
                COLUMN_MESSAGE_TYPE + " TEXT DEFAULT 'text', " +
                COLUMN_IS_MY_MESSAGE + " INTEGER DEFAULT 0, " +
                COLUMN_TIMESTAMP + " TEXT, " +
                COLUMN_CREATED_AT + " DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                "FOREIGN KEY (" + COLUMN_CHAT_ID + ") REFERENCES " + TABLE_CHAT_LIST + " (" + COLUMN_ID + ")" +
                ")";

        db.execSQL(createChatListTable);
        db.execSQL(createMessagesTable);
        Log.d(TAG, "Database tables created");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.d(TAG, "Upgrading database from version " + oldVersion + " to " + newVersion);
        
        if (oldVersion < 2) {
            // 添加sip_address字段
            try {
                db.execSQL("ALTER TABLE " + TABLE_CHAT_LIST + " ADD COLUMN " + COLUMN_SIP_ADDRESS + " TEXT");
                Log.d(TAG, "Added sip_address column to chat_list table");
            } catch (Exception e) {
                Log.e(TAG, "Error adding sip_address column: " + e.getMessage());
            }
        }
        
        // 如果需要完全重建数据库，可以使用以下代码
        // db.execSQL("DROP TABLE IF EXISTS " + TABLE_MESSAGES);
        // db.execSQL("DROP TABLE IF EXISTS " + TABLE_CHAT_LIST);
        // onCreate(db);
    }

    // 添加或更新聊天记录
    public long addOrUpdateChat(String fromUser, String messageText, String timestamp) {
        return addOrUpdateChat(fromUser, messageText, timestamp, null);
    }

    // 添加或更新聊天记录（带SIP地址）
    public long addOrUpdateChat(String fromUser, String messageText, String timestamp, String sipAddress) {
        SQLiteDatabase db = this.getWritableDatabase();
        long chatId = -1;

        try {
            // 检查是否已存在该用户的聊天记录
            Cursor cursor = db.query(TABLE_CHAT_LIST,
                    new String[]{COLUMN_ID},
                    COLUMN_NAME + "=?",
                    new String[]{fromUser},
                    null, null, null);

            if (cursor.moveToFirst()) {
                // 存在，获取chatId并更新
                chatId = cursor.getLong(0);
                ContentValues values = new ContentValues();
                values.put(COLUMN_LAST_MESSAGE, messageText);
                values.put(COLUMN_LAST_MESSAGE_TIME, timestamp);
                values.put(COLUMN_UPDATED_AT, getCurrentDateTime());
                
                // 如果提供了SIP地址，也更新SIP地址字段
                if (sipAddress != null) {
                    values.put(COLUMN_SIP_ADDRESS, sipAddress);
                }
                
                // 增加未读消息数
                db.execSQL("UPDATE " + TABLE_CHAT_LIST + 
                          " SET " + COLUMN_UNREAD_COUNT + " = " + COLUMN_UNREAD_COUNT + " + 1" +
                          " WHERE " + COLUMN_ID + " = ?", new String[]{String.valueOf(chatId)});

                db.update(TABLE_CHAT_LIST, values, COLUMN_ID + "=?", new String[]{String.valueOf(chatId)});
                Log.d(TAG, "Updated existing chat for user: " + fromUser + ", SIP: " + sipAddress);
            } else {
                // 不存在，创建新的聊天记录
                ContentValues values = new ContentValues();
                values.put(COLUMN_NAME, fromUser);
                values.put(COLUMN_LAST_MESSAGE, messageText);
                values.put(COLUMN_LAST_MESSAGE_TIME, timestamp);
                values.put(COLUMN_UNREAD_COUNT, 1);
                values.put(COLUMN_AVATAR_URL, "https://picsum.photos/50/50?random=" + System.currentTimeMillis());
                values.put(COLUMN_IS_ONLINE, 1);
                values.put(COLUMN_CHAT_TYPE, "private");
                if (sipAddress != null) {
                    values.put(COLUMN_SIP_ADDRESS, sipAddress);
                }

                chatId = db.insert(TABLE_CHAT_LIST, null, values);
                Log.d(TAG, "Created new chat for user: " + fromUser + ", chatId: " + chatId + ", SIP: " + sipAddress);
            }
            cursor.close();

            // 添加消息记录
            if (chatId != -1) {
                ContentValues messageValues = new ContentValues();
                messageValues.put(COLUMN_CHAT_ID, chatId);
                messageValues.put(COLUMN_MESSAGE_TEXT, messageText);
                messageValues.put(COLUMN_IS_MY_MESSAGE, 0); // 接收的消息
                messageValues.put(COLUMN_TIMESTAMP, timestamp);

                long messageId = db.insert(TABLE_MESSAGES, null, messageValues);
                Log.d(TAG, "Added message with id: " + messageId);
            }

        } catch (Exception e) {
            Log.e(TAG, "Error adding/updating chat: " + e.getMessage(), e);
        } finally {
            db.close();
        }

        return chatId;
    }

    // 获取当前时间字符串
    private String getCurrentDateTime() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        return sdf.format(new Date());
    }

    // 获取当前时间戳
    private String getCurrentTimeStamp() {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return sdf.format(new Date());
    }
}
