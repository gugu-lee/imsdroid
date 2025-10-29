import React from 'react';
import TrainingSessionListScreen from './TrainingSessionListScreen';

/**
 * TrainingTab - 训练主页面
 * 直接使用TrainingSessionListScreen作为内容
 */
const TrainingTab = ({ navigation }) => {
  return <TrainingSessionListScreen navigation={navigation} />;
};

export default TrainingTab;
