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
        <Text style={styles.legendLabel}>Far from target</Text>
        <View style={styles.legendGradient}>
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((value, index) => {
            // Generate gradient colors from red to green
            const getGradientColor = (v: number): string => {
              const colors = [
                '#d32f2f', '#e53935', '#f44336', '#ff5722', '#ff9800',
                '#ffc107', '#cddc39', '#8bc34a', '#66bb6a', '#4caf50', '#2e7d32'
              ];
              const segmentSize = 1 / (colors.length - 1);
              const segmentIndex = Math.floor(v / segmentSize);
              return colors[Math.min(segmentIndex, colors.length - 1)];
            };
            
            return (
              <View
                key={index}
                style={[
                  styles.legendGradientBox,
                  { backgroundColor: getGradientColor(value) }
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.legendLabel}>On target</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
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
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  legendLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendGradientBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});
