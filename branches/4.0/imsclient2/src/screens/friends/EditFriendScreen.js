import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FriendService from '../../services/FriendService';

const EditFriendScreen = ({ route, navigation }) => {
  const { friendId } = route.params;
  const [formData, setFormData] = useState({
    displayName: '',
    nickname: '',
    remark: '',
    groupName: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    loadFriendData();
  }, [friendId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      const friend = await FriendService.getFriendById(friendId);
      if (friend) {
        const data = {
          displayName: friend.displayName || '',
          nickname: friend.nickname || '',
          remark: friend.remark || '',
          groupName: friend.groupName || 'default',
          phone: friend.phone || '',
          email: friend.email || '',
        };
        setFormData(data);
        setOriginalData(data);
      } else {
        Alert.alert('错误', '好友不存在', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('加载好友信息失败:', error);
      Alert.alert('错误', '加载好友信息失败');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // 验证显示名称
    if (!formData.displayName.trim()) {
      Alert.alert('错误', '请输入显示名称');
      return false;
    }

    // 验证邮箱格式（如果填写了）
    if (formData.email.trim()) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formData.email.trim())) {
        Alert.alert('错误', '请输入有效的邮箱地址');
        return false;
      }
    }

    return true;
  };

  const hasChanges = () => {
    if (!originalData) {return false;}

    return Object.keys(formData).some(key =>
      formData[key].trim() !== originalData[key].trim()
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      Alert.alert('提示', '没有修改任何信息');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        displayName: formData.displayName.trim(),
        nickname: formData.nickname.trim(),
        remark: formData.remark.trim(),
        groupName: formData.groupName.trim() || 'default',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      await FriendService.updateFriend(friendId, updateData);

      Alert.alert(
        '保存成功',
        '好友信息已更新',
        [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('更新好友信息失败:', error);
      Alert.alert('错误', error.message || '更新好友信息失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        '放弃更改',
        '您有未保存的更改，确定要放弃吗？',
        [
          { text: '继续编辑', style: 'cancel' },
          { text: '放弃', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderInputGroup = (label, field, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {options.required && <Text style={styles.requiredStar}>*</Text>}
      </View>
      <TextInput
        style={[styles.textInput, options.multiline && styles.textArea]}
        value={formData[field]}
        onChangeText={(text) => updateField(field, text)}
        placeholder={placeholder}
        multiline={options.multiline}
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'none'}
        autoCorrect={false}
        maxLength={options.maxLength}
      />
      {options.helpText && (
        <Text style={styles.helpText}>{options.helpText}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载好友信息...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* 基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          {renderInputGroup(
            '显示名称',
            'displayName',
            '例如: 张三',
            {
              required: true,
              helpText: '好友列表中显示的名称，必填项',
            }
          )}

          {renderInputGroup(
            '昵称',
            'nickname',
            '例如: 小张',
            {
              helpText: '好友的昵称，可选项',
            }
          )}

          {renderInputGroup(
            '备注',
            'remark',
            '例如: 公司同事',
            {
              multiline: true,
              helpText: '对好友的备注说明，可选项',
            }
          )}
        </View>

        {/* 分组信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>分组信息</Text>

          {renderInputGroup(
            '分组名称',
            'groupName',
            '例如: 同事',
            {
              helpText: '好友所属分组，默认为"我的好友"',
            }
          )}
        </View>

        {/* 联系信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系信息（可选）</Text>

          {renderInputGroup(
            '手机号',
            'phone',
            '例如: 13800138000',
            {
              keyboardType: 'phone-pad',
              helpText: '好友的手机号码，可选项',
            }
          )}

          {renderInputGroup(
            '邮箱',
            'email',
            '例如: user@example.com',
            {
              keyboardType: 'email-address',
              helpText: '好友的邮箱地址，可选项',
            }
          )}
        </View>

        {/* 提示信息 */}
        <View style={styles.hintSection}>
          <Text style={styles.hintTitle}>编辑说明</Text>
          <Text style={styles.hintText}>
            • 显示名称为必填项，不能为空{'\n'}
            • SIP地址不可修改{'\n'}
            • 修改分组会影响好友在列表中的显示位置{'\n'}
            • 所有修改会立即生效
          </Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !hasChanges() && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving || !hasChanges()}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>保存修改</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  requiredStar: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    lineHeight: 16,
  },
  hintSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default EditFriendScreen;
