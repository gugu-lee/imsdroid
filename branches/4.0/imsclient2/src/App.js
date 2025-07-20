import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeModules, Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import ServerSettingsScreen from './screens/ServerSettingsScreen';
import AboutSettingsScreen from './screens/AboutSettingsScreen';
import AppSettingsScreen from './screens/AppSettingsScreen';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';
import SipSettingsScreen from './screens/SipSettingsScreen';
import DebugScreen from './screens/DebugScreen';
import SipTestScreen from './screens/SipTestScreen';
import StartupSplashScreen from './components/StartupSplashScreen';
import { initializeApp } from './utils/DatabaseUtils';
import SettingsService from './services/SettingsService';
import { StartupService } from './services/StartupService';

const { LoginModule } = NativeModules;
const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef();
  const [startupStatus, setStartupStatus] = useState(null);
  const [showStartupSplash, setShowStartupSplash] = useState(false);

  useEffect(() => {
    // 设置导航引用给StartupService
    StartupService.setNavigationRef(navigationRef);
    
    // 应用启动时初始化数据库和SIP服务
    const initializeApplication = async () => {
      try {
        console.log('🚀 应用启动初始化开始...');
        
        // 初始化数据库
        await initializeApp();
        console.log('✅ 数据库初始化完成');
        
        // 检查是否启用自动登录
        const autoLogin = await SettingsService.getSetting('account.autoLogin', false);
        
        if (autoLogin) {
          setStartupStatus({ type: 'connecting' });
          setShowStartupSplash(true);
          
          // 执行启动时的SIP注册检查
          const result = await StartupService.attemptAutoRegistration();
          
          if (result.success) {
            setStartupStatus({ 
              type: 'success', 
              message: result.message 
            });
            // 成功后自动关闭
            setTimeout(() => {
              setShowStartupSplash(false);
            }, 2000);
          } else {
            // 根据失败原因设置不同的状态
            switch (result.reason) {
              case 'incomplete_config':
                setStartupStatus({
                  type: 'config_incomplete',
                  message: '需要完成SIP配置',
                  validation: result.validation
                });
                break;
              case 'registration_failed':
                setStartupStatus({
                  type: 'connection_failed',
                  message: result.message
                });
                break;
              default:
                setStartupStatus({
                  type: 'connection_failed',
                  message: result.message || 'SIP连接失败'
                });
                break;
            }
          }
        }
        
      } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        
        // 显示错误对话框
        Alert.alert(
          '初始化错误', 
          '应用初始化失败，部分功能可能不可用。\n\n错误信息: ' + error.message,
          [
            {
              text: '确定',
              style: 'default'
            },
            {
              text: '重试',
              onPress: () => initializeApplication()
            }
          ]
        );
      }
    };

    initializeApplication();
  }, []);

  const handleStartupNavigation = (action) => {
    switch (action) {
      case 'account':
        navigationRef.current?.navigate('SipSettings');
        break;
      case 'server':
        navigationRef.current?.navigate('ServerSettings');
        break;
      case 'settings':
        navigationRef.current?.navigate('Settings');
        break;
      case 'retry':
        // 重新尝试连接
        setStartupStatus({ type: 'connecting' });
        StartupService.attemptAutoRegistration().then(result => {
          if (result.success) {
            setStartupStatus({ type: 'success', message: result.message });
            setTimeout(() => setShowStartupSplash(false), 2000);
          } else {
            setStartupStatus({
              type: 'connection_failed',
              message: result.message || 'SIP连接失败'
            });
          }
        });
        break;
    }
  };

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Home">
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
            name="ServerSettings" 
            component={ServerSettingsScreen} 
            options={{ 
              headerShown: true,
              title: '服务器设置',
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
            name="SipSettings" 
            component={SipSettingsScreen} 
            options={{ 
              headerShown: true,
              title: 'SIP账号设置',
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
              headerShown: false
            }} 
          />
          <Stack.Screen 
            name="SipTestScreen" 
            component={SipTestScreen} 
            options={{ 
              headerShown: false
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