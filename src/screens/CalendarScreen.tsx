/**
 * CalendarScreen
 * 
 * Displays a calendar heatmap for visualizing metric data over time.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { addMonths, subMonths } from 'date-fns';
import { useAppStore } from '../store';
import { useEntriesForDate } from '../hooks';
import { CalendarHeatmap, DayDetailModal } from '../components';
import { COLORS } from '../constants';
import * as entryService from '../services/entryService';

export function CalendarScreen() {
  const metrics = useAppStore(state => state.metrics);
  const entries = useAppStore(state => state.entries);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: dayData, isLoading: isDayDataLoading } = useEntriesForDate(
    selectedDate || ''
  );

  const selectedMetric = metrics[selectedMetricIndex];
  const metricEntries = selectedMetric
    ? entries.filter(e => e.metricId === selectedMetric.id)
    : [];

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  if (metrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Add metrics on the Home screen to see your calendar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricSelector}>
        {metrics.map((metric, index) => (
          <TouchableOpacity
            key={metric.id}
            style={[
              styles.metricTab,
              selectedMetricIndex === index && styles.metricTabActive,
              { borderBottomColor: metric.color || COLORS.primary },
            ]}
            onPress={() => setSelectedMetricIndex(index)}
          >
            <Text
              style={[
                styles.metricTabText,
                selectedMetricIndex === index && styles.metricTabTextActive,
              ]}
            >
              {metric.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedMetric && (
          <CalendarHeatmap
            metric={selectedMetric}
            entries={metricEntries}
            onDayPress={handleDayPress}
            currentMonth={currentMonth}
          />
        )}
      </ScrollView>

      {selectedDate && (
        <DayDetailModal
          visible={modalVisible}
          date={selectedDate}
          data={dayData}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 75,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  metricSelector: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  metricTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  metricTabActive: {
    borderBottomWidth: 3,
  },
  metricTabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  metricTabTextActive: {
    color: COLORS.black,
    fontWeight: '700',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.white,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  navButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
});
