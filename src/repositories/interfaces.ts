/**
 * Repository Interfaces
 * 
 * Defines the contract for data access operations.
 * These interfaces abstract the underlying database implementation,
 * allowing easy switching between in-memory, AsyncStorage, or Convex.
 */

import { User, Metric, Entry, CreateMetricDTO, CreateEntryDTO, UpdateEntryDTO } from '../models';

/**
 * User Repository Interface
 */
export interface IUserRepository {
  /**
   * Get the current user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Create a new user
   */
  createUser(name: string): Promise<User>;
  
  /**
   * Update user information
   */
  updateUser(userId: string, data: Partial<User>): Promise<User>;
}

/**
 * Metric Repository Interface
 */
export interface IMetricRepository {
  /**
   * Get all metrics for a user
   */
  getMetricsByUserId(userId: string): Promise<Metric[]>;
  
  /**
   * Get a specific metric by ID
   */
  getMetricById(metricId: string): Promise<Metric | null>;
  
  /**
   * Create a new metric
   */
  createMetric(userId: string, data: CreateMetricDTO): Promise<Metric>;
  
  /**
   * Update a metric
   */
  updateMetric(metricId: string, data: Partial<Metric>): Promise<Metric>;
  
  /**
   * Delete a metric
   */
  deleteMetric(metricId: string): Promise<void>;
}

/**
 * Entry Repository Interface
 */
export interface IEntryRepository {
  /**
   * Get all entries for a specific metric
   */
  getEntriesByMetricId(metricId: string): Promise<Entry[]>;
  
  /**
   * Get all entries for a user on a specific date
   */
  getEntriesByUserIdAndDate(userId: string, date: string): Promise<Entry[]>;
  
  /**
   * Get entries for a specific metric and date range
   */
  getEntriesByMetricIdAndDateRange(
    metricId: string,
    startDate: string,
    endDate: string
  ): Promise<Entry[]>;
  
  /**
   * Get a specific entry
   */
  getEntryByMetricIdAndDate(metricId: string, date: string): Promise<Entry | null>;
  
  /**
   * Create a new entry
   */
  createEntry(userId: string, data: CreateEntryDTO): Promise<Entry>;
  
  /**
   * Update an entry
   */
  updateEntry(entryId: string, data: UpdateEntryDTO): Promise<Entry>;
  
  /**
   * Delete an entry
   */
  deleteEntry(entryId: string): Promise<void>;
}
