/**
 * DayDetailModal Component
 * 
 * Modal that shows all metric values for a specific day.
 * Allows viewing and editing values.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Metric, Entry } from '../models';
import { COLORS } from '../constants';
import { formatDisplayDate } from '../utils/dateUtils';

interface DayDetailModalProps {
  visible: boolean;
  date: string;
  data: Array<{ metric: Metric; entry: Entry | null }>;
  onClose: () => void;
}

export function DayDetailModal({ visible, date, data, onClose }: DayDetailModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{formatDisplayDate(date)}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {data.map(({ metric, entry }) => (
              <View key={metric._id || metric.id} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: metric.color || COLORS.primary },
                    ]}
                  />
                  <Text style={styles.metricName}>{metric.name}</Text>
                </View>
                <Text style={styles.valueText}>
                  {entry ? `${entry.value.toFixed(1)} ${metric.unit || ''}` : 'No data'}
                </Text>
              </View>
            ))}
            
            {data.every(d => !d.entry) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No data logged for this day</Text>
              </View>
            )}
          </ScrollView>
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
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.gray,
    fontWeight: '300',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
