import React from 'react';
import { View, StyleSheet } from 'react-native';
import WeChatStyleHome from '../components/WeChatStyleHome';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <WeChatStyleHome />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
});

export default HomeScreen;