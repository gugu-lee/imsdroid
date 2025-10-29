import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';

const TrainingResultScreen = ({ navigation, route }) => {
  const { modelId } = route.params || {};
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // 模拟训练结果数据
  const trainingResult = {
    modelInfo: {
      name: '股价预测模型V2',
      type: 'LSTM',
      status: '已完成',
      trainedAt: '2024-10-29 15:30:25',
      duration: '02:15:30',
    },
    metrics: {
      finalLoss: 0.0245,
      finalAccuracy: 87.5,
      bestEpoch: 85,
      totalEpochs: 100,
      validationScore: 0.892,
      f1Score: 0.863,
    },
    performance: {
      trainingTime: '2小时15分钟',
      memoryUsage: '8.5 GB',
      gpuUtilization: '92%',
      convergenceEpoch: 75,
    },
    files: {
      modelSize: '156.7 MB',
      checkpointCount: 5,
      logSize: '2.3 MB',
    },
  };

  const tabs = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'metrics', label: '指标', icon: '📈' },
    { id: 'performance', label: '性能', icon: '⚡' },
    { id: 'files', label: '文件', icon: '📁' },
  ];

  const handleExportModel = () => {
    Alert.alert(
      '导出模型',
      '选择导出格式：',
      [
        { text: '取消', style: 'cancel' },
        { text: 'ONNX格式', onPress: () => exportModel('onnx') },
        { text: 'TensorFlow格式', onPress: () => exportModel('tensorflow') },
        { text: 'PyTorch格式', onPress: () => exportModel('pytorch') },
      ]
    );
  };

  const exportModel = (format) => {
    Alert.alert('导出成功', `模型已导出为${format}格式`);
  };

  const handleShareResult = async () => {
    try {
      const result = await Share.share({
        message: `训练结果分享\n模型: ${trainingResult.modelInfo.name}\n准确率: ${trainingResult.metrics.finalAccuracy}%\n训练时长: ${trainingResult.modelInfo.duration}`,
        title: '模型训练结果',
      });
    } catch (error) {
      Alert.alert('分享失败', error.message);
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'metrics':
        return renderMetricsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'files':
        return renderFilesTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* 模型信息卡片 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>模型信息</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>模型名称</Text>
              <Text style={styles.infoValue}>{trainingResult.modelInfo.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>模型类型</Text>
              <Text style={styles.infoValue}>{trainingResult.modelInfo.type}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>训练状态</Text>
              <Text style={[styles.infoValue, styles.successText]}>
                {trainingResult.modelInfo.status}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>完成时间</Text>
              <Text style={styles.infoValue}>{trainingResult.modelInfo.trainedAt}</Text>
            </View>
          </View>
        </View>

        {/* 关键指标 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>关键指标</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {trainingResult.metrics.finalAccuracy}%
              </Text>
              <Text style={styles.metricLabel}>最终准确率</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {trainingResult.metrics.finalLoss.toFixed(4)}
              </Text>
              <Text style={styles.metricLabel}>最终损失</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {trainingResult.metrics.bestEpoch}
              </Text>
              <Text style={styles.metricLabel}>最佳轮次</Text>
            </View>
          </View>
        </View>

        {/* 快速操作 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>快速操作</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Backtest', { modelId })}
            >
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>开始回测</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Prediction', { modelId })}
            >
              <Text style={styles.quickActionIcon}>🔮</Text>
              <Text style={styles.quickActionText}>运行预测</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleExportModel}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>导出模型</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleShareResult}
            >
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>分享结果</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMetricsTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>训练指标</Text>
          <View style={styles.metricsGrid}>
            {Object.entries(trainingResult.metrics).map(([key, value]) => (
              <View key={key} style={styles.metricRow}>
                <Text style={styles.metricName}>
                  {getMetricLabel(key)}
                </Text>
                <Text style={styles.metricValueText}>
                  {formatMetricValue(key, value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>性能指标</Text>
          <View style={styles.metricsGrid}>
            {Object.entries(trainingResult.performance).map(([key, value]) => (
              <View key={key} style={styles.metricRow}>
                <Text style={styles.metricName}>
                  {getPerformanceLabel(key)}
                </Text>
                <Text style={styles.metricValueText}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderFilesTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>生成文件</Text>
          <View style={styles.fileList}>
            <TouchableOpacity style={styles.fileItem}>
              <Text style={styles.fileIcon}>🤖</Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>model.h5</Text>
                <Text style={styles.fileSize}>{trainingResult.files.modelSize}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadButtonText}>下载</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.fileItem}>
              <Text style={styles.fileIcon}>📋</Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>training_log.txt</Text>
                <Text style={styles.fileSize}>{trainingResult.files.logSize}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadButtonText}>下载</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.fileItem}>
              <Text style={styles.fileIcon}>💾</Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>checkpoints</Text>
                <Text style={styles.fileSize}>{trainingResult.files.checkpointCount} 个文件</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadButtonText}>下载</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getMetricLabel = (key) => {
    const labels = {
      finalLoss: '最终损失',
      finalAccuracy: '最终准确率',
      bestEpoch: '最佳轮次',
      totalEpochs: '总轮次',
      validationScore: '验证分数',
      f1Score: 'F1分数',
    };
    return labels[key] || key;
  };

  const formatMetricValue = (key, value) => {
    if (key.includes('Accuracy') || key.includes('Score')) {
      return typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : value;
    }
    return typeof value === 'number' ? value.toFixed(4) : value;
  };

  const getPerformanceLabel = (key) => {
    const labels = {
      trainingTime: '训练时长',
      memoryUsage: '内存使用',
      gpuUtilization: 'GPU利用率',
      convergenceEpoch: '收敛轮次',
    };
    return labels[key] || key;
  };

  return (
    <View style={styles.container}>
      {/* 标签页导航 */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                selectedTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 标签页内容 */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

// 样式定义略...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  successText: {
    color: '#34C759',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  metricsGrid: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricName: {
    fontSize: 14,
    color: '#666',
  },
  metricValueText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileList: {
    gap: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrainingResultScreen;