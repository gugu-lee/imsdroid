package com.imsclient2

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.doubango.imsdroid.Engine

class MainActivity : ReactActivity() {

    private var mEngine: Engine? = null

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

    // Sets main activity (should be done before starting services)
    mEngine = Engine.getInstance() as Engine
    mEngine!!.mainActivity = this
    }
}
