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
    private val ACTION_CUSTOM_BROADCAST = NgnMessagingEventArgs.ACTION_MESSAGING_EVENT
    private val EXTRA_MSG = "message"
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == ACTION_CUSTOM_BROADCAST) {
                val msg = intent.getStringExtra(NgnMessagingEventArgs.EXTRA_DATE)
                Log.d("MainActivity", "收到自定义广播: $msg")
                val embedded = intent.getSerializableExtra(NgnMessagingEventArgs.EXTRA_EMBEDDED)
                val msg1 = (embedded as? NgnMessagingEventArgs)?.getPayload()
                Log.d("MainActivity", "收到短信: $msg1.")
            }
        }
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
        super.onCreate(savedInstanceState)
        // 你的初始化代码

        // 注册广播接收器，兼容低版本
        val filter = IntentFilter(ACTION_CUSTOM_BROADCAST)
        if (Build.VERSION.SDK_INT >= 26) {
            registerReceiver(receiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(receiver, filter)
        }


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

    override fun onStart() {
        super.onStart()
//        // 注册动态接收器
//        dynamicReceiver = MyDynamicReceiver()
//        val filter = IntentFilter(NgnMessagingEventArgs.ACTION_MESSAGING_EVENT)
//
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//            Log.i("MainActivey----------","regiser S");
//            registerReceiver(dynamicReceiver, filter, RECEIVER_NOT_EXPORTED)
//        } else {
//            Log.i("MainActivey----------","regiser");
//            registerReceiver(dynamicReceiver, filter)
//        }
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
