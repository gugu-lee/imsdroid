import React, { useState } from 'react';
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

const AddFriendScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    sipAddress: '',
    displayName: '',
    nickname: '',
    remark: '',
    groupName: 'default',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // 验证SIP地址
    const sipAddress = formData.sipAddress.trim();
    if (!sipAddress) {
      Alert.alert('错误', '请输入SIP地址');
      return false;
    }

    // 简单的SIP地址格式验证
    const sipPattern = /^(sip:)?[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanSipAddress = sipAddress.toLowerCase().replace(/^sip:/, '');
    if (!sipPattern.test(cleanSipAddress)) {
      Alert.alert('错误', '请输入有效的SIP地址格式\n例如: user@domain.com 或 sip:user@domain.com');
      return false;
    }

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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // 处理SIP地址格式
      let sipAddress = formData.sipAddress.trim().toLowerCase();
      if (!sipAddress.startsWith('sip:')) {
        sipAddress = `sip:${sipAddress}`;
      }

      const friendData = {
        sipAddress,
        displayName: formData.displayName.trim(),
        nickname: formData.nickname.trim(),
        remark: formData.remark.trim(),
        group: formData.groupName.trim() || 'default',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      const newFriend = await FriendService.addFriend(friendData);

      Alert.alert(
        '添加成功',
        `好友 "${newFriend.displayName}" 已添加`,
        [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('添加好友失败:', error);
      Alert.alert('错误', error.message || '添加好友失败');
    } finally {
      setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* 基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          {renderInputGroup(
            'SIP地址',
            'sipAddress',
            '例如: user@domain.com',
            {
              required: true,
              keyboardType: 'email-address',
              helpText: '好友的SIP通信地址，必填项',
            }
          )}

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
          <Text style={styles.hintTitle}>添加说明</Text>
          <Text style={styles.hintText}>
            • SIP地址和显示名称为必填项{'\n'}
            • SIP地址格式: user@domain.com 或 sip:user@domain.com{'\n'}
            • 添加好友后可以发送即时消息{'\n'}
            • 其他信息可后续在好友详情中编辑
          </Text>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>添加好友</Text>
          )}
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFriendScreen;
