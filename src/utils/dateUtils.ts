/**
 * Date Utilities
 * 
 * Helper functions for date manipulation and formatting.
 */

import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { DATE_FORMATS } from '../constants';

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return format(new Date(), DATE_FORMATS.ISO_DATE);
}

/**
 * Format a date string for display
 */
export function formatDisplayDate(dateString: string): string {
  return format(parseISO(dateString), DATE_FORMATS.DISPLAY_DATE);
}

/**
 * Format a date string for month display
 */
export function formatDisplayMonth(dateString: string): string {
  return format(parseISO(dateString), DATE_FORMATS.DISPLAY_MONTH);
}

/**
 * Get all days in a given month
 */
export function getDaysInMonth(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

/**
 * Convert Date to ISO date string
 */
export function dateToISO(date: Date): string {
  return format(date, DATE_FORMATS.ISO_DATE);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get color for heatmap based on value and target
 */
export function getHeatmapColor(
  value: number,
  minValue: number,
  maxValue: number,
  targetValue?: number,
  colors = { low: '#d96c6c', mid: '#e8a55c', high: '#4CAF50', empty: '#e8e8e8' }
): string {
  if (targetValue !== undefined) {
    // Calculate distance from target as a percentage
    const range = maxValue - minValue;
    const distance = Math.abs(value - targetValue);
    const distancePercent = distance / range;
    
    // Green when very close to target, orange for medium, red for far
    if (distancePercent < 0.15) return colors.high;  // Green - very close
    if (distancePercent < 0.35) return colors.mid;   // Orange - medium distance
    return colors.low;  // Red - far from target
  } else {
    // When no target: use value intensity (higher values are better)
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized > 0.66) return colors.high;  // Green - high values
    if (normalized > 0.33) return colors.mid;   // Orange - medium values
    return colors.low;  // Red - low values
  }
}

/**
 * Calculate streak of consecutive days with entries
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort().reverse();
  const today = getTodayISO();
  
  if (sortedDates[0] !== today) return 0;
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
