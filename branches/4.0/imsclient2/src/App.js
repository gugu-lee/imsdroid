import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeModules, Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import { initializeApp } from './utils/DatabaseUtils';

const { LoginModule } = NativeModules;
const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // 应用启动时初始化数据库和SIP服务
    const initializeApplication = async () => {
      try {
        // 初始化数据库
        await initializeApp();
        
        // 初始化并注册SIP服务
        if (LoginModule && LoginModule.initializeAndRegister) {
          try {
            const result = await LoginModule.initializeAndRegister();
            console.log('SIP服务初始化成功:', result);
          } catch (error) {
            console.error('SIP服务初始化失败:', error);
            // 不阻塞应用启动，只记录错误
          }
        } else {
          console.warn('LoginModule not available');
        }
      } catch (error) {
        console.error('应用初始化失败:', error);
        Alert.alert('初始化错误', '应用初始化失败，部分功能可能不可用');
      }
    };

    initializeApplication();
  }, []);

  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
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