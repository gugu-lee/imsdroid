@echo off
title SIP自动注册测试

echo ======================================
echo SIP自动注册功能测试
echo ======================================

REM 1. 清理并重新构建项目
echo 步骤 1: 清理项目...
cd android
call gradlew.bat clean
cd ..

echo 步骤 2: 重新构建Android项目...
cd android
call gradlew.bat assembleDebug
cd ..

REM 2. 启动Metro服务器
echo 步骤 3: 启动Metro服务器...
start "Metro Server" cmd /k "npx react-native start --reset-cache"

REM 等待Metro启动
timeout /t 10 /nobreak

REM 3. 安装应用到设备
echo 步骤 4: 安装应用到设备...
npx react-native run-android

REM 4. 提示用户进行手动测试
echo.
echo ======================================
echo 自动注册功能测试指南：
echo ======================================
echo.
echo 🔧 配置测试：
echo 1. 打开应用
echo 2. 导航到: 我的 → 账号设置
echo 3. 配置SIP地址、密码
echo 4. 导航到: 我的 → 服务器设置  
echo 5. 配置服务器地址、端口
echo 6. 开启"自动登录"选项
echo 7. 重新启动应用
echo.
echo 🚀 自动注册测试场景：
echo.
echo A) 完整配置测试：
echo    - 配置完整的SIP参数
echo    - 启用自动登录
echo    - 重启应用观察自动连接过程
echo.
echo B) 配置不完整测试：
echo    - 清空某些必需参数
echo    - 启用自动登录  
echo    - 重启应用观察引导界面
echo.
echo C) 连接失败测试：
echo    - 使用无效的服务器地址
echo    - 启用自动登录
echo    - 重启应用观察错误处理
echo.
echo 📱 预期行为：
echo ✅ 配置完整且有效 → 自动连接成功，显示成功提示
echo ⚙️  配置不完整 → 显示配置引导界面，提供设置入口
echo ❌ 连接失败 → 显示错误信息，提供重试和设置选项
echo 🔇 自动登录关闭 → 跳过自动注册，正常启动
echo.
echo 🛠️ 调试工具：
echo - 开发者选项 → 数据库调试（查看配置状态）
echo - 开发者选项 → SIP测试（手动测试连接）
echo.
echo 按任意键退出...
pause
