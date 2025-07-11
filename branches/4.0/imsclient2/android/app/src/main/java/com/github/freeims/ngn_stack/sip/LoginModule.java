package com.github.freeims.ngn_stack.sip;


import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.doubango.imsdroid.Engine;
import org.doubango.ngn.NgnApplication;
import org.doubango.ngn.events.NgnMessagingEventArgs;
import org.doubango.ngn.model.NgnHistoryEvent;
import org.doubango.ngn.services.impl.NgnSipService;
import org.doubango.ngn.sip.NgnMessagingSession;


public class LoginModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    private Engine engine;
    //private NgnApplication ngnApplication;
    private NgnSipService sipService;

    public LoginModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        //ngnApplication = new NgnApplication();
    }

    @NonNull
    @Override
    public String getName() {
        return "LoginModule";
    }
    private String ACTION_CUSTOM_BROADCAST = "com.example.myapp.ACTION_CUSTOM_BROADCAST";
    private String EXTRA_MSG = "msg";
    @ReactMethod
    public void login(Promise promise) {


//        Intent intent = new Intent(ACTION_CUSTOM_BROADCAST);
//        intent.setPackage(reactContext.getPackageName());
//        intent.putExtra(EXTRA_MSG, "你好，广播！");
//        reactContext.sendBroadcast(intent);





        try {
            engine = (Engine) Engine.getInstance();

            sipService=(NgnSipService) engine.getSipService();
            boolean ret = false;
            if (sipService.isRegistered()){
                Log.i("LOGINMODULE","is regiser");
            }else{
                //
                Log.i("LogIN","Not Register");
                sipService.register(reactContext);
            }

            final NgnMessagingSession imSession = NgnMessagingSession.createOutgoingSession(sipService.getSipStack(),
                    "sip:alice@freeims.net");
            if(!(ret = imSession.sendTextMessage("hello"))){
                //e.setStatus(NgnHistoryEvent.StatusType.Failed);
            }
            NgnMessagingSession.releaseSession(imSession);
        }catch (ExceptionInInitializerError e){
            Log.e("LOGIN", "Engine initialization failed: " + e.getMessage(), e);
            promise.reject("Engine initialization failed", e);
            return;
        }
        catch (Exception e) {
            Log.e("LOGIN",e.getLocalizedMessage(),e);
        }

        // 这里可以调用你的登录逻辑
        //Toast.makeText(reactContext, "Login called from JS", Toast.LENGTH_SHORT).show();
        // 假设登录成功
        promise.resolve("登录成功");
        // 如果失败可以调用 promise.reject("错误信息");
    }
}
