package com.github.freeims.ngn_stack.sip;


import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.doubango.imsdroid.Engine;
import org.doubango.ngn.NgnApplication;
import org.doubango.ngn.services.INgnSipService;


public class LoginModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    private Engine engine;
    //private NgnApplication ngnApplication;

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

    @ReactMethod
    public void login(Promise promise) {
        try {
            engine = (Engine) Engine.getInstance();
        }catch (ExceptionInInitializerError e){
            Log.e("LOGIN", "Engine initialization failed: " + e.getMessage(), e);
            promise.reject("Engine initialization failed", e);
            return;
        }
        catch (Exception e) {
            Log.e("LOGIN",e.getLocalizedMessage(),e);
        }

        // 这里可以调用你的登录逻辑
        Toast.makeText(reactContext, "Login called from JS", Toast.LENGTH_SHORT).show();
        // 假设登录成功
        promise.resolve("登录成功");
        // 如果失败可以调用 promise.reject("错误信息");
    }
}
