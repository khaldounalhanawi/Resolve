/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

import { CreateMetricDTO } from '../models';

/**
 * Color palette for metric visualization
 * Blue theme based on style1.png
 */
export const COLORS = {
  primary: '#1473b1',      // Dark blue - main brand color (from style1.png)
  primaryLight: '#0f81e6', // Bright blue - hover/active states
  secondary: '#b1d6f2',    // Medium blue - slider tracks, secondary elements
  success: '#1473b1',      // Blue - success states
  warning: '#e8a55c',      // Warm orange for warnings
  error: '#d96c6c',        // Soft red for errors
  gray: '#3b3b3b',         // Dark gray for secondary text
  lightGray: '#c1c1c1',    // Light gray for borders
  background: '#cce3f6',   // Light blue - main background (from style1.png)
  cardBackground: '#efe6c8', // Beige/cream - card background alternative
  white: '#FFFFFF',
  black: '#1c1c1c',        // Dark text color (from style1.png)
  navy: '#1c1c1c',         // Navy/black - for consistent naming
  
  // Heatmap colors
  heatmap: {
    low: '#d96c6c',        // Soft red
    mid: '#e8a55c',        // Warm orange
    high: '#1473b1',       // Blue
    empty: '#cce3f6',      // Light background tint
  },
  
  // Chart colors - blue palette matching theme
  chartColors: [
    '#1473b1',  // Primary dark blue
    '#0f81e6',  // Bright blue
    '#b1d6f2',  // Light blue
    '#1b6fa0',  // Medium dark blue
    '#5aa4d4',  // Medium blue
    '#7fb9e3',  // Lighter blue
    '#345f7f',  // Deep blue
    '#cce3f6',  // Very light blue
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
  Weight: '#1473b1',
  Sleep: '#0f81e6',
  Mood: '#1473b1',
  Calories: '#5aa4d4',
  Steps: '#7fb9e3',
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
