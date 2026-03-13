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
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAppStore } from '../store';
import { useMetricsWithTodayValues } from '../hooks';
import { MetricInputCard, AddMetricModal, EditMetricModal } from '../components';
import { COLORS, SUGGESTED_METRICS } from '../constants';
import { getTodayISO, formatDisplayDate } from '../utils/dateUtils';

export function HomeScreen() {
  const user = useAppStore(state => state.user);
  const metrics = useAppStore(state => state.metrics);
  const entries = useAppStore(state => state.entries);
  const isLoading = useAppStore(state => state.isLoading);
  const logValue = useAppStore(state => state.logValue);
  const addMetric = useAppStore(state => state.addMetric);
  const updateMetric = useAppStore(state => state.updateMetric);
  const removeMetric = useAppStore(state => state.removeMetric);
  
  const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);
  const [editingMetric, setEditingMetric] = React.useState<any>(null);
  
  const metricsWithValues = useMetricsWithTodayValues();
  const today = getTodayISO();

  const handleAddSuggestedMetrics = async () => {
    for (const suggestion of SUGGESTED_METRICS) {
      await addMetric(suggestion);
    }
  };

  const renderRightActions = (metricId: string) => (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeMetric(metricId)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
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
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
        <Text style={styles.date}>{formatDisplayDate(today)}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Text style={styles.sectionTitle}>Categories</Text>
        {metricsWithValues.map(({ metric, value }) => (
          <Swipeable
            key={metric.id}
            renderRightActions={renderRightActions(metric.id)}
            activeOffsetX={[-20, 20]}
            overshootLeft={false}
            overshootRight={false}
          >
            <MetricInputCard
              metric={metric}
              currentValue={value}
              onSave={(newValue) => logValue(metric.id, newValue)}
              onEdit={() => setEditingMetric(metric)}
            />
          </Swipeable>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddMetricModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={(metric) => addMetric(metric)}
      />

      <EditMetricModal
        visible={!!editingMetric}
        metric={editingMetric}
        onClose={() => setEditingMetric(null)}
        onUpdate={(metricId, data) => updateMetric(metricId, data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 75,
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
    paddingBottom: 100,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  setupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 16,
    marginBottom: 12,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
