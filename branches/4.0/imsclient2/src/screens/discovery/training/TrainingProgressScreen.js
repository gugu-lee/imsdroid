import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const TrainingProgressScreen = ({ navigation, route }) => {
  const { config } = route.params || {};
  const [trainingStatus, setTrainingStatus] = useState('preparing'); // preparing, training, completed, error
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs] = useState(config?.hyperparameters?.epochs || 100);
  const [trainingLoss, setTrainingLoss] = useState(0);
  const [validationLoss, setValidationLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [lossHistory, setLossHistory] = useState([]);

  useEffect(() => {
    // 模拟训练过程
    if (trainingStatus === 'preparing') {
      const timer = setTimeout(() => {
        setTrainingStatus('training');
        startTrainingSimulation();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trainingStatus]);

  const startTrainingSimulation = () => {
    const interval = setInterval(() => {
      setCurrentEpoch(prev => {
        const newEpoch = prev + 1;
        
        // 模拟训练指标
        const newTrainingLoss = Math.max(0.1, 2 - (newEpoch * 0.015) + (Math.random() - 0.5) * 0.1);
        const newValidationLoss = Math.max(0.1, 2.2 - (newEpoch * 0.012) + (Math.random() - 0.5) * 0.15);
        const newAccuracy = Math.min(95, 30 + (newEpoch * 0.8) + (Math.random() - 0.5) * 2);
        
        setTrainingLoss(newTrainingLoss);
        setValidationLoss(newValidationLoss);
        setAccuracy(newAccuracy);
        setTimeElapsed(newEpoch * 30); // 每个epoch假设30秒
        setEstimatedTimeRemaining((totalEpochs - newEpoch) * 30);
        
        // 更新损失历史
        setLossHistory(prev => [...prev.slice(-19), {
          epoch: newEpoch,
          trainLoss: newTrainingLoss,
          valLoss: newValidationLoss,
        }]);
        
        if (newEpoch >= totalEpochs) {
          setTrainingStatus('completed');
          clearInterval(interval);
        }
        
        return newEpoch;
      });
    }, 100); // 快速模拟，实际训练会很慢
    
    return () => clearInterval(interval);
  };

  const handleStopTraining = () => {
    Alert.alert(
      '停止训练',
      '确定要停止当前训练吗？已训练的进度将被保存。',
      [
        { text: '继续训练', style: 'cancel' },
        {
          text: '停止',
          style: 'destructive',
          onPress: () => {
            setTrainingStatus('completed');
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProgressBar = () => {
    const progress = totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Epoch {currentEpoch} / {totalEpochs}
          </Text>
          <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderMetrics = () => {
    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{trainingLoss.toFixed(4)}</Text>
          <Text style={styles.metricLabel}>训练损失</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{validationLoss.toFixed(4)}</Text>
          <Text style={styles.metricLabel}>验证损失</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{accuracy.toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>准确率</Text>
        </View>
      </View>
    );
  };

  const renderLossChart = () => {
    if (lossHistory.length < 2) return null;
    
    const maxLoss = Math.max(...lossHistory.map(h => Math.max(h.trainLoss, h.valLoss)));
    const minLoss = Math.min(...lossHistory.map(h => Math.min(h.trainLoss, h.valLoss)));
    const lossRange = maxLoss - minLoss || 1;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>损失变化曲线</Text>
        <View style={styles.chart}>
          <View style={styles.chartArea}>
            {lossHistory.map((point, index) => {
              const x = (index / (lossHistory.length - 1)) * (width - 80);
              const trainY = ((maxLoss - point.trainLoss) / lossRange) * 120;
              const valY = ((maxLoss - point.valLoss) / lossRange) * 120;
              
              return (
                <View key={index}>
                  <View
                    style={[
                      styles.chartPoint,
                      {
                        left: x,
                        top: trainY,
                        backgroundColor: '#007AFF',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartPoint,
                      {
                        left: x,
                        top: valY,
                        backgroundColor: '#FF9500',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>训练损失</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.legendText}>验证损失</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTimeInfo = () => {
    return (
      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>已用时间</Text>
          <Text style={styles.timeValue}>{formatTime(timeElapsed)}</Text>
        </View>
        
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>预计剩余</Text>
          <Text style={styles.timeValue}>{formatTime(estimatedTimeRemaining)}</Text>
        </View>
      </View>
    );
  };

  const renderStatusIndicator = () => {
    const getStatusInfo = () => {
      switch (trainingStatus) {
        case 'preparing':
          return { color: '#FF9500', text: '准备中...', icon: '⏳' };
        case 'training':
          return { color: '#007AFF', text: '训练中', icon: '🚀' };
        case 'completed':
          return { color: '#34C759', text: '训练完成', icon: '✅' };
        case 'error':
          return { color: '#FF3B30', text: '训练出错', icon: '❌' };
        default:
          return { color: '#8E8E93', text: '未知状态', icon: '❓' };
      }
    };
    
    const status = getStatusInfo();
    
    return (
      <View style={[styles.statusContainer, { backgroundColor: status.color }]}>
        <Text style={styles.statusIcon}>{status.icon}</Text>
        <Text style={styles.statusText}>{status.text}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 状态指示器 */}
      {renderStatusIndicator()}
      
      {/* 进度条 */}
      <View style={styles.section}>
        {renderProgressBar()}
      </View>
      
      {/* 指标卡片 */}
      <View style={styles.section}>
        {renderMetrics()}
      </View>
      
      {/* 时间信息 */}
      <View style={styles.section}>
        {renderTimeInfo()}
      </View>
      
      {/* 损失图表 */}
      <View style={styles.section}>
        {renderLossChart()}
      </View>
      
      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        {trainingStatus === 'training' && (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopTraining}>
            <Text style={styles.stopButtonText}>停止训练</Text>
          </TouchableOpacity>
        )}
        
        {trainingStatus === 'completed' && (
          <>
            <TouchableOpacity
              style={styles.viewResultButton}
              onPress={() => navigation.navigate('TrainingResult')}
            >
              <Text style={styles.viewResultButtonText}>查看结果</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.newTrainingButton}
              onPress={() => navigation.navigate('ModelConfig')}
            >
              <Text style={styles.newTrainingButtonText}>新建训练</Text>
            </TouchableOpacity>
          </>
        )}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  metricsContainer: {
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    height: 160,
  },
  chartArea: {
    height: 120,
    position: 'relative',
  },
  chartPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewResultButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewResultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newTrainingButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newTrainingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrainingProgressScreen;