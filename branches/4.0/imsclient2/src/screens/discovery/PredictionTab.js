import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';

const PredictionTab = ({ navigation }) => {
  const [selectedModel, setSelectedModel] = useState('股价预测模型V2');
  const [predictionInput, setPredictionInput] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [predictions, setPredictions] = useState([
    {
      id: 1,
      symbol: 'AAPL',
      currentPrice: 150.25,
      predictedPrice: 158.30,
      confidence: 85.2,
      timeframe: '1周',
      trend: 'up',
      timestamp: '2024-10-25 14:30',
    },
    {
      id: 2,
      symbol: 'MSFT',
      currentPrice: 412.80,
      predictedPrice: 408.15,
      confidence: 78.6,
      timeframe: '1周',
      trend: 'down',
      timestamp: '2024-10-25 14:28',
    },
    {
      id: 3,
      symbol: 'GOOGL',
      currentPrice: 2750.00,
      predictedPrice: 2820.50,
      confidence: 92.1,
      timeframe: '1周',
      trend: 'up',
      timestamp: '2024-10-25 14:25',
    },
  ]);

  const models = [
    '股价预测模型V2',
    '市场趋势分析',
    '风险评估模型',
    '量化交易模型',
  ];

  const handleRunPrediction = () => {
    if (!predictionInput.trim()) {
      Alert.alert('输入错误', '请输入股票代码或相关参数');
      return;
    }

    Alert.alert(
      '运行预测',
      `使用模型 "${selectedModel}" 对 "${predictionInput}" 进行预测？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '开始预测',
          onPress: () => {
            // 模拟添加新预测结果
            const newPrediction = {
              id: predictions.length + 1,
              symbol: predictionInput.toUpperCase(),
              currentPrice: Math.random() * 1000 + 100,
              predictedPrice: Math.random() * 1000 + 100,
              confidence: Math.random() * 20 + 70,
              timeframe: '1周',
              trend: Math.random() > 0.5 ? 'up' : 'down',
              timestamp: new Date().toLocaleString('zh-CN'),
            };
            
            setPredictions([newPrediction, ...predictions]);
            setPredictionInput('');
            Alert.alert('预测完成', '新的预测结果已生成');
          },
        },
      ]
    );
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : '📉';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? '#34C759' : '#FF3B30';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#34C759';
    if (confidence >= 60) return '#FF9800';
    return '#FF3B30';
  };

  const renderPredictionCard = (prediction) => {
    const priceChange = prediction.predictedPrice - prediction.currentPrice;
    const changePercent = (priceChange / prediction.currentPrice) * 100;

    return (
      <View key={prediction.id} style={styles.predictionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbolText}>{prediction.symbol}</Text>
            <Text style={styles.trendIcon}>{getTrendIcon(prediction.trend)}</Text>
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceText, { color: getConfidenceColor(prediction.confidence) }]}>
              {prediction.confidence.toFixed(1)}%
            </Text>
            <Text style={styles.confidenceLabel}>置信度</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>当前价格</Text>
            <Text style={styles.priceValue}>${prediction.currentPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
          
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>预测价格</Text>
            <Text style={[styles.priceValue, { color: getTrendColor(prediction.trend) }]}>
              ${prediction.predictedPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.changeContainer}>
          <Text style={[styles.changeText, { color: getTrendColor(prediction.trend) }]}>
            {priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </Text>
          <Text style={styles.timeframeText}>预测时间: {prediction.timeframe}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timestampText}>{prediction.timestamp}</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('PredictionDetail', { predictionId: prediction.id })}
          >
            <Text style={styles.detailButtonText}>详细分析</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 预测控制面板 */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>预测控制台</Text>
        
        {/* 模型选择 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>选择预测模型</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modelSelector}>
            {models.map((model) => (
              <TouchableOpacity
                key={model}
                style={[
                  styles.modelChip,
                  selectedModel === model && styles.selectedModelChip,
                ]}
                onPress={() => setSelectedModel(model)}
              >
                <Text
                  style={[
                    styles.modelChipText,
                    selectedModel === model && styles.selectedModelChipText,
                  ]}
                >
                  {model}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 输入参数 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>股票代码或参数</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="如: AAPL, MSFT, GOOGL..."
              value={predictionInput}
              onChangeText={setPredictionInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.runButton} onPress={handleRunPrediction}>
              <Text style={styles.runButtonText}>🚀</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 自动刷新设置 */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>自动刷新预测</Text>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={autoRefresh ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 预测结果 */}
      <View style={styles.resultsSection}>
        <View style={styles.resultHeader}>
          <Text style={styles.sectionTitle}>实时预测结果</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>🔄 刷新</Text>
          </TouchableOpacity>
        </View>
        
        {predictions.map(renderPredictionCard)}
      </View>

      {/* 市场概览 */}
      <View style={styles.marketOverview}>
        <Text style={styles.sectionTitle}>市场概览</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>今日预测</Text>
            <Text style={styles.overviewValue}>24</Text>
            <Text style={styles.overviewChange}>+3 ↗️</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>成功率</Text>
            <Text style={styles.overviewValue}>78.5%</Text>
            <Text style={styles.overviewChange}>+2.1% ↗️</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>平均置信度</Text>
            <Text style={styles.overviewValue}>82.3%</Text>
            <Text style={styles.overviewChange}>+1.8% ↗️</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>活跃模型</Text>
            <Text style={styles.overviewValue}>4</Text>
            <Text style={styles.overviewChange}>+1 ↗️</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  controlPanel: {
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
  modelSelector: {
    flexDirection: 'row',
  },
  modelChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedModelChip: {
    backgroundColor: '#007AFF',
  },
  modelChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedModelChipText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  runButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  runButtonText: {
    fontSize: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resultsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#666',
  },
  predictionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  trendIcon: {
    fontSize: 16,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  changeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
  },
  detailButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  marketOverview: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  overviewChange: {
    fontSize: 12,
    color: '#34C759',
  },
});

export default PredictionTab;