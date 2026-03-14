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
  onPrevMonth: () => void;
  onNextMonth: () => void;
  metrics: Metric[];
  selectedMetricIndex: number;
  onSelectMetric: (index: number) => void;
}

export function CalendarHeatmap({
  metric,
  entries,
  onDayPress,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  metrics,
  selectedMetricIndex,
  onSelectMetric,
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
    
    // If we have a target and direction, use them for color calculation
    if (metric.targetValue !== undefined && metric.direction) {
      const target = metric.targetValue;
      const isAscending = metric.direction === 'ascending';
      
      // Determine worst case based on direction
      const worstValue = isAscending ? metric.minValue : metric.maxValue;
      
      // Clamp values at or beyond target (green)
      if ((isAscending && value >= target) || (!isAscending && value <= target)) {
        return getGradientColor(1.0); // Green - at or beyond target
      }
      
      // Clamp values at or beyond worst case (red)
      if ((isAscending && value <= worstValue) || (!isAscending && value >= worstValue)) {
        return getGradientColor(0.0); // Red - at or beyond worst case
      }
      
      // Calculate position between worst case and target
      const range = Math.abs(target - worstValue);
      if (range === 0) return getGradientColor(1.0); // target === worst, treat as green
      const position = Math.abs(value - worstValue);
      const colorValue = Math.max(0, Math.min(1, position / range));
      
      return getGradientColor(colorValue);
    }
    
    // If we have an initial value and target (legacy fallback)
    if (metric.targetValue !== undefined && initialValue !== null) {
      const target = metric.targetValue;
      const initial = initialValue;
      
      // If initial equals target, we're already at goal - any deviation is bad
      if (initial === target) {
        const distance = Math.abs(value - target);
        const maxDeviation = Math.max(
          Math.abs(metric.maxValue - target),
          Math.abs(metric.minValue - target)
        );
        if (distance === 0) return getGradientColor(1.0);
        if (maxDeviation === 0) return getGradientColor(1.0);
        const colorValue = 1 - Math.min(distance / maxDeviation, 1);
        return getGradientColor(colorValue);
      }
      
      const distanceToTarget = initial - target;
      const worstCase = initial + distanceToTarget;
      
      // Determine if we're moving toward higher or lower values to reach target
      const movingUp = target > initial; // true if trying to increase
      
      // Clamp values that are at or beyond target (better than goal)
      if (movingUp && value >= target) {
        return getGradientColor(1.0); // Green - at or beyond target
      }
      if (!movingUp && value <= target) {
        return getGradientColor(1.0); // Green - at or beyond target
      }
      
      // Clamp values that are at or beyond worst case
      if (movingUp && value <= worstCase) {
        return getGradientColor(0.0); // Red - at or beyond worst case
      }
      if (!movingUp && value >= worstCase) {
        return getGradientColor(0.0); // Red - at or beyond worst case
      }
      
      // Calculate position between worst case and target
      const range = Math.abs(target - worstCase);
      const position = Math.abs(value - worstCase);
      const colorValue = position / range;
      
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
      <View style={styles.metricTabs}>
        {metrics.map((m, index) => {
          const isSelected = selectedMetricIndex === index;
          return (
            <TouchableOpacity
              key={m._id}
              style={[
                styles.metricTab,
                isSelected && { backgroundColor: m.color || COLORS.primary },
              ]}
              onPress={() => onSelectMetric(index)}
            >
              <Text style={[styles.metricTabText, isSelected && styles.metricTabTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.monthNavButton}>
          <Text style={styles.monthNavText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.monthNavButton}>
          <Text style={styles.monthNavText}>→</Text>
        </TouchableOpacity>
      </View>
      
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
            if (metric.targetValue !== undefined) {
              // If direction is set, use min (ascending) or max (descending) as the red end
              if (metric.direction) {
                const worstValue = metric.direction === 'ascending' ? metric.minValue : metric.maxValue;
                return `${worstValue}${metric.unit ? ` ${metric.unit}` : ''}`;
              }
              // Legacy: use initial value to compute worst case
              if (initialValue !== null && initialValue !== metric.targetValue) {
                const distanceToTarget = initialValue - metric.targetValue;
                const worstCase = Math.round(initialValue + distanceToTarget);
                return `${worstCase}${metric.unit ? ` ${metric.unit}` : ''}`;
              }
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
  metricTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  metricTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  monthNavText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
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
