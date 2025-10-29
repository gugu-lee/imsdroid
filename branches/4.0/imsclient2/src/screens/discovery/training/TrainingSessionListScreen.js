import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';

const TrainingSessionListScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 模拟训练session数据
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    // 模拟从API加载数据
    const mockSessions = [
      {
        id: 1,
        name: '股价预测模型V2',
        modelType: 'LSTM',
        status: 'completed',
        accuracy: 87.5,
        duration: '02:15:30',
        createdAt: '2024-10-29 10:30:00',
        completedAt: '2024-10-29 12:45:30',
        epochs: 100,
        currentEpoch: 100,
        loss: 0.0245,
      },
      {
        id: 2,
        name: '市场趋势分析模型',
        modelType: 'Transformer',
        status: 'training',
        accuracy: 72.8,
        duration: '01:45:20',
        createdAt: '2024-10-29 14:20:00',
        completedAt: null,
        epochs: 150,
        currentEpoch: 85,
        loss: 0.1156,
      },
      {
        id: 3,
        name: '风险评估模型',
        modelType: 'XGBoost',
        status: 'pending',
        accuracy: 0,
        duration: '00:00:00',
        createdAt: '2024-10-29 16:10:00',
        completedAt: null,
        epochs: 80,
        currentEpoch: 0,
        loss: 0,
      },
      {
        id: 4,
        name: '情感分析模型',
        modelType: 'BERT',
        status: 'failed',
        accuracy: 0,
        duration: '00:25:10',
        createdAt: '2024-10-28 09:15:00',
        completedAt: '2024-10-28 09:40:10',
        epochs: 50,
        currentEpoch: 12,
        loss: 2.547,
      },
      {
        id: 5,
        name: '量化交易策略',
        modelType: 'GRU',
        status: 'completed',
        accuracy: 91.2,
        duration: '03:22:45',
        createdAt: '2024-10-28 14:00:00',
        completedAt: '2024-10-28 17:22:45',
        epochs: 200,
        currentEpoch: 200,
        loss: 0.0189,
      },
    ];
    setSessions(mockSessions);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟加载
    loadSessions();
    setRefreshing(false);
  };

  const handleSessionPress = (session) => {
    if (session.status === 'completed') {
      navigation.navigate('TrainingResult', { sessionId: session.id });
    } else if (session.status === 'training') {
      navigation.navigate('TrainingProgress', { sessionId: session.id });
    } else if (session.status === 'pending') {
      Alert.alert('训练待开始', '该训练任务还未开始，是否要查看配置？', [
        { text: '取消', style: 'cancel' },
        { text: '查看配置', onPress: () => navigation.navigate('ModelConfig', { sessionId: session.id }) },
      ]);
    } else if (session.status === 'failed') {
      Alert.alert('训练失败', '该训练任务已失败，是否要重新配置？', [
        { text: '取消', style: 'cancel' },
        { text: '重新配置', onPress: () => navigation.navigate('ModelConfig', { sessionId: session.id }) },
      ]);
    }
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      '删除训练任务',
      '确定要删除这个训练任务吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
          },
        },
      ]
    );
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: '#34C759', text: '已完成', icon: '✅' };
      case 'training':
        return { color: '#007AFF', text: '训练中', icon: '🚀' };
      case 'pending':
        return { color: '#FF9500', text: '待开始', icon: '⏳' };
      case 'failed':
        return { color: '#FF3B30', text: '失败', icon: '❌' };
      default:
        return { color: '#8E8E93', text: '未知', icon: '❓' };
    }
  };

  const formatDuration = (duration) => {
    if (!duration || duration === '00:00:00') return '--';
    return duration;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         session.modelType.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusFilters = [
    { id: 'all', label: '全部', count: sessions.length },
    { id: 'training', label: '训练中', count: sessions.filter(s => s.status === 'training').length },
    { id: 'completed', label: '已完成', count: sessions.filter(s => s.status === 'completed').length },
    { id: 'pending', label: '待开始', count: sessions.filter(s => s.status === 'pending').length },
    { id: 'failed', label: '失败', count: sessions.filter(s => s.status === 'failed').length },
  ];

  const renderSessionCard = (session) => {
    const statusInfo = getStatusInfo(session.status);
    
    return (
      <TouchableOpacity
        key={session.id}
        style={styles.sessionCard}
        onPress={() => handleSessionPress(session)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{session.name}</Text>
            <Text style={styles.modelType}>{session.modelType}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSession(session.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>准确率</Text>
              <Text style={styles.metricValue}>
                {session.accuracy > 0 ? `${session.accuracy.toFixed(1)}%` : '--'}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>进度</Text>
              <Text style={styles.metricValue}>
                {session.currentEpoch}/{session.epochs}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>损失</Text>
              <Text style={styles.metricValue}>
                {session.loss > 0 ? session.loss.toFixed(4) : '--'}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>耗时</Text>
              <Text style={styles.metricValue}>
                {formatDuration(session.duration)}
              </Text>
            </View>
          </View>

          {session.status === 'training' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(session.currentEpoch / session.epochs) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {((session.currentEpoch / session.epochs) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>创建于 {formatDate(session.createdAt)}</Text>
          {session.completedAt && (
            <Text style={styles.dateText}>完成于 {formatDate(session.completedAt)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 搜索和筛选 */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索训练任务..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {statusFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                filterStatus === filter.id && styles.activeFilterChip,
              ]}
              onPress={() => setFilterStatus(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === filter.id && styles.activeFilterChipText,
                ]}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 快速操作 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={() => navigation.navigate('ModelConfig')}
        >
          <Text style={styles.newSessionButtonText}>➕ 新建训练任务</Text>
        </TouchableOpacity>
      </View>

      {/* 训练任务列表 */}
      <ScrollView
        style={styles.sessionList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredSessions.length > 0 ? (
          filteredSessions.map(renderSessionCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>没有找到训练任务</Text>
            <Text style={styles.emptySubtitle}>
              {searchText || filterStatus !== 'all'
                ? '尝试调整搜索条件或筛选器'
                : '点击上方按钮创建新的训练任务'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 统计信息 */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          共 {sessions.length} 个训练任务 · {sessions.filter(s => s.status === 'training').length} 个正在训练
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  quickActions: {
    padding: 16,
  },
  newSessionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newSessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modelType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  cardBody: {
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    minWidth: 35,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsBar: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
});

export default TrainingSessionListScreen;