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
 * Format a date string as "Tuesday, 12.03.2026"
 */
export function formatWeekdayDate(dateString: string): string {
  return format(parseISO(dateString), DATE_FORMATS.WEEKDAY_DATE);
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
 * Interpolate between two colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Parse hex colors
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Get color from gradient based on value (0-1)
 * Creates smooth gradient: Red → Orange → Yellow → Light Green → Green
 */
function getGradientColor(value: number): string {
  // Clamp value between 0 and 1
  value = Math.max(0, Math.min(1, value));
  
  // Color stops for smooth gradient (Red → Orange → Yellow → Light Green → Green)
  const colors = [
    '#d32f2f', // Dark red (0.0)
    '#e53935', // Red (0.1)
    '#f44336', // Light red (0.2)
    '#ff5722', // Deep orange (0.3)
    '#ff9800', // Orange (0.4)
    '#ffc107', // Amber/Yellow (0.5)
    '#cddc39', // Lime (0.6)
    '#8bc34a', // Light green (0.7)
    '#66bb6a', // Medium green (0.8)
    '#4caf50', // Green (0.9)
    '#2e7d32', // Dark green (1.0)
  ];
  
  // Find which segment we're in
  const segmentSize = 1 / (colors.length - 1);
  const segmentIndex = Math.floor(value / segmentSize);
  const segmentProgress = (value % segmentSize) / segmentSize;
  
  // Handle edge case
  if (segmentIndex >= colors.length - 1) {
    return colors[colors.length - 1];
  }
  
  return interpolateColor(colors[segmentIndex], colors[segmentIndex + 1], segmentProgress);
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
    // Calculate the range based on distance from min/max to target
    const distanceToMin = Math.abs(targetValue - minValue);
    const distanceToMax = Math.abs(maxValue - targetValue);
    const maxDistance = Math.max(distanceToMin, distanceToMax);
    
    // If maxDistance is 0, we're at the target
    if (maxDistance === 0) {
      return getGradientColor(1.0); // Green
    }
    
    // Calculate how far the current value is from the target
    const distanceFromTarget = Math.abs(value - targetValue);
    
    // Normalize the distance (0 = on target, 1 = at max distance)
    const normalizedDistance = distanceFromTarget / maxDistance;
    
    // Invert it so 1 = on target (green), 0 = far from target (red)
    const colorValue = 1 - Math.min(normalizedDistance, 1);
    
    return getGradientColor(colorValue);
  } else {
    // When no target: use value intensity (higher values are better)
    const normalized = (value - minValue) / (maxValue - minValue);
    return getGradientColor(normalized);
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
