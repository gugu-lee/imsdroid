package com.imsclient2

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.work.OneTimeWorkRequest
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.doubango.imsdroid.Engine


class MainActivity : ReactActivity() {

    private var mEngine: Engine? = null

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
        super.onCreate(savedInstanceState)
        // 你的初始化代码




        // 启动服务（适配 Android 8.0+）
        val serviceIntent = Intent(
            this,
            MyBroadcastService::class.java
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val request: OneTimeWorkRequest =
                Builder(BackupWorker::class.java).addTag("BACKUP_WORKER_TAG").build()
            WorkManager.getInstance(this).enqueue(request)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        checkPermissions();

        // Sets main activity (should be done before starting services)
        mEngine = Engine.getInstance() as Engine
        //if (mEngine!=null){
            mEngine?.start()
        //}

        mEngine!!.mainActivity = this

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
