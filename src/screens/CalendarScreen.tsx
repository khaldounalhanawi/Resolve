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
        <Text style={styles.title}>Calendar</Text>
      </View>

      <View style={styles.metricSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricTabsContainer}>
          {metrics.map((metric, index) => {
            const isSelected = selectedMetricIndex === index;
            return (
              <TouchableOpacity
                key={metric._id}
                style={[
                  styles.metricTab,
                  isSelected && {
                    backgroundColor: metric.color || COLORS.primary,
                  },
                ]}
                onPress={() => setSelectedMetricIndex(index)}
              >
                <Text
                  style={[
                    styles.metricTabText,
                    isSelected && styles.metricTabTextActive,
                  ]}
                >
                  {metric.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
  metricTabsContainer: {
    alignItems: 'center',
  },
  metricTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  metricTabActive: {
    // backgroundColor will be set dynamically based on metric color
  },
  metricTabText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '600',
  },
  metricTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
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
