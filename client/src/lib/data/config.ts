/**
 * Data Configuration
 * 
 * Toggle between mock data and real API data by changing USE_MOCK_DATA.
 * This allows easy switching between development with mock data and production with real APIs.
 */

export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  timeout: 10000,
};

export const MOCK_CONFIG = {
  // Simulate network delays for more realistic development experience
  simulateNetworkDelay: true,
  networkDelayMs: {
    min: 200,
    max: 800,
  },
  // Simulate occasional API errors for error handling testing
  simulateErrors: false,
  errorRate: 0.1, // 10% error rate when enabled
};