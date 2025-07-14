package com.github.freeims.ngn_stack.sip;
// MessageDbHelper.java

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class MessageDbHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "messages.db";
    private static final int DATABASE_VERSION = 1;

    public static final String TABLE_NAME = "messages";
    public static final String COLUMN_ID = "msgId";
    public static final String COLUMN_FROM = "msgFrom";
    public static final String COLUMN_TO = "msgTo";
    public static final String COLUMN_TYPE = "contentType";
    public static final String COLUMN_PAYLOAD = "payload";

    private static final String SQL_CREATE_TABLE =
            "CREATE TABLE " + TABLE_NAME + " (" +
                    COLUMN_ID + " TEXT PRIMARY KEY," +
                    COLUMN_FROM + " TEXT," +
                    COLUMN_TO + " TEXT," +
                    COLUMN_TYPE + " TEXT," +
                    COLUMN_PAYLOAD + " BLOB)";

    public MessageDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NAME);
        onCreate(db);
    }
}