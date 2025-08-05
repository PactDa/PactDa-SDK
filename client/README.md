This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Dashboard page
│   │   ├── docs/              # Documentation page
│   │   ├── favicon.ico        # Site favicon
│   │   ├── globals.css        # Global styles with Tailwind CSS
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   │   ├── footer.tsx    # Site footer
│   │   │   └── navbar.tsx    # Site navigation
│   │   └── ui/               # Base UI components
│   │       ├── button.tsx    # Button component
│   │       └── card.tsx      # Card component
│   ├── hooks/                # Custom React hooks
│   │   └── use-api.ts        # API-related hooks
│   ├── lib/                  # Utility libraries
│   │   └── utils.ts          # Common utility functions
│   ├── services/             # API service layer
│   │   └── api.ts            # API client and endpoints
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Shared type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── .env.local.example        # Environment variables template
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```


### Configuration

#### Environment Setup
Configure data source in `src/lib/data/config.ts`:

```typescript
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || 
                             process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const MOCK_CONFIG = {
  simulateNetworkDelay: true,
  networkDelayMs: { min: 200, max: 800 },
  simulateErrors: false,
  errorRate: 0.1,
};
```

#### Environment Variables
Create `.env.local`:

```bash
# Use mock data in development
NEXT_PUBLIC_USE_MOCK_DATA=true

# API URLs for production
NEXT_PUBLIC_API_URL=https://api.pactda.com
NEXT_PUBLIC_WS_URL=wss://api.pactda.com
```

### Mock Data Structure

#### Dashboard Data
Located in `src/lib/mock-data/dashboard.ts`:

```typescript
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
    // ... more properties
  }
];
```

#### Agreement Data
Located in `src/lib/mock-data/agreements.ts`:

```typescript
export const mockAgreements: Agreement[] = [
  {
    id: '1',
    title: 'Rock Paper Scissors Tournament',
    status: 'active',
    // ... more properties
  }
];
```

### Using Mock Data Hooks

#### Dashboard Data Hook
```typescript
import { useDashboardStats, useApiKeys, useCreditTransactions } from '@/hooks/use-dashboard-data';

function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats();
  const { apiKeys, createApiKey, revokeApiKey } = useApiKeys();
  const { transactions } = useCreditTransactions();
  
  // Data is automatically mock or real based on config
  return <div>{/* Use data */}</div>;
}
```

### Switching Between Mock and Real Data

#### For Development
Set in `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

#### For Production
Set in `.env.production`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://api.pactda.com
```

#### Programmatic Switching
Modify `src/lib/data/config.ts`:
```typescript
// Force real API for specific features
export const USE_MOCK_DATA = false; // Always use real API

// Or conditional logic
export const USE_MOCK_DATA = 
  process.env.NODE_ENV === 'development' && 
  !process.env.NEXT_PUBLIC_FORCE_REAL_API;
```

### Loading States and Error Handling

#### Built-in Loading States
```tsx
function Dashboard() {
  const { stats, loading, error } = useDashboardStats();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{stats.totalApiCalls}</div>;
}
```

#### Custom Loading Components
```tsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-8 bg-muted rounded w-20 mb-1"></div>
    <div className="h-3 bg-muted rounded w-16"></div>
  </div>
) : (
  <div className="text-2xl font-bold">{stats?.totalApiCalls}</div>
)}
```

### Adding New Mock Data

#### 1. Define Types
In `src/types/index.ts`:
```typescript
export interface NewDataType {
  id: string;
  name: string;
  // ... properties
}
```

#### 2. Create Mock Data
In `src/lib/mock-data/new-data.ts`:
```typescript
export const mockNewData: NewDataType[] = [
  { id: '1', name: 'Example' }
];
```

#### 3. Create Hook
In `src/hooks/use-new-data.ts`:
```typescript
export function useNewData() {
  const [data, setData] = useState<NewDataType[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (USE_MOCK_DATA) {
        await simulateDelay();
        setData(mockNewData);
      } else {
        const response = await apiClient.get('/new-data');
        setData(response.data);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return { data, loading };
}
```

#### 4. Use in Components
```tsx
import { useNewData } from '@/hooks/use-new-data';

function Component() {
  const { data, loading } = useNewData();
  return <div>{/* Use data */}</div>;
}
```
