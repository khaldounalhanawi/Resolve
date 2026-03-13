/**
 * Resolve - Main Application Entry Point
 * 
 * This is the root component that initializes the app and sets up navigation.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation';
import { useAppInitialization } from './src/hooks';
import { COLORS } from './src/constants';

export default function App() {
  const isInitialized = useAppInitialization();

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
