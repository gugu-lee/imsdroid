package com.imsclient2;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
public class MyBootReceiver extends BroadcastReceiver {
    private  final static String TAG="MyBootReceiver";
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.i(TAG ,action);
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // 设备启动后自动启动服务
            Intent serviceIntent = new Intent(context, MyBroadcastService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        }
    }
}
