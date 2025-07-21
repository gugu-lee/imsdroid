import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeModules, Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ChatDetailScreen from './screens/chat/ChatDetailScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import ProfileSettingsScreen from './screens/settings/ProfileSettingsScreen';
import BasicConfigScreen from './screens/settings/BasicConfigScreen';
import AdvancedSettingsScreen from './screens/settings/AdvancedSettingsScreen';
import AboutSettingsScreen from './screens/settings/AboutSettingsScreen';
import AppSettingsScreen from './screens/settings/AppSettingsScreen';
import PrivacySettingsScreen from './screens/settings/PrivacySettingsScreen';
import LoginScreen from './screens/auth/LoginScreen';
import DebugScreen from './screens/debug/DebugScreen';
import SipTestScreen from './screens/debug/SipTestScreen';
import FriendsScreen from './screens/friends/FriendsScreen';
import FriendDetailScreen from './screens/friends/FriendDetailScreen';
import AddFriendScreen from './screens/friends/AddFriendScreen';
import EditFriendScreen from './screens/friends/EditFriendScreen';
import InCallScreen from './screens/call/InCallScreen';
import IncomingCallScreen from './screens/call/IncomingCallScreen';
import StartupSplashScreen from './components/StartupSplashScreen';
import { initializeApp } from './utils/DatabaseUtils';
import SettingsService from './services/SettingsService';
import ConfigValidationService from './services/ConfigValidationService';
import { StartupService } from './services/StartupService';
import callService from './services/CallService';

const { LoginModule } = NativeModules;
const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef();
  const [initialRoute, setInitialRoute] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 设置来电监听器
  const setupIncomingCallListener = () => {
    callService.addEventListener('incomingCall', (callData) => {
      console.log('应用收到来电事件:', callData);
      
      // 导航到来电界面
      if (navigationRef.current) {
        navigationRef.current.navigate('IncomingCall', {
          callerName: callData.callerName || '未知来电',
          sipAddress: callData.sipAddress,
          callType: callData.callType,
          callId: callData.callId
        });
      }
    });
  };

  useEffect(() => {
    // 设置导航引用给StartupService
    StartupService.setNavigationRef(navigationRef);

    // 设置来电监听
    setupIncomingCallListener();

    // 应用启动时初始化
    const initializeApplication = async () => {
      try {
        console.log('🚀 应用启动初始化开始...');

        // 初始化数据库
        await initializeApp();
        console.log('✅ 数据库初始化完成');

        // 检查配置状态
        const configStatus = await ConfigValidationService.getStartupConfigStatus();
        console.log('📋 配置检查结果:', configStatus);

        if (configStatus.shouldShowLogin) {
          // 配置不完整或未启用自动登录，显示登录界面
          console.log('🔑 需要显示登录界面');
          setInitialRoute('Login');
        } else {
          // 配置完整且启用自动登录，尝试自动注册
          console.log('🚀 尝试自动注册...');

          try {
            const result = await StartupService.attemptAutoRegistration();

            if (result.success) {
              console.log('✅ 自动注册成功');
              setInitialRoute('Home');
            } else {
              console.log('❌ 自动注册失败:', result.message);
              // 自动注册失败，显示登录界面
              setInitialRoute('Login');
            }
          } catch (error) {
            console.error('❌ 自动注册异常:', error);
            setInitialRoute('Login');
          }
        }

      } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        // 初始化失败，显示登录界面
        setInitialRoute('Login');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApplication();
  }, []);

  // 启动过程中显示加载界面
  if (isInitializing || !initialRoute) {
    return <StartupSplashScreen visible={true} status={{ type: 'initializing', message: '应用初始化中...' }} />;
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: '设置',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ProfileSettings"
            component={ProfileSettingsScreen}
            options={{
              headerShown: true,
              title: '个人信息',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="BasicConfig"
            component={BasicConfigScreen}
            options={{
              headerShown: true,
              title: '基本配置',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="AdvancedSettings"
            component={AdvancedSettingsScreen}
            options={{
              headerShown: true,
              title: '高级设置',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="AboutSettings"
            component={AboutSettingsScreen}
            options={{
              headerShown: true,
              title: '关于',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="AppSettings"
            component={AppSettingsScreen}
            options={{
              headerShown: true,
              title: '应用设置',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={PrivacySettingsScreen}
            options={{
              headerShown: true,
              title: '隐私设置',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="DebugScreen"
            component={DebugScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SipTestScreen"
            component={SipTestScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Friends"
            component={FriendsScreen}
            options={{
              headerShown: true,
              title: '好友',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="FriendDetail"
            component={FriendDetailScreen}
            options={{
              headerShown: true,
              title: '好友详情',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="AddFriend"
            component={AddFriendScreen}
            options={{
              headerShown: true,
              title: '添加好友',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="EditFriend"
            component={EditFriendScreen}
            options={{
              headerShown: true,
              title: '编辑好友',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          
          {/* 音视频通话页面 */}
          <Stack.Screen
            name="InCall"
            component={InCallScreen}
            options={{
              headerShown: false,
              gestureEnabled: false, // 禁用手势返回
            }}
          />
          <Stack.Screen
            name="IncomingCall"
            component={IncomingCallScreen}
            options={{
              headerShown: false,
              gestureEnabled: false, // 禁用手势返回
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* <StartupSplashScreen
        visible={showStartupSplash}
        status={startupStatus}
        onClose={() => setShowStartupSplash(false)}
        onNavigateToSettings={handleStartupNavigation}
      /> */}
    </>
  );
};

export default App;

// import React from 'react';
// import {
//   StyleSheet,
//   Button,
//   View,
//   SafeAreaView,
//   Text,
//   Alert,
//   NativeModules
// } from 'react-native';

// import WeChatStyleHome from './components/WeChatStyleHome';
// const { LoginModule } = NativeModules; // 获取原生模块
// const Separator = () => <View style={styles.separator} />;

// const App = () => (
//   <SafeAreaView style={styles.container}>
//     <View>
//       <Button
//         title="Press me"
//         onPress={() => {
//           // 调用原生 login 方法
//           if (LoginModule && LoginModule.login) {
//             LoginModule.login()
//               .then((result) => {
//                 Alert.alert('Login Success', JSON.stringify(result));
//               })
//               .catch((error) => {
//                 Alert.alert('Login Failed', error.message || String(error));
//               });
//           } else {
//             Alert.alert('Native module not found');
//           }
//         }

//         }
//       />
//     </View>

//   </SafeAreaView>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     marginHorizontal: 16,
//   },
//   title: {
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   fixToText: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   separator: {
//     marginVertical: 8,
//     borderBottomColor: '#737373',
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
// });

// export default App;
