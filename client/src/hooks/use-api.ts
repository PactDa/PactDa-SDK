'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/services/api';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    //TODO: delay fetchStats
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}