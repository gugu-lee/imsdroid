import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { TrainingTab } from './training';
import BacktestTab from './BacktestTab';
import PredictionTab from './PredictionTab';

const DiscoveryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('training');

  const tabs = [
    { id: 'training', label: '训练', icon: '🎯' },
    { id: 'backtest', label: '回测', icon: '📊' },
    { id: 'prediction', label: '预测', icon: '🔮' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'training':
        return <TrainingTab navigation={navigation} />;
      case 'backtest':
        return <BacktestTab navigation={navigation} />;
      case 'prediction':
        return <PredictionTab navigation={navigation} />;
      default:
        return <TrainingTab navigation={navigation} />;
    }
  };

  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab.id)}
      >
        <Text style={styles.tabIcon}>{tab.icon}</Text>
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>发现</Text>
        <Text style={styles.headerSubtitle}>智能分析与预测工具</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map(renderTabButton)}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});

export default DiscoveryScreen;