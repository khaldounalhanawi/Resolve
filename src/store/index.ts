/**
 * Application Store
 * 
 * Zustand store for global state management.
 * Manages user, metrics, and entries state.
 */

import { create } from 'zustand';
import { User, Metric, Entry, CreateMetricDTO } from '../models';
import * as userService from '../services/userService';
import * as metricService from '../services/metricService';
import * as entryService from '../services/entryService';

interface AppState {
  // State
  user: User | null;
  metrics: Metric[];
  entries: Entry[];
  isLoading: boolean;
  error: string | null;

  // User actions
  loadUser: () => Promise<void>;
  
  // Metric actions
  loadMetrics: () => Promise<void>;
  addMetric: (data: CreateMetricDTO) => Promise<void>;
  updateMetric: (metricId: string, data: Partial<CreateMetricDTO>) => Promise<void>;
  removeMetric: (metricId: string) => Promise<void>;
  
  // Entry actions
  logValue: (metricId: string, value: number, date?: string) => Promise<void>;
  loadEntriesForMetric: (metricId: string) => Promise<void>;
  loadAllEntries: () => Promise<void>;
  
  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  metrics: [],
  entries: [],
  isLoading: false,
  error: null,

  // Load user
  loadUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await userService.getCurrentUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Load metrics
  loadMetrics: async () => {
    try {
      set({ isLoading: true, error: null });
      const metrics = await metricService.getUserMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Add metric
  addMetric: async (data: CreateMetricDTO) => {
    try {
      set({ isLoading: true, error: null });
      const metric = await metricService.createMetric(data);
      set(state => ({
        metrics: [...state.metrics, metric],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Update metric
  updateMetric: async (metricId: string, data: Partial<CreateMetricDTO>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedMetric = await metricService.updateMetric(metricId, data);
      set(state => ({
        metrics: state.metrics.map(m => m.id === metricId ? updatedMetric : m),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Remove metric
  removeMetric: async (metricId: string) => {
    try {
      set({ isLoading: true, error: null });
      await metricService.deleteMetric(metricId);
      set(state => ({
        metrics: state.metrics.filter(m => m.id !== metricId),
        entries: state.entries.filter(e => e.metricId !== metricId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Log value
  logValue: async (metricId: string, value: number, date?: string) => {
    try {
      set({ isLoading: true, error: null });
      const entry = await entryService.logMetricValue(metricId, value, date);
      
      // Update or add entry in state
      set(state => {
        const existingIndex = state.entries.findIndex(e => e.id === entry.id);
        const newEntries = [...state.entries];
        
        if (existingIndex >= 0) {
          newEntries[existingIndex] = entry;
        } else {
          newEntries.push(entry);
        }
        
        return { entries: newEntries, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Load entries for a specific metric
  loadEntriesForMetric: async (metricId: string) => {
    try {
      set({ isLoading: true, error: null });
      const entries = await entryService.getEntriesForMetric(metricId);
      
      // Merge with existing entries
      set(state => {
        const otherEntries = state.entries.filter(e => e.metricId !== metricId);
        return {
          entries: [...otherEntries, ...entries],
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Load all entries
  loadAllEntries: async () => {
    try {
      set({ isLoading: true, error: null });
      const metrics = get().metrics;
      const allEntries: Entry[] = [];
      
      for (const metric of metrics) {
        const entries = await entryService.getEntriesForMetric(metric.id);
        allEntries.push(...entries);
      }
      
      set({ entries: allEntries, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
