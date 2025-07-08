# PactDa SDK

> **Trust-based agreements without blockchain complexity**

PactDa SDK (PactDa-Lite) is a simple TypeScript SDK that enables developers to integrate trust and escrow mechanisms into their applications without dealing with blockchain complexity. Perfect for gaming, marketplaces, and any application requiring secure agreements between parties.

## 🚀 Quick Start

### Installation

```bash
npm install @pactda/sdk-lite
```

### Basic Usage

```typescript
import { createPactDa } from '@pactda/sdk-lite'

// Initialize SDK
const pactda = createPactDa({
  apiKey: 'your-api-key-here',
  environment: 'development' // or 'testnet', 'production'
})

// Initialize the SDK
await pactda.init()

// Connect user via Sui Enoki zkLogin
const user = await pactda.connectUser()

// Create an agreement
const agreement = await pactda.createAgreement({
  parties: [
    { address: user.address, role: 'player1' },
    { address: 'other-user-address', role: 'player2' }
  ],
  escrowConfig: {
    amount: 100,
    currency: 'SUI'
  },
  resolutionPolicy: {
    type: 'automated',
    resolverAddress: 'resolver-address'
  }
})

// Report outcome (for designated authorities)
await pactda.reportOutcome({
  agreementId: agreement.id,
  outcomeData: {
    agreementId: agreement.id,
    result: 'completed',
    winnerAddress: user.address
  }
})
```

## 📚 API Reference

### Core Functions

#### `pactda.init(options?)`
Initializes the SDK with API key authentication.

```typescript
await pactda.init({ apiKey: 'optional-override' })
```

#### `pactda.connectUser()`
Connects a user via Sui Enoki's zkLogin system.

```typescript
const user = await pactda.connectUser()
// Returns: User object with address, id, provider info
```

#### `pactda.createAgreement(params)`
Creates a new on-chain agreement.

```typescript
const agreement = await pactda.createAgreement({
  parties: [/* party objects */],
  escrowConfig: {
    amount: 100,
    currency: 'SUI'
  },
  resolutionPolicy: {
    type: 'automated',
    resolverAddress: 'resolver-address'
  },
  metadata: { /* optional metadata */ }
})
```

#### `pactda.reportOutcome(params)`
Reports the outcome of an agreement (for designated authorities).

```typescript
await pactda.reportOutcome({
  agreementId: 'agreement-id',
  outcomeData: {
    agreementId: 'agreement-id',
    result: 'completed',
    winnerAddress: 'winner-address'
  }
})
```

#### `pactda.getAgreementStatus(agreementId)`
Retrieves the current status of an agreement.

```typescript
const agreement = await pactda.getAgreementStatus('agreement-id')
```

#### `pactda.on(eventName, callback)`
Listens for real-time events (WebSocket-based).

```typescript
pactda.on('agreement_created', (data) => {
  console.log('New agreement created:', data)
})

pactda.on('agreement_completed', (data) => {
  console.log('Agreement completed:', data)
})
```

### Events

The SDK emits the following events:

- `agreement_created` - When a new agreement is created
- `agreement_funded` - When an agreement is funded
- `agreement_completed` - When an agreement is completed
- `agreement_cancelled` - When an agreement is cancelled
- `user_connected` - When a user connects
- `user_disconnected` - When a user disconnects
- `error` - When an error occurs

## 🎮 Gaming Example

Perfect for turn-based games, tournaments, and wager-based gaming:

```typescript
// Create a gaming agreement
const gameAgreement = await pactda.createAgreement({
  parties: [
    { address: player1.address, role: 'player1' },
    { address: player2.address, role: 'player2' }
  ],
  escrowConfig: {
    amount: 50, // 50 SUI wager
    currency: 'SUI'
  },
  resolutionPolicy: {
    type: 'automated',
    resolverAddress: gameServerAddress
  },
  metadata: {
    gameType: 'chess',
    timeLimit: 3600 // 1 hour
  }
})

// Game server reports outcome after game completion
await pactda.reportOutcome({
  agreementId: gameAgreement.id,
  outcomeData: {
    agreementId: gameAgreement.id,
    result: 'completed',
    winnerAddress: player1.address,
    evidence: ['game-replay-hash']
  }
})
```

## 🔧 Configuration

### Environment Options

- `development` - Local development server
- `testnet` - Sui testnet environment  
- `production` - Mainnet environment

### API Configuration

```typescript
const pactda = createPactDa({
  apiKey: 'your-api-key',
  environment: 'testnet',
  apiUrl: 'custom-api-url', // optional
  wsUrl: 'custom-websocket-url' // optional
})
```

## 📖 Type Definitions

The SDK includes comprehensive TypeScript definitions:

```typescript
interface PactDaConfig {
  apiKey: string
  environment?: 'production' | 'testnet' | 'development'
  apiUrl?: string
  wsUrl?: string
}

interface Agreement {
  id: string
  parties: Party[]
  escrowConfig: EscrowConfig
  resolutionPolicy: ResolutionPolicy
  status: AgreementStatus
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// ... see types.ts for complete definitions
```

## 🛡️ Security

- API key authentication required
- Sui Enoki zkLogin for user authentication
- On-chain escrow protection
- Automated dispute resolution
- Comprehensive audit trail

## 🎯 Key Benefits

- **Zero Blockchain Knowledge Required** - Abstract away all blockchain complexity
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Real-time Updates** - WebSocket-based event system
- **Gaming Optimized** - Perfect for wager-based games and tournaments
- **Secure by Design** - Built-in escrow and dispute resolution
- **Developer Friendly** - Simple API, extensive documentation

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

- Documentation: [https://docs.pactda.com](https://docs.pactda.com)
- Issues: [GitHub Issues](https://github.com/pactda/pactda-sdk/issues)
- Community: [Discord](https://discord.gg/pactda)

---

**Built with ❤️ for the developer community** 