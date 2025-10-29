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

const BacktestTab = ({ navigation }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [backtestResults, setBacktestResults] = useState([
    {
      id: 1,
      modelName: '股价预测模型V2',
      timeframe: '2024-01-01 到 2024-10-01',
      totalReturn: 15.6,
      maxDrawdown: -8.2,
      sharpeRatio: 1.42,
      winRate: 68.5,
      totalTrades: 156,
      status: '已完成',
    },
    {
      id: 2,
      modelName: '市场趋势分析',
      timeframe: '2024-06-01 到 2024-10-01',
      totalReturn: 8.9,
      maxDrawdown: -5.1,
      sharpeRatio: 1.28,
      winRate: 71.2,
      totalTrades: 89,
      status: '已完成',
    },
    {
      id: 3,
      modelName: '风险评估模型',
      timeframe: '2024-08-01 到 2024-10-01',
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      winRate: 0,
      totalTrades: 0,
      status: '运行中',
    },
  ]);

  const timeframes = ['1M', '3M', '6M', '1Y', '2Y'];

  const handleStartBacktest = () => {
    Alert.alert(
      '开始回测',
      '请选择要回测的模型和时间范围',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '开始回测',
          onPress: () => {
            Alert.alert('回测启动', '回测已开始，请稍后查看结果');
          },
        },
      ]
    );
  };

  const renderPerformanceChart = () => {
    // 模拟收益率数据
    const performanceData = [
      { month: '1月', return: 2.1 },
      { month: '2月', return: -1.5 },
      { month: '3月', return: 4.2 },
      { month: '4月', return: 1.8 },
      { month: '5月', return: -0.8 },
      { month: '6月', return: 3.5 },
      { month: '7月', return: 2.7 },
      { month: '8月', return: -2.1 },
      { month: '9月', return: 5.2 },
      { month: '10月', return: 3.8 },
    ];

    const maxReturn = Math.max(...performanceData.map(d => Math.abs(d.return)));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>月度收益率 (%)</Text>
        <View style={styles.chart}>
          {performanceData.map((data, index) => {
            const barHeight = Math.abs(data.return) / maxReturn * 100;
            const isPositive = data.return >= 0;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isPositive ? '#34C759' : '#FF3B30',
                        marginTop: isPositive ? 0 : (100 - barHeight),
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.month}</Text>
                <Text style={[styles.barValue, { color: isPositive ? '#34C759' : '#FF3B30' }]}>
                  {data.return > 0 ? '+' : ''}{data.return}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBacktestCard = (result) => {
    const getStatusColor = (status) => {
      return status === '已完成' ? '#34C759' : '#FF9800';
    };

    return (
      <View key={result.id} style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.modelName}>{result.modelName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
            <Text style={styles.statusText}>{result.status}</Text>
          </View>
        </View>
        
        <Text style={styles.timeframe}>{result.timeframe}</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {result.status === '已完成' ? `${result.totalReturn > 0 ? '+' : ''}${result.totalReturn}%` : '--'}
            </Text>
            <Text style={styles.metricLabel}>总收益率</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#FF3B30' }]}>
              {result.status === '已完成' ? `${result.maxDrawdown}%` : '--'}
            </Text>
            <Text style={styles.metricLabel}>最大回撤</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {result.status === '已完成' ? result.sharpeRatio : '--'}
            </Text>
            <Text style={styles.metricLabel}>夏普比率</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {result.status === '已完成' ? `${result.winRate}%` : '--'}
            </Text>
            <Text style={styles.metricLabel}>胜率</Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('BacktestDetail', { resultId: result.id })}
          >
            <Text style={styles.detailButtonText}>查看详情</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.compareButton}>
            <Text style={styles.compareButtonText}>对比分析</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 时间范围选择 */}
      <View style={styles.timeframeSection}>
        <Text style={styles.sectionTitle}>回测时间范围</Text>
        <View style={styles.timeframeButtons}>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.selectedTimeframe,
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe && styles.selectedTimeframeText,
                ]}
              >
                {timeframe}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 快速操作 */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.startBacktestButton}
          onPress={handleStartBacktest}
        >
          <Text style={styles.startBacktestText}>🚀 开始新回测</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.compareAllButton}>
          <Text style={styles.compareAllText}>📊 对比所有模型</Text>
        </TouchableOpacity>
      </View>

      {/* 性能图表 */}
      {renderPerformanceChart()}

      {/* 回测结果列表 */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>回测结果</Text>
        {backtestResults.map(renderBacktestCard)}
      </View>

      {/* 统计摘要 */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>回测统计</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>24</Text>
            <Text style={styles.summaryLabel}>总回测次数</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>18</Text>
            <Text style={styles.summaryLabel}>盈利回测</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>12.3%</Text>
            <Text style={styles.summaryLabel}>平均收益率</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>1.35</Text>
            <Text style={styles.summaryLabel}>平均夏普比率</Text>
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
  timeframeSection: {
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
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedTimeframe: {
    backgroundColor: '#007AFF',
  },
  timeframeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedTimeframeText: {
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    gap: 12,
  },
  startBacktestButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBacktestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  compareAllButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  compareAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
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
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricItem: {
    width: '50%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  compareButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },
  compareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  summarySection: {
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default BacktestTab;