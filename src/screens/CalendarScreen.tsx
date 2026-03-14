/**
 * CalendarScreen
 * 
 * Displays a calendar heatmap for visualizing metric data over time.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { addMonths, subMonths } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { useEntriesForDate } from '../hooks';
import { CalendarHeatmap, DayDetailModal } from '../components';
import { COLORS } from '../constants';

export function CalendarScreen() {
  const { userId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch metrics and entries from Convex
  const metrics = useQuery(
    api.metrics.getUserMetrics,
    userId ? { userId } : 'skip'
  );
  const allEntries = useQuery(
    api.entries.getUserEntries,
    userId ? { userId } : 'skip'
  );

  const { data: dayData, isLoading: isDayDataLoading } = useEntriesForDate(
    selectedDate || ''
  );

  const selectedMetric = metrics?.[selectedMetricIndex];
  
  // Filter entries for the selected metric
  const metricEntries = useMemo(() => {
    if (!selectedMetric || !allEntries) return [];
    return allEntries.filter(e => e.metricId === selectedMetric._id);
  }, [selectedMetric, allEntries]);

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

  if (!metrics || metrics.length === 0) {
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
        <Text style={styles.title}>Your progress this month</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedMetric && (
          <CalendarHeatmap
            metric={selectedMetric}
            entries={metricEntries}
            onDayPress={handleDayPress}
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            metrics={metrics}
            selectedMetricIndex={selectedMetricIndex}
            onSelectMetric={setSelectedMetricIndex}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
  },
  scrollView: {
    flex: 1,
  },
});
