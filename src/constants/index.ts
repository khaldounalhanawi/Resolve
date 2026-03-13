/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

import { CreateMetricDTO } from '../models';

/**
 * Color palette for metric visualization
 */
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  background: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  
  // Heatmap colors
  heatmap: {
    low: '#FF3B30',
    mid: '#FF9500',
    high: '#34C759',
    empty: '#E5E5EA',
  },
  
  // Chart colors
  chartColors: [
    '#007AFF',
    '#5856D6',
    '#FF9500',
    '#FF2D55',
    '#34C759',
    '#5AC8FA',
    '#FFCC00',
    '#AF52DE',
  ],
};

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  ISO_DATE: 'yyyy-MM-dd',
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_MONTH: 'MMMM yyyy',
};

/**
 * Default metric color mapping
 */
export const METRIC_COLORS: Record<string, string> = {
  Weight: '#007AFF',
  Sleep: '#5856D6',
  Mood: '#FF9500',
  Calories: '#FF2D55',
  Steps: '#34C759',
};

/**
 * Suggested metrics for quick setup
 */
export const SUGGESTED_METRICS: CreateMetricDTO[] = [
  {
    name: 'Weight',
    type: 'number',
    unit: 'kg',
    minValue: 40,
    maxValue: 150,
    targetValue: 70,
    aggregationType: 'singleValue',
    color: METRIC_COLORS.Weight,
  },
  {
    name: 'Sleep',
    type: 'duration',
    unit: 'h',
    minValue: 0,
    maxValue: 12,
    targetValue: 8,
    aggregationType: 'singleValue',
    color: METRIC_COLORS.Sleep,
  },
  {
    name: 'Mood',
    type: 'scale',
    unit: '',
    minValue: 1,
    maxValue: 5,
    targetValue: 5,
    aggregationType: 'singleValue',
    color: METRIC_COLORS.Mood,
  },
  {
    name: 'Calories',
    type: 'number',
    unit: 'kcal',
    minValue: 0,
    maxValue: 5000,
    targetValue: 2000,
    aggregationType: 'accumulate',
    color: METRIC_COLORS.Calories,
  },
  {
    name: 'Steps',
    type: 'number',
    unit: 'steps',
    minValue: 0,
    maxValue: 30000,
    targetValue: 10000,
    aggregationType: 'accumulate',
    color: METRIC_COLORS.Steps,
  },
];

/**
 * Storage keys for persistent data
 */
export const STORAGE_KEYS = {
  USER: '@resolve:user',
  METRICS: '@resolve:metrics',
  ENTRIES: '@resolve:entries',
};
