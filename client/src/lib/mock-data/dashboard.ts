import type { DashboardStats, ApiKey, CreditTransaction } from '@/types';

export const mockDashboardStats: DashboardStats = {
  totalApiCalls: 1250,
  activeAgreements: 8,
  creditBalance: 450.75,
  monthlyUsage: 342
};

export const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    key: 'pk_live_123456780abcdefghijklmnop',
    name: 'Production API Key',
    userId: 'user1',
    isActive: true,
    lastUsed: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    key: 'pk_test_987654321abcdefghijklmnop',
    name: 'Development API Key',
    userId: 'user1',
    isActive: true,
    lastUsed: new Date('2024-01-14'),
    createdAt: new Date('2024-01-05')
  },
  {
    id: '3',
    key: 'pk_test_555666777abcdefghijklmnop',
    name: 'Testing API Key',
    userId: 'user1',
    isActive: false,
    lastUsed: new Date('2024-01-10'),
    createdAt: new Date('2024-01-03')
  }
];

export const mockCreditTransactions: CreditTransaction[] = [
  {
    id: '1',
    userId: 'user1',
    amount: -25.50,
    type: 'usage',
    description: 'API usage - January 2024',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    userId: 'user1',
    amount: 500.00,
    type: 'purchase',
    description: 'Credit purchase',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    userId: 'user1',
    amount: -15.25,
    type: 'usage',
    description: 'API usage - December 2023',
    createdAt: new Date('2023-12-28')
  },
  {
    id: '4',
    userId: 'user1',
    amount: 100.00,
    type: 'purchase',
    description: 'Credit top-up',
    createdAt: new Date('2023-12-15')
  }
];