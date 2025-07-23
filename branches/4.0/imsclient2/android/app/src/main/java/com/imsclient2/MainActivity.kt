package com.imsclient2

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.doubango.imsdroid.Engine
import org.doubango.ngn.events.NgnMessagingEventArgs


class MainActivity : ReactActivity() {

    private var mEngine: Engine? = null
    private var dynamicReceiver: MyDynamicReceiver? = null
    companion object {
        private const val PERMISSION_REQUEST_CODE = 100
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "imsclient2"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    //    override fun onCreate(savedInstanceState: Bundle):ReactActivity {
//        super.onCreate(savedInstanceState)
//        // 你的初始化代码
//    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        // 你的初始化代码

        // 🎯 处理来自原生代码的通话重定向
        handleCallRedirection()

        // 启动服务（适配 Android 8.0+）
//        val serviceIntent = Intent(
//            this,
//            MyBroadcastService::class.java
//        )
//
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//            Log.i("dddddddd","fffffffffff")
//            val request: OneTimeWorkRequest =
//                Builder(BackupWorker::class.java).addTag("BACKUP_WORKER_TAG").build()
//            WorkManager.getInstance(this).enqueue(request)
//        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            startForegroundService(serviceIntent)
//        } else {
//            startService(serviceIntent)
//        }

        //checkPermissions();

        // Sets main activity (should be done before starting services)
        mEngine = Engine.getInstance() as Engine
        //if (mEngine!=null){
            mEngine?.start()
        //}

        mEngine!!.mainActivity = this

    }
    
    /**
     * 处理来自原生代码的通话重定向
     */
    private fun handleCallRedirection() {
        try {
            val action = intent.getStringExtra("action")
            val initialRoute = intent.getStringExtra("initialRoute")
            
            // 🎯 处理ScreenAV直接启动的通话（新的主要方式）
            if (action == "incoming_call" || action == "outgoing_call") {
                val sessionId = intent.getStringExtra("sessionId") ?: ""
                val remoteUri = intent.getStringExtra("remoteUri") ?: ""
                val mediaType = intent.getStringExtra("mediaType") ?: "Audio"
                val direction = if (action == "incoming_call") "incoming" else "outgoing"
                val callType = if (mediaType.contains("Video", true)) "video" else "audio"
                
                Log.d("MainActivity", "🎯 ScreenAV直接启动: action=$action, sessionId=$sessionId, remoteUri=$remoteUri, mediaType=$mediaType")
                
                // 🎯 将参数传递给React Native
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                    try {
                        // 通过CallModule发送事件给React Native
                        CallModule.handleScreenAVLaunch(action, sessionId, remoteUri, mediaType)
                        Log.d("MainActivity", "✅ 已通过CallModule发送ReactNativeCallManager启动事件")
                        
                    } catch (e: Exception) {
                        Log.e("MainActivity", "❌ 处理ReactNativeCallManager启动参数失败", e)
                    }
                }, 500)
                return
            }
            
            // 🎯 处理原有的重定向方式（向后兼容）
            if (initialRoute == "InCall") {
                val callType = intent.getStringExtra("callType") ?: "audio"
                val contactName = intent.getStringExtra("contactName") ?: "Unknown"
                val sipAddress = intent.getStringExtra("sipAddress") ?: ""
                val direction = intent.getStringExtra("direction") ?: "outgoing"
                val sessionId = intent.getStringExtra("sessionId") ?: ""
                
                Log.d("MainActivity", "🎯 Redirecting to InCall screen: callType=$callType, direction=$direction, contactName=$contactName, sessionId=$sessionId")
                
                // 🎯 发送重定向事件到React Native
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                    try {
                        val params = android.os.Bundle().apply {
                            putString("callType", callType)
                            putString("contactName", contactName)
                            putString("sipAddress", sipAddress)
                            putString("direction", direction)
                            putString("sessionId", sessionId)
                        }
                        
                        Log.d("MainActivity", "✅ 准备启动通话重定向")
                    } catch (e: Exception) {
                        Log.e("MainActivity", "❌ 处理重定向参数失败", e)
                    }
                }, 1000)
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error handling call redirection", e)
        }
    }

    override fun onStart() {
        super.onStart()
        // 注册动态接收器
        dynamicReceiver = MyDynamicReceiver()
        val filter = IntentFilter(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Log.i("MainActivity", "注册消息接收器 S版本")
            registerReceiver(dynamicReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            Log.i("MainActivity", "注册消息接收器")
            registerReceiver(dynamicReceiver, filter)
        }
    }

    override fun onStop() {
        super.onStop()
        // 注销动态接收器（避免内存泄漏）
        if (dynamicReceiver != null) {
            unregisterReceiver(dynamicReceiver)
        }
    }

    private fun checkPermissions() {
        val missingPermissions = REQUIRED_PERMISSIONS.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                // 所有权限已授予
            } else {
                // 部分权限被拒绝
                showPermissionDeniedDialog()
            }
        }
    }

    private fun showPermissionDeniedDialog() {
//        AlertDialog.Builder(this)
//            .setTitle("权限被拒绝")
//            .setMessage("需要权限才能使用完整功能，是否去设置中开启？")
//            .setPositiveButton("去设置") { _, _ ->
//                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
//                intent.data = Uri.fromParts("package", packageName, null)
//                startActivity(intent)
//            }
//            .setNegativeButton("取消", null)
//            .show()
    }
}
