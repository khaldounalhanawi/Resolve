/**
 * In-Memory Metric Repository
 * 
 * Implementation of IMetricRepository using in-memory storage.
 * This is used for testing and development before connecting to Convex.
 */

import { Metric, CreateMetricDTO } from '../models';
import { IMetricRepository } from './interfaces';
import { generateId } from '../utils';

class InMemoryMetricRepository implements IMetricRepository {
  private metrics: Map<string, Metric> = new Map();

  async getMetricsByUserId(userId: string): Promise<Metric[]> {
    return Array.from(this.metrics.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async getMetricById(metricId: string): Promise<Metric | null> {
    return this.metrics.get(metricId) || null;
  }

  async createMetric(userId: string, data: CreateMetricDTO): Promise<Metric> {
    const metric: Metric = {
      id: generateId(),
      userId,
      ...data,
      createdAt: Date.now(),
    };
    this.metrics.set(metric.id, metric);
    return metric;
  }

  async updateMetric(metricId: string, data: Partial<Metric>): Promise<Metric> {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${metricId}`);
    }
    const updated = { ...metric, ...data };
    this.metrics.set(metricId, updated);
    return updated;
  }

  async deleteMetric(metricId: string): Promise<void> {
    this.metrics.delete(metricId);
  }
}

export default new InMemoryMetricRepository();
