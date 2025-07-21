import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import settingsService from '../../services/SettingsService';

const ProfileSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    nickname: '',
    signature: '',
    avatar: '',
    gender: '未设置',
    region: '',
  });
  const [loading, setLoading] = useState(true);

  // 加载用户个人信息
  useEffect(() => {
    loadProfileSettings();
  }, []);

  const loadProfileSettings = async () => {
    try {
      setLoading(true);
      const profile = await settingsService.getProfileSettings();
      setSettings(profile);
    } catch (error) {
      console.error('加载个人信息失败:', error);
      Alert.alert('错误', '加载个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      if (!settings.nickname.trim()) {
        Alert.alert('提示', '昵称不能为空');
        return;
      }

      const profileData = {
        nickname: settings.nickname.trim(),
        signature: settings.signature.trim(),
        avatar: settings.avatar,
        gender: settings.gender,
        region: settings.region.trim(),
      };

      await settingsService.saveProfileSettings(profileData);
      Alert.alert('保存成功', '个人信息已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('保存个人信息失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      '更换头像',
      '选择头像来源',
      [
        {
          text: '拍照',
          onPress: () => {
            // 调用相机
            console.log('拍照');
          },
        },
        {
          text: '从相册选择',
          onPress: () => {
            // 打开相册
            console.log('从相册选择');
          },
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>头像</Text>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar}>
            <Image source={{ uri: settings.avatar }} style={styles.avatar} />
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarText}>更换</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 昵称设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>昵称</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={settings.nickname}
              onChangeText={(text) => updateSetting('nickname', text)}
              placeholder="请输入昵称"
              maxLength={20}
            />
            <Text style={styles.inputCounter}>{settings.nickname.length}/20</Text>
          </View>
        </View>

        {/* 个性签名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个性签名</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={settings.signature}
              onChangeText={(text) => updateSetting('signature', text)}
              placeholder="分享你的心情..."
              multiline
              numberOfLines={3}
              maxLength={100}
            />
          </View>
        </View>

        {/* 性别设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性别</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderOption, settings.gender === '男' && styles.genderSelected]}
              onPress={() => updateSetting('gender', '男')}
            >
              <Text style={[styles.genderText, settings.gender === '男' && styles.genderSelectedText]}>男</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, settings.gender === '女' && styles.genderSelected]}
              onPress={() => updateSetting('gender', '女')}
            >
              <Text style={[styles.genderText, settings.gender === '女' && styles.genderSelectedText]}>女</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, settings.gender === '保密' && styles.genderSelected]}
              onPress={() => updateSetting('gender', '保密')}
            >
              <Text style={[styles.genderText, settings.gender === '保密' && styles.genderSelectedText]}>保密</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 地区设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>地区</Text>
          <TouchableOpacity style={styles.regionContainer}>
            <Text style={styles.regionText}>{settings.region || '请选择地区'}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 开发者选项 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开发者选项</Text>
          <TouchableOpacity
            style={styles.debugContainer}
            onPress={() => navigation.navigate('DebugScreen')}
          >
            <Text style={styles.debugText}>数据库调试</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugContainer}
            onPress={() => navigation.navigate('SipTestScreen')}
          >
            <Text style={styles.debugText}>SIP测试</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity style={styles.saveButtonMain} onPress={handleSave}>
          <Text style={styles.saveButtonMainText}>保存个人信息</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 4,
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputCounter: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    fontSize: 12,
    color: '#999999',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genderOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  genderSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  genderText: {
    fontSize: 16,
    color: '#666666',
  },
  genderSelectedText: {
    color: '#ffffff',
  },
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  regionText: {
    fontSize: 16,
    color: '#000000',
  },
  debugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  debugText: {
    fontSize: 16,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#c0c0c0',
  },
  saveButtonMain: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    marginHorizontal: 16,
  },
  saveButtonMainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSettingsScreen;
