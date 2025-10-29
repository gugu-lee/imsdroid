@echo off
echo FCM 推送测试脚本 - 已恢复
echo ============================
echo.

REM 设置变量 - 需要替换为实际值
REM 示例格式：
REM set SERVER_KEY=AAAAxxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxx
REM set DEVICE_TOKEN=exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
set SERVER_KEY=YOUR_FIREBASE_SERVER_KEY_HERE
set DEVICE_TOKEN=YOUR_DEVICE_FCM_TOKEN_HERE

echo 📋 获取Firebase凭据指南：
echo.
echo 🔑 1. SERVER_KEY 获取方法：
echo    a) 打开 Firebase 控制台: https://console.firebase.google.com
echo    b) 选择您的项目
echo    c) 点击齿轮图标 ⚙️ -> 项目设置
echo    d) 点击 "Cloud Messaging" 标签页
echo    e) 在"项目凭据"部分复制"服务器密钥"
echo    f) 格式像: AAAAxxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxx
echo.
echo 📱 2. DEVICE_TOKEN 获取方法：
echo    方法1 - 从应用日志获取:
echo      a) 运行您的Android应用
echo      b) 在Logcat中搜索 "FCM Token" 或 "Token已更新"
echo      c) 复制完整的token字符串
echo.
echo    方法2 - 使用恢复的FcmTestModule:
echo      a) 在应用中导入: import FcmTestHelper from './src/utils/FcmTestHelper'
echo      b) 调用: await FcmTestHelper.getCurrentToken()
echo      c) 或运行完整测试: await FcmTestHelper.runFullTest()
echo.
echo    格式像: exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
echo.

REM 检查变量是否已设置
if "%SERVER_KEY%"=="YOUR_FIREBASE_SERVER_KEY_HERE" (
    echo ❌ 请先设置 SERVER_KEY 变量
    echo.
    pause
    exit /b 1
)

if "%DEVICE_TOKEN%"=="YOUR_DEVICE_FCM_TOKEN_HERE" (
    echo ❌ 请先设置 DEVICE_TOKEN 变量
    echo.
    pause
    exit /b 1
)

echo ✅ 开始FCM推送测试...
echo.

REM 测试1：发送数据消息（Data Message）
echo 🧪 测试1: 发送数据消息
curl -X POST ^
  -H "Authorization: key=%SERVER_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"to\":\"%DEVICE_TOKEN%\",\"data\":{\"type\":\"test_message\",\"title\":\"FCM数据消息测试\",\"body\":\"这是一条来自curl的数据消息\",\"sender\":\"curl测试\",\"timestamp\":\"%date:~0,4%%date:~5,2%%date:~8,2%\",\"extra\":\"{\\\"source\\\":\\\"curl\\\",\\\"restored\\\":true}\"}}" ^
  https://fcm.googleapis.com/fcm/send

echo.
echo.

REM 测试2：发送通知消息（Notification Message）
echo 🧪 测试2: 发送通知消息
curl -X POST ^
  -H "Authorization: key=%SERVER_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"to\":\"%DEVICE_TOKEN%\",\"notification\":{\"title\":\"FCM通知测试 - 已恢复\",\"body\":\"Firebase服务已成功恢复\"},\"data\":{\"type\":\"notification_test\",\"sender\":\"curl\",\"restored\":\"true\"}}" ^
  https://fcm.googleapis.com/fcm/send

echo.
echo.

REM 测试3：发送混合消息（包含通知和数据）
echo 🧪 测试3: 发送混合消息
curl -X POST ^
  -H "Authorization: key=%SERVER_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"to\":\"%DEVICE_TOKEN%\",\"notification\":{\"title\":\"FCM服务恢复成功\",\"body\":\"所有FCM相关类已恢复\"},\"data\":{\"type\":\"mixed_message\",\"title\":\"FCM服务恢复成功\",\"body\":\"所有FCM相关类已恢复\",\"sender\":\"curl测试\",\"restored\":\"true\",\"extra\":\"{\\\"test\\\":true,\\\"modules_restored\\\":true}\"}}" ^
  https://fcm.googleapis.com/fcm/send

echo.
echo ✅ 测试完成！请检查：
echo 1. 应用日志中的FCM消息接收记录
echo 2. 设备通知栏中的通知
echo 3. 应用内的消息处理结果
echo 4. ExternalMessageManager的消息路由
echo.
echo 💡 提示：如果遇到问题，可以：
echo - 运行 test_fcm_logs.bat 监控日志
echo - 使用 FcmTestHelper.runFullTest() 进行全面检测
echo - 查看 FCM_TEST_GUIDE.md 获取详细说明
echo.
pause