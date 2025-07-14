package com.imsclient2;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;

import org.doubango.ngn.events.NgnMessagingEventArgs;

public class MyDynamicReceiver extends BroadcastReceiver {
    private static final String TAG = "MyDynamicReceiver";

    @Override
    public void onReceive( Context context,  Intent intent) {
        if (intent.getAction().equals( NgnMessagingEventArgs.ACTION_MESSAGING_EVENT) ){
            String msg = intent.getStringExtra(NgnMessagingEventArgs.EXTRA_DATE);
            Log.d("MainActivity", "收到自定义广播: "+msg);
            NgnMessagingEventArgs args = intent.getParcelableExtra
                    (NgnMessagingEventArgs.EXTRA_EMBEDDED);


            Log.d("MainActivity", "收到短信: " + new String(args.getPayload()));
        }
    }

    // 在 Activity/Fragment/Service 中注册和注销
//    public static void register(Context context) {
//        Log.i(TAG,"register receiver");
//        MyDynamicReceiver receiver = new MyDynamicReceiver();
//        IntentFilter filter = new IntentFilter(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT);
//
//        // Android 12+ 需指定 RECEIVER_EXPORTED 或 RECEIVER_NOT_EXPORTED
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//            context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
//        } else {
//            context.registerReceiver(receiver, filter);
//        }
//    }

    public static void unregister(Context context, BroadcastReceiver receiver) {
        context.unregisterReceiver(receiver);
    }
}
