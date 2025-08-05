'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSelect } from '@/components/ui/theme-toggle';
import { formatCurrency, formatDate, truncateApiKey } from '@/lib/utils';
import { useDashboardStats, useApiKeys, useCreditTransactions } from '@/hooks/use-dashboard-data';
import { USE_MOCK_DATA } from '@/lib/data/config';

export default function Dashboard() {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { apiKeys, loading: keysLoading, createApiKey, revokeApiKey } = useApiKeys();
  const { transactions, loading: transactionsLoading } = useCreditTransactions();
  
  const [creatingKey, setCreatingKey] = useState(false);

  const handleCreateApiKey = async () => {
    //TODO: Add a modal for the API key name
    const name = prompt('Enter API key name:');
    if (!name) return;

    try {
      setCreatingKey(true);
      await createApiKey(name);
    } catch (error) {
      //TODO: Add a toast for the error
      alert('Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke "${name}"?`)) return;
    
    try {
      await revokeApiKey(id);
    } catch (error) {
      //TODO: Add a toast for the error
      alert('Failed to revoke API key');
    }
  };

  if (statsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mt-2">{statsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {USE_MOCK_DATA && (
            <p className="text-sm text-muted-foreground mt-1">
              Using mock data • Switch to real API in config
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <ThemeSelect />
          <Button 
            onClick={handleCreateApiKey} 
            disabled={creatingKey || keysLoading}
          >
            {creatingKey ? 'Creating...' : 'Create New API Key'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalApiCalls.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-12 mb-1"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeAgreements}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats && formatCurrency(stats.creditBalance)}</div>
                <p className="text-xs text-muted-foreground">Available credits</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.monthlyUsage}</div>
                <p className="text-xs text-muted-foreground">API calls this month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys for development and production</CardDescription>
          </CardHeader>
          <CardContent>
            {keysLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-48"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {truncateApiKey(apiKey.key)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last used: {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${apiKey.isActive ? 'bg-success' : 'bg-destructive'}`} />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeApiKey(apiKey.id, apiKey.name)}
                        disabled={!apiKey.isActive}
                      >
                        {apiKey.isActive ? 'Revoke' : 'Revoked'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your credit usage and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-48"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className={`font-medium ${transaction.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}