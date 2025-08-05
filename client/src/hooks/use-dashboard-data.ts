'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, ApiKey, CreditTransaction } from '@/types';
import { USE_MOCK_DATA, MOCK_CONFIG } from '@/lib/data/config';
import { mockDashboardStats, mockApiKeys, mockCreditTransactions } from '@/lib/mock-data/dashboard';
import { dashboardApi, apiKeyApi, creditApi } from '@/services/api';

// Utility function to simulate network delay
const simulateDelay = (ms: number = MOCK_CONFIG.networkDelayMs.min) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Utility function to get random delay
const getRandomDelay = () => {
  const { min, max } = MOCK_CONFIG.networkDelayMs;
  return Math.random() * (max - min) + min;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        if (MOCK_CONFIG.simulateNetworkDelay) {
          await simulateDelay(getRandomDelay());
        }
        setStats(mockDashboardStats);
      } else {
        const data = await dashboardApi.getStats();
        setStats(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
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

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        if (MOCK_CONFIG.simulateNetworkDelay) {
          await simulateDelay(getRandomDelay());
        }
        setApiKeys(mockApiKeys);
      } else {
        const data = await apiKeyApi.getApiKeys();
        setApiKeys(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (name: string) => {
    try {
      if (USE_MOCK_DATA) {
        if (MOCK_CONFIG.simulateNetworkDelay) {
          await simulateDelay(getRandomDelay());
        }
        const newApiKey: ApiKey = {
          id: String(Date.now()),
          key: `pk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          name,
          userId: 'user1',
          isActive: true,
          createdAt: new Date(),
        };
        setApiKeys(prev => [...prev, newApiKey]);
        return newApiKey;
      } else {
        const newApiKey = await apiKeyApi.createApiKey(name);
        setApiKeys(prev => [...prev, newApiKey]);
        return newApiKey;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      throw err;
    }
  }, []);

  const revokeApiKey = useCallback(async (id: string) => {
    try {
      if (USE_MOCK_DATA) {
        if (MOCK_CONFIG.simulateNetworkDelay) {
          await simulateDelay(getRandomDelay());
        }
        setApiKeys(prev => prev.map(key => 
          key.id === id ? { ...key, isActive: false } : key
        ));
      } else {
        await apiKeyApi.revokeApiKey(id);
        setApiKeys(prev => prev.map(key => 
          key.id === id ? { ...key, isActive: false } : key
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
      throw err;
    }
  }, []);

  useEffect(() => {
    //TODO: delay fetchApiKeys
    fetchApiKeys();
  }, [fetchApiKeys]);

  return { 
    apiKeys, 
    loading, 
    error, 
    refetch: fetchApiKeys, 
    createApiKey, 
    revokeApiKey 
  };
}

export function useCreditTransactions() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        if (MOCK_CONFIG.simulateNetworkDelay) {
          await simulateDelay(getRandomDelay());
        }
        setTransactions(mockCreditTransactions);
      } else {
        const data = await creditApi.getTransactions();
        setTransactions(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    //TODO: delay fetchTransactions
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}