/**
 * AnalyticsScreen
 * 
 * Displays correlation graphs for selected metrics.
 * Shows trends and patterns across multiple metrics.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { subDays } from 'date-fns';
import { useAppStore } from '../store';
import { CorrelationGraph } from '../components';
import { COLORS } from '../constants';
import { dateToISO } from '../utils/dateUtils';
import * as entryService from '../services/entryService';
import { Entry } from '../models';

export function AnalyticsScreen() {
  const metrics = useAppStore(state => state.metrics);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [entriesByMetric, setEntriesByMetric] = useState<Record<string, Entry[]>>({});
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    const loadData = async () => {
      const endDate = dateToISO(new Date());
      const startDate = dateToISO(subDays(new Date(), dateRange));

      const dataByMetric: Record<string, Entry[]> = {};
      
      for (const metricId of selectedMetricIds) {
        const entries = await entryService.getEntriesForMetricInRange(
          metricId,
          startDate,
          endDate
        );
        dataByMetric[metricId] = entries;
      }
      
      setEntriesByMetric(dataByMetric);
    };

    if (selectedMetricIds.length > 0) {
      loadData();
    }
  }, [selectedMetricIds, dateRange]);

  const toggleMetric = (metricId: string) => {
    setSelectedMetricIds(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const selectedMetrics = metrics.filter(m => selectedMetricIds.includes(m.id));

  if (metrics.length === 0) {
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
              const isSelected = selectedMetricIds.includes(metric.id);
              return (
                <TouchableOpacity
                  key={metric.id}
                  style={[
                    styles.metricChip,
                    isSelected && {
                      backgroundColor: metric.color || COLORS.primary,
                    },
                  ]}
                  onPress={() => toggleMetric(metric.id)}
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
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
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  metricChips: {
    flexDirection: 'row',
    gap: 8,
  },
  metricChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  metricChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
  },
  metricChipTextSelected: {
    color: COLORS.white,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  dateRangeButtonText: {
    fontSize: 14,
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
    padding: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  insights: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
