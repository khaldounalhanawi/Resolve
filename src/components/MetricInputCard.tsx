/**
 * MetricInputCard Component
 * 
 * Displays a metric with a slider input for logging values.
 * Supports both accumulate and singleValue aggregation types.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Metric } from '../models';
import { COLORS } from '../constants';

interface MetricInputCardProps {
  metric: Metric;
  currentValue: number;
  onSave: (value: number) => void;
}

export function MetricInputCard({ metric, currentValue, onSave }: MetricInputCardProps) {
  const [sliderValue, setSliderValue] = useState(
    metric.aggregationType === 'accumulate' ? metric.minValue : currentValue
  );

  const handleSave = () => {
    const valueToAdd = metric.aggregationType === 'accumulate' 
      ? sliderValue 
      : sliderValue;
    onSave(valueToAdd);
    
    // Reset slider for accumulate metrics
    if (metric.aggregationType === 'accumulate') {
      setSliderValue(metric.minValue);
    }
  };

  const displayValue = metric.aggregationType === 'accumulate'
    ? currentValue
    : sliderValue;

  return (
    <View style={[styles.container, { borderLeftColor: metric.color || COLORS.primary }]}>
      <View style={styles.header}>
        <Text style={styles.metricName}>{metric.name}</Text>
        <Text style={styles.valueText}>
          {displayValue.toFixed(1)} {metric.unit || ''}
        </Text>
      </View>

      {metric.aggregationType === 'accumulate' && (
        <Text style={styles.hint}>Add to today's total</Text>
      )}

      <Slider
        style={styles.slider}
        minimumValue={metric.minValue}
        maximumValue={metric.maxValue}
        value={sliderValue}
        onValueChange={setSliderValue}
        minimumTrackTintColor={metric.color || COLORS.primary}
        maximumTrackTintColor={COLORS.lightGray}
        thumbTintColor={metric.color || COLORS.primary}
      />

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{metric.minValue}</Text>
        <Text style={styles.rangeLabel}>{metric.maxValue}</Text>
      </View>

      {metric.aggregationType === 'accumulate' && (
        <Text style={styles.addValueText}>
          +{sliderValue.toFixed(1)} {metric.unit || ''}
        </Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  addValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
