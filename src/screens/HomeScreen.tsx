/**
 * HomeScreen
 * 
 * Main screen for daily metric logging.
 * Displays all metrics with slider inputs for quick data entry.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '../store';
import { useMetricsWithTodayValues } from '../hooks';
import { MetricInputCard } from '../components';
import { COLORS, SUGGESTED_METRICS } from '../constants';
import { getTodayISO, formatDisplayDate } from '../utils/dateUtils';

export function HomeScreen() {
  const metrics = useAppStore(state => state.metrics);
  const isLoading = useAppStore(state => state.isLoading);
  const logValue = useAppStore(state => state.logValue);
  const addMetric = useAppStore(state => state.addMetric);
  
  const metricsWithValues = useMetricsWithTodayValues();
  const today = getTodayISO();

  const handleAddSuggestedMetrics = async () => {
    for (const suggestion of SUGGESTED_METRICS) {
      await addMetric(suggestion);
    }
  };

  if (isLoading && metrics.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (metrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to Resolve! 🎯</Text>
        <Text style={styles.emptyText}>
          Start tracking your daily metrics to discover patterns and reach your goals.
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={handleAddSuggestedMetrics}
        >
          <Text style={styles.setupButtonText}>Add Suggested Metrics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{formatDisplayDate(today)}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {metricsWithValues.map(({ metric, value }) => (
          <MetricInputCard
            key={metric.id}
            metric={metric}
            currentValue={value}
            onSave={(newValue) => logValue(metric.id, newValue)}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Keep logging daily to see patterns! 📊
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  setupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
