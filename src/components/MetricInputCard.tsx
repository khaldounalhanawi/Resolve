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
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Metric } from '../models';
import { COLORS } from '../constants';

interface MetricInputCardProps {
  metric: Metric;
  currentValue: number;
  hasEntry?: boolean;
  onSave: (value: number) => void;
  onEdit?: () => void;
}

export function MetricInputCard({ metric, currentValue, hasEntry = false, onSave, onEdit }: MetricInputCardProps) {
  const [sliderValue, setSliderValue] = useState(
    metric.aggregationType === 'accumulate' ? metric.minValue : currentValue
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputModalVisible, setIsInputModalVisible] = useState(false);
  const [directInputValue, setDirectInputValue] = useState('');

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

  const handleDirectInput = () => {
    setDirectInputValue(displayValue.toFixed(1));
    setIsInputModalVisible(true);
  };

  const handleDirectInputSave = () => {
    const numValue = parseFloat(directInputValue);
    if (!isNaN(numValue) && numValue >= metric.minValue && numValue <= metric.maxValue) {
      setSliderValue(numValue);
      if (metric.aggregationType === 'singleValue') {
        onSave(numValue);
        setIsExpanded(false);
      }
    }
    setIsInputModalVisible(false);
  };

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
        {hasEntry || metric.aggregationType === 'accumulate' ? (
          <Text style={styles.collapsedValue}>
            {currentValue.toFixed(1)}{metric.unit || ''}
          </Text>
        ) : (
          <Text style={styles.collapsedPlaceholder}>Log today</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Expanded view - show slider and controls
  return (
    <View style={[styles.container, { borderLeftColor: metric.color || COLORS.primary }]}>
      <TouchableOpacity style={styles.headerRow} onPress={() => setIsExpanded(false)} activeOpacity={0.7}>
        <View style={styles.collapsedLeft}>
          <View style={[styles.colorDot, { backgroundColor: metric.color || COLORS.primary }]} />
          <Text style={styles.metricName}>{metric.name}</Text>
        </View>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDirectInput(); }} style={styles.valueTouchable}>
          <Text style={styles.valueText}>
            {displayValue.toFixed(1)}{metric.unit || ''}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.sliderWrapper}>
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
          step={(metric.maxValue - metric.minValue) / 100}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.minLabel}>{metric.minValue}</Text>
          <Text style={styles.maxLabel}>{metric.maxValue}</Text>
        </View>
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

      <Modal
        visible={isInputModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInputModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsInputModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter {metric.name}</Text>
            <TextInput
              style={styles.modalInput}
              value={directInputValue}
              onChangeText={setDirectInputValue}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              placeholder={`${metric.minValue} - ${metric.maxValue}`}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsInputModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleDirectInputSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  collapsedPlaceholder: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.lightGray,
    fontStyle: 'italic',
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
  sliderWrapper: {
    marginVertical: -10,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  sliderContainer: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 50,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  minLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  maxLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  valueTouchable: {
    padding: 6,
    marginRight: -6,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 70,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalCancelText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
