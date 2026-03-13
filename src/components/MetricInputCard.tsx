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
  onEdit?: () => void;
}

export function MetricInputCard({ metric, currentValue, onSave, onEdit }: MetricInputCardProps) {
  const [sliderValue, setSliderValue] = useState(
    metric.aggregationType === 'accumulate' ? metric.minValue : currentValue
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    const valueToAdd = metric.aggregationType === 'accumulate' 
      ? sliderValue 
      : sliderValue;
    onSave(valueToAdd);
    
    // Reset slider for accumulate metrics
    if (metric.aggregationType === 'accumulate') {
      setSliderValue(metric.minValue);
    }
    
    // Collapse after saving
    setIsExpanded(false);
  };

  const displayValue = metric.aggregationType === 'accumulate'
    ? currentValue
    : sliderValue;

  // Collapsed view - just show name and current value
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={[styles.container, styles.collapsedContainer, { borderLeftColor: metric.color || COLORS.primary }]}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.metricName}>{metric.name}</Text>
        <Text style={styles.collapsedValue}>
          {currentValue.toFixed(1)}{metric.unit || ''}
        </Text>
      </TouchableOpacity>
    );
  }

  // Expanded view - show slider and controls
  return (
    <View style={[styles.container, { borderLeftColor: metric.color || COLORS.primary }]}>
      <View style={styles.compactRow}>
        <Text style={styles.metricName}>{metric.name}</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.minLabel}>{metric.minValue}</Text>
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
          <Text style={styles.maxLabel}>{metric.maxValue}</Text>
        </View>
        <Text style={styles.valueText}>
          {displayValue.toFixed(1)}{metric.unit || ''}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {metric.aggregationType === 'accumulate' ? 'Add' : 'Update'}
          </Text>
        </TouchableOpacity>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  collapsedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  collapsedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    width: 70,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  minLabel: {
    fontSize: 11,
    color: COLORS.gray,
    width: 30,
  },
  maxLabel: {
    fontSize: 11,
    color: COLORS.gray,
    width: 30,
    textAlign: 'right',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    width: 60,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  editButtonText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
  },
});
