/**
 * Custom Hooks
 * 
 * React hooks that provide convenient access to services and state.
 */

import { useEffect, useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { Metric, Entry } from '../models';
import { getTodayISO } from '../utils/dateUtils';

/**
 * Hook to get metrics with their current day values
 */
export function useMetricsWithTodayValues() {
  const { userId } = useAuth();
  const today = getTodayISO();
  
  const metrics = useQuery(
    api.metrics.getUserMetrics,
    userId ? { userId } : 'skip'
  );
  
  const entries = useQuery(
    api.entries.getUserEntriesByDate,
    userId ? { userId, date: today } : 'skip'
  );

  return useMemo(() => {
    if (!metrics) return [];
    
    return metrics.map(metric => {
      const todayEntry = entries?.find(
        e => e.metricId === metric._id
      );
      return {
        metric,
        value: todayEntry?.value || 0,
      };
    });
  }, [metrics, entries]);
}

/**
 * Hook to get entries for a specific date
 */
export function useEntriesForDate(date: string) {
  const { userId } = useAuth();
  
  const metrics = useQuery(
    api.metrics.getUserMetrics,
    userId ? { userId } : 'skip'
  );
  
  const entries = useQuery(
    api.entries.getUserEntriesByDate,
    userId && date ? { userId, date } : 'skip'
  );

  const data = useMemo(() => {
    if (!metrics) return [];
    
    // Debug logging
    console.log('useEntriesForDate - Date:', date);
    console.log('useEntriesForDate - Metrics count:', metrics.length);
    console.log('useEntriesForDate - Entries:', entries);
    
    return metrics.map(metric => {
      // Convert both to string for comparison
      const entry = entries?.find(e => String(e.metricId) === String(metric._id)) || null;
      
      if (entry) {
        console.log(`Found entry for metric ${metric.name}:`, entry.value);
      }
      
      return {
        metric,
        entry,
      };
    });
  }, [metrics, entries, date]);

  const isLoading = !date || metrics === undefined || entries === undefined;

  return { data, isLoading };
}

/**
 * Hook to get entries for a metric in a date range
 */
export function useMetricEntries(metricId: string, startDate: string, endDate: string) {
  const { userId } = useAuth();
  
  const allEntries = useQuery(
    api.entries.getUserEntriesInRange,
    userId && startDate && endDate ? { userId, startDate, endDate } : 'skip'
  );

  const entries = useMemo(() => {
    if (!allEntries) return [];
    return allEntries.filter(e => e.metricId === metricId) as Entry[];
  }, [allEntries, metricId]);

  const isLoading = allEntries === undefined;

  return { entries, isLoading };
}

/**
 * Hook to initialize the app
 */
export function useAppInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  return isInitialized;
}
