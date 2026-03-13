/**
 * Resolve - Main Application Entry Point
 * 
 * This is the root component that initializes the app and sets up navigation.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SwipeableTabNavigator } from './src/navigation/SwipeableTabNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { COLORS } from './src/constants';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || '');

function AppContent() {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userId) {
    return <LoginScreen />;
  }

  return <SwipeableTabNavigator />;
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GestureHandlerRootView>
    </ConvexProvider>
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
