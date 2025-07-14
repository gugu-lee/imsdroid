package com.github.freeims.ngn_stack.sip;


import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

public class MessageDao {
    private MessageDbHelper dbHelper;

    public MessageDao(Context context) {
        dbHelper = new MessageDbHelper(context);
    }

    public void insertMessage(Message message) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(MessageDbHelper.COLUMN_ID, message.getMsgId());
        values.put(MessageDbHelper.COLUMN_FROM, message.getFrom());
        values.put(MessageDbHelper.COLUMN_TO, message.getTo());
        values.put(MessageDbHelper.COLUMN_TYPE, message.getContentType());
        values.put(MessageDbHelper.COLUMN_PAYLOAD, message.getPayload());
        db.insert(MessageDbHelper.TABLE_NAME, null, values);
        db.close();
    }

    public Message getMessageById(String msgId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.query(
                MessageDbHelper.TABLE_NAME,
                null,
                MessageDbHelper.COLUMN_ID + "=?",
                new String[]{msgId},
                null, null, null
        );
        Message message = null;
        if (cursor.moveToFirst()) {
            String from = cursor.getString(cursor.getColumnIndexOrThrow(MessageDbHelper.COLUMN_FROM));
            String to = cursor.getString(cursor.getColumnIndexOrThrow(MessageDbHelper.COLUMN_TO));
            String type = cursor.getString(cursor.getColumnIndexOrThrow(MessageDbHelper.COLUMN_TYPE));
            byte[] payload = cursor.getBlob(cursor.getColumnIndexOrThrow(MessageDbHelper.COLUMN_PAYLOAD));
            message = new Message(from, to, type, payload);
        }
        cursor.close();
        db.close();
        return message;
    }
}
