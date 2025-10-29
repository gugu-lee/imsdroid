@echo off
echo 监控FCM Token获取日志
echo ========================
echo.
echo 正在监控Android日志中的FCM Token信息...
echo 请确保：
echo 1. 设备已连接并通过 adb devices 可见
echo 2. 应用正在运行
echo 3. 网络连接正常
echo.
echo 按 Ctrl+C 停止监控
echo.

REM 监控FCM相关日志
adb logcat | findstr /i "FCM.*Token\|MyFirebaseMessagingService\|Token.*更新\|Firebase.*Token"