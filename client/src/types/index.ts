export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  createdAt: Date;
}

export interface Agreement {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'disputed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalApiCalls: number;
  activeAgreements: number;
  creditBalance: number;
  monthlyUsage: number;
}