/**
 * CorrelationGraph Component
 * 
 * Multi-line chart showing correlation between multiple metrics over time.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryTheme } from 'victory-native';
import { Metric, Entry } from '../models';
import { COLORS } from '../constants';

interface CorrelationGraphProps {
  metrics: Metric[];
  entriesByMetric: Record<string, Entry[]>;
}

export function CorrelationGraph({ metrics, entriesByMetric }: CorrelationGraphProps) {
  const screenWidth = Dimensions.get('window').width;

  if (metrics.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Select metrics to display</Text>
      </View>
    );
  }

  // Normalize data for each metric (0-1 scale based on target performance)
  const normalizeValue = (value: number, metric: Metric, initialValue: number | null): number => {
    // If we have a target and initial value, normalize based on progress toward target
    if (metric.targetValue !== undefined && initialValue !== null) {
      const target = metric.targetValue;
      const initial = initialValue;
      
      // If initial equals target, we're already at goal - any deviation is bad
      if (initial === target) {
        const distance = Math.abs(value - target);
        const maxDeviation = Math.max(
          Math.abs(metric.maxValue - target),
          Math.abs(metric.minValue - target)
        );
        if (distance === 0) return 1.0;
        if (maxDeviation === 0) return 1.0;
        return Math.max(0, 1 - distance / maxDeviation);
      }
      
      const distanceToTarget = initial - target;
      const worstCase = initial + distanceToTarget;
      
      // Determine if we're moving toward higher or lower values to reach target
      const movingUp = target > initial;
      
      // Clamp values that are at or beyond target (better than goal)
      if (movingUp && value >= target) {
        return 1.0; // 100% - at or beyond target
      }
      if (!movingUp && value <= target) {
        return 1.0; // 100% - at or beyond target
      }
      
      // Clamp values that are at or beyond worst case
      if (movingUp && value <= worstCase) {
        return 0.0; // 0% - at or beyond worst case
      }
      if (!movingUp && value >= worstCase) {
        return 0.0; // 0% - at or beyond worst case
      }
      
      // Calculate position between worst case and target
      const range = Math.abs(target - worstCase);
      const position = Math.abs(value - worstCase);
      return position / range;
    }
    
    // Fallback: normalize based on min/max range
    if (metric.maxValue === metric.minValue) return 0.5;
    return (value - metric.minValue) / (metric.maxValue - metric.minValue);
  };

  const chartData = metrics.map((metric, index) => {
    const metricId = (metric._id || metric.id) as string;
    const entries = entriesByMetric[metricId] || [];
    
    // Aggregate entries by date (take the last entry for each date)
    const entriesByDate = entries.reduce((acc, entry) => {
      const existing = acc[entry.date];
      if (!existing) {
        acc[entry.date] = entry;
      } else {
        // Take the entry with the later createdAt, or just replace if no createdAt
        const existingTime = existing.createdAt || existing.updatedAt || 0;
        const entryTime = entry.createdAt || entry.updatedAt || 0;
        if (entryTime >= existingTime) {
          acc[entry.date] = entry;
        }
      }
      return acc;
    }, {} as Record<string, Entry>);
    
    // Sort by date and get unique entries
    const sortedEntries = Object.values(entriesByDate).sort((a, b) => a.date.localeCompare(b.date));
    const initialValue = sortedEntries[0]?.value ?? null;
    
    return {
      metric,
      data: sortedEntries.map(entry => ({
        x: new Date(entry.date),
        y: normalizeValue(entry.value, metric, initialValue),
      })),
      color: metric.color || COLORS.chartColors[index % COLORS.chartColors.length],
    };
  });

  // Get all unique dates across all metrics for x-axis ticks
  const allDates = new Set<string>();
  chartData.forEach(({ data }) => {
    data.forEach(point => {
      allDates.add(point.x.toISOString().split('T')[0]);
    });
  });
  const uniqueDates = Array.from(allDates).sort().map(d => new Date(d));

  return (
    <View style={styles.container}>
      <VictoryChart
        width={screenWidth - 32}
        height={300}
        theme={VictoryTheme.material}
        scale={{ x: 'time' }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `${Math.round(t * 100)}%`}
          style={{
            grid: { stroke: COLORS.lightGray },
          }}
        />
        <VictoryAxis
          tickValues={uniqueDates}
          tickFormat={(date) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          style={{
            grid: { stroke: COLORS.lightGray },
            tickLabels: { angle: 0, fontSize: 10 },
          }}
        />
        
        {chartData.map(({ metric, data, color }) => (
          <VictoryLine
            key={metric._id || metric.id}
            data={data}
            style={{
              data: { stroke: color, strokeWidth: 2 },
            }}
          />
        ))}
      </VictoryChart>

      <View style={styles.legend}>
        {metrics.map((metric, index) => (
          <View key={metric._id || metric.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    metric.color || COLORS.chartColors[index % COLORS.chartColors.length],
                },
              ]}
            />
            <Text style={styles.legendText}>{metric.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.black,
  },
});
