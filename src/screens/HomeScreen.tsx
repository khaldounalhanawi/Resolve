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
  Image,
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

  // Calculate progress statistics
  const calculateProgress = () => {
    if (entries.length === 0 || metrics.length === 0) {
      return null;
    }

    // Get metrics with targets
    const metricsWithTargets = metrics.filter(m => m.targetValue);
    if (metricsWithTargets.length === 0) {
      return null;
    }

    // Calculate days tracking
    const allDates = [...new Set(entries.map(e => e.date))].sort();
    const daysTracking = allDates.length;
    const firstDate = allDates[0];
    
    // Calculate improvements
    let improvedCount = 0;
    
    for (const metric of metricsWithTargets) {
      const metricEntries = entries.filter(e => e.metricId === metric.id).sort((a, b) => a.date.localeCompare(b.date));
      
      if (metricEntries.length >= 2 && metric.targetValue) {
        const firstEntry = metricEntries[0];
        const recentEntries = metricEntries.slice(-7); // Last 7 days average
        const recentAvg = recentEntries.reduce((sum, e) => sum + e.value, 0) / recentEntries.length;
        
        // Check if getting closer to target
        const firstDistance = Math.abs(firstEntry.value - metric.targetValue);
        const recentDistance = Math.abs(recentAvg - metric.targetValue);
        
        if (recentDistance < firstDistance) {
          improvedCount++;
        }
      }
    }

    return {
      improved: improvedCount > 0,
      improvedCount,
      totalWithTargets: metricsWithTargets.length,
      daysTracking,
      firstDate,
    };
  };

  const progress = calculateProgress();

  // Generate motivational message
  const getMotivationalMessage = () => {
    if (!progress) {
      return null;
    }

    if (progress.improved) {
      return `🎯 ${progress.improvedCount} metric${progress.improvedCount > 1 ? 's are' : ' is'} getting closer to target!`;
    } else {
      return `💪 Keep at it! You're already ${progress.daysTracking} day${progress.daysTracking > 1 ? 's' : ''} in!`;
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
        <View style={styles.userSection}>
          <Image 
            source={user?.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/Resolve_logo.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
            <Text style={styles.date}>{formatDisplayDate(today)}</Text>
            {getMotivationalMessage() && (
              <Text style={styles.motivation}>{getMotivationalMessage()}</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {metricsWithValues.map(({ metric, value }) => (
          <Swipeable
            key={metric.id}
            renderRightActions={renderRightActions(metric.id)}
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
          <Text style={styles.addButtonText}>Add New Metric</Text>
        </TouchableOpacity>

        {metrics.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tap Calendar or Analytics below to see your data 📊
            </Text>
          </View>
        )}
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
  },
  setupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray,
  },
  motivation: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  footer: {
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 8,
    marginBottom: 8,
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
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
