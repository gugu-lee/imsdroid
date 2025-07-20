import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const StartupSplashScreen = ({ visible, onClose, status, onNavigateToSettings }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getStatusConfig = () => {
    switch (status?.type) {
      case 'connecting':
        return {
          color: '#007AFF',
          icon: '🔄',
          title: '正在连接SIP服务',
          subtitle: '请稍候...',
          showButtons: false,
        };
      case 'success':
        return {
          color: '#4CAF50',
          icon: '✅',
          title: 'SIP连接成功',
          subtitle: '已连接到服务器',
          showButtons: false,
          autoClose: true,
        };
      case 'config_incomplete':
        return {
          color: '#FF9800',
          icon: '⚙️',
          title: '需要配置SIP参数',
          subtitle: status.message || '请完成SIP账号配置',
          showButtons: true,
          primaryButton: '账号设置',
          secondaryButton: '服务器设置',
        };
      case 'connection_failed':
        return {
          color: '#f44336',
          icon: '❌',
          title: 'SIP连接失败',
          subtitle: status.message || '请检查网络和配置',
          showButtons: true,
          primaryButton: '重试',
          secondaryButton: '检查设置',
        };
      default:
        return {
          color: '#666',
          icon: '📱',
          title: '初始化中',
          subtitle: '准备应用服务',
          showButtons: false,
        };
    }
  };

  const config = getStatusConfig();

  useEffect(() => {
    let timer;
    if (config.autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [config.autoClose, onClose]);

  const handlePrimaryAction = () => {
    if (status?.type === 'config_incomplete') {
      onNavigateToSettings('account');
    } else if (status?.type === 'connection_failed') {
      onNavigateToSettings('retry');
    }
    onClose();
  };

  const handleSecondaryAction = () => {
    if (status?.type === 'config_incomplete') {
      onNavigateToSettings('server');
    } else if (status?.type === 'connection_failed') {
      onNavigateToSettings('settings');
    }
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.icon, { color: config.color }]}>
            {config.icon}
          </Text>
          
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          {status?.type === 'connecting' && (
            <ActivityIndicator
              size="large"
              color={config.color}
              style={styles.loader}
            />
          )}

          {config.showButtons && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: config.color }]}
                onPress={handlePrimaryAction}
              >
                <Text style={styles.primaryButtonText}>
                  {config.primaryButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSecondaryAction}
              >
                <Text style={[styles.secondaryButtonText, { color: config.color }]}>
                  {config.secondaryButton}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>稍后处理</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  loader: {
    marginVertical: 15,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  closeButtonText: {
    color: '#999',
    fontSize: 14,
  },
});

export default StartupSplashScreen;
