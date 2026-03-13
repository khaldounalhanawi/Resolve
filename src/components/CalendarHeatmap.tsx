/**
 * CalendarHeatmap Component
 * 
 * Displays a monthly calendar grid with color-coded cells
 * representing metric values.
 */

import React, { useMemo } from 'react';
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
  
  // Find the earliest entry to use as initial value
  const initialValue = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    return sortedEntries[0]?.value ?? null;
  }, [entries]);
  
  const getValueForDate = (date: Date): number | null => {
    const dateStr = dateToISO(date);
    const entry = entries.find(e => e.date === dateStr);
    return entry ? entry.value : null;
  };

  // Generate gradient color from red (0) to green (1)
  const getGradientColor = (value: number): string => {
    // Clamp value between 0 and 1
    value = Math.max(0, Math.min(1, value));
    
    const colors = [
      '#d32f2f', '#e53935', '#f44336', '#ff5722', '#ff9800',
      '#ffc107', '#cddc39', '#8bc34a', '#66bb6a', '#4caf50', '#2e7d32'
    ];
    
    const segmentSize = 1 / (colors.length - 1);
    const segmentIndex = Math.floor(value / segmentSize);
    const segmentProgress = (value % segmentSize) / segmentSize;
    
    if (segmentIndex >= colors.length - 1) {
      return colors[colors.length - 1];
    }
    
    // Interpolate between two colors
    const c1 = parseInt(colors[segmentIndex].slice(1), 16);
    const c2 = parseInt(colors[segmentIndex + 1].slice(1), 16);
    
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    const r = Math.round(r1 + segmentProgress * (r2 - r1));
    const g = Math.round(g1 + segmentProgress * (g2 - g1));
    const b = Math.round(b1 + segmentProgress * (b2 - b1));
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const getCellColor = (date: Date): string => {
    const value = getValueForDate(date);
    
    if (value === null) {
      return COLORS.heatmap.empty;
    }
    
    // If we have an initial value and target, use them for color calculation
    if (metric.targetValue !== undefined && initialValue !== null) {
      const distanceToTarget = initialValue - metric.targetValue;
      const worstCase = initialValue + distanceToTarget;
      
      // Calculate how far the current value is from target
      const distanceFromTarget = Math.abs(value - metric.targetValue);
      
      // Calculate max distance (from worst case to target)
      const maxDistance = Math.abs(worstCase - metric.targetValue);
      
      if (maxDistance === 0) {
        return getGradientColor(1.0); // Green
      }
      
      // Normalize: 0 = at worst case (red), 1 = at target (green)
      const normalizedDistance = distanceFromTarget / maxDistance;
      const colorValue = 1 - Math.min(normalizedDistance, 1);
      
      return getGradientColor(colorValue);
    }
    
    // Fallback to original calculation
    return getHeatmapColor(
      value,
      metric.minValue,
      metric.maxValue,
      metric.targetValue,
      COLORS.heatmap
    );
  };

  const getTextColorForBackground = (backgroundColor: string): string => {
    // For empty cells, use dark text
    if (backgroundColor === COLORS.heatmap.empty) {
      return COLORS.gray;
    }
    
    // Calculate luminance to determine if we need light or dark text
    // Parse hex color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // If luminance is below threshold, use white text, otherwise use black
    return luminance < 0.5 ? COLORS.white : COLORS.black;
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
          const cellColor = isCurrentMonth ? getCellColor(day) : COLORS.background;
          const textColor = isCurrentMonth ? getTextColorForBackground(cellColor) : COLORS.gray;
          const value = getValueForDate(day);
          
          return (
            <View key={dateStr} style={styles.dayCellWrapper}>
              <TouchableOpacity
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: cellColor,
                    opacity: isCurrentMonth ? 1 : 0.3,
                  },
                ]}
                onPress={() => onDayPress(dateStr)}
              >
                <Text style={[styles.dayText, { color: textColor }]}>
                  {format(day, 'd')}
                </Text>
                {value !== null && isCurrentMonth && (
                  <Text style={[styles.valueText, { color: textColor }]}>
                    {value}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>
          {(() => {
            // Calculate legend values based on target and initial value
            if (metric.targetValue !== undefined && initialValue !== null) {
              // Calculate worst case: same distance from initial but in opposite direction from target
              const distanceToTarget = initialValue - metric.targetValue;
              const worstCase = Math.round(initialValue + distanceToTarget);
              return `${worstCase}${metric.unit ? ` ${metric.unit}` : ''}`;
            } else if (metric.targetValue !== undefined) {
              // Fallback: use the bound farthest from target
              const distanceFromMin = Math.abs(metric.targetValue - metric.minValue);
              const distanceFromMax = Math.abs(metric.targetValue - metric.maxValue);
              const worstValue = distanceFromMin > distanceFromMax ? metric.minValue : metric.maxValue;
              return `${worstValue}${metric.unit ? ` ${metric.unit}` : ''}`;
            }
            return `${metric.minValue}${metric.unit ? ` ${metric.unit}` : ''}`;
          })()}
        </Text>
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
        <Text style={styles.legendLabel}>
          {metric.targetValue !== undefined 
            ? `${metric.targetValue}${metric.unit ? ` ${metric.unit}` : ''}`
            : `${metric.maxValue}${metric.unit ? ` ${metric.unit}` : ''}`
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 8,
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
    paddingHorizontal: 4,
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
    justifyContent: 'center',
    gap: 4,
  },
  dayCellWrapper: {
    width: '13.5%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    flex: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
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
