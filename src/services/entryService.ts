/**
 * Entry Service
 * 
 * Business logic for managing entries.
 * Implements aggregation logic for accumulate vs singleValue metrics.
 */

import { Entry, CreateEntryDTO, Metric } from '../models';
import { entryRepository, userRepository, metricRepository } from '../repositories';
import { getTodayISO } from '../utils/dateUtils';

/**
 * Log a value for a metric
 * 
 * Implements aggregation logic:
 * - singleValue: Replace existing value for the day
 * - accumulate: Add to existing value for the day
 */
export async function logMetricValue(
  metricId: string,
  value: number,
  date: string = getTodayISO()
): Promise<Entry> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  const metric = await metricRepository.getMetricById(metricId);
  if (!metric) {
    throw new Error(`Metric not found: ${metricId}`);
  }

  // Check if an entry already exists for this date
  const existingEntry = await entryRepository.getEntryByMetricIdAndDate(metricId, date);

  if (existingEntry) {
    // Apply aggregation logic
    const newValue =
      metric.aggregationType === 'accumulate'
        ? existingEntry.value + value // Add to existing
        : value; // Replace existing

    return entryRepository.updateEntry(existingEntry.id, { value: newValue });
  } else {
    // Create new entry
    return entryRepository.createEntry(user.id, {
      metricId,
      date,
      value,
    });
  }
}

/**
 * Get all entries for a specific metric
 */
export async function getEntriesForMetric(metricId: string): Promise<Entry[]> {
  return entryRepository.getEntriesByMetricId(metricId);
}

/**
 * Get entries for a metric within a date range
 */
export async function getEntriesForMetricInRange(
  metricId: string,
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  return entryRepository.getEntriesByMetricIdAndDateRange(metricId, startDate, endDate);
}

/**
 * Get all entries for a specific date
 */
export async function getEntriesForDate(date: string): Promise<Entry[]> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }
  return entryRepository.getEntriesByUserIdAndDate(user.id, date);
}

/**
 * Get the current value for a metric today
 */
export async function getTodayValueForMetric(metricId: string): Promise<number> {
  const today = getTodayISO();
  const entry = await entryRepository.getEntryByMetricIdAndDate(metricId, today);
  return entry?.value || 0;
}

/**
 * Update an entry value
 */
export async function updateEntryValue(entryId: string, value: number): Promise<Entry> {
  return entryRepository.updateEntry(entryId, { value });
}

/**
 * Delete an entry
 */
export async function deleteEntry(entryId: string): Promise<void> {
  return entryRepository.deleteEntry(entryId);
}

/**
 * Get entries grouped by metric for a specific date
 * Useful for the day detail modal
 */
export async function getMetricEntriesForDate(
  date: string
): Promise<Array<{ metric: Metric; entry: Entry | null }>> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  const metrics = await metricRepository.getMetricsByUserId(user.id);
  const entries = await entryRepository.getEntriesByUserIdAndDate(user.id, date);

  return metrics.map(metric => ({
    metric,
    entry: entries.find(e => e.metricId === metric.id) || null,
  }));
}
