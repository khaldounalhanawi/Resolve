/**
 * AddMetricModal Component
 * 
 * Modal for creating a new metric with all required properties.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { MetricType, AggregationType, CreateMetricDTO, Direction } from '../models';
import { COLORS } from '../constants';

interface AddMetricModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (metric: CreateMetricDTO) => void;
}

const METRIC_COLORS = [
  '#E8737B', // dusty rose
  '#E8944B', // burnt orange
  '#E8B84B', // golden amber
  '#9DBF5B', // olive green
  '#5BBF8A', // sage green
  '#4BBFB0', // teal
  '#4B9BDB', // cornflower blue
  '#6B9FD4', // steel blue
  '#7B7BD4', // slate violet
  '#A07BD4', // dusty violet
  '#CA6BB8', // mauve
  '#D46B8A', // raspberry
];

export function AddMetricModal({ visible, onClose, onAdd }: AddMetricModalProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minValue, setMinValue] = useState('0');
  const [maxValue, setMaxValue] = useState('10');
  const [target, setTarget] = useState('5');
  const [selectedColor, setSelectedColor] = useState(METRIC_COLORS[0]);
  const [isAccumulate, setIsAccumulate] = useState(false);
  const [direction, setDirection] = useState<Direction>('ascending');

  const handleAdd = () => {
    if (!name.trim()) {
      return;
    }

    const newMetric: CreateMetricDTO = {
      name: name.trim(),
      type: 'number' as MetricType,
      unit: unit.trim() || undefined,
      minValue: parseFloat(minValue) || 0,
      maxValue: parseFloat(maxValue) || 10,
      targetValue: parseFloat(target) || undefined,
      direction: direction,
      color: selectedColor,
      aggregationType: isAccumulate ? 'accumulate' : 'singleValue',
    };

    onAdd(newMetric);
    
    // Reset form
    setName('');
    setUnit('');
    setMinValue('0');
    setMaxValue('10');
    setTarget('5');
    setSelectedColor(METRIC_COLORS[0]);
    setIsAccumulate(false);
    setDirection('ascending');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Metric</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Water Intake"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unit (optional)</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g., cups, kg, hours"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Min Value</Text>
                <TextInput
                  style={styles.input}
                  value={minValue}
                  onChangeText={setMinValue}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Max Value</Text>
                <TextInput
                  style={styles.input}
                  value={maxValue}
                  onChangeText={setMaxValue}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target (optional)</Text>
              <TextInput
                style={styles.input}
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholder="Your daily goal"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Direction</Text>
              <Text style={styles.hint}>
                Specify what's better for this metric
              </Text>
              <View style={styles.directionPicker}>
                <TouchableOpacity
                  style={[
                    styles.directionOption,
                    direction === 'ascending' && styles.directionOptionSelected,
                  ]}
                  onPress={() => setDirection('ascending')}
                >
                  <Text style={[
                    styles.directionText,
                    direction === 'ascending' && styles.directionTextSelected,
                  ]}>
                    ↑ Higher is Better
                  </Text>
                  <Text style={styles.directionHint}>e.g., Steps, Mood, Sleep</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.directionOption,
                    direction === 'descending' && styles.directionOptionSelected,
                  ]}
                  onPress={() => setDirection('descending')}
                >
                  <Text style={[
                    styles.directionText,
                    direction === 'descending' && styles.directionTextSelected,
                  ]}>
                    ↓ Lower is Better
                  </Text>
                  <Text style={styles.directionHint}>e.g., Weight Loss, Stress</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorPicker}>
                {METRIC_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.switchGroup}>
              <View>
                <Text style={styles.label}>Accumulate Values</Text>
                <Text style={styles.hint}>
                  Enable for metrics that add up during the day (e.g., water, steps)
                </Text>
              </View>
              <Switch
                value={isAccumulate}
                onValueChange={setIsAccumulate}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text style={styles.addButtonText}>Add Metric</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.gray,
    fontWeight: '300',
  },
  form: {
    padding: 20,
  },
  formContent: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.black,
    borderWidth: 3,
  },
  directionPicker: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  directionOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.background,
  },
  directionOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  directionTextSelected: {
    color: COLORS.primary,
  },
  directionHint: {
    fontSize: 11,
    color: COLORS.gray,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
