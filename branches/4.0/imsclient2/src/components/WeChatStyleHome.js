import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

// 通讯录页面组件
const ContactsScreen = () => (
  <SafeAreaView style={styles.screenContainer}>
    <Text style={styles.header}>通讯录</Text>
    <View style={styles.content}>
      <Text style={styles.contentText}>这里是通讯录</Text>
    </View>
  </SafeAreaView>
);

// 发现页面组件
const DiscoverScreen = () => (
  <SafeAreaView style={styles.screenContainer}>
    <Text style={styles.header}>发现</Text>
    <View style={styles.content}>
      <Text style={styles.contentText}>这里是发现页面</Text>
    </View>
  </SafeAreaView>
);

// 我的页面组件
const ProfileScreen = () => (
  <SafeAreaView style={styles.screenContainer}>
    <Text style={styles.header}>我</Text>
    <View style={styles.content}>
      <Text style={styles.contentText}>这里是个人信息页面</Text>
    </View>
  </SafeAreaView>
);

const WeChatStyleHome = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '聊天') {
            iconName = 'chat';
          } else if (route.name === '通讯录') {
            iconName = 'contacts';
          } else if (route.name === '发现') {
            iconName = 'explore';
          } else if (route.name === '我') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#07c160',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="聊天" 
        children={() => <ChatScreen navigation={navigation} />} 
      />
      <Tab.Screen name="通讯录" component={ContactsScreen} />
      <Tab.Screen name="发现" component={DiscoverScreen} />
      <Tab.Screen name="我" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1,
    color: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default WeChatStyleHome;