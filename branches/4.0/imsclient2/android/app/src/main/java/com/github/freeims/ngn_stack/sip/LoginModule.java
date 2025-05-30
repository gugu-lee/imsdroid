package com.github.freeims.ngn_stack.sip;


import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class LoginModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;


    public LoginModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

    }

    @NonNull
    @Override
    public String getName() {
        return "LoginModule";
    }

    @ReactMethod
    public void login(Promise promise) {
        //ngnEngine.start();
        //ngnEngine.getConfigurationService()
        //        .putString("PCSCF","127.0.0.1");
        //INgnSipService sipService = ngnEngine.getSipService();
        //sipService.register(reactContext);

        // 这里可以调用你的登录逻辑
        Toast.makeText(reactContext, "Login called from JS", Toast.LENGTH_SHORT).show();
        // 假设登录成功
        promise.resolve("登录成功");
        // 如果失败可以调用 promise.reject("错误信息");
    }
}
