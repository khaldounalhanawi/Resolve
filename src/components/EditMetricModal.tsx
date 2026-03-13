/**
 * EditMetricModal Component
 * 
 * Modal for editing an existing metric's properties.
 */

import React, { useState, useEffect } from 'react';
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
import { Metric, CreateMetricDTO } from '../models';
import { COLORS } from '../constants';

interface EditMetricModalProps {
  visible: boolean;
  metric: Metric | null;
  onClose: () => void;
  onUpdate: (metricId: string, data: Partial<CreateMetricDTO>) => void;
}

const METRIC_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
  '#F44336', '#00BCD4', '#FF5722', '#3F51B5'
];

export function EditMetricModal({ visible, metric, onClose, onUpdate }: EditMetricModalProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minValue, setMinValue] = useState('0');
  const [maxValue, setMaxValue] = useState('10');
  const [target, setTarget] = useState('');
  const [selectedColor, setSelectedColor] = useState(METRIC_COLORS[0]);
  const [isAccumulate, setIsAccumulate] = useState(false);

  // Initialize form when metric changes
  useEffect(() => {
    if (metric) {
      setName(metric.name);
      setUnit(metric.unit || '');
      setMinValue(metric.minValue.toString());
      setMaxValue(metric.maxValue.toString());
      setTarget(metric.targetValue?.toString() || '');
      setSelectedColor(metric.color || METRIC_COLORS[0]);
      setIsAccumulate(metric.aggregationType === 'accumulate');
    }
  }, [metric]);

  const handleUpdate = () => {
    if (!metric || !name.trim()) {
      return;
    }

    const updates: Partial<CreateMetricDTO> = {
      name: name.trim(),
      unit: unit.trim() || undefined,
      minValue: parseFloat(minValue) || 0,
      maxValue: parseFloat(maxValue) || 10,
      targetValue: target ? parseFloat(target) : undefined,
      color: selectedColor,
      aggregationType: isAccumulate ? 'accumulate' : 'singleValue',
    };

    onUpdate(metric.id, updates);
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
            <Text style={styles.title}>Edit Metric</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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
              style={[styles.updateButton, !name.trim() && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={!name.trim()}
            >
              <Text style={styles.updateButtonText}>Update</Text>
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
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
