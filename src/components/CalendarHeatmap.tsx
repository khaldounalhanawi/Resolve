/**
 * CalendarHeatmap Component
 * 
 * Displays a monthly calendar grid with color-coded cells
 * representing metric values.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { Metric, Entry } from '../models';
import { COLORS } from '../constants';
import { dateToISO, getHeatmapColor } from '../utils/dateUtils';

interface CalendarHeatmapProps {
  metric: Metric;
  entries: Entry[];
  onDayPress: (date: string) => void;
  currentMonth: Date;
}

export function CalendarHeatmap({
  metric,
  entries,
  onDayPress,
  currentMonth,
}: CalendarHeatmapProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getValueForDate = (date: Date): number | null => {
    const dateStr = dateToISO(date);
    const entry = entries.find(e => e.date === dateStr);
    return entry ? entry.value : null;
  };

  const getCellColor = (date: Date): string => {
    const value = getValueForDate(date);
    
    if (value === null) {
      return COLORS.heatmap.empty;
    }
    
    return getHeatmapColor(
      value,
      metric.minValue,
      metric.maxValue,
      metric.targetValue,
      COLORS.heatmap
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{format(currentMonth, 'MMMM yyyy')}</Text>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendar}>
        {days.map((day, index) => {
          const dateStr = dateToISO(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          
          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                {
                  backgroundColor: isCurrentMonth ? getCellColor(day) : COLORS.background,
                  opacity: isCurrentMonth ? 1 : 0.3,
                },
              ]}
              onPress={() => onDayPress(dateStr)}
            >
              <Text style={styles.dayText}>{format(day, 'd')}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={[styles.legendBox, { backgroundColor: COLORS.heatmap.low }]} />
        <View style={[styles.legendBox, { backgroundColor: COLORS.heatmap.mid }]} />
        <View style={[styles.legendBox, { backgroundColor: COLORS.heatmap.high }]} />
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
});
