/**
 * In-Memory Entry Repository
 * 
 * Implementation of IEntryRepository using in-memory storage.
 * This is used for testing and development before connecting to Convex.
 */

import { Entry, CreateEntryDTO, UpdateEntryDTO } from '../models';
import { IEntryRepository } from './interfaces';
import { generateId } from '../utils';

class InMemoryEntryRepository implements IEntryRepository {
  private entries: Map<string, Entry> = new Map();

  async getEntriesByMetricId(metricId: string): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.metricId === metricId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getEntriesByUserIdAndDate(userId: string, date: string): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId && entry.date === date);
  }

  async getEntriesByMetricIdAndDateRange(
    metricId: string,
    startDate: string,
    endDate: string
  ): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(
        entry =>
          entry.metricId === metricId &&
          entry.date >= startDate &&
          entry.date <= endDate
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getEntryByMetricIdAndDate(metricId: string, date: string): Promise<Entry | null> {
    return (
      Array.from(this.entries.values()).find(
        entry => entry.metricId === metricId && entry.date === date
      ) || null
    );
  }

  async createEntry(userId: string, data: CreateEntryDTO): Promise<Entry> {
    const entry: Entry = {
      id: generateId(),
      userId,
      ...data,
      createdAt: Date.now(),
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async updateEntry(entryId: string, data: UpdateEntryDTO): Promise<Entry> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      throw new Error(`Entry not found: ${entryId}`);
    }
    const updated = { ...entry, ...data };
    this.entries.set(entryId, updated);
    return updated;
  }

  async deleteEntry(entryId: string): Promise<void> {
    this.entries.delete(entryId);
  }
}

export default new InMemoryEntryRepository();
