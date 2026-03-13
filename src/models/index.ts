/**
 * User Model
 * 
 * Represents a user in the system.
 * Compatible with both local storage and Convex
 */
export interface User {
  id?: string;
  _id?: string;  // Convex ID
  name: string;
  email?: string;
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
 * Direction Type
 * 
 * Defines whether higher or lower values are better:
 * - ascending: Higher values are better (e.g., steps, mood)
 * - descending: Lower values are better (e.g., weight loss, stress)
 */
export type Direction = 'ascending' | 'descending';

/**
 * Metric Model
 * 
 * Represents a trackable metric defined by the user.
 * Compatible with both local storage and Convex
 */
export interface Metric {
  id?: string;
  _id?: string;  // Convex ID
  userId?: string;
  name: string;
  type: MetricType;
  unit?: string;
  minValue: number;
  maxValue: number;
  targetValue?: number;
  direction?: Direction;
  aggregationType: AggregationType;
  color?: string;
  order?: number;
  createdAt: number;
}

/**
 * Entry Model
 * 
 * Represents a single data point for a metric on a specific date.
 * Compatible with both local storage and Convex
 */
export interface Entry {
  id?: string;
  _id?: string;  // Convex ID
  userId?: string | any;  // string for local, Id<"users"> for Convex
  metricId?: string | any;  // string for local, Id<"metrics"> for Convex
  date: string; // YYYY-MM-DD format
  value: number;
  note?: string;
  createdAt?: number;
  updatedAt?: number;
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
  direction?: Direction;
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
