#!/bin/bash

# 数据库集成测试脚本
# 用于验证前端到后端的完整数据流

echo "======================================"
echo "数据库集成测试开始"
echo "======================================"

# 1. 清理并重新构建项目
echo "步骤 1: 清理项目..."
cd android
./gradlew clean
cd ..

echo "步骤 2: 重新构建Android项目..."
cd android
./gradlew assembleDebug
cd ..

# 2. 启动Metro服务器
echo "步骤 3: 启动Metro服务器..."
npx react-native start --reset-cache &
METRO_PID=$!

# 等待Metro启动
sleep 10

# 3. 安装应用到设备
echo "步骤 4: 安装应用到设备..."
npx react-native run-android

# 4. 提示用户进行手动测试
echo ""
echo "======================================"
echo "自动化测试完成，请进行手动测试："
echo "======================================"
echo "1. 打开应用"
echo "2. 导航到: 我的 → 个人信息 → 开发者选项"
echo "3. 点击'数据库调试'测试数据库状态"
echo "4. 点击'SIP测试'进行端到端测试"
echo ""
echo "测试步骤："
echo "a) 在SIP测试页面配置测试参数"
echo "b) 点击'保存测试设置'"
echo "c) 点击'测试数据库读取'验证数据一致性"
echo "d) 点击'测试SIP注册'进行实际连接测试"
echo ""
echo "预期结果："
echo "- 数据库读写操作成功"
echo "- Java和JavaScript端读取结果一致"
echo "- SIP注册能正确使用数据库中的参数"
echo ""
echo "如需停止Metro服务器，请运行: kill $METRO_PID"
echo "======================================"
