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
        <View style={styles.collapsedLeft}>
          <View style={[styles.colorDot, { backgroundColor: metric.color || COLORS.primary }]} />
          <Text style={styles.metricName}>{metric.name}</Text>
        </View>
        <Text style={styles.collapsedValue}>
          {currentValue.toFixed(1)}{metric.unit || ''}
        </Text>
      </TouchableOpacity>
    );
  }

  // Expanded view - show slider and controls
  return (
    <View style={[styles.container, { borderLeftColor: metric.color || COLORS.primary }]}>
      <View style={styles.headerRow}>
        <View style={styles.collapsedLeft}>
          <View style={[styles.colorDot, { backgroundColor: metric.color || COLORS.primary }]} />
          <Text style={styles.metricName}>{metric.name}</Text>
        </View>
        <Text style={styles.valueText}>
          {displayValue.toFixed(1)}{metric.unit || ''}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={metric.minValue}
          maximumValue={metric.maxValue}
          value={sliderValue}
          onValueChange={setSliderValue}
          minimumTrackTintColor={metric.color || COLORS.primary}
          maximumTrackTintColor={COLORS.secondary}
          thumbTintColor={metric.color || COLORS.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.minLabel}>{metric.minValue}</Text>
          <Text style={styles.maxLabel}>{metric.maxValue}</Text>
        </View>
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  collapsedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  collapsedValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  sliderContainer: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  minLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  maxLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    width: 70,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  editButtonText: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '600',
  },
});
