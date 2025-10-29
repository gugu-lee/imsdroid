import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';

const ModelConfigScreen = ({ navigation, route }) => {
  const { modelId } = route.params || {};
  const [modelName, setModelName] = useState('新模型');
  const [modelType, setModelType] = useState('LSTM');
  const [batchSize, setBatchSize] = useState('32');
  const [epochs, setEpochs] = useState('100');
  const [learningRate, setLearningRate] = useState('0.001');
  const [validationSplit, setValidationSplit] = useState('0.2');
  const [useGPU, setUseGPU] = useState(true);
  const [earlyStopping, setEarlyStopping] = useState(true);

  const modelTypes = ['LSTM', 'GRU', 'Transformer', 'CNN', 'XGBoost', 'Random Forest'];

  const handleSaveConfig = () => {
    const config = {
      name: modelName,
      type: modelType,
      hyperparameters: {
        batchSize: parseInt(batchSize),
        epochs: parseInt(epochs),
        learningRate: parseFloat(learningRate),
        validationSplit: parseFloat(validationSplit),
      },
      settings: {
        useGPU,
        earlyStopping,
      },
    };

    Alert.alert(
      '保存配置',
      '模型配置已保存，是否开始训练？',
      [
        { text: '稍后训练', style: 'cancel' },
        {
          text: '开始训练',
          onPress: () => {
            navigation.navigate('TrainingProgress', { config });
          },
        },
      ]
    );
  };

  const renderModelTypeSelector = () => {
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>模型类型</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {modelTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeChip,
                modelType === type && styles.selectedTypeChip,
              ]}
              onPress={() => setModelType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  modelType === type && styles.selectedTypeChipText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderInputField = (label, value, setter, keyboardType = 'default', placeholder = '') => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={setter}
          keyboardType={keyboardType}
          placeholder={placeholder}
        />
      </View>
    );
  };

  const renderSwitchField = (label, value, setter, description = '') => {
    return (
      <View style={styles.switchGroup}>
        <View style={styles.switchLabelContainer}>
          <Text style={styles.switchLabel}>{label}</Text>
          {description ? <Text style={styles.switchDescription}>{description}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={setter}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 基本信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本信息</Text>
        {renderInputField('模型名称', modelName, setModelName, 'default', '输入模型名称')}
        {renderModelTypeSelector()}
      </View>

      {/* 超参数配置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>超参数配置</Text>
        {renderInputField('批次大小 (Batch Size)', batchSize, setBatchSize, 'numeric', '16, 32, 64...')}
        {renderInputField('训练轮数 (Epochs)', epochs, setEpochs, 'numeric', '50, 100, 200...')}
        {renderInputField('学习率 (Learning Rate)', learningRate, setLearningRate, 'numeric', '0.001, 0.01...')}
        {renderInputField('验证集比例', validationSplit, setValidationSplit, 'numeric', '0.1, 0.2, 0.3...')}
      </View>

      {/* 训练设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>训练设置</Text>
        {renderSwitchField(
          '启用GPU加速',
          useGPU,
          setUseGPU,
          '使用GPU可以显著提高训练速度'
        )}
        {renderSwitchField(
          '早停机制',
          earlyStopping,
          setEarlyStopping,
          '当验证损失不再改善时自动停止训练'
        )}
      </View>

      {/* 高级配置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>高级配置</Text>
        <View style={styles.advancedOptions}>
          <TouchableOpacity style={styles.advancedButton}>
            <Text style={styles.advancedButtonText}>📊 数据预处理设置</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.advancedButton}>
            <Text style={styles.advancedButtonText}>🔧 网络结构配置</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.advancedButton}>
            <Text style={styles.advancedButtonText}>📈 损失函数选择</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.advancedButton}>
            <Text style={styles.advancedButtonText}>⚡ 优化器设置</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.previewButton}>
          <Text style={styles.previewButtonText}>预览配置</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfig}>
          <Text style={styles.saveButtonText}>保存并训练</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  typeScroll: {
    flexDirection: 'row',
  },
  typeChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTypeChip: {
    backgroundColor: '#007AFF',
  },
  typeChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedTypeChipText: {
    color: '#fff',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  advancedOptions: {
    gap: 12,
  },
  advancedButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  advancedButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModelConfigScreen;