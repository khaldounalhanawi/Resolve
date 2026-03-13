/**
 * Custom Hooks
 * 
 * React hooks that provide convenient access to services and state.
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Metric, Entry } from '../models';
import { getTodayISO } from '../utils/dateUtils';
import * as entryService from '../services/entryService';

/**
 * Hook to get metrics with their current day values
 */
export function useMetricsWithTodayValues() {
  const metrics = useAppStore(state => state.metrics);
  const entries = useAppStore(state => state.entries);
  const today = getTodayISO();

  return metrics.map(metric => {
    const todayEntry = entries.find(
      e => e.metricId === metric.id && e.date === today
    );
    return {
      metric,
      value: todayEntry?.value || 0,
    };
  });
}

/**
 * Hook to get entries for a specific date
 */
export function useEntriesForDate(date: string) {
  const [data, setData] = useState<Array<{ metric: Metric; entry: Entry | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await entryService.getMetricEntriesForDate(date);
        setData(result);
      } catch (error) {
        console.error('Failed to load entries for date:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [date]);

  return { data, isLoading };
}

/**
 * Hook to get entries for a metric in a date range
 */
export function useMetricEntries(metricId: string, startDate: string, endDate: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await entryService.getEntriesForMetricInRange(
          metricId,
          startDate,
          endDate
        );
        setEntries(result);
      } catch (error) {
        console.error('Failed to load metric entries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [metricId, startDate, endDate]);

  return { entries, isLoading };
}

/**
 * Hook to initialize the app
 */
export function useAppInitialization() {
  const loadUser = useAppStore(state => state.loadUser);
  const loadMetrics = useAppStore(state => state.loadMetrics);
  const loadAllEntries = useAppStore(state => state.loadAllEntries);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      await loadMetrics();
      await loadAllEntries();
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  return isInitialized;
}
