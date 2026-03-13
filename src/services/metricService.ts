/**
 * Metric Service
 * 
 * Business logic for managing metrics.
 * This service layer sits between the UI and the repository layer.
 */

import { Metric, CreateMetricDTO } from '../models';
import { metricRepository, userRepository } from '../repositories';

/**
 * Get all metrics for the current user
 */
export async function getUserMetrics(): Promise<Metric[]> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }
  return metricRepository.getMetricsByUserId(user.id);
}

/**
 * Get a specific metric by ID
 */
export async function getMetricById(metricId: string): Promise<Metric | null> {
  return metricRepository.getMetricById(metricId);
}

/**
 * Create a new metric for the current user
 */
export async function createMetric(data: CreateMetricDTO): Promise<Metric> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }
  return metricRepository.createMetric(user.id, data);
}

/**
 * Update an existing metric
 */
export async function updateMetric(
  metricId: string,
  data: Partial<CreateMetricDTO>
): Promise<Metric> {
  return metricRepository.updateMetric(metricId, data);
}

/**
 * Delete a metric
 */
export async function deleteMetric(metricId: string): Promise<void> {
  return metricRepository.deleteMetric(metricId);
}

/**
 * Create multiple suggested metrics
 */
export async function createSuggestedMetrics(
  suggestions: CreateMetricDTO[]
): Promise<Metric[]> {
  const metrics: Metric[] = [];
  for (const suggestion of suggestions) {
    const metric = await createMetric(suggestion);
    metrics.push(metric);
  }
  return metrics;
}
