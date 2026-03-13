/**
 * AnalyticsScreen
 * 
 * Displays correlation graphs for selected metrics.
 * Shows trends and patterns across multiple metrics.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { subDays } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { CorrelationGraph } from '../components';
import { COLORS } from '../constants';
import { dateToISO } from '../utils/dateUtils';
import { Entry } from '../models';
import type { Id } from '../../convex/_generated/dataModel';

export function AnalyticsScreen() {
  const { userId } = useAuth();
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(30);

  // Fetch metrics from Convex
  const metrics = useQuery(
    api.metrics.getUserMetrics,
    userId ? { userId } : 'skip'
  );

  // Calculate date range
  const { startDate, endDate } = useMemo(() => ({
    startDate: dateToISO(subDays(new Date(), dateRange)),
    endDate: dateToISO(new Date()),
  }), [dateRange]);

  // Fetch entries in date range
  const allEntries = useQuery(
    api.entries.getUserEntriesInRange,
    userId ? { userId, startDate, endDate } : 'skip'
  );

  // Group entries by metric
  const entriesByMetric = useMemo(() => {
    if (!allEntries) return {};
    
    const grouped: Record<string, Entry[]> = {};
    for (const entry of allEntries) {
      const metricId = entry.metricId as string;
      if (!grouped[metricId]) {
        grouped[metricId] = [];
      }
      grouped[metricId].push(entry as Entry);
    }
    return grouped;
  }, [allEntries]);

  const toggleMetric = (metricId: string) => {
    setSelectedMetricIds(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const selectedMetrics = useMemo(() => {
    if (!metrics) return [];
    return metrics.filter(m => selectedMetricIds.includes(m._id as string));
  }, [metrics, selectedMetricIds]);

  if (!metrics || metrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Add metrics on the Home screen to see analytics
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Metrics to Compare</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.metricChips}>
            {metrics.map(metric => {
              const metricId = metric._id as string;
              const isSelected = selectedMetricIds.includes(metricId);
              return (
                <TouchableOpacity
                  key={metricId}
                  style={[
                    styles.metricChip,
                    isSelected && {
                      backgroundColor: metric.color || COLORS.primary,
                    },
                  ]}
                  onPress={() => toggleMetric(metricId)}
                >
                  <Text
                    style={[
                      styles.metricChipText,
                      isSelected && styles.metricChipTextSelected,
                    ]}
                  >
                    {metric.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <View style={styles.dateRangeButtons}>
          {[7, 30, 90].map(days => (
            <TouchableOpacity
              key={days}
              style={[
                styles.dateRangeButton,
                dateRange === days && styles.dateRangeButtonActive,
              ]}
              onPress={() => setDateRange(days)}
            >
              <Text
                style={[
                  styles.dateRangeButtonText,
                  dateRange === days && styles.dateRangeButtonTextActive,
                ]}
              >
                {days} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedMetrics.length > 0 ? (
          <>
            <CorrelationGraph
              metrics={selectedMetrics}
              entriesByMetric={entriesByMetric}
            />
            <View style={styles.insights}>
              <Text style={styles.insightsTitle}>💡 Insight</Text>
              <Text style={styles.insightsText}>
                Track multiple metrics to discover patterns and correlations in your data.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Select metrics above to see correlations
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 75,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 10,
  },
  metricChips: {
    flexDirection: 'row',
    gap: 6,
  },
  metricChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  metricChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.black,
  },
  metricChipTextSelected: {
    color: COLORS.white,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  dateRangeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.black,
  },
  dateRangeButtonTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  insights: {
    margin: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },
  insightsText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
});
