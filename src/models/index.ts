/**
 * User Model
 * 
 * Represents a user in the system.
 */
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
}

/**
 * Metric Type
 * 
 * Defines the data type of a metric value.
 */
export type MetricType = 'number' | 'scale' | 'boolean' | 'duration';

/**
 * Aggregation Type
 * 
 * Defines how multiple entries for the same day should be handled:
 * - singleValue: Replace previous value (e.g., weight, mood)
 * - accumulate: Add to existing value (e.g., calories, steps)
 */
export type AggregationType = 'singleValue' | 'accumulate';

/**
 * Metric Model
 * 
 * Represents a trackable metric defined by the user.
 */
export interface Metric {
  id: string;
  userId: string;
  name: string;
  type: MetricType;
  unit?: string;
  minValue: number;
  maxValue: number;
  targetValue?: number;
  aggregationType: AggregationType;
  color?: string;
  createdAt: number;
}

/**
 * Entry Model
 * 
 * Represents a single data point for a metric on a specific date.
 */
export interface Entry {
  id: string;
  userId: string;
  metricId: string;
  date: string; // YYYY-MM-DD format
  value: number;
  createdAt: number;
}

/**
 * CreateMetricDTO
 * 
 * Data transfer object for creating a new metric.
 */
export interface CreateMetricDTO {
  name: string;
  type: MetricType;
  unit?: string;
  minValue: number;
  maxValue: number;
  targetValue?: number;
  aggregationType: AggregationType;
  color?: string;
}

/**
 * CreateEntryDTO
 * 
 * Data transfer object for creating a new entry.
 */
export interface CreateEntryDTO {
  metricId: string;
  date: string;
  value: number;
}

/**
 * UpdateEntryDTO
 * 
 * Data transfer object for updating an entry.
 */
export interface UpdateEntryDTO {
  value: number;
}
