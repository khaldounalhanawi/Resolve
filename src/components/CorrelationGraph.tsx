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

  // Normalize data for each metric (0-1 scale)
  const normalizeValue = (value: number, min: number, max: number): number => {
    return (value - min) / (max - min);
  };

  const chartData = metrics.map((metric, index) => {
    const entries = entriesByMetric[metric.id] || [];
    return {
      metric,
      data: entries.map(entry => ({
        x: new Date(entry.date),
        y: normalizeValue(entry.value, metric.minValue, metric.maxValue),
      })),
      color: metric.color || COLORS.chartColors[index % COLORS.chartColors.length],
    };
  });

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
          tickFormat={(date) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          style={{
            grid: { stroke: COLORS.lightGray },
          }}
        />
        
        {chartData.map(({ metric, data, color }) => (
          <VictoryLine
            key={metric.id}
            data={data}
            style={{
              data: { stroke: color, strokeWidth: 2 },
            }}
          />
        ))}
      </VictoryChart>

      <View style={styles.legend}>
        {metrics.map((metric, index) => (
          <View key={metric.id} style={styles.legendItem}>
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
