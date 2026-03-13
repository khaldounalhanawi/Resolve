/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

import { CreateMetricDTO } from '../models';

/**
 * Color palette for metric visualization
 * Modern minimalistic theme based on brand colors
 */
export const COLORS = {
  primary: '#355176',      // Dark blue - main brand color
  secondary: '#8db8d4',    // Light blue - secondary accents
  success: '#3ca55e',      // Green - success states
  warning: '#e8a55c',      // Warm orange for warnings
  error: '#d96c6c',        // Soft red for errors
  gray: '#7a8a9e',         // Derived from primary blue
  lightGray: '#c5d4e0',    // Light gray with blue tint
  background: '#dafafc',   // Very light cyan - main background
  white: '#FFFFFF',
  black: '#1a2733',        // Slightly softer black with blue tint
  
  // Heatmap colors
  heatmap: {
    low: '#d96c6c',        // Soft red
    mid: '#e8a55c',        // Warm orange
    high: '#3ca55e',       // Green
    empty: '#e8f4f5',      // Very light background tint
  },
  
  // Chart colors - modern palette matching theme
  chartColors: [
    '#355176',  // Primary dark blue
    '#8db8d4',  // Light blue
    '#3ca55e',  // Green
    '#5a9fb8',  // Medium blue
    '#6abf7e',  // Light green
    '#4d6a89',  // Darker blue
    '#a8c9db',  // Pale blue
    '#58b378',  // Medium green
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
  Weight: '#355176',
  Sleep: '#8db8d4',
  Mood: '#3ca55e',
  Calories: '#5a9fb8',
  Steps: '#6abf7e',
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
